"use client";

import {useEffect, useState} from "react";

export default function BuildInfo() {
    const [info, setInfo] = useState<any>(null);

    useEffect(() => {
        fetch("/api/healthz", {cache: "no-store"})
            .then((r) => r.json())
            .then(setInfo)
            .catch(() => setInfo({ok: false}));
    }, []);

    if (!info) return <div style={box}>Build: loading...</div>;

    return (
        <div style={box}>
            <div><b>Build SHA</b>: {info.buildSha ?? "unknown"}</div>
            <div><b>Build Time</b>: {info.buildTime ?? "unknown"}</div>
        </div>
    );
}

const box: React.CSSProperties = {
    padding: 12,
    border: "1px solid #ddd",
    borderRadius: 8,
};
