"use client";

import React from "react";

type Props = {
    /** 現在のバッテリー残量 (0-100) */
    batteryLevel: number | null;
    /** 充電上限 (0-100) */
    chargeLimitSoc: number | null;
    /** 前日のバッテリー残量 (0-100) */
    yesterdayLevel?: number | null;
};

export default function BatteryGauge({ batteryLevel, chargeLimitSoc, yesterdayLevel }: Props) {
    const level = typeof batteryLevel === "number" ? batteryLevel : 0;
    const limit = typeof chargeLimitSoc === "number" ? chargeLimitSoc : 100;
    const hasData = typeof batteryLevel === "number";
    const hasYesterday = typeof yesterdayLevel === "number";
    const delta = hasData && hasYesterday ? level - yesterdayLevel : null;

    // バッテリー残量に応じた色
    const getColor = (pct: number) => {
        if (pct <= 20) return "#ef4444"; // 赤
        if (pct <= 40) return "#f97316"; // オレンジ
        return "#22c55e"; // 緑
    };

    const color = getColor(level);

    // 円グラフ用のSVG計算
    const size = 72;
    const strokeWidth = 7;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const levelOffset = circumference - (level / 100) * circumference;
    const limitOffset = circumference - (limit / 100) * circumference;

    if (!hasData) {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "4px 0",
            }}>
                <div
                    style={{
                        width: size,
                        height: size,
                        borderRadius: "50%",
                        background: "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        color: "#9ca3af",
                    }}
                >
                    --
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>データなし</div>
            </div>
        );
    }

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "8px 0",
        }}>
            {/* 円グラフ */}
            <div style={{ position: "relative", width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    style={{ transform: "rotate(-90deg)" }}
                >
                    {/* 背景の円 */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth={strokeWidth}
                    />
                    {/* 充電上限を示す薄い円弧 */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(34, 197, 94, 0.2)"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={limitOffset}
                        strokeLinecap="round"
                    />
                    {/* バッテリー残量 */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={levelOffset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.3s ease" }}
                    />
                </svg>
                {/* 中央のパーセント表示 */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#111827",
                    }}
                >
                    {level}%
                </div>
            </div>

            {/* 右側の数値情報 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* 電池残量ラベル */}
                <div style={{ fontSize: 12, color: "#6b7280" }}>電池残量</div>
                {/* メインの数値と前日比を横並び */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#111827",
                    }}>
                        {level}%
                    </span>
                    <span style={{
                        fontSize: 14,
                        color: (() => {
                            if (delta === null) return "#6b7280";
                            return delta > 0 ? "#16a34a" : delta < 0 ? "#dc2626" : "#6b7280";
                        })(),
                    }}>
                        {delta === null
                            ? "(欠測)"
                            : `(${delta > 0 ? "+" : ""}${delta}%)`
                        }
                    </span>
                </div>
                {/* 充電上限 */}
                <div style={{ fontSize: 12, color: "#9ca3af" }}>
                    上限 {limit}%
                </div>
            </div>
        </div>
    );
}
