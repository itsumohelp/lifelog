type Props = {
    vehicleId: string;
    odometerKm: number | null;
    deltaKm: number | null; // 前日比（欠測なら null）
};

function formatKm(n: number) {
    return n.toLocaleString("ja-JP", {maximumFractionDigits: 0});
}

export function OdometerHero({vehicleId, odometerKm, deltaKm}: Props) {
    const isMissing = odometerKm == null;

    const sign =
        deltaKm == null ? null : deltaKm > 0 ? "+" : deltaKm < 0 ? "−" : "";
    const abs = deltaKm == null ? null : Math.abs(deltaKm);

    return (
        <section className="rounded-2xl bg-gradient-to-b from-slate-50 to-white">
            <span style={{fontSize: 12, color: "#6b7280"}}>Vehicle ID: {vehicleId}</span>
            <div className="flex items-baseline gap-2">
                <div className="text-5xl font-extrabold tracking-tight">
                    {isMissing ? "—" : formatKm(odometerKm)}
                </div>
                <div className="text-xl font-bold text-slate-500">km</div>
            </div>

            <div>
                {deltaKm == null ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-1 text-sm font-semibold bg-slate-100 text-slate-600">前日比：欠測</span>
                ) : deltaKm > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-1 text-sm font-semibold bg-emerald-100 text-green-700">前日比：+{formatKm(abs ?? 0)}km</span>
                ) : deltaKm < 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-1 text-sm font-semibold bg-slate-100 text-slate-600">前日より減少</span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full px-1 text-sm font-semibold bg-slate-100 text-slate-600">前日と同じ</span>
                )}
            </div>


        </section>
    );
}
