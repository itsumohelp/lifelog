import React from "react";
import {OdometerHero} from "./OdometerHero";
import BatteryGauge from "./BatteryGauge";

export type Vehicle = {
    id: string;
    displayName: string | null;
    teslaVehicleId: bigint;
    state: string | null;
    accessType: string | null;
    lastSeenAt: Date;
    vehicleOptions?: Array<{
        code: string;
    }>;
    vehicleGrade?: string | null;
    capacityKwh?: number | null;
};

type Snapshot = {
    batteryLevel: number | null;
    chargeLimitSoc: number | null;
    odometerKm: number | null;

    batteryRangeKm: number | null;
    estBatteryRangeKm: number | null;
    outsideTemp: number | null;
    insideTemp: number | null;

    status: boolean;
    errorStatus: number | null;
    errorMessage: string | null;
    fetchedAt: Date;
};

export function badge(text: string, bg: string, fg: string) {
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 10px",
                borderRadius: 999,
                fontSize: 12,
                background: bg,
                color: fg,
                border: "1px solid rgba(0,0,0,0.06)",
                whiteSpace: "nowrap",
            }}
        >
            {text}
        </span>
    );
}

function fmtTempC(n: number | null | undefined): string {
    if (typeof n !== "number" || Number.isNaN(n)) return "-";
    // 0.5刻みなどがあるので1桁表示が見やすい
    return `${n.toFixed(1)}℃`;
}


export default function VehicleCards({
    vehicles,
    todayMap,
    yesterdayMap,
    hideVehicleTag = false,
}: {
    vehicles: Vehicle[];
    todayMap: Record<string, Snapshot>;
    yesterdayMap: Record<string, Snapshot>;
    hideVehicleTag?: boolean;
}) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 12,
            }}
        >
            {vehicles.map((v) => {
                const key = v.teslaVehicleId.toString();
                const today = todayMap?.[key];
                const yesterday = yesterdayMap?.[key];

                return (
                    <div
                        key={v.id}
                        style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: 12,
                            padding: "5px 10px 10px 5px",
                            background: "white",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                            display: "grid",
                            gap: 10,
                        }}
                    >

                        <div style={{display: "flex", justifyContent: "center"}}>
                            <OdometerHero vehicleId={key} odometerKm={today?.odometerKm} deltaKm={today?.odometerKm != null && yesterday?.odometerKm != null ? today.odometerKm - yesterday.odometerKm : null} vehicleGrade={v.vehicleGrade ?? null} hideVehicleTag={hideVehicleTag} />
                        </div>
                        {/* バッテリーゲージ + 走行可能距離 */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                            margin: "0 5px",
                            alignItems: "center",
                        }}>
                            {/* 左半分：バッテリーゲージ */}
                            <div>
                                <BatteryGauge
                                    batteryLevel={today?.batteryLevel ?? null}
                                    chargeLimitSoc={today?.chargeLimitSoc ?? null}
                                    yesterdayLevel={yesterday?.batteryLevel ?? null}
                                />
                            </div>

                            {/* 右半分：走行可能距離 */}
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "8px 0",
                            }}>
                                {/* タイトル */}
                                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                                    走行可能距離
                                </div>
                                {today?.status === true ? (
                                    <>
                                        {/* 数値 + 前日比（1行） */}
                                        <div style={{
                                            display: "flex",
                                            alignItems: "baseline",
                                            gap: 4,
                                            whiteSpace: "nowrap",
                                        }}>
                                            <span style={{
                                                fontSize: 20,
                                                fontWeight: 700,
                                                color: "#111827",
                                            }}>
                                                {Math.round(today.batteryRangeKm ?? 0)}
                                            </span>
                                            <span style={{ fontSize: 14, color: "#111827" }}>km</span>
                                            <span style={{
                                                fontSize: 13,
                                                color: (() => {
                                                    if (yesterday?.status !== true || typeof yesterday.batteryRangeKm !== "number") return "#6b7280";
                                                    const diff = (today.batteryRangeKm ?? 0) - yesterday.batteryRangeKm;
                                                    return diff > 0 ? "#16a34a" : diff < 0 ? "#dc2626" : "#6b7280";
                                                })(),
                                            }}>
                                                {(() => {
                                                    if (yesterday?.status !== true || typeof yesterday.batteryRangeKm !== "number") {
                                                        return "(欠測)";
                                                    }
                                                    const diff = Math.round((today.batteryRangeKm ?? 0) - yesterday.batteryRangeKm);
                                                    const sign = diff > 0 ? "+" : "";
                                                    return `(${sign}${diff}km)`;
                                                })()}
                                            </span>
                                        </div>
                                        {/* 実績値 */}
                                        <div style={{
                                            fontSize: 12,
                                            color: "#9ca3af",
                                            marginTop: 4,
                                        }}>
                                            実績値: {Math.round(today.estBatteryRangeKm ?? 0)} km
                                        </div>
                                    </>
                                ) : (
                                    <div style={{
                                        fontSize: 16,
                                        color: "#9ca3af",
                                    }}>
                                        データなし
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metrics - 4列表示 */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: 4,
                            fontSize: 12,
                            color: "#111827",
                            textAlign: "center",
                            borderTop: "1px solid #e5e7eb",
                            paddingTop: 8,
                            marginTop: 2,
                        }}>
                            {/* 最終データ取得日 */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ color: "#6b7280", fontSize: 11 }}>最終取得</span>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>
                                    {today?.fetchedAt
                                        ? new Date(today.fetchedAt).toLocaleString('ja-JP', {
                                            timeZone: 'Asia/Tokyo',
                                            month: 'numeric',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : "-"}
                                </span>
                            </div>

                            {/* 今日の電費 */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ color: "#6b7280", fontSize: 11 }}>電費</span>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>
                                    {(() => {
                                        if (!yesterday || yesterday.status !== true) return "欠測";
                                        if (today?.odometerKm != null &&
                                            yesterday?.odometerKm != null &&
                                            today.batteryLevel != null &&
                                            yesterday.batteryLevel != null &&
                                            (yesterday.batteryLevel - today.batteryLevel) > 0) {
                                            return `${Math.trunc(
                                                (today.odometerKm - yesterday.odometerKm) /
                                                ((yesterday.batteryLevel - today.batteryLevel) / 100 * 60)
                                            )} km/kWh`;
                                        }
                                        return "-";
                                    })()}
                                </span>
                            </div>

                            {/* 車外気温 */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ color: "#6b7280", fontSize: 11 }}>車外気温</span>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>
                                    {today?.status === true ? fmtTempC(today.outsideTemp) : "-"}
                                </span>
                            </div>

                            {/* 車内気温 */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ color: "#6b7280", fontSize: 11 }}>車内気温</span>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>
                                    {today?.status === true ? fmtTempC(today.insideTemp) : "-"}
                                </span>
                            </div>
                        </div>

                        {/* エラー表示 */}
                        {today && today.status !== true && today.errorStatus ? (
                            <div style={{fontSize: 12, color: "#9a3412"}}>
                                error: {today.errorStatus} {today.errorMessage ?? ""}
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
