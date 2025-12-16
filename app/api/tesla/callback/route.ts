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

  function decodeJwtPayload(token: string): any {
    const payload = token.split(".")[1];
    const json = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(json);
  }

  const token = await exchangeCodeForToken(code);

  // id_token から sub を取り出す
  if (!token.id_token) throw new Error("missing id_token (need openid scope)");
  const {sub} = decodeJwtPayload(token.id_token);
  if (!sub) throw new Error("missing sub in id_token");

  // sessionに入れてもいいし、DBに作ってもいい

  session.teslaSub = sub;
  session.tesla = token;
  session.oauthState = undefined;
  await session.save();

  return NextResponse.redirect(new URL("/dashboard", "https://" + process.env.DOMAIN));
}
