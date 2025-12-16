import React from "react";

type Vehicle = {
    id: string;
    displayName: string | null;
    teslaVehicleId: bigint;
    state: string | null;
    accessType: string | null;
    lastSeenAt: Date;
};

function stateBadge(state: string | null) {
    const s = (state ?? "unknown").toLowerCase();
    let label = state ?? "unknown";
    let bg = "#eee";
    let fg = "#333";

    if (s === "online") {bg = "#e7f7ee"; fg = "#117a37";}
    else if (s === "asleep") {bg = "#eef2ff"; fg = "#3730a3";}
    else if (s === "offline") {bg = "#f3f4f6"; fg = "#374151";}

    return (
        <span style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "2px 10px",
            borderRadius: 999,
            fontSize: 12,
            background: bg,
            color: fg,
            border: "1px solid rgba(0,0,0,0.06)"
        }}>
            {label}
        </span>
    );
}

export default function VehicleCards({vehicles}: {vehicles: Vehicle[]}) {
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 12,
        }}>
            {vehicles.map((v) => (
                <div key={v.id} style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 14,
                    background: "white",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    display: "grid",
                    gap: 10,
                }}>
                    <div style={{display: "flex", justifyContent: "space-between", gap: 8}}>
                        <div style={{minWidth: 0}}>
                            <div style={{
                                fontSize: 16,
                                fontWeight: 700,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}>
                                {v.displayName ?? "Tesla"}
                            </div>
                            <div style={{fontSize: 12, color: "#6b7280"}}>
                                Vehicle ID: {v.teslaVehicleId.toString()}
                            </div>
                        </div>
                        <div>{stateBadge(v.state)}</div>
                    </div>

                    <div style={{
                        display: "grid",
                        gap: 6,
                        fontSize: 13,
                        color: "#111827",
                    }}>
                        <div style={{display: "flex", justifyContent: "space-between", gap: 8}}>
                            <span style={{color: "#6b7280"}}>Access</span>
                            <span>{v.accessType ?? "-"}</span>
                        </div>

                        <div style={{display: "flex", justifyContent: "space-between", gap: 8}}>
                            <span style={{color: "#6b7280"}}>Last seen</span>
                            <span>{new Date(v.lastSeenAt).toLocaleString()}</span>
                        </div>
                    </div>

                    <div style={{
                        borderTop: "1px solid #f3f4f6",
                        paddingTop: 10,
                        display: "flex",
                        gap: 8,
                    }}>
                        <button
                            disabled
                            title="次にSOC等を入れるとき用"
                            style={{
                                padding: "8px 10px",
                                borderRadius: 10,
                                border: "1px solid #e5e7eb",
                                background: "#fafafa",
                                color: "#9ca3af",
                                cursor: "not-allowed",
                            }}
                        >
                            詳細（準備中）
                        </button>

                        <div style={{flex: 1}} />

                        <span style={{fontSize: 12, color: "#9ca3af"}}>
                            VINは保持しません
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
