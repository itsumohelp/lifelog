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

  const json = await res.json();
  return json.response ?? [];
}


export async function fetchOptions(accessToken: string, vin: string, teslaAccountId: string, teslaVehicleId?: bigint): Promise<any> {
  const res = await fleetFetch(accessToken, "/api/1/dx/vehicles/options?vin=" + vin);

  if (!res.ok) {
    const text = await res.text();
    fleetFetchLog({
      errorFlg: true,
      teslaAccountId: teslaAccountId,
      method: "POST",
      path: "/api/1/dx/vehicles/options?vin=VIN",
      teslaVehicleId: teslaVehicleId,
    })
    throw new Error(`fetchVehicles failed: ${res.status} ${text}`);
  }

  fleetFetchLog({
    errorFlg: false,
    teslaAccountId: teslaAccountId,
    method: "POST",
    path: "/api/1/dx/vehicles/options?vin=VIN",
    teslaVehicleId: teslaVehicleId,
  })

  return await res.json() ?? [];
}


export type VehicleDataResponse = {
  vin?: string; // 車両識別番号（充電履歴取得に使用）
  charge_state?: {
    battery_level?: number;      // %
    charge_limit_soc?: number;   // %
    battery_range?: number;      // miles or km（環境次第）
    est_battery_range?: number;  // miles or km
    charge_energy_added?: number; // kWh
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

// 充電履歴のレスポンス型
export type ChargingHistoryItem = {
  sessionId?: number;
  vin?: string;
  siteLocationName?: string;
  chargeStartDateTime?: string;  // ISO形式
  chargeStopDateTime?: string;   // ISO形式
  unlatchDateTime?: string;
  countryCode?: string;
  fees?: {
    sessionFeeId?: number;
    feeType?: string;
    currencyCode?: string;
    pricingType?: string;
    rateBase?: number;
    rateTier1?: number;
    totalBase?: number;
    totalDue?: number;
    netDue?: number;
    usageBase?: number;  // kWh
    usageTier1?: number;
    status?: string;
    uom?: string;
  }[];
  billingType?: string;
  invoices?: any[];
  vehicleMakeType?: string;
  // 充電量（kWh）を抽出するためのヘルパー
  chargeDetails?: {
    energyDetails?: {
      energyAdded?: number; // kWh
    };
  };
};

export type ChargingHistoryResponse = {
  data?: ChargingHistoryItem[];
  totalResults?: number;
};

/**
 * 充電履歴を取得する
 * @param accessToken アクセストークン
 * @param vin 車両識別番号
 * @param startTime 開始日時（ISO形式）
 * @param endTime 終了日時（ISO形式）
 * @param teslaAccountId アカウントID（ログ用）
 */
export async function fetchChargingHistory(
  accessToken: string,
  vin: string,
  startTime: string,
  endTime: string,
  teslaAccountId: string
): Promise<{kind: "ok"; data: ChargingHistoryItem[]} | {kind: "error"; message: string}> {
  const params = new URLSearchParams({
    vin,
    startTime,
    endTime,
  });

  const res = await fleetFetch(accessToken, `/api/1/dx/charging/history?${params.toString()}`);

  if (!res.ok) {
    const text = await res.text();
    fleetFetchLog({
      errorFlg: true,
      teslaAccountId,
      method: "GET",
      path: "/api/1/dx/charging/history",
      errorMessage: `${res.status} ${text}`,
    });
    return {kind: "error", message: `fetchChargingHistory failed: ${res.status} ${text}`};
  }

  const json = await res.json();
  fleetFetchLog({
    errorFlg: false,
    teslaAccountId,
    method: "GET",
    path: "/api/1/dx/charging/history",
  });

  return {kind: "ok", data: (json?.data ?? []) as ChargingHistoryItem[]};
}
