import React from "react";

type Vehicle = {
    id: string;
    displayName: string | null;
    teslaVehicleId: bigint;
    state: string | null;
    accessType: string | null;
    lastSeenAt: Date;
};

type Snapshot = {
    batteryLevel: number | null;
    chargeLimitSoc: number | null;
    odometerKm: number | null;

    batteryRangeKm: number | null;
    estBatteryRangeKm: number | null;
    outsideTempC: number | null;
    insideTempC: number | null;

    status: string; // OK / UNAVAILABLE_ASLEEP / ERROR
    errorStatus: number | null;
    errorMessage: string | null;
    fetchedAt: Date;
};

function badge(text: string, bg: string, fg: string) {
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
    if (s === "offline") return badge("offline", "#f3f4f6", "#374151");
    return badge(state ?? "unknown", "#f3f4f6", "#374151");
}

function todayBadge(s?: Snapshot) {
    if (!s) return badge("今日: 未取得", "#fff7ed", "#9a3412");
    if (s.status === "OK" && typeof s.batteryLevel === "number") {
        const limit = typeof s.chargeLimitSoc === "number" ? ` / 上限${s.chargeLimitSoc}%` : "";
        return badge(`SOC ${s.batteryLevel}%${limit}`, "#ecfeff", "#0e7490");
    }
    if (s.status === "UNAVAILABLE_ASLEEP") return badge("今日: 取得失敗(スリープ)", "#fff7ed", "#9a3412");
    return badge("今日: 取得失敗", "#fef2f2", "#991b1b");
}

function diffBadge(today?: Snapshot, yesterday?: Snapshot) {
    if (!today || !yesterday) return badge("前日差: -", "#f3f4f6", "#374151");

    if (today.status !== "OK" || yesterday.status !== "OK") {
        return badge("前日差: 欠測", "#fff7ed", "#9a3412");
    }

    const tSoc = today.batteryLevel;
    const ySoc = yesterday.batteryLevel;

    if (typeof tSoc !== "number" || typeof ySoc !== "number") {
        return badge("前日差: 欠測", "#fff7ed", "#9a3412");
    }

    const delta = tSoc - ySoc;
    const sign = delta > 0 ? "+" : "";
    const text = `前日差 SOC ${sign}${delta}%`;

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
    if (!today || today.status !== "OK") return "レンジ: -";
    const rated = fmtKm(today.batteryRangeKm);
    const est = fmtKm(today.estBatteryRangeKm);
    return `レンジ: 定格 ${rated} / 推定 ${est}`;
}

function tempLine(today?: Snapshot) {
    if (!today || today.status !== "OK") return "気温: -";
    const out = fmtTempC(today.outsideTempC);
    const ins = fmtTempC(today.insideTempC);
    // inside が取れない車/状態もあるので、取れてる時だけ出す
    return today.insideTempC != null
        ? `気温: 外 ${out} / 車内 ${ins}`
        : `気温: 外 ${out}`;
}

function rangeDiffText(today?: Snapshot, yesterday?: Snapshot) {
    if (!today || !yesterday) return "レンジ差: -";
    if (today.status !== "OK" || yesterday.status !== "OK") return "レンジ差: 欠測";

    const tR = today.batteryRangeKm;
    const yR = yesterday.batteryRangeKm;
    const tE = today.estBatteryRangeKm;
    const yE = yesterday.estBatteryRangeKm;

    const fmt = (d: number) => `${d > 0 ? "+" : ""}${Math.round(d)}km`;

    const rated = typeof tR === "number" && typeof yR === "number" ? fmt(tR - yR) : "欠測";
    const est = typeof tE === "number" && typeof yE === "number" ? fmt(tE - yE) : "欠測";

    return `レンジ差: 定格 ${rated} / 推定 ${est}`;
}

function tempDiffText(today?: Snapshot, yesterday?: Snapshot) {
    if (!today || !yesterday) return "-";
    if (today.status !== "OK" || yesterday.status !== "OK") return "欠測";
    const t = today.outsideTempC, y = yesterday.outsideTempC;
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
                            padding: 14,
                            background: "white",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                            display: "grid",
                            gap: 10,
                        }}
                    >
                        {/* Header */}
                        <div style={{display: "flex", justifyContent: "space-between", gap: 8}}>
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
                                <div style={{fontSize: 12, color: "#6b7280"}}>Vehicle ID: {key}</div>
                            </div>

                            <div style={{display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end"}}>
                                {stateBadge(v.state)}
                                {todayBadge(today)}
                                {diffBadge(today, yesterday)}
                            </div>
                        </div>

                        {/* Metrics */}
                        <div style={{display: "grid", gap: 6, fontSize: 13, color: "#111827"}}>
                            <div style={{display: "flex", justifyContent: "space-between", gap: 8}}>
                                <span style={{color: "#6b7280"}}>Access</span>
                                <span>{v.accessType ?? "-"}</span>
                            </div>

                            <div style={{display: "flex", justifyContent: "space-between", gap: 8}}>
                                <span style={{color: "#6b7280"}}>Last seen</span>
                                <span>{new Date(v.lastSeenAt).toLocaleString()}</span>
                            </div>

                            <div style={{display: "flex", justifyContent: "space-between", gap: 8}}>
                                <span style={{color: "#6b7280"}}>Odometer</span>
                                <span>{today?.status === "OK" ? fmtKm(today.odometerKm) : "-"}</span>
                            </div>

                            {/* 追加：レンジ */}
                            <div style={{display: "flex", justifyContent: "space-between", gap: 8}}>
                                <span style={{color: "#6b7280"}}>Range</span>
                                <span style={{textAlign: "right"}}>
                                    {today?.status === "OK"
                                        ? `定格 ${fmtKm(today.batteryRangeKm)} / 推定 ${fmtKm(today.estBatteryRangeKm)}`
                                        : "-"}
                                </span>
                            </div>

                            {/* 追加：気温 */}
                            <div style={{display: "flex", justifyContent: "space-between", gap: 8}}>
                                <span style={{color: "#6b7280"}}>Temp</span>
                                <span style={{textAlign: "right"}}>
                                    {today?.status === "OK"
                                        ? today.insideTempC != null
                                            ? `外 ${fmtTempC(today.outsideTempC)} / 車内 ${fmtTempC(today.insideTempC)}`
                                            : `外 ${fmtTempC(today.outsideTempC)}`
                                        : "-"}
                                </span>
                            </div>

                            <div style={{display: "flex", justifyContent: "space-between", gap: 8}}>
                                <span style={{color: "#6b7280"}}>Range diff</span>
                                <span style={{textAlign: "right"}}>{rangeDiffText(today, yesterday)}</span>
                            </div>

                            <div style={{display: "flex", justifyContent: "space-between", gap: 8}}>
                                <span style={{color: "#6b7280"}}>Outside temp diff</span>
                                <span style={{textAlign: "right"}}>{tempDiffText(today, yesterday)}</span>
                            </div>


                            {today && today.status !== "OK" && today.errorStatus ? (
                                <div style={{fontSize: 12, color: "#9a3412"}}>
                                    error: {today.errorStatus} {today.errorMessage ?? ""}
                                </div>
                            ) : null}
                        </div>

                        {/* Footer */}
                        <div
                            style={{
                                borderTop: "1px solid #f3f4f6",
                                paddingTop: 10,
                                display: "flex",
                                gap: 8,
                            }}
                        >
                            <span style={{fontSize: 12, color: "#9ca3af"}}>VINは保持しません</span>
                            <div style={{flex: 1}} />
                            <span style={{fontSize: 12, color: "#9ca3af"}}>
                                {today ? `fetched: ${new Date(today.fetchedAt).toLocaleTimeString()}` : ""}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
