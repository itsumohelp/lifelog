import {prisma} from "@/prisma";
import path from "path";

type FleetFetchOptions = {
  errorFlg: boolean;
  teslaAccountId: string;
  statusCode?: number;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  teslaVehicleId?: bigint;
  errorMessage?: string;
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
        statusCode: opts.statusCode,
        errorMessage: opts.errorMessage ? maskJson(opts.errorMessage) : undefined,
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

export async function fleetFetch(
  accessToken: string,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const base = process.env.TESLA_FLEET_BASE_URL;
  if (!base) throw new Error("TESLA_FLEET_BASE_URL is not set");

  const url = `${base}${path}`;

  return fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
}
