import {cookies} from "next/headers";
import {redirect, notFound} from "next/navigation";
import {getIronSession} from "iron-session";
import Link from "next/link";

import {prisma} from "@/prisma";
import {sessionOptions, type SessionData} from "@/app/lib/session";
import SyncDailyButton from "../sync-daily-button";
import VehicleCards, {Vehicle, badge} from "../vehicle-cards";
import BatteryRangeChart from "../BatteryRangeChart";
import AddToHomeButton from "@/app/components/AddToHomeButton";
import HeaderMenu from "@/app/components/HeaderMenu";

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
    params: Promise<{vehicleTag: string}>;
};

export default async function VehicleDashboardPage({params}: Props) {
    const {vehicleTag} = await params;
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
                    override: true,
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

    // vehicleTagで車両を検索（teslaVehicleIdの文字列表現）
    const vehicle = account.vehicles.find(
        (v) => v.teslaVehicleId.toString() === vehicleTag
    );

    if (!vehicle) {
        notFound();
    }

    // 今日・前日（JST）の日次スナップショットを取得
    const todayKey = getJstDayKey(new Date());
    const yesterdayKey = getJstDayKey(addDays(new Date(), -1));

    const [todaySnapshot, yesterdaySnapshot] = await Promise.all([
        prisma.teslaVehicleDailySnapshot.findFirst({
            where: {
                teslaAccountId: account.id,
                teslaVehicleId: vehicle.teslaVehicleId,
                snapshotDate: todayKey,
            },
        }),
        prisma.teslaVehicleDailySnapshot.findFirst({
            where: {
                teslaAccountId: account.id,
                teslaVehicleId: vehicle.teslaVehicleId,
                snapshotDate: yesterdayKey,
            },
        }),
    ]);

    const todayMap = todaySnapshot
        ? {[vehicle.teslaVehicleId.toString()]: todaySnapshot}
        : {};
    const yesterdayMap = yesterdaySnapshot
        ? {[vehicle.teslaVehicleId.toString()]: yesterdaySnapshot}
        : {};

    // 直近30日のチャートデータ
    const days = 30;
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const rows = await prisma.teslaVehicleDailySnapshot.findMany({
        where: {
            teslaAccountId: account.id,
            teslaVehicleId: vehicle.teslaVehicleId,
            snapshotDate: {gte: from},
        },
        orderBy: {snapshotDate: "asc"},
    });

    const chartData = rows.map((r) => ({
        date: r.snapshotDate.toISOString().slice(0, 10),
        batteryLevel: r.batteryLevel ?? null,
        batteryRangeKm: r.batteryRangeKm != null ? Math.round(r.batteryRangeKm) : null,
        dailyDistanceKm: r.odometerDeltaKm != null ? Math.round(r.odometerDeltaKm) : null,
        outsideTemp: r.outsideTemp ?? null,
    }));

    const displayName = vehicle.override?.displayName ?? vehicle.displayName ?? "名称未設定";

    return (
        <main style={{padding: "3px 10px 0px 10px", display: "grid", gap: 16}}>
            {/* ヘッダー: 車両一覧へ戻るリンク */}
            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8}}>
                <div style={{display: "flex", alignItems: "center", gap: 8}}>
                    <Link
                        href="/vehicles"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            color: "#3b82f6",
                            textDecoration: "none",
                            fontSize: 14,
                        }}
                    >
                        <svg
                            style={{width: 16, height: 16}}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        車両一覧
                    </Link>
                    <span style={{color: "#9ca3af"}}>|</span>
                    <span style={{fontWeight: 600, color: "#111827"}}>{displayName}</span>
                    {badge(vehicle.override?.vehicleGrade ?? vehicle.vehicleGrade ?? "RWD", "#ecfeff", "#0e7490")}
                </div>
                <div style={{display: "flex", alignItems: "center", gap: 4}}>
                    <AddToHomeButton />
                    <HeaderMenu />
                </div>
            </div>

            <VehicleCards
                vehicles={[vehicle] as Vehicle[]}
                todayMap={todayMap as any}
                yesterdayMap={yesterdayMap as any}
                hideVehicleTag={true}
            />

            <section style={{display: "grid", gap: 8}}>
                <b>電池残量 / 走行可能距離</b>
                <BatteryRangeChart data={chartData} />
            </section>

            <section style={{display: "flex", gap: 12, flexWrap: "wrap", paddingBottom: 20}}>
                <SyncDailyButton alreadyFetchedToday={todaySnapshot?.status === true} />
            </section>
        </main>
    );
}
