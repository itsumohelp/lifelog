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

export async function getTeslaMode(teslaAccountId: string): Promise<"MANUAL" | "AUTO"> {
  const teslaSub = await requireTeslaSub();
  const account = await prisma.teslaAccount.findUnique({
    where: {teslaSub},
    include: {authToken: true, settings: true},
  });
  if (!account) throw new Error("TeslaAccount not found");

  const settings = await prisma.teslaSettings.findUnique({
    where: {teslaAccountId},
  });

  return settings?.mode ?? "MANUAL";
}


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
  }

  if (input.mode === "AUTO") {
    await prisma.teslaSettings.upsert({
      where: {teslaAccountId: account.id},
      update: {
        mode: input.mode,
        consentGivenAt: new Date(),
        consentVersion: CONSENT_VERSION,
      },
      create: {
        teslaAccountId: account.id,
        mode: input.mode,
        consentGivenAt: new Date(),
        consentVersion: CONSENT_VERSION,
      },
    });

  } else {
    await prisma.$transaction([
      prisma.teslaAuthToken.deleteMany({where: {teslaAccountId: account.id}}),
      prisma.teslaSettings.upsert({
        where: {teslaAccountId: account.id},
        update: {mode: "MANUAL"},
        create: {teslaAccountId: account.id, mode: "MANUAL"},
      }),
    ]);
  }

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

  // アカウントを物理削除（関連データはonDelete: Cascadeで自動削除される）
  // 明示的に関連データも削除してからアカウントを削除
  await prisma.$transaction([
    // 車両に紐づくデータを削除
    prisma.vehicleOptions.deleteMany({
      where: {teslaVehicle: {teslaAccountId: account.id}},
    }),
    prisma.teslaVehicleOverride.deleteMany({
      where: {teslaVehicle: {teslaAccountId: account.id}},
    }),
    // 日次スナップショットを削除
    prisma.teslaVehicleDailySnapshot.deleteMany({where: {teslaAccountId: account.id}}),
    // 車両を削除
    prisma.teslaVehicle.deleteMany({where: {teslaAccountId: account.id}}),
    // トークン・設定・ジョブを削除
    prisma.teslaAuthToken.deleteMany({where: {teslaAccountId: account.id}}),
    prisma.teslaSettings.deleteMany({where: {teslaAccountId: account.id}}),
    prisma.syncJob.deleteMany({where: {teslaAccountId: account.id}}),
    // APIログは残す（teslaAccountIdは参照のみ）
    // 最後にアカウント自体を削除
    prisma.teslaAccount.delete({where: {id: account.id}}),
  ]);

  // セッションをクリア
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  session.teslaSub = undefined;
  session.tesla = undefined;
  await session.save();

  return {ok: true as const};
}

export async function agreeAndStartTeslaLogin(input: {
  consentUnderstand: boolean;
  consentStoreToken: boolean;
  fromSettings?: boolean;
}) {
  if (!input.fromSettings && (!input.consentUnderstand || !input.consentStoreToken)) {
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
