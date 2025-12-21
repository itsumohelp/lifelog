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

  // 推定電費（条件を満たす日だけ）
  const odoOk = derived.odometerDeltaKm !== null && derived.odometerDeltaKm > 0.3;
  const socOk = derived.batteryDeltaPct !== null && derived.batteryDeltaPct < 0; // 減少日だけ

  const chargeAdded = typeof today.chargeEnergyAdded === "number" ? today.chargeEnergyAdded : null;
  const chargingLikely = chargeAdded !== null && chargeAdded > 0.5; // ガード（後で調整）

  if (odoOk && socOk && !chargingLikely) {
    const cap = await getCapacityKwh(teslaAccountId, teslaVehicleId);
    if (cap && cap > 0) {
      const dropPct = clamp(-derived.batteryDeltaPct!, 0, 100); // 例: -5% → 5
      const energyUsedKwh = cap * (dropPct / 100);

      // 0割回避
      if (energyUsedKwh > 0.05) {
        derived.energyUsedKwh = energyUsedKwh;
        derived.efficiencyKmPerKwh = derived.odometerDeltaKm! / energyUsedKwh;
        derived.efficiencyType = "ESTIMATED";
      }
    }
  } else {
    derived.efficiencyType = "UNKNOWN";
  }

  await prisma.teslaVehicleDailySnapshot.update({
    where: {uniq_daily_snapshot: {teslaAccountId, teslaVehicleId, snapshotDate}},
    data: derived,
  });
}
