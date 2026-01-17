import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import {sessionOptions, SessionData} from "@/app/lib/session";

export async function POST() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  // セッションを破棄
  session.destroy();

  return NextResponse.json({ok: true});
}

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  // セッションを破棄
  session.destroy();

  // トップページへリダイレクト
  return NextResponse.redirect(new URL("/", process.env.DOMAIN));
}
