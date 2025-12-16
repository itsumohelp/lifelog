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

// JSTの“日付キー”を Date にする（JST 00:00 をUTCに変換したDate）
function getJstDayKey(d = new Date()): Date {
  // JST = UTC+9
  const utc = d.getTime();
  const jst = new Date(utc + 9 * 60 * 60 * 1000);

  // JSTで日付だけに丸める
  const y = jst.getUTCFullYear();
  const m = jst.getUTCMonth();
  const day = jst.getUTCDate();
  const jstMidnightUtc = Date.UTC(y, m, day, 0, 0, 0) - 9 * 60 * 60 * 1000;

  return new Date(jstMidnightUtc);
}

async function callFleetApi(path: string, accessToken: string) {
  const base = requireEnv("TESLA_FLEET_BASE_URL"); // 例: https://fleet-api.prd.na.vn.cloud.tesla.com
  const url = `${base}${path}`;
  const res = await fetch(url, {
    headers: {Authorization: `Bearer ${accessToken}`},
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Fleet API error: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

function pickSnapshotFields(vehicleData: any) {
  // vehicle_data の形は環境で揺れるので、null安全に拾う
  const charge = vehicleData?.response?.charge_state ?? vehicleData?.charge_state;
  const vstate = vehicleData?.response?.vehicle_state ?? vehicleData?.vehicle_state;

  const batteryLevel =
    typeof charge?.battery_level === "number" ? Math.round(charge.battery_level) : null;

  const chargeLimitSoc =
    typeof charge?.charge_limit_soc === "number" ? Math.round(charge.charge_limit_soc) : null;

  // Teslaのodometerは mile の場合がある（地域やAPI仕様で揺れやすい）
  // 今回は “取れたら保存” にして、単位は後で合わせるのが安全
  let odometerKm: number | null = null;
  if (typeof vstate?.odometer === "number") {
    // 多くのケースで miles が返るので、仮に miles→km 変換して保存（欲しくなければそのままでもOK）
    odometerKm = vstate.odometer * 1.609344;
  }

  return {batteryLevel, chargeLimitSoc, odometerKm};
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

  const results: Array<{teslaVehicleId: string; ok: boolean; error?: string}> = [];

  // まずは安全に逐次実行（レート制限やスリープ挙動の影響を避けやすい）
  for (const v of account.vehicles) {
    try {
      const data = await callFleetApi(`/api/1/vehicles/${v.teslaVehicleId.toString()}/vehicle_data`, accessToken);
      const {batteryLevel, chargeLimitSoc, odometerKm} = pickSnapshotFields(data);

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

      results.push({teslaVehicleId: v.teslaVehicleId.toString(), ok: true});
    } catch (e: any) {
      results.push({
        teslaVehicleId: v.teslaVehicleId.toString(),
        ok: false,
        error: e?.message ?? String(e),
      });
    }
  }

  return NextResponse.json({
    ok: true,
    snapshotDate,
    count: results.length,
    results,
  });
}
