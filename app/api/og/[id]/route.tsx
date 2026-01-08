import {ImageResponse} from "next/og";
import {prisma} from "@/prisma";

export const runtime = "nodejs";

export async function GET(
    request: Request,
    {params}: {params: Promise<{id: string}>}
) {
    const {id} = await params;

    // アカウント情報を取得
    const account = await prisma.teslaAccount.findUnique({
        where: {id},
        include: {
            vehicles: {
                orderBy: {lastSeenAt: "desc"},
                take: 1,
                include: {
                    override: true,
                },
            },
            dailySnapshot: {
                orderBy: {snapshotDate: "desc"},
                take: 1,
            },
        },
    });

    // データがない場合のデフォルト表示
    const vehicle = account?.vehicles?.[0];
    const snapshot = account?.dailySnapshot?.[0];
    const displayName = vehicle?.override?.displayName ?? vehicle?.displayName ?? "My Tesla";
    const odometerKm = snapshot?.odometerKm ? Math.round(snapshot.odometerKm) : null;

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                    fontFamily: "system-ui, sans-serif",
                }}
            >
                {/* ロゴセクション */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 20,
                        marginBottom: 40,
                    }}
                >
                    {/* ロゴアイコン */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 80,
                            height: 80,
                            borderRadius: 16,
                            background: "linear-gradient(135deg, #f97316, #dc2626)",
                        }}
                    >
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                            <path d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                        </svg>
                    </div>
                    {/* ロゴテキスト */}
                    <span
                        style={{
                            fontSize: 64,
                            fontWeight: 700,
                            color: "#ffffff",
                        }}
                    >
                        Marsflare
                    </span>
                </div>

                {/* 車両名 */}
                <div
                    style={{
                        fontSize: 36,
                        color: "#94a3b8",
                        marginBottom: 24,
                    }}
                >
                    {displayName}
                </div>

                {/* オドメーター */}
                {odometerKm !== null && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 12,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 96,
                                fontWeight: 700,
                                color: "#ffffff",
                            }}
                        >
                            {odometerKm.toLocaleString()}
                        </span>
                        <span
                            style={{
                                fontSize: 36,
                                color: "#64748b",
                            }}
                        >
                            km
                        </span>
                    </div>
                )}

                {odometerKm === null && (
                    <div
                        style={{
                            fontSize: 48,
                            color: "#64748b",
                        }}
                    >
                        Tesla Vehicle Dashboard
                    </div>
                )}
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
