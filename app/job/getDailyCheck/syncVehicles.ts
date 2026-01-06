import {prisma} from "@/prisma";
import {fetchVehicles, fetchVehicleData, fetchOptions} from "@/app/job/getDailyCheck/api";
import {milesToKm, rangeToKm} from "@/app/lib/utility";
import {Codes} from "@/app/static/Codes";
import {deriveAndUpdateDailySnapshot} from "@/app/lib/deriveDailyMetrics";

function startOfJstDay(date = new Date()) {
  // JSTで日次にしたい前提：DBはUTC保存でOK、境界をJSTで切る
  // もっと厳密にやるなら dayjs.tz 等で。
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  jst.setUTCHours(0, 0, 0, 0);
  // ここでの jst は「UTC表現のJST 0時」なので、UTCに戻す
  return new Date(jst.getTime() - 9 * 60 * 60 * 1000);
}

export type SyncResult = {
  teslaVehicleId: string;
  displayName: string | null;
  status: "ok" | "timeout" | "error";
  errorMessage?: string;
};

export async function syncVehiclesAndDailySnapshot(params: {
  teslaAccountId: string;
  accessToken: string;
}): Promise<SyncResult[]> {
  const {teslaAccountId, accessToken} = params;

  // check to vhicles from marsflare db
  // const vehicles = await fetchVehicles(accessToken);

  // 2) TeslaVehicleへ upsert（車両マスタ）

  const vehicles = await prisma.teslaVehicle.findMany({
    where: {teslaAccountId},
  });

  const results: SyncResult[] = [];

  for (const v of vehicles) {
    const teslaVehicleId = BigInt(v.teslaVehicleId);

    // const vehicleRes = await prisma.teslaVehicle.upsert({
    //   where: {teslaVehicleId}, // あなたのschemaに合わせてユニークキーを調整してください
    //   update: {
    //     teslaAccountId,
    //     displayName: v.display_name ?? null,
    //     state: v.state ?? null,
    //     accessType: v.access_type ?? null,
    //     rawJson: v as any,
    //   },
    //   create: {
    //     teslaAccountId,
    //     teslaVehicleId,
    //     displayName: v.display_name ?? null,
    //     state: v.state ?? null,
    //     accessType: v.access_type ?? null,
    //     rawJson: v as any,
    //   },
    // });

    // // vehicle options 取得・保存
    // const request = await fetchOptions(accessToken, v?.vin ?? "", teslaAccountId, teslaVehicleId);
    // const options: {code: string}[] = request?.codes ?? [];

    // console.log("this is check + " + JSON.stringify(request));
    // if (request.length === 0) {
    //   return;
    // }

    // options.map(async (s) => {
    //   const vehicleKind = s.code

    //   const codeKey = s.code as keyof typeof Codes;
    //   const checkCodes = Codes[codeKey];
    //   if (checkCodes) {
    //     await prisma.teslaVehicle.update({
    //       where: {teslaVehicleId},
    //       data: {
    //         vehicleGrade: checkCodes["grade"] || null,
    //         capacityKwh: checkCodes["batteryCapacity"] || null,
    //       },
    //     });
    //   }

    //   return prisma.vehicleOptions.upsert({
    //     where: {
    //       vehicleId_code: {
    //         vehicleId: vehicleRes.id,
    //         code: vehicleKind,
    //       },
    //     },
    //     update: {
    //       code: vehicleKind
    //     },
    //     create: {
    //       vehicleId: v.id.toString(),
    //       code: vehicleKind
    //     },
    //   });
    // })

    const snapshotDate = startOfJstDay(new Date());
    const vd = await fetchVehicleData(accessToken, teslaVehicleId, teslaAccountId);

    // 408 欠測保存
    if (vd.kind === "timeout") {
      await prisma.teslaVehicleDailySnapshot.upsert({
        where: {
          uniq_daily_snapshot: {
            teslaAccountId,
            teslaVehicleId,
            snapshotDate,
          },
        },
        update: {
          fetchedAt: new Date(),
          // 欠測なので値は更新しない（方針次第で null 上書きもOK）
        },
        create: {
          teslaAccountId,
          teslaVehicleId,
          snapshotDate,
          fetchedAt: new Date(),
        },
      });

      results.push({
        teslaVehicleId: teslaVehicleId.toString(),
        displayName: v.displayName,
        status: "timeout",
      });

      continue;
    }

    const data = vd.data || {};

    const batteryLevel = data.charge_state?.battery_level ?? null;
    const chargeLimitSoc = data.charge_state?.charge_limit_soc ?? null;

    const batteryRangeKm = rangeToKm(data.charge_state?.battery_range ?? null);
    const estBatteryRangeKm = rangeToKm(data.charge_state?.est_battery_range ?? null);

    const odometerKm = milesToKm(data.vehicle_state?.odometer ?? null);

    const outsideTemp = data.climate_state?.outside_temp ?? null;
    const insideTemp = data.climate_state?.inside_temp ?? null;
    const chargeEnergyAdded = data.charge_state?.charge_energy_added ?? null;

    await prisma.teslaVehicleDailySnapshot.upsert({
      where: {
        uniq_daily_snapshot: {
          teslaAccountId,
          teslaVehicleId,
          snapshotDate,
        },
      },
      update: {
        fetchedAt: new Date(),
        batteryLevel,
        chargeLimitSoc,
        odometerKm,
        batteryRangeKm,
        estBatteryRangeKm,
        outsideTemp,
        insideTemp,
        chargeEnergyAdded,
        status: true,
      },
      create: {
        teslaAccountId,
        teslaVehicleId,
        snapshotDate,
        fetchedAt: new Date(),
        batteryLevel,
        chargeLimitSoc,
        odometerKm,
        batteryRangeKm,
        estBatteryRangeKm,
        outsideTemp,
        insideTemp,
        chargeEnergyAdded,
        status: true,
      },
    });

    upsertDailySnapshotAndDerive({
      teslaAccountId,
      teslaVehicleId,
      snapshotDate,
      batteryLevel,
      chargeLimitSoc,
      odometerKm,
      batteryRangeKm,
      estBatteryRangeKm,
      outsideTemp,
      insideTemp,
      chargeEnergyAdded,
    });

    results.push({
      teslaVehicleId: teslaVehicleId.toString(),
      displayName: v.displayName,
      status: "ok",
    });
  }

  return results;
}

export async function upsertDailySnapshotAndDerive(data: {
  teslaAccountId: string;
  teslaVehicleId: bigint;
  snapshotDate: Date;
  batteryLevel?: number | null;
  chargeLimitSoc?: number | null;
  odometerKm?: number | null;
  batteryRangeKm?: number | null;
  estBatteryRangeKm?: number | null;
  outsideTemp?: number | null;
  insideTemp?: number | null;
  chargeEnergyAdded?: number | null;
}) {
  const {teslaAccountId, teslaVehicleId, snapshotDate, ...rest} = data;

  await prisma.teslaVehicleDailySnapshot.upsert({
    where: {uniq_daily_snapshot: {teslaAccountId, teslaVehicleId, snapshotDate}},
    create: {teslaAccountId, teslaVehicleId, snapshotDate, ...rest},
    update: {...rest, fetchedAt: new Date()},
  });

  await deriveAndUpdateDailySnapshot({teslaAccountId, teslaVehicleId, snapshotDate});
}
