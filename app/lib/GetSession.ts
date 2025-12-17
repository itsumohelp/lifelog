import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import {SessionData, sessionOptions} from "./session";

export async function getSessionSafe(): Promise<SessionData | null> {
  // sessionOptions.password が無いと iron-session は例外を投げるので先にガード
  const pw = (sessionOptions as any)?.password;
  if (!pw) return null;

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  return session;
}
