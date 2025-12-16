import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import {prisma} from "@/prisma";
import {sessionOptions, SessionData} from "@/app/lib/session";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

// JSTの日次キー（JST 00:00 をUTC DateにしてDBのキーにする）
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

async function callFleetApi(path: string, accessToken: string) {
  const base = requireEnv("TESLA_FLEET_BASE_URL");
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
    throw err;
  }
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

function pickFromChargeState(data: any) {
  const charge = data?.response ?? data;
  return {
    batteryLevel: typeof charge?.battery_level === "number" ? Math.round(charge.battery_level) : null,
    chargeLimitSoc: typeof charge?.charge_limit_soc === "number" ? Math.round(charge.charge_limit_soc) : null,
  };
}

function pickFromVehicleState(data: any) {
  const vs = data?.response ?? data;
  // odometer は miles のことが多いので km に変換（不要なら変換を外してもOK）
  const odometerKm =
    typeof vs?.odometer === "number" ? vs.odometer * 1.609344 : null;
  return {odometerKm};
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

  const results: Array<{teslaVehicleId: string; status: string; errorStatus?: number; errorMessage?: string}> = [];

  // 逐次で安全に（スリープ/レート制限回避）
  for (const v of account.vehicles) {
    const id = v.teslaVehicleId.toString();

    let batteryLevel: number | null = null;
    let chargeLimitSoc: number | null = null;
    let odometerKm: number | null = null;

    let status: "OK" | "UNAVAILABLE_ASLEEP" | "ERROR" = "OK";
    let errorStatus: number | null = null;
    let errorMessage: string | null = null;

    try {
      // charge_state（より軽い）
      const chargeData = await callFleetApi(`/api/1/vehicles/${id}/charge_state`, accessToken);
      const c = pickFromChargeState(chargeData);
      batteryLevel = c.batteryLevel;
      chargeLimitSoc = c.chargeLimitSoc;
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

    // vehicle_state は取れたら取る（失敗してもOK/欠測にする）
    if (status === "OK") {
      try {
        const vsData = await callFleetApi(`/api/1/vehicles/${id}/vehicle_state`, accessToken);
        const vs = pickFromVehicleState(vsData);
        odometerKm = vs.odometerKm;
      } catch (e: any) {
        // ここは致命扱いにせず、odometerだけ欠測にする
        //（必要なら status を ERROR に格上げしてもOK）
      }
    }

    // ✅ 重要：成功でも失敗でも “その日” のレコードを upsert する（欠測保存）
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
        fetchedAt: new Date(),
      },
      create: {
        teslaAccountId: account.id,
        teslaVehicleId: v.teslaVehicleId,
        snapshotDate,
        batteryLevel,
        chargeLimitSoc,
        odometerKm,
      },
    });

    results.push({
      teslaVehicleId: id,
      status,
      ...(errorStatus ? {errorStatus} : {}),
      ...(errorMessage ? {errorMessage} : {}),
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
