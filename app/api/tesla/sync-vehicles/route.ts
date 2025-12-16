import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {sessionOptions, SessionData} from "@/app/lib/session";
import {callFleetApi} from "@/app/lib/tesla";

const prisma = new PrismaClient();

function stripVin(obj: any) {
  if (!obj || typeof obj !== "object") return obj;
  const copy: any = Array.isArray(obj) ? [...obj] : {...obj};
  delete copy.vin;
  delete copy.VIN;
  for (const k of Object.keys(copy)) copy[k] = stripVin(copy[k]);
  return copy;
}

export async function POST() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  const accessToken = session.tesla?.access_token;
  const teslaSub = session.teslaSub;

  if (!accessToken || !teslaSub) {
    return NextResponse.json({ok: false, error: "not authed"}, {status: 401});
  }

  // TeslaAccount を確保
  const account = await prisma.teslaAccount.upsert({
    where: {teslaSub},
    update: {},
    create: {teslaSub},
  });

  // vehicles取得
  const data = await callFleetApi("/api/1/vehicles", accessToken);
  const vehicles: any[] = data?.response ?? [];

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
          rawJson: stripVin(v),
        },
      });
    })
  );

  return NextResponse.json({ok: true, count: results.length});
}
