import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {getIronSession} from "iron-session";

import {prisma} from "@/prisma";
import {sessionOptions, type SessionData} from "@/app/lib/session";
import VehicleConfirmForm from "./vehicle-confirm-form";

export type VehicleWithOverride = {
    id: string;
    teslaVehicleId: string;
    displayName: string | null;
    vehicleGrade: string | null;
    capacityKwh: number | null;
    override: {
        displayName: string | null;
        vehicleGrade: string | null;
        capacityKwh: number | null;
        confirmedAt: Date | null;
    } | null;
};

export default async function VehicleConfirmPage() {
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

    if (!account || account.vehicles.length === 0) {
        redirect("/dashboard");
    }

    // 未確認の車両があるかチェック
    const hasUnconfirmed = account.vehicles.some(
        (v) => !v.override?.confirmedAt
    );

    // 全車両確認済みならダッシュボードへ
    if (!hasUnconfirmed) {
        redirect("/dashboard");
    }

    // BigIntをstringに変換してクライアントに渡せる形式に
    const vehicles: VehicleWithOverride[] = account.vehicles.map((v) => ({
        id: v.id,
        teslaVehicleId: v.teslaVehicleId.toString(),
        displayName: v.displayName,
        vehicleGrade: v.vehicleGrade,
        capacityKwh: v.capacityKwh,
        override: v.override
            ? {
                  displayName: v.override.displayName,
                  vehicleGrade: v.override.vehicleGrade,
                  capacityKwh: v.override.capacityKwh,
                  confirmedAt: v.override.confirmedAt,
              }
            : null,
    }));

    return (
        <main className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    車両情報の確認
                </h1>
                <p className="text-gray-600 mb-6">
                    取得した車両情報を確認してください。必要に応じて修正できます。
                </p>
                <VehicleConfirmForm vehicles={vehicles} />
            </div>
        </main>
    );
}
