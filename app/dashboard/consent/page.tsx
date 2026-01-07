"use client";

import {useState} from "react";
import {saveTeslaConsentAndMode} from "./actions";

export default function TeslaConsentPage() {
    const [mode, setMode] = useState<"MANUAL" | "AUTO">("MANUAL");
    const [checked, setChecked] = useState(false);

    return (
        <main style={{
            minHeight: "100vh",
            background: "linear-gradient(to bottom, #0f172a, #1e293b)",
            color: "#ffffff",
        }}>
            <div style={{
                maxWidth: "448px",
                margin: "0 auto",
                padding: "32px 24px",
            }}>
                {/* ヘッダー */}
                <header style={{textAlign: "center", marginBottom: "24px"}}>
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "56px",
                        height: "56px",
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, #f97316, #dc2626)",
                        marginBottom: "12px",
                    }}>
                        <svg style={{width: "28px", height: "28px", color: "white"}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 style={{fontSize: "22px", fontWeight: "bold", color: "#ffffff"}}>
                        利用規約への同意
                    </h1>
                    <p style={{marginTop: "8px", color: "#94a3b8", fontSize: "14px"}}>
                        Tesla公式OAuthでログインし車両データを取得します
                    </p>
                </header>

                {/* 取得するデータ */}
                <section style={{
                    marginTop: "16px",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                }}>
                    <h2 style={{fontWeight: 600, color: "#ffffff", fontSize: "15px", marginBottom: "12px"}}>
                        取得するデータ
                    </h2>
                    <ul style={{
                        margin: 0,
                        paddingLeft: "20px",
                        color: "#cbd5e1",
                        fontSize: "13px",
                        lineHeight: "1.8",
                    }}>
                        <li>車体グレード、色、内装、タイヤ</li>
                        <li>バッテリー残量（%）</li>
                        <li>走行可能距離</li>
                        <li>走行距離（オドメーター）</li>
                        <li>車外温度・車内温度</li>
                        <li>オンライン / オフライン状態</li>
                    </ul>
                    <p style={{marginTop: "12px", fontSize: "12px", color: "#64748b"}}>
                        取得項目は変わる可能性があります。その際はお知らせします。
                    </p>
                </section>

                {/* 取得しないデータ */}
                <section style={{
                    marginTop: "12px",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "rgba(34,197,94,0.1)",
                    border: "1px solid rgba(34,197,94,0.2)",
                }}>
                    <h2 style={{fontWeight: 600, color: "#4ade80", fontSize: "15px", marginBottom: "12px"}}>
                        取得しないデータ
                    </h2>
                    <ul style={{
                        margin: 0,
                        paddingLeft: "20px",
                        color: "#86efac",
                        fontSize: "13px",
                        lineHeight: "1.8",
                    }}>
                        <li>VIN</li>
                        <li>位置情報（GPS）</li>
                        <li>メールアドレス</li>
                        <li>パスワード</li>
                    </ul>
                </section>

                {/* 通信モード */}
                <section style={{
                    marginTop: "12px",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                }}>
                    <h2 style={{fontWeight: 600, color: "#ffffff", fontSize: "15px"}}>
                        通信モード
                    </h2>
                    <p style={{marginTop: "4px", fontSize: "12px", color: "#64748b"}}>
                        現在は手動のみ。将来的に自動取得を追加予定です。
                    </p>
                    <div style={{marginTop: "12px"}}>
                        <label style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            color: "#cbd5e1",
                            fontSize: "14px",
                            cursor: "pointer",
                        }}>
                            <input
                                type="radio"
                                name="mode"
                                value="MANUAL"
                                checked={mode === "MANUAL"}
                                onChange={() => setMode("MANUAL")}
                                style={{accentColor: "#f97316"}}
                            />
                            MANUAL（手動）
                        </label>
                    </div>
                </section>

                {/* 同意チェック */}
                <div style={{
                    marginTop: "20px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                }}>
                    <input
                        id="consent"
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                        style={{
                            marginTop: "3px",
                            width: "18px",
                            height: "18px",
                            accentColor: "#f97316",
                            cursor: "pointer",
                        }}
                    />
                    <label htmlFor="consent" style={{
                        fontSize: "14px",
                        color: "#e2e8f0",
                        cursor: "pointer",
                    }}>
                        上記内容を確認し、Teslaデータの取得に同意します
                    </label>
                </div>

                {/* ボタン */}
                <div style={{marginTop: "24px", display: "grid", gap: "12px"}}>
                    <button
                        disabled={!checked}
                        onClick={async () => {
                            if (!checked) return;
                            await saveTeslaConsentAndMode({mode, consentVersion: "v1"});
                            window.location.href = "/api/tesla/login";
                        }}
                        style={{
                            width: "100%",
                            padding: "16px 24px",
                            textAlign: "center",
                            fontWeight: 600,
                            fontSize: "16px",
                            borderRadius: "12px",
                            border: "none",
                            background: checked
                                ? "linear-gradient(to right, #f97316, #dc2626)"
                                : "rgba(100,116,139,0.3)",
                            color: checked ? "#ffffff" : "#64748b",
                            cursor: checked ? "pointer" : "not-allowed",
                            boxShadow: checked ? "0 10px 15px -3px rgba(249,115,22,0.3)" : "none",
                            transition: "all 0.2s",
                        }}
                    >
                        同意してTeslaにログイン
                    </button>
                    <a
                        href="/"
                        style={{
                            display: "block",
                            textAlign: "center",
                            fontSize: "14px",
                            color: "#64748b",
                            textDecoration: "none",
                        }}
                    >
                        戻る
                    </a>
                </div>

                {/* フッター */}
                <footer style={{
                    marginTop: "32px",
                    paddingTop: "24px",
                    borderTop: "1px solid rgba(100,116,139,0.3)",
                    textAlign: "center",
                }}>
                    <p style={{fontSize: "12px", color: "#64748b"}}>
                        Marsflare は Tesla, Inc. の公式サービスではありません。
                    </p>
                </footer>
            </div>
        </main>
    );
}
