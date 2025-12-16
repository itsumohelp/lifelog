// app/api/tesla/callback/route.ts
import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import {sessionOptions, SessionData} from "@/app/lib/session";
import {exchangeCodeForToken} from "@/app/lib/tesla";
import {verifyAndGetSubFromIdToken} from "@/app/lib/tesla-oidc";

export async function GET(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  const {searchParams} = new URL(req.url);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !state) {
    return NextResponse.json({ok: false, error: "missing code/state"}, {status: 400});
  }
  if (!session.oauthState || session.oauthState !== state) {
    return NextResponse.json({ok: false, error: "state mismatch"}, {status: 400});
  }

  const token = await exchangeCodeForToken(code);

  // id_token から sub を確定
  if (!token.id_token) {
    return NextResponse.json(
      {ok: false, error: "missing id_token (need openid scope)"},
      {status: 500}
    );
  }

  const sub = await verifyAndGetSubFromIdToken(token.id_token);

  session.tesla = token;
  session.teslaSub = sub;
  session.oauthState = undefined;
  await session.save();

  return NextResponse.redirect(new URL("/dashboard", process.env.APP_BASE_URL!));
}
