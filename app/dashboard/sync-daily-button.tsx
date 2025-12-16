"use client";

import {useState} from "react";

export default function SyncDailyButton() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string>("");

    async function onSync() {
        setLoading(true);
        setResult("");

        try {
            const res = await fetch("/api/tesla/sync-daily", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                cache: "no-store",
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                setResult(`NG: ${res.status} ${JSON.stringify(json)}`);
                return;
            }
            setResult(
                `OK: snapshot=${json.snapshotDateIso}\n` +
                `vehiclesInAccount=${json.vehiclesInAccount} success=${json.success} fail=${json.fail} savedCount=${json.savedCount}\n` +
                `results=${JSON.stringify(json.results, null, 2)}`
            );
        } catch (e: any) {
            setResult(`NG: ${e?.message ?? String(e)}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{display: "grid", gap: 8, maxWidth: 520}}>
            <button
                onClick={onSync}
                disabled={loading}
                style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #ccc",
                    cursor: loading ? "not-allowed" : "pointer",
                }}
            >
                {loading ? "日次スナップショット取得中..." : "日次スナップショット取得（POST）"}
            </button>

            {result && (
                <pre style={{padding: 12, background: "#f6f6f6", borderRadius: 8}}>
                    {result}
                </pre>
            )}
        </div>
    );
}
