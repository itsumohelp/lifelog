import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import {sessionOptions, SessionData} from "@/app/lib/session";
import {exchangeCodeForToken} from "@/app/lib/tesla";

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
  session.tesla = token;
  session.oauthState = undefined;
  await session.save();

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
