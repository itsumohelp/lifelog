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

  // 4) TeslaAccount upsert（全ユーザー共通）
  const account = await prisma.teslaAccount.upsert({
    where: {teslaSub: sub},
    update: {},
    create: {teslaSub: sub},
  });

  // 5) 同意情報をDBに保存（ログイン前に同意画面で保存されたpendingデータがある場合）
  const hasPendingConsent = session.pendingConsentVersion && session.pendingConsentGivenAt;

  if (hasPendingConsent) {
    // TeslaSettings（同意情報を保存）
    await prisma.teslaSettings.upsert({
      where: {teslaAccountId: account.id},
      update: {
        mode: session.pendingTeslaMode ?? "MANUAL",
        consentGivenAt: new Date(session.pendingConsentGivenAt!),
        consentVersion: session.pendingConsentVersion!,
      },
      create: {
        teslaAccountId: account.id,
        mode: session.pendingTeslaMode ?? "MANUAL",
        consentGivenAt: new Date(session.pendingConsentGivenAt!),
        consentVersion: session.pendingConsentVersion!,
      },
    });

    // ✅ 同意フラグは使い切りにする（再利用防止）
    session.pendingConsentVersion = undefined;
    session.pendingConsentGivenAt = undefined;
    session.pendingTeslaMode = undefined;
    await session.save();
  }

  // 6) トークン保存（暗号化）- 全ユーザー共通で毎回更新
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

  // 既存ユーザーかチェック（日次データが1件でもあれば確認画面をスキップ）
  const existingAccount = await prisma.teslaAccount.findUnique({
    where: {teslaSub: sub},
    include: {
      vehicles: true,
      dailySnapshot: {
        take: 1,
      },
    },
  });

  // 日次データが存在する = 既存ユーザー → 確認画面をスキップ
  const hasExistingData =
    existingAccount &&
    existingAccount.vehicles.length > 0 &&
    existingAccount.dailySnapshot.length > 0;

  if (hasExistingData) {
    if (existingAccount.vehicles.length === 1) {
      return NextResponse.redirect(
        new URL(`/dashboard/${existingAccount.vehicles[0].teslaVehicleId.toString()}`, process.env.DOMAIN)
      );
    }
    return NextResponse.redirect(new URL("/vehicles", process.env.DOMAIN));
  }

  return NextResponse.redirect(new URL("/vehicles/confirm", process.env.DOMAIN));
}
