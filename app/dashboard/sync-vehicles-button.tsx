"use client";

import {useState} from "react";

export default function SyncVehiclesButton() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string>("");

    async function onSync() {
        setLoading(true);
        setResult("");

        try {
            const res = await fetch("/api/tesla/sync-vehicles", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                cache: "no-store",
            });

            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                console.error("Sync failed", json);
                setResult(`NG: ${res.status} ${json.message ?? "エラーが発生しました"}`);
                return;
            }

            // sync-vehicles の返却に合わせて整形
            setResult(`OK: count=${json.count ?? "?"}`);
        } catch (e: any) {
            setResult(`NG: ${e?.message ?? String(e)}`);
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

            {result && (
                <pre style={{padding: 12, background: "#f6f6f6", borderRadius: 8}}>
                    {result}
                </pre>
            )}
        </div>
    );
}
