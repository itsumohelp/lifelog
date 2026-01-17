import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import {PrismaClient} from "@prisma/client";
import {sessionOptions, SessionData} from "@/app/lib/session";
import {fleetFetchLog} from "@/app/lib/fleetFetch";
import {getAccessTokenFromDB, TokenRefreshError} from "@/app/lib/getAccessToken";
import {Codes} from "@/app/static/Codes";

const prisma = new PrismaClient();

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

// VINは絶対保存しない（rawJson含めて除去）
function stripVin(obj: any) {
  if (!obj || typeof obj !== "object") return obj;
  const copy: any = Array.isArray(obj) ? [...obj] : {...obj};
  delete copy.vin;
  delete copy.VIN;
  for (const k of Object.keys(copy)) copy[k] = stripVin(copy[k]);
  return copy;
}

async function callFleetApi(path: string, accessToken: string, teslaAccountId: string, teslaVehicleIdS?: bigint, optionFlg: boolean = false) {
  const base = requireEnv("TESLA_FLEET_BASE_URL"); // ホストまで
  const url = `${base}${path}`;

  const res = await fetch(url, {
    headers: {Authorization: `Bearer ${accessToken}`},
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    fleetFetchLog({
      errorFlg: true,
      teslaAccountId: teslaAccountId,
      method: "POST",
      path: optionFlg ? "/api/1/dx/vehicles/options?vin=VIN" : path,
      teslaVehicleId: teslaVehicleIdS,
    })
    throw new Error(`Fleet API error: ${res.status} ${JSON.stringify(json)}`);
  }
  fleetFetchLog({
    errorFlg: false,
    teslaAccountId: teslaAccountId,
    method: "POST",
    path: optionFlg ? "/api/1/dx/vehicles/options?vin=VIN" : path,
    teslaVehicleId: teslaVehicleIdS,
  })

  return json;
}

export async function POST() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  const teslaSub = session.teslaSub;

  if (!teslaSub) {
    return NextResponse.json(
      {ok: false, error: "not authed (missing teslaSub)"},
      {status: 401}
    );
  }

  // TeslaAccount を確保（teslaSubで紐づけ）
  const account = await prisma.teslaAccount.upsert({
    where: {teslaSub},
    update: {},
    create: {teslaSub},
  });

  let accessToken: string;
  try {
    accessToken = await getAccessTokenFromDB(account.id);
  } catch (e) {
    if (e instanceof TokenRefreshError && e.requiresReauth) {
      return NextResponse.json(
        {ok: false, error: e.message, requiresReauth: true},
        {status: 401}
      );
    }
    throw e;
  }

  // vehicles取得
  const data = await callFleetApi("/api/1/vehicles", accessToken, account.id, undefined);
  const vehicles: any[] = data?.response ?? [];

  if (!Array.isArray(vehicles)) {
    return NextResponse.json({ok: false, error: "unexpected response"}, {status: 500});
  }



  // DB反映（VINは保存しない）
  const results = await prisma.$transaction(
    vehicles.map((v) => {
      const teslaVehicleId = BigInt(v.id);
      const teslaVehicleIdS = typeof v.id_s === "string" ? v.id_s : null;

      return prisma.teslaVehicle.upsert({
        where: {
          teslaAccountId_teslaVehicleId: {
            teslaAccountId: account.id,
            teslaVehicleId,
          },
        },
        update: {
          displayName: v.display_name ?? null,
          state: v.state ?? null,
          accessType: v.access_type ?? null,
          teslaVehicleIdS,
          rawJson: stripVin(v),
        },
        create: {
          teslaAccountId: account.id,
          teslaVehicleId,
          displayName: v.display_name ?? null,
          state: v.state ?? null,
          accessType: v.access_type ?? null,
          teslaVehicleIdS,
          rawJson: stripVin(v), // ← VIN削除後に保存
        },
      });
    })
  );

  // vehicle options 取得・保存（複数車両対応）
  await Promise.all(
    vehicles.map(async (v) => {
      const request = await callFleetApi("/api/1/dx/vehicles/options?vin=" + v.vin, accessToken, account.id, undefined, true);
      const options: any[] = request?.codes ?? [];

      if (request.error) {
        console.error("Failed to fetch vehicle options for vehicle " + v.id + ": " + JSON.stringify(request.error));
        return;
      }

      const vehicleId = results.find(r => r.teslaVehicleId === BigInt(v.id))!.id;

      await Promise.all(
        options.map(async (s) => {
          const vehicleKind = s.code;

          const codeKey = s.code as keyof typeof Codes;
          const checkCodes = Codes[codeKey];
          if (checkCodes) {
            await prisma.teslaVehicle.update({
              where: {id: vehicleId},
              data: {
                vehicleGrade: checkCodes["vehicleGrade"] || null,
                capacityKwh: checkCodes["capacityKwh"] || null,
              },
            });
          }
          return prisma.vehicleOptions.upsert({
            where: {
              vehicleId_code: {
                vehicleId: vehicleId,
                code: vehicleKind,
              },
            },
            update: {
              code: vehicleKind,
            },
            create: {
              vehicleId: vehicleId,
              code: vehicleKind,
            },
          });
        })
      );
    })
  );


  return NextResponse.json({
    ok: true,
    count: results.length,
    teslaSub,
    vehicles: results.map((r: {teslaVehicleId: {toString: () => any;}; displayName: any; state: any;}) => ({
      teslaVehicleId: r.teslaVehicleId.toString(),
      displayName: r.displayName,
      state: r.state,
    })),
  });
}
