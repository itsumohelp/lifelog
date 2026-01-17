"use client";

import {useState} from "react";

type FeedbackState = {
    type: "success" | "error" | "reauth";
    message: string;
} | null;

export default function SyncVehiclesButton() {
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackState>(null);

    async function onSync() {
        setLoading(true);
        setFeedback(null);

        try {
            const res = await fetch("/api/tesla/sync-vehicles", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                cache: "no-store",
            });

            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                console.error("Sync failed", json);
                // 再認証が必要な場合
                if (json.requiresReauth) {
                    setFeedback({
                        type: "reauth",
                        message: json.error ?? "認証の有効期限が切れました。再ログインしてください。",
                    });
                    return;
                }
                setFeedback({
                    type: "error",
                    message: `エラーが発生しました: ${json.error ?? res.status}`,
                });
                return;
            }

            // sync-vehicles の返却に合わせて整形
            setFeedback({
                type: "success",
                message: `${json.count ?? 0}台の車両情報を取得しました`,
            });
        } catch (e: any) {
            setFeedback({
                type: "error",
                message: `エラーが発生しました: ${e?.message ?? String(e)}`,
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{display: "grid", gap: 8}}>
            <button
                onClick={onSync}
                disabled={loading}
                style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    cursor: loading ? "not-allowed" : "pointer",
                }}
            >
                {loading ? "取得中..." : "車両情報を再取得"}
            </button>

            {feedback && (
                <div style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: feedback.type === "success" ? "#dcfce7" :
                               feedback.type === "reauth" ? "#fef3c7" : "#fee2e2",
                    color: feedback.type === "success" ? "#166534" :
                           feedback.type === "reauth" ? "#92400e" : "#991b1b",
                    fontSize: 14,
                }}>
                    {feedback.message}
                    {feedback.type === "reauth" && (
                        <div style={{marginTop: 8}}>
                            <a
                                href="/api/tesla/login"
                                style={{
                                    display: "inline-block",
                                    padding: "8px 16px",
                                    background: "#1f2937",
                                    color: "white",
                                    borderRadius: 6,
                                    textDecoration: "none",
                                    fontSize: 13,
                                }}
                            >
                                Teslaで再ログイン
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
