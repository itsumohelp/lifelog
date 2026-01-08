import Link from "next/link";

export default function Home() {
    return (
        <main style={{
            minHeight: "100vh",
            background: "#ffffff",
            color: "#1e293b",
        }}>
            <div style={{
                maxWidth: "448px",
                margin: "0 auto",
                padding: "48px 24px",
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}>
                {/* ヘッダー */}
                <header style={{textAlign: "center"}}>
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "64px",
                        height: "64px",
                        borderRadius: "16px",
                        background: "linear-gradient(135deg, #f97316, #dc2626)",
                        marginBottom: "16px",
                    }}>
                        <svg style={{width: "32px", height: "32px", color: "white"}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                        </svg>
                    </div>
                    <h1 style={{
                        fontSize: "28px",
                        fontWeight: "bold",
                        letterSpacing: "-0.025em",
                        color: "#0f172a",
                    }}>
                        Marsflare
                    </h1>
                    <p style={{
                        marginTop: "8px",
                        color: "#64748b",
                        fontSize: "14px",
                    }}>
                        あなたのTeslaを、もっとスマートに。
                    </p>
                </header>

                {/* メインコンテンツ */}
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "32px 0",
                }}>
                    {/* 機能リスト */}
                    <div style={{display: "grid", gap: "16px"}}>
                        <div style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "16px",
                            padding: "16px",
                            borderRadius: "12px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                        }}>
                            <div style={{
                                flexShrink: 0,
                                width: "40px",
                                height: "40px",
                                borderRadius: "8px",
                                background: "rgba(249,115,22,0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                <svg style={{width: "20px", height: "20px", color: "#f97316"}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 style={{fontWeight: 600, color: "#0f172a", fontSize: "15px"}}>
                                    バッテリー・走行距離を記録
                                </h3>
                                <p style={{fontSize: "13px", color: "#64748b", marginTop: "4px"}}>
                                    毎日のバッテリー残量と走行距離を自動で記録。推移をグラフで確認できます。
                                </p>
                            </div>
                        </div>

                        <div style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "16px",
                            padding: "16px",
                            borderRadius: "12px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                        }}>
                            <div style={{
                                flexShrink: 0,
                                width: "40px",
                                height: "40px",
                                borderRadius: "8px",
                                background: "rgba(59,130,246,0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                <svg style={{width: "20px", height: "20px", color: "#3b82f6"}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div>
                                <h3 style={{fontWeight: 600, color: "#0f172a", fontSize: "15px"}}>
                                    電費を自動計算
                                </h3>
                                <p style={{fontSize: "13px", color: "#64748b", marginTop: "4px"}}>
                                    走行距離と消費電力から電費（km/kWh）を算出。効率的なドライブをサポート。
                                </p>
                            </div>
                        </div>

                        <div style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "16px",
                            padding: "16px",
                            borderRadius: "12px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                        }}>
                            <div style={{
                                flexShrink: 0,
                                width: "40px",
                                height: "40px",
                                borderRadius: "8px",
                                background: "rgba(168,85,247,0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                <svg style={{width: "20px", height: "20px", color: "#a855f7"}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 style={{fontWeight: 600, color: "#0f172a", fontSize: "15px"}}>
                                    安全なデータ管理
                                </h3>
                                <p style={{fontSize: "13px", color: "#64748b", marginTop: "4px"}}>
                                    Tesla公式OAuthで認証。VINや位置情報は取得しません。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTAボタン */}
                <div style={{display: "grid", gap: "12px"}}>
                    <Link
                        href="/dashboard/consent"
                        style={{
                            display: "block",
                            width: "100%",
                            padding: "16px 24px",
                            textAlign: "center",
                            fontWeight: 600,
                            fontSize: "16px",
                            borderRadius: "12px",
                            background: "linear-gradient(to right, #f97316, #dc2626)",
                            color: "#ffffff",
                            textDecoration: "none",
                            boxShadow: "0 10px 15px -3px rgba(249,115,22,0.3)",
                        }}
                    >
                        Teslaアカウントでログイン
                    </Link>
                    <p style={{
                        textAlign: "center",
                        fontSize: "12px",
                        color: "#94a3b8",
                    }}>
                        ログインにはTeslaアカウントが必要です
                    </p>
                </div>

                {/* フッター */}
                <footer style={{
                    marginTop: "32px",
                    paddingTop: "24px",
                    borderTop: "1px solid #e2e8f0",
                    textAlign: "center",
                }}>
                    <p style={{fontSize: "12px", color: "#94a3b8"}}>
                        Marsflare は Tesla, Inc. の公式サービスではありません。
                    </p>
                </footer>
            </div>
        </main>
    );
}
