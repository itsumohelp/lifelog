import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import crypto from "crypto";
import {sessionOptions, SessionData} from "@/app/lib/session";
import {buildAuthorizeUrl} from "@/app/lib/tesla";

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  const state = crypto.randomBytes(16).toString("hex");
  session.oauthState = state;
  await session.save();

  return NextResponse.redirect(buildAuthorizeUrl(state));
}
