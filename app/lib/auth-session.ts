import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import {sessionOptions, type SessionData} from "@/app/lib/session";

export async function requireTeslaSub(): Promise<string> {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  const teslaSub = session.teslaSub;
  if (!teslaSub) throw new Error("Not logged in (teslaSub missing)");
  return teslaSub;
}
