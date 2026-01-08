import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {getIronSession} from "iron-session";
import Link from "next/link";

import {prisma} from "@/prisma";
import {sessionOptions, type SessionData} from "@/app/lib/session";
import SyncAndEditButton from "./sync-and-edit-button";

// JSTの日次キー
function getJstDayKey(d = new Date()): Date {
    const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    const y = jst.getUTCFullYear();
    const m = jst.getUTCMonth();
    const day = jst.getUTCDate();
    const jstMidnightUtc = Date.UTC(y, m, day, 0, 0, 0) - 9 * 60 * 60 * 1000;
    return new Date(jstMidnightUtc);
}

export default async function VehiclesPage() {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const teslaSub = session.teslaSub;

    if (!teslaSub) {
        redirect("/");
    }

    const account = await prisma.teslaAccount.findUnique({
        where: {teslaSub},
        include: {
            vehicles: {
                orderBy: {lastSeenAt: "desc"},
                include: {
                    override: true,
                },
            },
        },
    });

    if (!account) {
        redirect("/");
    }

    const vehicles = account.vehicles;

    // 今日のスナップショットを取得（オドメーター情報）
    const todayKey = getJstDayKey(new Date());
    const todaySnapshots = await prisma.teslaVehicleDailySnapshot.findMany({
        where: {
            teslaAccountId: account.id,
            snapshotDate: todayKey,
        },
    });

    // teslaVehicleId -> snapshot のマップ
    const snapshotMap = Object.fromEntries(
        todaySnapshots.map((s) => [s.teslaVehicleId.toString(), s])
    );

    return (
        <main className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    車両一覧
                </h1>

                {vehicles.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">
                        車両が登録されていません
                    </div>
                ) : (
                    <div className="space-y-3">
                        {vehicles.map((vehicle) => {
                            const displayName = vehicle.override?.displayName ?? vehicle.displayName ?? "名称未設定";
                            const vehicleGrade = vehicle.override?.vehicleGrade ?? vehicle.vehicleGrade ?? "-";
                            const snapshot = snapshotMap[vehicle.teslaVehicleId.toString()];
                            const odometerKm = snapshot?.odometerKm;

                            return (
                                <Link
                                    key={vehicle.id}
                                    href={`/dashboard/${vehicle.teslaVehicleId.toString()}`}
                                    className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-lg font-semibold text-gray-900 truncate">
                                                {displayName}
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {vehicleGrade}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 ml-4">
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500">走行距離</div>
                                                <div className="text-lg font-bold text-gray-900">
                                                    {odometerKm != null
                                                        ? `${Math.round(odometerKm).toLocaleString()} km`
                                                        : "-"}
                                                </div>
                                            </div>
                                            <svg
                                                className="w-5 h-5 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                <div className="mt-8 space-y-4">
                    <SyncAndEditButton />
                    <div className="text-center">
                        <Link
                            href="/vehicles/confirm?edit=true"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                            再取得せずに車両情報を編集
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
