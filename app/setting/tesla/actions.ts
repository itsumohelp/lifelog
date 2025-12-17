"use server";

import {prisma} from "@/prisma";
import {requireTeslaSub} from "@/app/lib/auth-session";
import {encrypt} from "@/app/lib/crypto";
import {revalidatePath} from "next/cache";
import {getIronSession} from "iron-session";
import {SessionData, sessionOptions} from "@/app/lib/session";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import crypto from "crypto";


const CONSENT_VERSION = "2025-12-17.v1"; // 注意文を更新したらversionを上げる

type SaveInput = {
  mode: "MANUAL" | "AUTO";
  consentUnderstand: boolean;
  consentStoreToken: boolean;
};

export async function saveTeslaSettings(input: SaveInput) {
  const teslaSub = await requireTeslaSub();

  const account = await prisma.teslaAccount.findUnique({
    where: {teslaSub},
    include: {authToken: true, settings: true},
  });
  if (!account) throw new Error("TeslaAccount not found");

  // AUTOにするなら同意が必須
  if (input.mode === "AUTO") {
    if (!input.consentUnderstand || !input.consentStoreToken) {
      throw new Error("Consent required to enable AUTO mode");
    }
    // AUTOには refresh_token が必要（DB保存前提）
    if (!account.authToken?.refreshTokenEnc) {
      throw new Error("No refresh token stored yet. Complete login/token registration first.");
    }
  }

  await prisma.teslaSettings.upsert({
    where: {teslaAccountId: account.id},
    update: {
      mode: input.mode,
      consentGivenAt: input.mode === "AUTO" ? new Date() : account.settings?.consentGivenAt ?? null,
      consentVersion: input.mode === "AUTO" ? CONSENT_VERSION : account.settings?.consentVersion ?? null,
    },
    create: {
      teslaAccountId: account.id,
      mode: input.mode,
      consentGivenAt: input.mode === "AUTO" ? new Date() : null,
      consentVersion: input.mode === "AUTO" ? CONSENT_VERSION : null,
    },
  });

  revalidatePath("/settings/tesla");
  return {ok: true as const};
}

// callback で token を得たタイミングで呼ぶ用（例：refresh_token保存）
export async function storeRefreshToken(params: {
  refreshToken: string;
  accessToken?: string | null;
  expiresAt: string; // ISO
}) {
  const teslaSub = await requireTeslaSub();

  const account = await prisma.teslaAccount.findUnique({where: {teslaSub}});
  if (!account) throw new Error("TeslaAccount not found");

  const refreshTokenEnc = encrypt(params.refreshToken);
  const accessTokenEnc = params.accessToken ? encrypt(params.accessToken) : null;

  await prisma.teslaAuthToken.upsert({
    where: {teslaAccountId: account.id},
    update: {
      refreshTokenEnc,
      accessTokenEnc: accessTokenEnc ?? undefined,
      expiresAt: new Date(params.expiresAt),
    },
    create: {
      teslaAccountId: account.id,
      refreshTokenEnc,
      accessTokenEnc: accessTokenEnc ?? undefined,
      expiresAt: new Date(params.expiresAt),
    },
  });

  revalidatePath("/settings/tesla");
  return {ok: true as const};
}

export async function deleteStoredToken() {
  const teslaSub = await requireTeslaSub();

  const account = await prisma.teslaAccount.findUnique({where: {teslaSub}});
  if (!account) throw new Error("TeslaAccount not found");

  // トークン削除と同時に MANUAL に戻すのが安全
  await prisma.$transaction([
    prisma.teslaAuthToken.deleteMany({where: {teslaAccountId: account.id}}),
    prisma.teslaSettings.upsert({
      where: {teslaAccountId: account.id},
      update: {mode: "MANUAL"},
      create: {teslaAccountId: account.id, mode: "MANUAL"},
    }),
  ]);

  revalidatePath("/settings/tesla");
  return {ok: true as const};
}

export async function disconnectTesla() {
  const teslaSub = await requireTeslaSub();

  const account = await prisma.teslaAccount.findUnique({where: {teslaSub}});
  if (!account) throw new Error("TeslaAccount not found");

  // 例：連携解除＝トークン/設定/車両を消す（必要に応じて調整）
  await prisma.$transaction([
    prisma.teslaAuthToken.deleteMany({where: {teslaAccountId: account.id}}),
    prisma.teslaSettings.deleteMany({where: {teslaAccountId: account.id}}),
    prisma.teslaVehicle.deleteMany({where: {teslaAccountId: account.id}}),
    // account自体を消すかは方針次第：ここでは残す
  ]);

  revalidatePath("/settings/tesla");
  return {ok: true as const};
}

export async function agreeAndStartTeslaLogin(input: {
  consentUnderstand: boolean;
  consentStoreToken: boolean;
}) {
  if (!input.consentUnderstand || !input.consentStoreToken) {
    throw new Error("同意チェックが必要です。");
  }

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  // ここで「同意済み」をセッションに保存（Teslaログイン前）
  session.pendingTeslaAutoConsent = true;
  session.teslaDesiredMode = "AUTO";
  session.teslaAuthFlowId = crypto.randomBytes(16).toString("hex");

  // （任意）同意バージョンや時刻もセッションに持たせたければ追加してOK
  // session.teslaConsentVersion = CONSENT_VERSION;
  // session.teslaConsentGivenAt = new Date().toISOString();

  await session.save();

  // Teslaログインへ（同意済みセッションを持ったまま移動）
  redirect("/api/tesla/login");
}
