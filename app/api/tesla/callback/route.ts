import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import {createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey} from "jose";
import {sessionOptions, SessionData} from "@/app/lib/session";

/**
 * ===== Tesla OAuth / OIDC 設定 =====
 */

// Token exchange endpoint（Fleet API 用）
const TOKEN_URL =
  "https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/token";

// OIDC discovery（id_token 検証用）
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
 * ===== OIDC verifier（キャッシュ） =====
 */

let getKey: JWTVerifyGetKey | null = null;
let issuerStr: string | null = null;

async function getOidcVerifier(): Promise<{
  getKey: JWTVerifyGetKey;
  issuer: string;
}> {
  if (getKey && issuerStr) {
    return {getKey, issuer: issuerStr};
  }

  const res = await fetch(DISCOVERY_URL, {cache: "force-cache"});
  if (!res.ok) {
    throw new Error(`Failed to load OIDC discovery: ${res.status}`);
  }

  const meta = await res.json();

  issuerStr = String(meta.issuer);
  getKey = createRemoteJWKSet(new URL(String(meta.jwks_uri)));

  return {getKey, issuer: issuerStr};
}

/**
 * ===== id_token 検証して sub を取り出す =====
 */
async function verifyAndGetSubFromIdToken(idToken: string): Promise<string> {
  const clientId = process.env.TESLA_CLIENT_ID;
  if (!clientId) {
    throw new Error("TESLA_CLIENT_ID is not set");
  }

  const {getKey, issuer} = await getOidcVerifier();

  const {payload} = await jwtVerify(idToken, getKey, {
    issuer,
    audience: clientId,
  });

  const sub = payload.sub;
  if (!sub || typeof sub !== "string") {
    throw new Error("id_token missing sub");
  }

  return sub;
}

/**
 * ===== authorization code → token 交換 =====
 */
async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("client_id", process.env.TESLA_CLIENT_ID!);
  body.set("client_secret", process.env.TESLA_CLIENT_SECRET!);
  body.set("code", code);
  body.set("redirect_uri", "https://" + process.env.DOMAIN + process.env.TESLA_REDIRECT_URI);

  // Fleet API 用 audience（ホストまで /api/1 は付けない）
  body.set("audience", process.env.TESLA_FLEET_BASE_URL!);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `Token exchange failed: ${res.status} ${JSON.stringify(json)}`
    );
  }

  return json as TokenResponse;
}

/**
 * ===== callback handler =====
 */
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
    return NextResponse.json(
      {ok: false, error: "missing code/state"},
      {status: 400}
    );
  }
  if (!session.oauthState || session.oauthState !== state) {
    return NextResponse.json(
      {ok: false, error: "state mismatch"},
      {status: 400}
    );
  }

  // === token 取得 ===
  const token = await exchangeCodeForToken(code);

  if (!token.id_token) {
    return NextResponse.json(
      {ok: false, error: "missing id_token (need openid scope)"},
      {status: 500}
    );
  }

  // === id_token から sub 確定 ===
  const sub = await verifyAndGetSubFromIdToken(token.id_token);

  // === session 保存 ===
  session.tesla = token;
  session.teslaSub = sub;
  session.oauthState = undefined;
  await session.save();

  // === redirect ===
  const baseUrl = process.env.APP_BASE_URL!;
  return NextResponse.redirect(new URL("/dashboard", baseUrl));
}
