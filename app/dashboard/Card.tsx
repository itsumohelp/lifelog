// どこでもOK（例: app/dashboard/_components/SomeCard.tsx）

import {SocBar} from "./socBar";

export default function DemoSocCard() {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="mb-3 text-sm font-semibold text-slate-100">Battery</div>

            <SocBar
                socPct={62}
                chargeLimitPct={80}
                deltaPct={-5}
                recommendedMinPct={20}
                recommendedMaxPct={80}
                heightClassName="h-7"
            />

            <div className="mt-3 text-xs text-slate-400">
                推奨ゾーン(20–80%)、上限マーカー、前日差分を1本に集約。
            </div>
        </div>
    );
}
