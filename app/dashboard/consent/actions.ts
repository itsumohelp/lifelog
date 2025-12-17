"use server";

import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import {prisma} from "@/prisma";
import {sessionOptions} from "@/app/lib/session";
import type {SessionData} from "@/app/lib/session";

export async function saveTeslaConsentAndMode(input: {
  mode: "MANUAL" | "AUTO";
  consentVersion: string; // "v1"
}) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  const nowIso = new Date().toISOString();

  // 1) 未ログインでも保存できるようにセッションへ pending 保存
  session.pendingTeslaMode = input.mode;
  session.pendingConsentVersion = input.consentVersion;
  session.pendingConsentGivenAt = nowIso;
  await session.save();

  // 2) middleware用の軽量cookie（ブロック判定用）
  // ※同意の真の根拠は session/DB。これは “門番” 用。
  const jar = await cookies();
  jar.set("mf_tesla_consent", "1", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" ? true : true, // あなたは https なので true でOK
    path: "/",
  });

  // 3) もしログイン済みならDBにも永続化（TeslaSettings）
  if (session.teslaSub) {
    const account = await prisma.teslaAccount.findUnique({
      where: {teslaSub: session.teslaSub},
      select: {id: true},
    });

    if (account) {
      await prisma.teslaSettings.upsert({
        where: {teslaAccountId: account.id},
        create: {
          teslaAccountId: account.id,
          mode: input.mode,
          consentVersion: input.consentVersion,
          consentGivenAt: new Date(nowIso),
        },
        update: {
          mode: input.mode,
          consentVersion: input.consentVersion,
          consentGivenAt: new Date(nowIso),
        },
      });
    }
  }

  return {ok: true};
}
