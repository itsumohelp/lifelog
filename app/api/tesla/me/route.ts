// app/api/tesla/me/route.ts
import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import {sessionOptions, SessionData} from "@/app/lib/session";
import {callFleetApi} from "@/app/lib/tesla";

export async function GET(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.tesla?.access_token) {
    return NextResponse.json({ok: false, error: "not authed"}, {status: 401});
  }
  const data = await callFleetApi("/api/1/users/me", session.tesla.access_token);
  return NextResponse.json({ok: true, data});
}
