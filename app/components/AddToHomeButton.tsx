"use client";

import { useState, useEffect } from "react";

type DeviceType = "ios" | "android" | "other";

function detectDevice(): DeviceType {
  if (typeof window === "undefined") return "other";

  const ua = navigator.userAgent.toLowerCase();

  // iOS Safari
  if (/iphone|ipad|ipod/.test(ua) && /safari/.test(ua) && !/crios|fxios/.test(ua)) {
    return "ios";
  }

  // Android Chrome
  if (/android/.test(ua) && /chrome/.test(ua)) {
    return "android";
  }

  return "other";
}

export default function AddToHomeButton() {
  const [showModal, setShowModal] = useState(false);
  const [device, setDevice] = useState<DeviceType | null>(null);

  useEffect(() => {
    setDevice(detectDevice());
  }, []);

  // PCの場合は非表示（iOS/Android以外）
  if (device === null || device === "other") {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        title="ホーム画面に追加"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: 8,
          color: "#94a3b8",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
      </button>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: 24,
              maxWidth: 340,
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#0f172a",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              ホーム画面に追加
            </h2>

            {device === "ios" && (
              <div style={{ display: "grid", gap: 16 }}>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
                  このページをホーム画面に追加すると、アプリのようにすぐアクセスできます。
                </p>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 12,
                    padding: 16,
                    display: "grid",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#3b82f6",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      1
                    </span>
                    <span style={{ fontSize: 14, color: "#334155" }}>
                      画面下の
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        style={{ verticalAlign: "middle", margin: "0 4px" }}
                      >
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                      をタップ
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#3b82f6",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      2
                    </span>
                    <span style={{ fontSize: 14, color: "#334155" }}>
                      「ホーム画面に追加」を選択
                    </span>
                  </div>
                </div>
              </div>
            )}

            {device === "android" && (
              <div style={{ display: "grid", gap: 16 }}>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
                  このページをホーム画面に追加すると、アプリのようにすぐアクセスできます。
                </p>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 12,
                    padding: 16,
                    display: "grid",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#3b82f6",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      1
                    </span>
                    <span style={{ fontSize: 14, color: "#334155" }}>
                      右上の
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="#334155"
                        style={{ verticalAlign: "middle", margin: "0 4px" }}
                      >
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                      </svg>
                      をタップ
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#3b82f6",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      2
                    </span>
                    <span style={{ fontSize: 14, color: "#334155" }}>
                      「ホーム画面に追加」を選択
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              style={{
                marginTop: 20,
                width: "100%",
                padding: "12px 16px",
                background: "#f1f5f9",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                color: "#475569",
                cursor: "pointer",
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
