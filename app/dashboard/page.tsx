import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import {sessionOptions, SessionData} from "@/app/lib/session";
import {prisma} from "@/prisma";
import BuildInfo from "@/app/dashboard/build-info"
import SyncVehiclesButton from "./sync-vehicles-button";
import SyncDailyButton from "./sync-daily-button";

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
    });

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
                    <div style={{overflowX: "auto"}}>
                        <table style={{borderCollapse: "collapse", width: "100%"}}>
                            <thead>
                                <tr>
                                    <th style={th}>displayName</th>
                                    <th style={th}>teslaVehicleId</th>
                                    <th style={th}>state</th>
                                    <th style={th}>accessType</th>
                                    <th style={th}>lastSeenAt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicles.map((v) => (
                                    <tr key={v.id}>
                                        <td style={td}>{v.displayName ?? "-"}</td>
                                        <td style={td}>{v.teslaVehicleId.toString()}</td>
                                        <td style={td}>{v.state ?? "-"}</td>
                                        <td style={td}>{v.accessType ?? "-"}</td>
                                        <td style={td}>{new Date(v.lastSeenAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
