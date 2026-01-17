// lib/tesla/deriveDailyMetrics.ts
import {prisma} from "@/prisma";

type Derived = {
  prevSnapshotDate: Date | null;
  odometerDeltaKm: number | null;
  batteryDeltaPct: number | null;
  energyUsedKwh: number | null;
  efficiencyKmPerKwh: number | null;
  efficiencyType: string | null;
};

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

async function getCapacityKwh(teslaAccountId: string, teslaVehicleId: bigint): Promise<number | null> {
  const v = await prisma.teslaVehicle.findUnique({
    where: {teslaVehicleId},
    select: {capacityKwh: true},
  });

  if (v?.capacityKwh && Number.isFinite(v.capacityKwh) && v.capacityKwh > 0) return v.capacityKwh;
  return 60;
}

export async function deriveAndUpdateDailySnapshot(input: {
  teslaAccountId: string;
  teslaVehicleId: bigint;
  snapshotDate: Date;
}) {
  const {teslaAccountId, teslaVehicleId, snapshotDate} = input;

  // 今日分
  const today = await prisma.teslaVehicleDailySnapshot.findUnique({
    where: {
      uniq_daily_snapshot: {teslaAccountId, teslaVehicleId, snapshotDate},
    },
    select: {
      snapshotDate: true,
      batteryLevel: true,
      odometerKm: true,
      chargeEnergyAdded: true,
      chargedKwhFromHistory: true, // 充電履歴から取得した充電量
    },
  });

  if (!today) return;

  // 直近の過去1件（前回スナップ）
  const prev = await prisma.teslaVehicleDailySnapshot.findFirst({
    where: {
      teslaAccountId,
      teslaVehicleId,
      snapshotDate: {lt: snapshotDate},
    },
    orderBy: {snapshotDate: "desc"},
    select: {
      snapshotDate: true,
      batteryLevel: true,
      odometerKm: true,
    },
  });

  const derived: Derived = {
    prevSnapshotDate: prev?.snapshotDate ?? null,
    odometerDeltaKm: null,
    batteryDeltaPct: null,
    energyUsedKwh: null,
    efficiencyKmPerKwh: null,
    efficiencyType: null,
  };

  if (!prev) {
    await prisma.teslaVehicleDailySnapshot.update({
      where: {uniq_daily_snapshot: {teslaAccountId, teslaVehicleId, snapshotDate}},
      data: derived,
    });
    return;
  }

  // delta（欠損はnull）
  const hasOdo = typeof today.odometerKm === "number" && typeof prev.odometerKm === "number";
  const hasSoc = typeof today.batteryLevel === "number" && typeof prev.batteryLevel === "number";

  const odometerDelta = hasOdo ? today.odometerKm! - prev.odometerKm! : null;
  const batteryDelta = hasSoc ? today.batteryLevel! - prev.batteryLevel! : null;

  derived.odometerDeltaKm = odometerDelta !== null && Number.isFinite(odometerDelta) ? odometerDelta : null;
  derived.batteryDeltaPct = batteryDelta !== null && Number.isFinite(batteryDelta) ? Math.trunc(batteryDelta) : null;

  // 電費計算
  const odoOk = derived.odometerDeltaKm !== null && derived.odometerDeltaKm > 0.3;

  // 充電履歴から取得した充電量がある場合
  const chargedKwh = today.chargedKwhFromHistory;
  const hasChargingHistory = typeof chargedKwh === "number" && chargedKwh > 0;

  if (odoOk && hasChargingHistory) {
    // 充電履歴がある場合：
    // 消費電力 = 充電量 + (バッテリー減少分 × バッテリー容量)
    // ただしバッテリーが増えている場合は、純粋に充電量を使う
    const cap = await getCapacityKwh(teslaAccountId, teslaVehicleId);
    if (cap && cap > 0) {
      let energyUsedKwh: number;

      if (derived.batteryDeltaPct !== null && derived.batteryDeltaPct < 0) {
        // バッテリーが減少している場合：充電量 + 減少分
        const dropPct = clamp(-derived.batteryDeltaPct, 0, 100);
        energyUsedKwh = chargedKwh! + (cap * dropPct / 100);
      } else if (derived.batteryDeltaPct !== null && derived.batteryDeltaPct > 0) {
        // バッテリーが増加している場合：充電量 - 増加分（走行で使った分）
        const increasePct = clamp(derived.batteryDeltaPct, 0, 100);
        energyUsedKwh = Math.max(0, chargedKwh! - (cap * increasePct / 100));
      } else {
        // バッテリーが変わらない場合：充電量がそのまま使われた
        energyUsedKwh = chargedKwh!;
      }

      if (energyUsedKwh > 0.05) {
        derived.energyUsedKwh = energyUsedKwh;
        derived.efficiencyKmPerKwh = derived.odometerDeltaKm! / energyUsedKwh;
        derived.efficiencyType = "CHARGING_HISTORY";
      }
    }
  } else if (odoOk && derived.batteryDeltaPct !== null && derived.batteryDeltaPct < 0) {
    // 従来のロジック：バッテリー減少日のみ推定
    const chargeAdded = typeof today.chargeEnergyAdded === "number" ? today.chargeEnergyAdded : null;
    const chargingLikely = chargeAdded !== null && chargeAdded > 0.5;

    if (!chargingLikely) {
      const cap = await getCapacityKwh(teslaAccountId, teslaVehicleId);
      if (cap && cap > 0) {
        const dropPct = clamp(-derived.batteryDeltaPct, 0, 100);
        const energyUsedKwh = cap * (dropPct / 100);

        if (energyUsedKwh > 0.05) {
          derived.energyUsedKwh = energyUsedKwh;
          derived.efficiencyKmPerKwh = derived.odometerDeltaKm! / energyUsedKwh;
          derived.efficiencyType = "ESTIMATED";
        }
      }
    } else {
      derived.efficiencyType = "UNKNOWN";
    }
  } else {
    derived.efficiencyType = "UNKNOWN";
  }

  await prisma.teslaVehicleDailySnapshot.update({
    where: {uniq_daily_snapshot: {teslaAccountId, teslaVehicleId, snapshotDate}},
    data: derived,
  });
}
