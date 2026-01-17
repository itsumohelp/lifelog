"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

type SyncResultItem = {
    teslaVehicleId: string;
    displayName: string | null;
    status: "ok" | "timeout" | "error";
    errorMessage?: string;
};

type Props = {
    alreadyFetchedToday?: boolean;
};

export default function SyncDailyButton({alreadyFetchedToday = false}: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(alreadyFetchedToday);
    const [feedback, setFeedback] = useState<{
        type: "success" | "warning" | "error" | "reauth";
        message: string;
    } | null>(null);

    async function onSync() {
        setLoading(true);
        setFeedback(null);

        try {
            const res = await fetch("/api/tesla/sync-daily", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                cache: "no-store",
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                console.error("Sync daily failed", json);
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

            const results: SyncResultItem[] = json.results ?? [];
            const timeoutCount = results.filter(r => r.status === "timeout").length;
            const okCount = results.filter(r => r.status === "ok").length;

            if (timeoutCount > 0 && okCount === 0) {
                setFeedback({
                    type: "warning",
                    message: "車両がスリープしているため取得できませんでした",
                });
            } else if (timeoutCount > 0) {
                setFeedback({
                    type: "warning",
                    message: `${okCount}台のデータを取得しました。${timeoutCount}台はスリープ中のため取得できませんでした`,
                });
                router.refresh();
            } else {
                setFeedback({
                    type: "success",
                    message: `データを取得しました`,
                });
                setFetched(true);
                router.refresh();
            }
        } catch (e: any) {
            setFeedback({
                type: "error",
                message: `エラーが発生しました: ${e?.message ?? String(e)}`,
            });
        } finally {
            setLoading(false);
        }
    }

    const isDisabled = loading || fetched;

    return (
        <div style={{display: "grid", gap: 8}}>
            <button
                onClick={onSync}
                disabled={isDisabled}
                style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #ccc",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    background: isDisabled ? "#f3f4f6" : "white",
                    opacity: fetched ? 0.5 : 1,
                }}
            >
                {loading ? "取得中..." : fetched ? "取得済み" : "走行データ取得"}
            </button>

            {feedback && (
                <div style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: feedback.type === "success" ? "#dcfce7" :
                               feedback.type === "warning" ? "#fef3c7" :
                               feedback.type === "reauth" ? "#fef3c7" : "#fee2e2",
                    color: feedback.type === "success" ? "#166534" :
                           feedback.type === "warning" ? "#92400e" :
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
