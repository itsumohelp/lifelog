type Props = {
    odometerKm: number | null;
    deltaKm: number | null; // 前日比（欠測なら null）
};

function formatKm(n: number) {
    return n.toLocaleString("ja-JP", {maximumFractionDigits: 0});
}

export function OdometerHero({odometerKm, deltaKm}: Props) {
    const isMissing = odometerKm == null;

    const sign =
        deltaKm == null ? null : deltaKm > 0 ? "+" : deltaKm < 0 ? "−" : "";
    const abs = deltaKm == null ? null : Math.abs(deltaKm);

    const chip =
        deltaKm == null ? (
            <span className="text-sm text-slate-500">前日比：欠測</span>
        ) : (
            <span
                className={[
                    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold",
                    deltaKm > 0 && "bg-emerald-100 text-emerald-700",
                    deltaKm < 0 && "bg-rose-100 text-rose-700",
                    deltaKm === 0 && "bg-slate-100 text-slate-600",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                {deltaKm > 0 ? "▲" : deltaKm < 0 ? "▼" : "•"}
                {sign}
                {formatKm(abs ?? 0)}km
            </span>
        );

    return (
        <section className="mb-6 rounded-2xl bg-gradient-to-b from-slate-50 to-white p-6">
            <div className="text-sm font-medium text-slate-600">
                走行距離
            </div>

            <div className="mt-2 flex items-baseline gap-2">
                <div className="text-5xl font-extrabold tracking-tight">
                    {isMissing ? "—" : formatKm(odometerKm)}
                </div>
                <div className="text-xl font-bold text-slate-500">km</div>
            </div>

            <div className="mt-3">{chip}</div>
        </section>
    );
}
