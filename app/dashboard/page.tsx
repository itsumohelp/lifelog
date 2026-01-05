import {cookies} from "next/headers";
import {getIronSession} from "iron-session";

import {prisma} from "@/prisma";
import {sessionOptions, type SessionData} from "@/app/lib/session";
import SyncVehiclesButton from "./sync-vehicles-button";
import SyncDailyButton from "./sync-daily-button";
import VehicleCards, {Vehicle} from "./vehicle-cards";
import BatteryRangeChart from "./BatteryRangeChart";
import Card from "./Card";

// JSTの日次キー（JST 00:00 をUTC Dateとして表現し、DBのキーに使う）
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

export default async function DashboardPage() {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const teslaSub = session.teslaSub;

    if (!teslaSub) {
        return (
            <main style={{padding: 16}}>
                <p>未ログインです。先に Tesla ログインしてください。</p>
            </main>
        );
    }

    // ログイン中ユーザーの TeslaAccount を取得（車両も一緒に）
    const account = await prisma.teslaAccount.findUnique({
        where: {teslaSub},
        include: {
            vehicles: {
                orderBy: {lastSeenAt: "desc"},
                include: {
                    vehicleOptions: {
                        orderBy: {code: "asc"},
                    },
                },
            },
        },
    });

    if (!account) {
        return (
            <main style={{padding: 16}}>
                <p>Teslaアカウントが見つかりません。</p>
            </main>
        );
    }

    const vehicles: Vehicle[] = account.vehicles ?? [];

    // 今日・前日（JST）の日次スナップショットを取得
    const todayKey = getJstDayKey(new Date());
    const yesterdayKey = getJstDayKey(addDays(new Date(), -1));

    const [todaySnapshots, yesterdaySnapshots] = await Promise.all([
        prisma.teslaVehicleDailySnapshot.findMany({
            where: {teslaAccountId: account.id, snapshotDate: todayKey},
        }),
        prisma.teslaVehicleDailySnapshot.findMany({
            where: {teslaAccountId: account.id, snapshotDate: yesterdayKey},
        }),
    ]);

    // BigInt -> string key の map（Server Componentでも安全な形に）
    const todayMap = Object.fromEntries(
        todaySnapshots.map((s: {teslaVehicleId: {toString: () => any;};}) => [s.teslaVehicleId.toString(), s])
    );
    const yesterdayMap = Object.fromEntries(
        yesterdaySnapshots.map((s: {teslaVehicleId: {toString: () => any;};}) => [s.teslaVehicleId.toString(), s])
    );

    const days = 30; // 直近30日
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const rows = await prisma.teslaVehicleDailySnapshot.findMany({
        where: {
            teslaAccountId: account.id,
            teslaVehicleId: vehicles[0].teslaVehicleId,
            snapshotDate: {gte: from},
        },
        orderBy: {snapshotDate: "asc"},
    });

    const chartData = rows.map((r) => ({
        date: r.snapshotDate.toISOString().slice(0, 10), // "YYYY-MM-DD"
        batteryLevel: r.batteryLevel ?? null,
        batteryRangeKm: r.batteryRangeKm != null ? Math.round(r.batteryRangeKm) : null,
        dailyDistanceKm: r.odometerDeltaKm != null ? Math.round(r.odometerDeltaKm) : null,
        outsideTemp: r.outsideTemp ?? null,
    }));
    const snapshotDays = 37; // DBから集計した値に置き換え
    const lastDate = "2025-12-21";

    return (
        <main style={{padding: "3px 10px 0px 10px", display: "grid", gap: 16}}>
            <VehicleCards
                vehicles={vehicles as any}
                todayMap={todayMap as any}
                yesterdayMap={yesterdayMap as any}
            />
            <section style={{display: "grid", gap: 8}}>
                <b>電池残量 / 走行可能距離</b>

                {vehicles.length === 0 ? (
                    <p>車両がありません。上の「車両同期」を押してください。</p>
                ) : (
                    <>
                        <BatteryRangeChart data={chartData} />
                    </>
                )}
            </section>
            <section style={{display: "grid", gap: 8}}>
                <h2>車両同期</h2>
                <SyncVehiclesButton />
            </section>

            <section style={{display: "grid", gap: 8}}>
                <h2>日次スナップショット</h2>
                <p style={{margin: 0, color: "#6b7280"}}>
                    1日1回、SOC/上限SOC/走行距離（取れれば）を保存します。車両がスリープの場合は欠測として保存します。
                </p>
                <SyncDailyButton />
            </section>
            <a href="/dashboard/api-log" target="_blank" rel="noreferrer">APIログを見る</a> <a href="/setting/tesla" target="_blank" rel="noreferrer">設定を見る</a>
        </main>
    );
}
