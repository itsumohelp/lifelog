import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import {createRemoteJWKSet, jwtVerify} from "jose";
import {sessionOptions, SessionData} from "@/app/lib/session";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  created_at?: number;
  scope?: string;
  token_type?: string;
};

// Tesla: token exchange endpoint（ここは fleet-auth.prd.vn.cloud.tesla.com）
const TOKEN_URL = "https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/token";

// Tesla: OIDC discovery（ここも fleet-auth.prd.vn.cloud.tesla.com）
const DISCOVERY_URL =
  "https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/thirdparty/.well-known/openid-configuration";

// discoveryはキャッシュしてOK
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
let issuer: string | null = null;

async function getOidcVerifier() {
  if (jwks && issuer) return {jwks, issuer};

  const res = await fetch(DISCOVERY_URL, {cache: "force-cache"});
  if (!res.ok) throw new Error(`Failed to load OIDC discovery: ${res.status}`);
  const meta = await res.json();

  issuer = meta.issuer;
  jwks = createRemoteJWKSet(new URL(meta.jwks_uri));
  return {jwks, issuer};
}

async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("client_id", process.env.TESLA_CLIENT_ID!);
  body.set("client_secret", process.env.TESLA_CLIENT_SECRET!);
  body.set("code", code);
  body.set("redirect_uri", process.env.TESLA_REDIRECT_URI!);

  // 重要：audience は Fleet API base URL（ホストまで。/api/1は付けない）
  body.set("audience", process.env.TESLA_FLEET_BASE_URL!);

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

async function verifyAndGetSub(idToken: string): Promise<string> {
  const {jwks, issuer} = await getOidcVerifier();

  const {payload} = await jwtVerify(idToken, jwks, {
    issuer,
    audience: process.env.TESLA_CLIENT_ID, // id_tokenのaudはclient_idになる想定
  });

  const sub = payload.sub;
  if (!sub || typeof sub !== "string") throw new Error("id_token missing sub");
  return sub;
}

export async function GET(req: Request) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

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

  // token取得
  const token = await exchangeCodeForToken(code);

  // id_token から sub 抽出（署名検証あり）
  if (!token.id_token) {
    return NextResponse.json(
      {ok: false, error: "missing id_token (need openid scope)"},
      {status: 500}
    );
  }
  const sub = await verifyAndGetSub(token.id_token);

  // session保存
  session.tesla = token;
  session.teslaSub = sub;
  session.oauthState = undefined;
  await session.save();

  // redirect先は固定が安全（Azure内hostズレ対策）
  const base = process.env.APP_BASE_URL!;
  return NextResponse.redirect(new URL("/dashboard", base));
}
