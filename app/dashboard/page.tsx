import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {getIronSession} from "iron-session";

import {prisma} from "@/prisma";
import {sessionOptions, type SessionData} from "@/app/lib/session";

export default async function DashboardPage() {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const teslaSub = session.teslaSub;

    if (!teslaSub) {
        redirect("/");
    }

    // ログイン中ユーザーの TeslaAccount を取得
    const account = await prisma.teslaAccount.findUnique({
        where: {teslaSub},
        include: {
            vehicles: {
                orderBy: {lastSeenAt: "desc"},
                take: 1,
            },
        },
    });

    if (!account) {
        redirect("/");
    }

    // 車両が1台のみの場合は直接そのダッシュボードへ
    if (account.vehicles.length === 1) {
        redirect(`/dashboard/${account.vehicles[0].teslaVehicleId.toString()}`);
    }

    // 車両が複数または0台の場合は車両一覧へ
    redirect("/vehicles");
}
