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

    if (!info) return <div>Build: loading...</div>;

    return (
        <div style={{padding: 12, border: "1px solid #ddd", borderRadius: 8}}>
            <div><b>Build SHA</b>: {info.buildSha}</div>
            <div><b>Build Time</b>: {info.buildTime}</div>
        </div>
    );
}
