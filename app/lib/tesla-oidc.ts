import {createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey} from "jose";

/**
 * 固定の discovery URL（Tesla公式の thirdparty OIDC metadata）
 * ※ ここは fleet-auth.prd.vn.cloud.tesla.com を固定使用
 */
const DISCOVERY_URL =
  "https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/thirdparty/.well-known/openid-configuration";

/**
 * JWKS取得関数（Remote JWK Set）
 * 一度作って再利用（lambda/edgeでなければ十分効果あり）
 */
let getKey: JWTVerifyGetKey | null = null;

async function getRemoteGetKey(): Promise<JWTVerifyGetKey> {
  if (getKey) return getKey;

  const res = await fetch(DISCOVERY_URL, {cache: "force-cache"});
  if (!res.ok) {
    throw new Error(`Failed to load OIDC discovery: ${res.status}`);
  }
  const meta = await res.json();

  // discoveryの jwks_uri を使うが、ここで得られるURLが
  // fleet-auth.tesla.com に寄っていてDNSで死ぬ環境があるため、
  // 念のためログで確認したくなる場合は console.log してOK
  const jwksUri = String(meta.jwks_uri);

  // jwks_uri が fleet-auth.tesla.com だったとしても、
  // それがDNSで引けない環境ではここで落ちる。
  // その場合は「jwksUri のホストを prd.vn.cloud.tesla.com に置換」する回避も可能。
  getKey = createRemoteJWKSet(new URL(jwksUri));
  return getKey;
}

/**
 * id_token を検証して sub を返す
 * - issuer 検証はしない（今回のENOTFOUND回避のため）
 * - audience は必ず client_id で検証する（ここが重要）
 */
export async function verifyAndGetSubFromIdToken(idToken: string): Promise<string> {
  const clientId = process.env.TESLA_CLIENT_ID;
  if (!clientId) throw new Error("TESLA_CLIENT_ID is not set");

  const key = await getRemoteGetKey();

  const {payload} = await jwtVerify(idToken, key, {
    audience: clientId,
    // issuer は指定しない（= 検証しない）
  });

  const sub = payload.sub;
  if (!sub || typeof sub !== "string") {
    throw new Error("id_token missing sub");
  }
  return sub;
}
