import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import {createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey} from "jose";
import {sessionOptions, SessionData} from "@/app/lib/session";

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
  body.set("redirect_uri", "https://" + process.env.DOMAIN + process.env.TESLA_REDIRECT_URI);

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

  // 3) save session
  session.tesla = token;
  session.teslaSub = sub;
  session.oauthState = undefined;
  await session.save();

  return NextResponse.redirect(new URL("/dashboard", "https://" + process.env.DOMAIN));
}
