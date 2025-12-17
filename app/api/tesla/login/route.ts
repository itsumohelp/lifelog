import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import crypto from "crypto";
import {sessionOptions, SessionData} from "@/app/lib/session";
import {buildAuthorizeUrl} from "@/app/lib/tesla";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.pendingTeslaAutoConsent || session.teslaDesiredMode !== "AUTO" || !session.teslaAuthFlowId) {
    return NextResponse.json(
      {ok: false, error: "Consent required before Tesla login"},
      {status: 403}
    );
  }

  const clientId = requireEnv("TESLA_CLIENT_ID");
  const redirectUri = requireEnv("TESLA_REDIRECT_URI"); // 例: https://yourdomain.com/api/tesla/callback
  const authBase = requireEnv("TESLA_AUTH_BASE_URL");   // 例: issuer由来の authorize base


  const state = crypto.randomBytes(16).toString("hex");
  session.oauthState = state;
  await session.save();

  const url = new URL(`${authBase}/oauth2/v3/authorize`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid offline_access vehicle_device_data"); // 例：あなたの運用に合わせて
  url.searchParams.set("state", state);

  return NextResponse.redirect(buildAuthorizeUrl(state));
}
