import React from "react";
import {OdometerHero} from "./OdometerHero";
import {Codes} from "../static/Codes";

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

function stateBadge(state: string | null) {
    const s = (state ?? "unknown").toLowerCase();
    if (s === "online") return badge("online", "#e7f7ee", "#117a37");
    if (s === "asleep") return badge("asleep", "#eef2ff", "#3730a3");
    return badge(state ?? "unknown", "#f3f4f6", "#374151");
}

function todayBadge(s?: Snapshot) {
    if (!s) return badge("今日: 未取得", "#fff7ed", "#9a3412");
    if (s.status === true && typeof s.batteryLevel === "number") {
        const limit = typeof s.chargeLimitSoc === "number" ? ` / 充電上限 ${s.chargeLimitSoc}%` : "";
        return badge(`電池残量 ${s.batteryLevel}%${limit}`, "#ecfeff", "#0e7490");
    }
    if (s.status === false) return badge("今日: 取得失敗(スリープ)", "#fff7ed", "#9a3412");
    return badge("今日: 取得失敗", "#fef2f2", "#991b1b");
}

function diffBadge(today?: Snapshot, yesterday?: Snapshot) {
    if (!today || !yesterday) return badge("前日差: -", "#f3f4f6", "#374151");

    if (today.status !== true || yesterday.status !== true) {
        return badge("前日差: 欠測", "#fff7ed", "#9a3412");
    }

    const tSoc = today.batteryLevel;
    const ySoc = yesterday.batteryLevel;

    if (typeof tSoc !== "number" || typeof ySoc !== "number") {
        return badge("前日差: 欠測", "#fff7ed", "#9a3412");
    }

    const delta = tSoc - ySoc;
    const sign = delta > 0 ? "+" : "";
    const text = `前日から電池残量 ${sign}${delta}%`;

    const tLimit = today.chargeLimitSoc;
    const yLimit = yesterday.chargeLimitSoc;
    let limitText = "";
    if (typeof tLimit === "number" && typeof yLimit === "number" && tLimit !== yLimit) {
        const d = tLimit - yLimit;
        const s = d > 0 ? "+" : "";
        limitText = ` / 上限${s}${d}%`;
    }

    if (delta > 0) return badge(`${text}${limitText}`, "#e7f7ee", "#117a37");
    if (delta < 0) return badge(`${text}${limitText}`, "#fef2f2", "#991b1b");
    return badge(`${text}${limitText}`, "#f3f4f6", "#374151");
}

function fmtNum(n: number | null | undefined, digits = 0): string {
    if (typeof n !== "number" || Number.isNaN(n)) return "-";
    return n.toFixed(digits);
}

function fmtTempC(n: number | null | undefined): string {
    if (typeof n !== "number" || Number.isNaN(n)) return "-";
    // 0.5刻みなどがあるので1桁表示が見やすい
    return `${n.toFixed(1)}℃`;
}

function fmtKm(n: number | null | undefined): string {
    if (typeof n !== "number" || Number.isNaN(n)) return "-";
    return `${Math.round(n)} km`;
}

function rangeLine(today?: Snapshot) {
    if (!today || today.status !== true) return "レンジ: -";
    const rated = fmtKm(today.batteryRangeKm);
    const est = fmtKm(today.estBatteryRangeKm);
    return `レンジ: 定格 ${rated} / 推定 ${est}`;
}

function tempLine(today?: Snapshot) {
    if (!today || today.status !== true) return "気温: -";
    const out = fmtTempC(today.outsideTemp);
    const ins = fmtTempC(today.insideTemp);
    // inside が取れない車/状態もあるので、取れてる時だけ出す
    return today.insideTemp != null
        ? `気温: 外 ${out} / 車内 ${ins}`
        : `気温: 外 ${out}`;
}

function rangeDiffText(today?: Snapshot, yesterday?: Snapshot, estimated = false) {
    if (!today || !yesterday) return "レンジ差: -";
    if (today.status !== true || yesterday.status !== true) return "レンジ差: 欠測";

    let tR, yR;
    if (estimated) {
        tR = today.estBatteryRangeKm;
        yR = yesterday.estBatteryRangeKm;
    } else {
        tR = today.batteryRangeKm;
        yR = yesterday.batteryRangeKm;
    }

    const fmt = (d: number) => `${d > 0 ? "+" : ""}${Math.round(d)}km`;
    const rated = typeof tR === "number" && typeof yR === "number" ? fmt(tR - yR) : "欠測";

    return `${rated}`;
}

function tempDiffText(today?: Snapshot, yesterday?: Snapshot) {
    if (!today || !yesterday) return "-";
    if (today.status !== true || yesterday.status !== true) return "欠測";
    const t = today.outsideTemp, y = yesterday.outsideTemp;
    if (typeof t !== "number" || typeof y !== "number") return "欠測";
    const d = t - y;
    return `${d > 0 ? "+" : ""}${d.toFixed(1)}℃`;
}


export default function VehicleCards({
    vehicles,
    todayMap,
    yesterdayMap,
}: {
    vehicles: Vehicle[];
    todayMap: Record<string, Snapshot>;
    yesterdayMap: Record<string, Snapshot>;
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
                            padding: "5px 10px 10px 10px",
                            background: "white",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                            display: "grid",
                            gap: 10,
                        }}
                    >

                        <div style={{display: "flex", justifyContent: "space-between", gap: 8}}>
                            <OdometerHero vehicleId={key} odometerKm={today?.odometerKm} deltaKm={today?.odometerKm != null && yesterday?.odometerKm != null ? today.odometerKm - yesterday.odometerKm : null} vehicle={v} />
                            <div style={{minWidth: 0}}>
                                <div
                                    style={{
                                        fontSize: 16,
                                        fontWeight: 700,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {v.displayName ?? "Tesla"}
                                </div>
                            </div>
                        </div>
                        <div>
                            <span className="p-1">{todayBadge(today)}</span>
                            <span className="p-1">{diffBadge(today, yesterday)}</span>
                        </div>

                        {/* Metrics */}
                        <div style={{display: "grid", gap: 6, fontSize: 13, color: "#111827"}}>


                            <div style={{display: "flex", justifyContent: "space-between", gap: 8}}>
                                <span style={{color: "#6b7280"}}>最終データ取得日</span>
                                <span>{new Date(v.lastSeenAt).toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'})}</span>
                            </div>

                            <div style={{display: "flex", justifyContent: "space-between", gap: 8}}>
                                <span style={{color: "#6b7280"}}>今日の電費</span>
                                <span>
                                    {today?.odometerKm != null &&
                                        yesterday?.odometerKm != null &&
                                        today.batteryLevel != null &&
                                        yesterday.batteryLevel != null
                                        ? Math.trunc(
                                            (today.odometerKm - yesterday.odometerKm) /
                                            ((yesterday.batteryLevel - today.batteryLevel) / 100 * 60)
                                        )
                                        : "-"}{" "}
                                    km/kWh
                                </span>
                            </div>

                            {/* 追加：レンジ */}
                            <div style={{display: "flex", justifyContent: "space-between", gap: 8}}>
                                <span style={{color: "#6b7280"}}>走行可能距離(残量から算出)</span>
                                <span style={{textAlign: "right"}}>
                                    {today?.status === true
                                        ? `${fmtKm(today.batteryRangeKm)}`
                                        : "-"}
                                    ({rangeDiffText(today, yesterday)})
                                </span>
                            </div>

                            {/* 追加：レンジ */}
                            <div style={{display: "flex", justifyContent: "space-between", gap: 8}}>
                                <span style={{color: "#6b7280"}}>走行可能距離(実績値)</span>
                                <span style={{textAlign: "right"}}>
                                    {today?.status === true
                                        ? `${fmtKm(today.estBatteryRangeKm)}`
                                        : "-"}
                                    ({rangeDiffText(today, yesterday, true)})
                                </span>
                            </div>


                            <div style={{display: "flex", justifyContent: "space-between", gap: 8}}>
                                <span style={{color: "#6b7280"}}>車外気温</span>
                                <span style={{textAlign: "right"}}>
                                    {today?.status === true
                                        ? `${fmtTempC(today.outsideTemp)}`
                                        : "-"}
                                    ({tempDiffText(today, yesterday)})
                                </span>
                            </div>

                            {/* 追加：気温 */}
                            <div style={{display: "flex", justifyContent: "space-between", gap: 8}}>
                                <span style={{color: "#6b7280"}}>車内気温</span>
                                <span style={{textAlign: "right"}}>
                                    {today?.status === true
                                        ? `${fmtTempC(today.insideTemp)}`
                                        : "-"}
                                </span>
                            </div>


                            {today && today.status !== true && today.errorStatus ? (
                                <div style={{fontSize: 12, color: "#9a3412"}}>
                                    error: {today.errorStatus} {today.errorMessage ?? ""}
                                </div>
                            ) : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
