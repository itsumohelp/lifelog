import {fleetFetch, fleetFetchLog} from "@/app/lib/fleetFetch";

export type FleetVehicle = {
  id: number; // teslaVehicleId (BigIntで保存するなら注意)
  vehicle_id?: number;
  vin?: string;
  display_name?: string;
  state?: string;
  access_type?: string;
};

export async function fetchVehicles(accessToken: string): Promise<FleetVehicle[]> {
  const res = await fleetFetch(accessToken, "/api/1/vehicles");

  if (!res.ok) {
    const text = await res.text();
    fleetFetchLog({
      errorFlg: true,
      teslaAccountId: "batch",
      method: "POST",
      path: "/api/1/vehicles",
      teslaVehicleId: undefined
    })

    throw new Error(`fetchVehicles failed: ${res.status} ${text}`);
  }

  fleetFetchLog({
    errorFlg: false,
    teslaAccountId: "batch",
    method: "POST",
    path: "/api/1/vehicles",
    teslaVehicleId: undefined
  })
  console.log("Fetched vehicles successfully.");

  const json = await res.json();
  return json?.response ?? [];
}

export type VehicleDataResponse = {
  charge_state?: {
    battery_level?: number;      // %
    charge_limit_soc?: number;   // %
    battery_range?: number;      // miles or km（環境次第）
    est_battery_range?: number;  // miles or km
    charge_energy_added?: number; // %
  };
  vehicle_state?: {
    odometer?: number; // miles (多い) ※環境により
  };
  climate_state?: {
    outside_temp?: number;
    inside_temp?: number;
  };
};

export async function fetchVehicleData(accessToken: string, teslaVehicleId: bigint, teslaAccountId: string) {
  const res = await fleetFetch(accessToken, `/api/1/vehicles/${teslaVehicleId.toString()}/vehicle_data`);


  // 408は欠測として扱う（throwしない）
  if (res.status === 408) {
    fleetFetchLog({
      errorFlg: true,
      teslaAccountId: teslaAccountId,
      method: "POST",
      path: "/api/1/vehicles/VEHICLETAG/vehicle_data",
      teslaVehicleId: teslaVehicleId,
      errorMessage: "408 vehicle was sleeping"
    })
    return {kind: "timeout" as const};
  }

  if (!res.ok) {
    const text = await res.text();
    fleetFetchLog({
      errorFlg: true,
      teslaAccountId: teslaAccountId,
      method: "POST",
      path: "/api/1/vehicles/VEHICLETAG/vehicle_data",
      teslaVehicleId: teslaVehicleId,
    })
    throw new Error(`fetchVehicleData failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  fleetFetchLog({
    errorFlg: false,
    teslaAccountId: teslaAccountId,
    method: "POST",
    path: "/api/1/vehicles/VEHICLETAG/vehicle_data",
    teslaVehicleId: teslaVehicleId,
  })
  return {kind: "ok" as const, data: (json?.response ?? {}) as VehicleDataResponse};
}
