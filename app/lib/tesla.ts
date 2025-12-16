// lib/tesla.ts
export function buildAuthorizeUrl(state: string) {
  const url = new URL("https://auth.tesla.com/oauth2/v3/authorize"); // :contentReference[oaicite:3]{index=3}
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", process.env.TESLA_CLIENT_ID!);
  url.searchParams.set("redirect_uri", "https://" + process.env.DOMAIN + process.env.TESLA_REDIRECT_URI);

  // 最低限：openid + vehicle_device_data + offline_access（refresh token欲しければ）
  url.searchParams.set(
    "scope",
    "openid vehicle_device_data offline_access"
  ); // スコープ指定 :contentReference[oaicite:4]{index=4}

  url.searchParams.set("state", state);
  url.searchParams.set("locale", "ja-JP");
  url.searchParams.set("prompt", "login");

  // 任意：不足スコープがあれば同意画面を出す
  url.searchParams.set("prompt_missing_scopes", "true"); // :contentReference[oaicite:5]{index=5}

  return url.toString();
}

export async function exchangeCodeForToken(code: string) {
  const tokenUrl = "https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/token";

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("client_id", process.env.TESLA_CLIENT_ID!);
  body.set("client_secret", process.env.TESLA_CLIENT_SECRET!);
  body.set("code", code);

  // 重要：audience は Fleet API base URL
  body.set("audience", process.env.TESLA_FLEET_BASE_URL!); // :contentReference[oaicite:7]{index=7}

  body.set("redirect_uri", "https://" + process.env.DOMAIN + process.env.TESLA_REDIRECT_URI);

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    created_at?: number;
    scope?: string;
    token_type?: string;
  };
}

export async function callFleetApi(path: string, accessToken: string) {
  const base = process.env.TESLA_FLEET_BASE_URL!;
  const url = `${base}${path}`;
  const res = await fetch(url, {
    headers: {Authorization: `Bearer ${accessToken}`}, // :contentReference[oaicite:8]{index=8}
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Fleet API error: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}
