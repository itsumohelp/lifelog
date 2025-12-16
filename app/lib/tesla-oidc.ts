import {createRemoteJWKSet, jwtVerify} from "jose";

const DISCOVERY_URL =
  "https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/thirdparty/.well-known/openid-configuration";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
let issuer: string | null = null;

async function getJwksAndIssuer() {
  if (jwks && issuer) return {jwks, issuer};

  const res = await fetch(DISCOVERY_URL, {cache: "force-cache"});
  if (!res.ok) throw new Error(`Failed to load OIDC discovery: ${res.status}`);
  const meta = await res.json();

  issuer = meta.issuer;
  jwks = createRemoteJWKSet(new URL(meta.jwks_uri));
  return {jwks, issuer};
}

export async function verifyAndGetSubFromIdToken(idToken: string) {
  const {jwks, issuer} = await getJwksAndIssuer();
  if (!issuer) throw new Error("Issuer is null");

  const {payload} = await jwtVerify(idToken, jwks, {
    audience: process.env.TESLA_CLIENT_ID || undefined, // client_id を audience として検証
  });

  const sub = payload.sub;
  if (!sub || typeof sub !== "string") throw new Error("id_token missing sub");
  return sub;
}
