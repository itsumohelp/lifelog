import {prisma} from "@/prisma";
import {requireTeslaSub} from "@/app/lib/auth-session";
import TeslaSettingsForm from "./TeslaSettingsForm";
import {getTeslaMode} from "./actions";

export default async function TeslaSettingsPage() {
    const teslaSub = await requireTeslaSub();

    const account = await prisma.teslaAccount.findUnique({
        where: {teslaSub},
        include: {
            settings: true,
            authToken: true,
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

    return (
        <main style={{padding: 16, maxWidth: 760}}>
            <h1>Tesla連携設定</h1>
            <TeslaSettingsForm
                initial={{
                    mode,
                    consentGivenAt,
                    consentVersion,
                }}
            />
        </main>
    );
}
