import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import {createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey} from "jose";
import {sessionOptions, SessionData} from "@/app/lib/session";
import {prisma} from "@/prisma";
import {encrypt} from "@/app/lib/crypto";
/**
 * Tesla endpoints
 */
const TOKEN_URL = "https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/token";
const DISCOVERY_URL =
  "https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/thirdparty/.well-known/openid-configuration";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  created_at?: number;
  scope?: string;
  token_type?: string;
};

/**
 * OIDC JWKS getter cache
 */
let getKey: JWTVerifyGetKey | null = null;

async function getRemoteGetKey(): Promise<JWTVerifyGetKey> {
  if (getKey) return getKey;

  const res = await fetch(DISCOVERY_URL, {cache: "force-cache"});
  if (!res.ok) throw new Error(`Failed to load OIDC discovery: ${res.status}`);
  const meta = await res.json();

  // IMPORTANT:
  // discovery の jwks_uri が fleet-auth.tesla.com を返す環境があり、
  // Azure等でDNS解決できず ENOTFOUND になることがあるためホスト置換する
  const jwksUri = String(meta.jwks_uri).replace(
    "fleet-auth.tesla.com",
    "fleet-auth.prd.vn.cloud.tesla.com"
  );

  getKey = createRemoteJWKSet(new URL(jwksUri));
  return getKey;
}

const CONSENT_VERSION = "2025-12-17.v1";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

function extractSubUnsafe(idToken: string): string {
  const parts = idToken.split(".");
  if (parts.length < 2) throw new Error("invalid id_token");
  const payloadJson = Buffer.from(parts[1], "base64url").toString("utf8");
  const payload = JSON.parse(payloadJson);
  const sub = payload?.sub;
  if (!sub) throw new Error("sub missing in id_token");
  return sub;
}

async function verifyAndGetSubFromIdToken(idToken: string): Promise<string> {
  const clientId = process.env.TESLA_CLIENT_ID;
  if (!clientId) throw new Error("TESLA_CLIENT_ID is not set");

  const key = await getRemoteGetKey();

  // issuer は検証しない（DNS問題回避のため）
  const {payload} = await jwtVerify(idToken, key, {
    audience: clientId,
  });

  const sub = payload.sub;
  if (!sub || typeof sub !== "string") throw new Error("id_token missing sub");
  return sub;
}

async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const clientId = process.env.TESLA_CLIENT_ID;
  const clientSecret = process.env.TESLA_CLIENT_SECRET;
  const audience = process.env.TESLA_FLEET_BASE_URL;

  if (!clientId) throw new Error("TESLA_CLIENT_ID is not set");
  if (!clientSecret) throw new Error("TESLA_CLIENT_SECRET is not set");
  if (!audience) throw new Error("TESLA_FLEET_BASE_URL is not set");

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);
  body.set("code", code);
  body.set("redirect_uri", process.env.DOMAIN! + process.env.TESLA_REDIRECT_URI);

  // Fleet API 用 audience（ホストまで。/api/1 は付けない）
  body.set("audience", audience);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json as TokenResponse;
}

export async function GET(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  const {searchParams} = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  console.log(" state received: ", state);
  console.log(" code received: ", code);

  console.log(" state session: ", session.oauthState);


  if (error) {
    return NextResponse.json({ok: false, error}, {status: 400});
  }
  if (!code || !state) {
    return NextResponse.json({ok: false, error: "missing code/state"}, {status: 400});
  }
  if (!session.oauthState || session.oauthState !== state) {
    return NextResponse.json({ok: false, error: "state mismatch"}, {status: 400});
  }

  // 1) token exchange
  const token = await exchangeCodeForToken(code);

  // 2) sub from id_token
  if (!token.id_token) {
    return NextResponse.json(
      {ok: false, error: "missing id_token (need openid scope)"},
      {status: 500}
    );
  }
  const sub = await verifyAndGetSubFromIdToken(token.id_token);
  const now = Date.now();
  const expiresAtIso =
    typeof token.expires_in === "number"
      ? new Date(now + token.expires_in * 1000).toISOString()
      : new Date(now + 55 * 60 * 1000).toISOString();

  // 3) save session
  session.tesla = token;
  session.teslaSub = sub;
  session.oauthState = undefined;
  session.tesla.expires_at = expiresAtIso;
  await session.save();



  const shouldStoreForAuto =
    session.pendingTeslaAutoConsent === true && session.teslaDesiredMode === "AUTO";

  if (shouldStoreForAuto) {
    // TeslaAccount upsert
    const account = await prisma.teslaAccount.upsert({
      where: {teslaSub: session.teslaSub},
      update: {},
      create: {teslaSub: session.teslaSub},
    });

    // TeslaSettings（AUTO + 同意ログ）
    await prisma.teslaSettings.upsert({
      where: {teslaAccountId: account.id},
      update: {
        mode: "AUTO",
        consentGivenAt: new Date(),
        consentVersion: CONSENT_VERSION,
      },
      create: {
        teslaAccountId: account.id,
        mode: "AUTO",
        consentGivenAt: new Date(),
        consentVersion: CONSENT_VERSION,
      },
    });

    // refresh_token 保存（暗号化）
    await prisma.teslaAuthToken.upsert({
      where: {teslaAccountId: account.id},
      update: {
        refreshTokenEnc: encrypt(token.refresh_token ?? ""),
        accessTokenEnc: encrypt(token.access_token),
        expiresAt: new Date(expiresAtIso),
      },
      create: {
        teslaAccountId: account.id,
        refreshTokenEnc: encrypt(token.refresh_token ?? ""),
        accessTokenEnc: encrypt(token.access_token),
        expiresAt: new Date(expiresAtIso),
      },
    });

    // ✅ 同意フラグは使い切りにする（再利用・なりすまし防止）
    session.pendingTeslaAutoConsent = false;
    session.teslaDesiredMode = "MANUAL"; // ここは好み（AUTOのままでもいい）
    await session.save();
  }

  // 既に車両情報が確認済みかチェック
  const existingAccount = await prisma.teslaAccount.findUnique({
    where: {teslaSub: sub},
    include: {
      vehicles: {
        include: {
          override: true,
        },
      },
    },
  });

  // 車両が存在し、全て確認済みなら車両一覧へ（1台の場合は直接ダッシュボードへ）
  const allConfirmed =
    existingAccount &&
    existingAccount.vehicles.length > 0 &&
    existingAccount.vehicles.every((v) => v.override?.confirmedAt);

  if (allConfirmed) {
    if (existingAccount.vehicles.length === 1) {
      return NextResponse.redirect(
        new URL(`/dashboard/${existingAccount.vehicles[0].teslaVehicleId.toString()}`, process.env.DOMAIN)
      );
    }
    return NextResponse.redirect(new URL("/vehicles", process.env.DOMAIN));
  }

  return NextResponse.redirect(new URL("/vehicles/confirm", process.env.DOMAIN));
}
