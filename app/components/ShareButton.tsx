"use client";

import {useState, useEffect} from "react";
import {usePathname} from "next/navigation";

export default function ShareButton() {
    const [copied, setCopied] = useState(false);
    const [isPublic, setIsPublic] = useState<boolean | null>(null);
    const pathname = usePathname();

    // パスから vehicleTag を抽出（/dashboard/[vehicleTag] の形式）
    const match = pathname.match(/^\/dashboard\/(\d+)/);
    const vehicleTag = match?.[1] ?? null;

    useEffect(() => {
        if (!vehicleTag) return;

        // 公開状態を確認
        fetch(`/api/vehicle/${vehicleTag}/public-status`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data !== null) {
                    setIsPublic(data.isPublic);
                }
            })
            .catch(() => {});
    }, [vehicleTag]);

    async function handleShare() {
        if (!vehicleTag) return;

        const url = `${window.location.origin}/public/${vehicleTag}`;

        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error("Failed to copy", e);
        }
    }

    // ダッシュボードページでない場合、または公開されていない場合は表示しない
    if (!vehicleTag || isPublic !== true) return null;

    return (
        <div style={{ position: "relative" }}>
            <button
                onClick={handleShare}
                title="公開URLをコピー"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    color: "#6b7280",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.15s",
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
            </button>
            {copied && (
                <div style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: 4,
                    padding: "8px 12px",
                    background: "#111827",
                    color: "white",
                    borderRadius: 6,
                    fontSize: 12,
                    whiteSpace: "nowrap",
                    zIndex: 1000,
                }}>
                    公開URLをコピーしました
                </div>
            )}
        </div>
    );
}
