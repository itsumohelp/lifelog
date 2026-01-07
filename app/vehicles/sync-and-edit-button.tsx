"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

export default function SyncAndEditButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSync() {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/tesla/sync-vehicles", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                cache: "no-store",
            });

            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                console.error("Sync failed", json);
                setError(json.error ?? "車両情報の取得に失敗しました");
                return;
            }

            // 成功したら確認画面へ遷移
            router.push("/vehicles/confirm");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "エラーが発生しました");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-2">
            <button
                onClick={onSync}
                disabled={loading}
                className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {loading ? "取得中..." : "車両情報を再取得して編集"}
            </button>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
}
