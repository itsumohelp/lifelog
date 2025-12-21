// components/SocBar.tsx（差分塗り付き・安定版）
import React from "react";

type SocBarProps = {
    socPct: number;
    chargeLimitPct: number;
    deltaPct?: number; // 前日差分（今日 - 昨日）
    recommendedMinPct?: number;
    recommendedMaxPct?: number;
    heightClassName?: string;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function SocBar({
    socPct,
    chargeLimitPct,
    deltaPct,
    recommendedMinPct = 20,
    recommendedMaxPct = 80,
    heightClassName = "h-7",
}: SocBarProps) {
    const soc = clamp(socPct, 0, 100);
    const limit = clamp(chargeLimitPct, 0, 100);
    const recMin = clamp(recommendedMinPct, 0, 100);
    const recMax = clamp(recommendedMaxPct, 0, 100);

    // 昨日SOCを差分から逆算（今日 - 昨日 = delta → 昨日 = 今日 - delta）
    const hasDelta = typeof deltaPct === "number" && Number.isFinite(deltaPct);
    const ySoc = hasDelta ? clamp(soc - (deltaPct as number), 0, 100) : soc;

    const a = Math.min(soc, ySoc); // 差分区間の左端
    const b = Math.max(soc, ySoc); // 差分区間の右端

    const deltaLabel =
        !hasDelta ? null : `${(deltaPct as number) > 0 ? "+" : ""}${Math.round(deltaPct as number)}%`;

    return (
        <div className="w-full">
            <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-slate-200">
                    <span className="font-semibold">{Math.round(soc)}%</span>
                    <span className="ml-2 text-slate-400">limit {Math.round(limit)}%</span>
                </div>

                {deltaLabel && (
                    <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{
                            backgroundColor:
                                (deltaPct as number) >= 0 ? "rgba(16,185,129,0.18)" : "rgba(244,63,94,0.18)",
                            color: (deltaPct as number) >= 0 ? "rgb(167,243,208)" : "rgb(254,205,211)",
                        }}
                        title="前日からの差分"
                    >
                        {deltaLabel}
                    </span>
                )}
            </div>

            <div
                className={[
                    "relative w-full overflow-hidden rounded-full border border-slate-700",
                    heightClassName,
                ].join(" ")}
                style={{
                    backgroundColor: "rgba(15, 23, 42, 0.7)", // バー背景
                }}
            >
                {/* 推奨ゾーン（20-80%など） */}
                <div
                    className="absolute inset-y-0"
                    style={{
                        left: `${Math.min(recMin, recMax)}%`,
                        width: `${Math.abs(recMax - recMin)}%`,
                        backgroundColor: "rgba(148, 163, 184, 0.18)",
                        zIndex: 10,
                    }}
                    aria-hidden
                />

                {/* 昨日SOC（薄い塗り） */}
                <div
                    className="absolute inset-y-0 left-0"
                    style={{
                        width: `${ySoc}%`,
                        backgroundColor: "rgba(148,163,184,0.35)", // slate系
                        zIndex: 15,
                    }}
                    aria-hidden
                />

                {/* 今日SOC（メイン塗り） */}
                <div
                    className="absolute inset-y-0 left-0"
                    style={{
                        width: `${soc}%`,
                        backgroundColor: "rgba(14,165,233,0.75)", // sky系
                        zIndex: 20,
                    }}
                    aria-hidden
                />

                {/* 差分区間の塗り（増分=緑 / 減分=赤） */}
                {hasDelta && b > a && (
                    <div
                        className="absolute inset-y-0"
                        style={{
                            left: `${a}%`,
                            width: `${b - a}%`,
                            backgroundColor:
                                (deltaPct as number) >= 0
                                    ? "rgba(16,185,129,0.55)" // 増えた分
                                    : "rgba(244,63,94,0.55)", // 減った分
                            zIndex: 25,
                        }}
                        aria-hidden
                    />
                )}

                {/* 上限マーカー */}
                <div
                    className="absolute inset-y-0"
                    style={{
                        left: `${limit}%`,
                        width: "2px",
                        backgroundColor: "rgb(252 211 77)", // amber
                        zIndex: 30,
                    }}
                    aria-hidden
                />

                {/* 上限ラベル */}
                <div
                    className="absolute z-40 -top-6 -translate-x-1/2 whitespace-nowrap text-[11px]"
                    style={{left: `${limit}%`, color: "rgb(253 230 138)"}}
                >
                    limit
                </div>
            </div>

            {/* 任意：凡例（必要なら） */}
            {/* <div className="mt-2 text-xs text-slate-500">昨日=灰 / 今日=青 / 差分=緑or赤</div> */}
        </div>
    );
}
