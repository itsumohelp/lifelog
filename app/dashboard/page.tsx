import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import {sessionOptions, SessionData} from "@/app/lib/session";
import {prisma} from "@/prisma";
import BuildInfo from "@/app/dashboard/build-info"
import SyncVehiclesButton from "./sync-vehicles-button";
import SyncDailyButton from "./sync-daily-button";
import VehicleCards from "./vehicle-cards";

export default async function DashboardPage() {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const teslaSub = session.teslaSub;

    if (!teslaSub) {
        return (
            <main style={{padding: 16}}>
                <h1>Dashboard</h1>
                <p>未ログインです。先に Tesla ログインしてください。</p>
            </main>
        );
    }

    const account = await prisma.teslaAccount.findUnique({
        where: {teslaSub},
        include: {
            vehicles: {
                orderBy: {lastSeenAt: "desc"},
            },
        },
    }) || null;

    const todayKey = getJstDayKey(new Date());

    const todaySnapshots = await prisma.teslaVehicleDailySnapshot.findMany({
        where: {
            teslaAccountId: account?.id,
            snapshotDate: todayKey,
        },
    });


    function getJstDayKey(d = new Date()): Date {
        const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
        const y = jst.getUTCFullYear();
        const m = jst.getUTCMonth();
        const day = jst.getUTCDate();
        const jstMidnightUtc = Date.UTC(y, m, day, 0, 0, 0) - 9 * 60 * 60 * 1000;
        return new Date(jstMidnightUtc);
    }



    function addDays(date: Date, days: number): Date {
        return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
    }

    // 既にある getJstDayKey を使う前提
    const yesterdayKey = getJstDayKey(addDays(new Date(), -1));

    const yesterdaySnapshots = await prisma.teslaVehicleDailySnapshot.findMany({
        where: {teslaAccountId: account?.id, snapshotDate: yesterdayKey},
    });

    // BigInt -> string key の map にする
    const todayMap = Object.fromEntries(
        todaySnapshots.map((s: {teslaVehicleId: {toString: () => any;};}) => [s.teslaVehicleId.toString(), s])
    );
    const yesterdayMap = Object.fromEntries(
        yesterdaySnapshots.map((s: {teslaVehicleId: {toString: () => any;};}) => [s.teslaVehicleId.toString(), s])
    );

    for (const s of todaySnapshots) {
        todayMap.set(s.teslaVehicleId.toString(), s);
    }

    const vehicles = account?.vehicles ?? [];

    return (
        <main style={{padding: 16, display: "grid", gap: 16}}>
            <h1>Dashboard</h1>

            <BuildInfo />

            <section style={{display: "grid", gap: 8}}>
                <h2>車両同期</h2>
                <SyncVehiclesButton />
            </section>

            <section style={{display: "grid", gap: 8}}>
                <h2>車両一覧（VINは表示しません）</h2>

                {vehicles.length === 0 ? (
                    <p>車両がありません。上の「車両を同期」を押してください。</p>
                ) : (
                    <VehicleCards
                        vehicles={vehicles as any}
                        todayMap={todayMap as any}
                        yesterdayMap={yesterdayMap as any}
                    />
                )}
            </section>
            <section style={{display: "grid", gap: 8}}>
                <h2>日次スナップショット</h2>
                <p>1日1回、SOC/上限SOC/走行距離を保存します。</p>
                <SyncDailyButton />
            </section>
        </main>
    );
}

const th: React.CSSProperties = {
    textAlign: "left",
    padding: "8px 10px",
    borderBottom: "1px solid #ddd",
    whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
    padding: "8px 10px",
    borderBottom: "1px solid #eee",
    whiteSpace: "nowrap",
};
