import {prisma} from "@/prisma";
import path from "path";

type FleetFetchOptions = {
  errorFlg: boolean;
  teslaAccountId: string;
  statusCode?: number;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  teslaVehicleId?: bigint;
};


// 必要ならここでmask（今は最低限）
const maskJson = (v: any) => v ?? undefined;

export async function fleetFetchLog<T = any>(opts: FleetFetchOptions) {


  const started = Date.now();

  try {
    await prisma.teslaFleetApiCallLog.create({
      data: {
        teslaAccountId: opts.teslaAccountId,
        teslaVehicleId: opts.teslaVehicleId,
        method: opts.method ?? "GET",
        path: opts.path,
        isSuccess: !opts.errorFlg,
        statusCode: opts.statusCode
      },
    });
  } catch (e: any) {
    const durationMs = Date.now() - started;
    await prisma.teslaFleetApiCallLog.create({
      data: {
        isSuccess: false,
        teslaAccountId: opts.teslaAccountId,
        teslaVehicleId: opts.teslaVehicleId,
        method: opts.method ?? "GET",
        path: opts.path,
        statusCode: opts.statusCode
      },
    });
    throw e;
  }
}
