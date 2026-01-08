import {cookies} from "next/headers";
import {getIronSession} from "iron-session";

import {prisma} from "@/prisma";
import {sessionOptions, type SessionData} from "@/app/lib/session";
import TeslaSettingsForm from "./TeslaSettingsForm";
import {getTeslaMode} from "./actions";

export default async function TeslaSettingsPage() {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const teslaSub = session.teslaSub;

    if (!teslaSub) {
        return (
            <main style={{padding: 16}}>
                <p>未ログインです。先に Tesla ログインしてください。</p>
            </main>
        );
    }

    const account = await prisma.teslaAccount.findUnique({
        where: {teslaSub},
        include: {
            settings: true,
            authToken: true,
            vehicles: {
                orderBy: {lastSeenAt: "desc"},
                include: {
                    override: true,
                },
            },
        },
    });

    if (!account) {
        return (
            <main style={{padding: 16}}>
                <h1>Tesla連携設定</h1>
                <p>TeslaAccount が見つかりません。</p>
            </main>
        );
    }

    const mode = await getTeslaMode(account.id);
    const consentGivenAt = account.settings?.consentGivenAt?.toISOString() ?? null;
    const consentVersion = account.settings?.consentVersion ?? null;

    // 車両データをクライアントに渡せる形に変換（BigIntをstringに）
    const vehicles = account.vehicles.map((v) => ({
        id: v.id,
        teslaVehicleId: v.teslaVehicleId.toString(),
        displayName: v.override?.displayName ?? v.displayName ?? "名称未設定",
        isPublic: v.override?.isPublic ?? false,
    }));

    return (
        <main style={{padding: 16, maxWidth: 760}}>
            <h1>Tesla連携設定</h1>
            <TeslaSettingsForm
                initial={{
                    mode,
                    consentGivenAt,
                    consentVersion,
                }}
                vehicles={vehicles}
            />
        </main>
    );
}
