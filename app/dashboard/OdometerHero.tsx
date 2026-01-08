type Props = {
    vehicleId: string;
    odometerKm: number | null;
    deltaKm: number | null;
    hideVehicleTag?: boolean;
};

function formatKm(n: number) {
    return n.toLocaleString("ja-JP", {maximumFractionDigits: 0});
}

export function OdometerHero({vehicleId, odometerKm, deltaKm, hideVehicleTag = false}: Props) {
    const isMissing = odometerKm == null;
    const abs = deltaKm == null ? null : Math.abs(deltaKm);

    return (
        <section className="rounded-2xl bg-gradient-to-b from-slate-50 to-white" style={{ width: "100%", paddingBottom: 4 }}>
            {!hideVehicleTag && (
                <div>
                    <span style={{fontSize: "12px", color: "#6b7280", padding: "0 2px 0 0"}}>{vehicleId}</span>
                </div>
            )}

            <div className="flex items-baseline gap-2 justify-center">
                <div className="text-5xl font-extrabold tracking-tight">
                    {isMissing ? "—" : formatKm(odometerKm)}
                </div>
                <div className="text-xl font-bold text-slate-500">km</div>
            </div>

            <div className="flex justify-center" style={{ marginTop: 2 }}>
                {deltaKm == null ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-semibold bg-slate-100 text-slate-600">(欠測)</span>
                ) : deltaKm > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-semibold bg-emerald-100 text-green-700">(+{formatKm(abs ?? 0)} km)</span>
                ) : deltaKm < 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-semibold bg-slate-100 text-slate-600">前日より減少</span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-semibold bg-slate-100 text-slate-600">前日と同じ</span>
                )}
            </div>
        </section>
    );
}
