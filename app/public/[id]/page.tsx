import {notFound} from "next/navigation";

import {prisma} from "@/prisma";
import VehicleCards, {Vehicle} from "@/app/dashboard/vehicle-cards";
import BatteryRangeChart from "@/app/dashboard/BatteryRangeChart";

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

type Props = {
    params: Promise<{id: string}>;
};

export default async function PublicDashboardPage({params}: Props) {
    const {id} = await params;

    // アカウントIDで検索（公開ダッシュボード用）
    const account = await prisma.teslaAccount.findUnique({
        where: {id},
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
        notFound();
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

    // BigInt -> string key の map
    const todayMap = Object.fromEntries(
        todaySnapshots.map((s: {teslaVehicleId: {toString: () => any}}) => [s.teslaVehicleId.toString(), s])
    );
    const yesterdayMap = Object.fromEntries(
        yesterdaySnapshots.map((s: {teslaVehicleId: {toString: () => any}}) => [s.teslaVehicleId.toString(), s])
    );

    const days = 30; // 直近30日
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const rows = vehicles.length > 0 ? await prisma.teslaVehicleDailySnapshot.findMany({
        where: {
            teslaAccountId: account.id,
            teslaVehicleId: vehicles[0].teslaVehicleId,
            snapshotDate: {gte: from},
        },
        orderBy: {snapshotDate: "asc"},
    }) : [];

    const chartData = rows.map((r) => ({
        date: r.snapshotDate.toISOString().slice(0, 10),
        batteryLevel: r.batteryLevel ?? null,
        batteryRangeKm: r.batteryRangeKm != null ? Math.round(r.batteryRangeKm) : null,
        dailyDistanceKm: r.odometerDeltaKm != null ? Math.round(r.odometerDeltaKm) : null,
        outsideTemp: r.outsideTemp ?? null,
    }));

    return (
        <main style={{padding: "3px 10px 0px 10px", display: "grid", gap: 16}}>
            <VehicleCards
                vehicles={vehicles as any}
                todayMap={todayMap as any}
                yesterdayMap={yesterdayMap as any}
                hideVehicleTag={true}
            />
            <section style={{display: "grid", gap: 8}}>
                <b>電池残量 / 走行可能距離</b>

                {vehicles.length === 0 ? (
                    <p>車両データがありません。</p>
                ) : (
                    <BatteryRangeChart data={chartData} />
                )}
            </section>
        </main>
    );
}
