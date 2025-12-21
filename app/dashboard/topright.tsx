// components/TopRightKpi.tsx
import React from "react";

type TopRightKpiProps = {
    days: number;              // スナップショット取得日数
    apiCalls?: number;         // API呼び出し回数（あれば）
    lastDateLabel?: string;    // "2025-12-21" など（任意）
};

export function TopRightKpi({days, apiCalls, lastDateLabel}: TopRightKpiProps) {
    const d = Number.isFinite(days) ? days : 0;

    const title =
        apiCalls !== undefined
            ? `スナップショット日数: ${d}日 / API取得回数: ${apiCalls}回`
            : `スナップショット日数: ${d}日`;

    return (
        <div className="absolute right-4 top-4 z-50" title={title}>
            <div
                className="rounded-2xl border border-slate-700/80 px-4 py-3 shadow-sm"
                style={{
                    backgroundColor: "rgba(2, 6, 23, 0.55)", // ほぼ黒、透過
                    backdropFilter: "blur(8px)",
                }}
            >
                <div className="flex items-end justify-end gap-2">
                    <div
                        className="text-4xl font-extrabold leading-none tracking-tight"
                        style={{color: "rgba(226, 232, 240, 0.95)"}} // slate-200
                    >
                        {d}
                    </div>
                    <div className="pb-1 text-sm font-semibold text-slate-300">days</div>
                </div>

                <div className="mt-1 text-right text-xs text-slate-400">
                    snapshots
                    {lastDateLabel ? <span className="ml-2">• last {lastDateLabel}</span> : null}
                </div>
            </div>
        </div>
    );
}
