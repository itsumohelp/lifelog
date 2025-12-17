import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import {prisma} from "@/prisma";
import {sessionOptions, SessionData} from "@/app/lib/session";
import {fleetFetchLog} from "@/app/lib/fleetFetch";
import {stat} from "fs";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

// JSTの日次キー（JST 00:00 をUTC DateにしてDBキーに使う）
function getJstDayKey(d = new Date()): Date {
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const m = jst.getUTCMonth();
  const day = jst.getUTCDate();
  const jstMidnightUtc = Date.UTC(y, m, day, 0, 0, 0) - 9 * 60 * 60 * 1000;
  return new Date(jstMidnightUtc);
}

type FleetError = {
  status: number;
  body: any;
  message: string;
};

async function callFleetApi(path: string, accessToken: string, teslaAccountId: string, teslaVehicleIdS?: bigint) {
  const base = requireEnv("TESLA_FLEET_BASE_URL"); // 例: https://fleet-api.prd.na.vn.cloud.tesla.com
  const url = `${base}${path}`;

  const res = await fetch(url, {
    headers: {Authorization: `Bearer ${accessToken}`},
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: FleetError = {
      status: res.status,
      body: json,
      message: `Fleet API error: ${res.status} ${JSON.stringify(json)}`,
    };
    fleetFetchLog({
      errorFlg: true,
      teslaAccountId: teslaAccountId,
      method: "POST",
      path: path,
      teslaVehicleId: teslaVehicleIdS,
    })

    throw err;
  }

  fleetFetchLog({
    errorFlg: false,
    teslaAccountId: teslaAccountId,
    method: "POST",
    path: path,
    teslaVehicleId: teslaVehicleIdS,
  })
  return json;
}

function isVehicleUnavailable(err: any): boolean {
  const status = err?.status;
  const body = err?.body;
  const msg = err?.message ?? "";

  const errorText =
    (typeof body?.error === "string" ? body.error : "") +
    " " +
    (typeof body?.error_description === "string" ? body.error_description : "");

  return (
    status === 408 ||
    msg.includes("vehicle unavailable") ||
    errorText.includes("vehicle unavailable") ||
    errorText.includes("offline or asleep")
  );
}

function pickSnapshotFieldsFromVehicleData(vehicleData: any) {
  const root = vehicleData?.response ?? vehicleData;

  const charge = root?.charge_state;
  const vstate = root?.vehicle_state;
  const climate = root?.climate_state;

  const batteryLevel =
    typeof charge?.battery_level === "number" ? Math.round(charge.battery_level) : null;

  const chargeLimitSoc =
    typeof charge?.charge_limit_soc === "number" ? Math.round(charge.charge_limit_soc) : null;

  // odometer は miles のことが多いので km へ
  const odometerKm =
    typeof vstate?.odometer === "number" ? vstate.odometer * 1.609344 : null;

  // ✅ range は基本 miles → km に変換して保存（日本向け＆比較が楽）
  const MILE_TO_KM = 1.609344;

  const batteryRangeKm =
    typeof charge?.battery_range === "number" ? charge.battery_range * MILE_TO_KM : null;

  const estBatteryRangeKm =
    typeof charge?.est_battery_range === "number" ? charge.est_battery_range * MILE_TO_KM : null;

  // ✅ 気温（℃）: climate_state に outside/inside が入ることが多い
  const outsideTemp =
    typeof climate?.outside_temp === "number" ? climate.outside_temp : null;

  const insideTemp =
    typeof climate?.inside_temp === "number" ? climate.inside_temp : null;

  return {
    batteryLevel,
    chargeLimitSoc,
    odometerKm,
    batteryRangeKm,
    estBatteryRangeKm,
    outsideTemp,
    insideTemp,
  };
}


export async function POST() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  const accessToken = session.tesla?.access_token;
  const teslaSub = session.teslaSub;

  if (!accessToken || !teslaSub) {
    return NextResponse.json({ok: false, error: "not authed"}, {status: 401});
  }

  const account = await prisma.teslaAccount.findUnique({
    where: {teslaSub},
    include: {vehicles: true},
  });

  if (!account) {
    return NextResponse.json({ok: false, error: "tesla account not found"}, {status: 404});
  }

  const snapshotDate = getJstDayKey(new Date());

  const results: Array<{
    teslaVehicleId: string;
    status: "OK" | "UNAVAILABLE_ASLEEP" | "ERROR";
    batteryLevel?: number | null;
    chargeLimitSoc?: number | null;
    errorStatus?: number | null;
    errorMessage?: string | null;
  }> = [];

  for (const v of account.vehicles) {
    const id = v.teslaVehicleId.toString();

    let status: "OK" | "UNAVAILABLE_ASLEEP" | "ERROR" = "OK";
    let errorStatus: number | null = null;
    let errorMessage: string | null = null;

    let batteryLevel: number | null = null;
    let chargeLimitSoc: number | null = null;
    let odometerKm: number | null = null;
    let batteryRangeKm: number | null = null;
    let estBatteryRangeKm: number | null = null;
    let outsideTemp: number | null = null;
    let insideTemp: number | null = null;

    try {
      const data = await callFleetApi(
        `/api/1/vehicles/${id}/vehicle_data`,
        accessToken,
        v.teslaAccountId,
        v.teslaVehicleIdS ? BigInt(v.teslaVehicleIdS) : undefined
      );

      const picked = pickSnapshotFieldsFromVehicleData(data);
      batteryLevel = picked.batteryLevel;
      chargeLimitSoc = picked.chargeLimitSoc;
      odometerKm = picked.odometerKm;
      batteryRangeKm = picked.batteryRangeKm;
      estBatteryRangeKm = picked.estBatteryRangeKm;
      outsideTemp = picked.outsideTemp;
      insideTemp = picked.insideTemp;
    } catch (e: any) {
      if (isVehicleUnavailable(e)) {
        status = "UNAVAILABLE_ASLEEP";
        errorStatus = e.status ?? 408;
        errorMessage = e.message ?? "vehicle unavailable";
      } else {
        status = "ERROR";
        errorStatus = e.status ?? null;
        errorMessage = e.message ?? String(e);
      }
    }

    let apiStatus: boolean = false;
    if (status === "OK") apiStatus = true;

    await prisma.teslaVehicleDailySnapshot.upsert({
      where: {
        uniq_daily_snapshot: {
          teslaAccountId: account.id,
          teslaVehicleId: v.teslaVehicleId,
          snapshotDate,
        },
      },
      update: {
        batteryLevel,
        chargeLimitSoc,
        odometerKm,
        batteryRangeKm,
        estBatteryRangeKm,
        outsideTemp,
        insideTemp,
        fetchedAt: new Date(),
        status: apiStatus,
      },
      create: {
        teslaAccountId: account.id,
        teslaVehicleId: v.teslaVehicleId,
        snapshotDate,
        batteryLevel,
        chargeLimitSoc,
        odometerKm,
        batteryRangeKm,
        estBatteryRangeKm,
        outsideTemp,
        insideTemp,
        fetchedAt: new Date(),
        status: apiStatus,
      },
    });

    results.push({
      teslaVehicleId: id,
      status,
      batteryLevel,
      chargeLimitSoc,
      errorStatus,
      errorMessage,
    });
  }

  const savedCount = await prisma.teslaVehicleDailySnapshot.count({
    where: {teslaAccountId: account.id, snapshotDate},
  });

  return NextResponse.json({
    ok: true,
    snapshotDateIso: snapshotDate.toISOString(),
    vehicles: account.vehicles.length,
    savedCount,
    results,
  });
}
