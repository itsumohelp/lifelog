"use client";

import {useMemo, useState} from "react";
import {saveTeslaSettings, deleteStoredToken, disconnectTesla, agreeAndStartTeslaLogin} from "./actions";
import React from "react";

type Props = {
    initial: {
        mode: "MANUAL" | "AUTO";
        consentGivenAt: string | null;
        consentVersion: string | null;
    };
};

export default function TeslaSettingsForm({initial}: Props) {
    const [mode, setMode] = useState<Props["initial"]["mode"]>(initial.mode);
    const [consentUnderstand, setConsentUnderstand] = useState(false);
    const [consentStoreToken, setConsentStoreToken] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<string>("");

    const canSelectAuto = consentUnderstand && consentStoreToken;

    React.useEffect(() => {
        if (mode === "AUTO") {
            setConsentUnderstand(true);
            setConsentStoreToken(true);
        }
    }, []);

    async function onAgreeAndLogin() {
        setSaving(true);
        setMsg("");
        try {
            await agreeAndStartTeslaLogin({consentUnderstand, consentStoreToken, fromSettings: true});
        } catch (e: any) {
            setMsg(`失敗: ${e?.message ?? String(e)}`);
        } finally {
            setSaving(false);
        }
    }

    async function onSave() {
        setSaving(true);
        setMsg("");
        try {
            await saveTeslaSettings({mode, consentUnderstand, consentStoreToken});
            if (mode === "MANUAL") {
                setMsg("保存しました。");
            } else if (mode === "AUTO") {
                alert("保存しました。AUTOで情報取得するためトークンを取得保管します。ログイン画面に遷移します。");
                onAgreeAndLogin();
            }
        } catch (e: any) {
            setMsg(`保存に失敗: ${e?.message ?? String(e)}`);
        } finally {
            setSaving(false);
        }
    }

    async function onDeleteToken() {
        if (!confirm("保存済みトークンを削除します。自動取得は無効（手動）になります。よろしいですか？")) return;
        setSaving(true);
        setMsg("");
        try {
            await deleteStoredToken();
            setMsg("トークンを削除しました（手動モードに戻しました）。");
            setMode("MANUAL");
        } catch (e: any) {
            setMsg(`削除に失敗: ${e?.message ?? String(e)}`);
        } finally {
            setSaving(false);
        }
    }

    async function onDisconnect() {
        if (!confirm("アカウントを削除します。全てのデータ（車両情報・日次データ・トークン・設定）が完全に削除され、復元できません。本当によろしいですか？")) return;
        if (!confirm("最終確認：この操作は取り消せません。本当に削除しますか？")) return;

        setSaving(true);
        setMsg("");
        try {
            await disconnectTesla();
            alert("アカウントの削除が完了しました。ログイン画面に移動します。");
            window.location.href = "https://zees.blog/dashboard/consent";
        } catch (e: unknown) {
            setMsg(`削除に失敗: ${e instanceof Error ? e.message : String(e)}`);
            setSaving(false);
        }
    }

    return (
        <section style={{display: "grid", gap: 14}}>
            <div style={card}>
                <div style={{fontWeight: 700}}>現在の状態</div>
                <div style={{color: "#374151", fontSize: 14}}>
                    <div>モード: <b>{initial.mode}</b></div>
                    <div>同意日時: {initial.consentGivenAt ?? "-"}</div>
                    <div>同意文バージョン: {initial.consentVersion ?? "-"}</div>
                </div>
            </div>

            {/* 注意 */}
            <div style={{...card, borderColor: "#f59e0b", background: "#fffbeb"}}>
                <div style={{fontWeight: 700}}>⚠️ 重要</div>
                <ul style={{margin: "8px 0 0 18px", color: "#92400e"}}>
                    <li>自動取得を有効にすると、日次取得のためにリフレッシュトークンを暗号化して保存します。</li>
                    <li>保存したトークンはいつでも削除でき、手動モードに戻せます。</li>
                    <li>車両がスリープ中は取得できず、欠測になる場合があります。</li>
                    <li>本アプリからAPIを参照した履歴はログとして保管して結果を確認することができます。</li>
                    <li>DB管理者は暗号化されたトークン文字列を参照可能ですが利用することはありません。</li>
                </ul>
                <details style={{marginTop: 10}}>
                    <summary style={{cursor: "pointer"}}>詳細（リスクと対策）</summary>
                    <ul style={{margin: "8px 0 0 18px", color: "#92400e"}}>
                        <li>DBが何らかの理由で不正参照された場合、暗号化されたトークンが流出する可能性があります。</li>
                        <li>トークンを暗号化する暗号鍵はDBやソースコードとは分けて管理し、復号経路を最小化することで被害を軽減します。</li>
                        <li>自動取得は最小権限スコープで運用し、異常検知（急増）を実装予定です。</li>
                    </ul>
                </details>
            </div>

            {/* 同意 */}
            <div style={card}>
                <div style={{fontWeight: 700}}>同意</div>
                <label style={checkRow}>
                    <input type="checkbox" checked={consentStoreToken} onChange={(e) => {
                        setConsentStoreToken(e.target.checked)
                        if (!e.target.checked) setMode("MANUAL");
                    }
                    }
                    />
                    <span>自動取得のためにリフレッシュトークンを保存することに同意します</span>
                </label>
                <label style={checkRow}>
                    <input type="checkbox" checked={consentUnderstand} onChange={(e) => {
                        setConsentUnderstand(e.target.checked)
                        if (!e.target.checked) setMode("MANUAL");
                    }} />
                    <span>注意事項とリスクを理解しました</span>
                </label>
                <div style={{fontSize: 12, color: "#6b7280"}}>
                    ※ 自動モードの同意日時は記録されます
                </div>
            </div>

            {/* モード選択 */}
            <div style={card}>
                <div style={{fontWeight: 700}}>データ取得モード</div>

                <label style={radioRow}>
                    <input
                        type="radio"
                        name="mode"
                        value="MANUAL"
                        checked={mode === "MANUAL"}
                        onChange={() => setMode("MANUAL")}
                    />
                    <div>
                        <div style={{fontWeight: 600}}>手動（おすすめ：まずはこちら）</div>
                        <div style={desc}>ボタン押下時のみ取得。トークンはDBに保存しません（ログインセッションのみ）。</div>
                    </div>
                </label>

                <label style={{...radioRow, opacity: canSelectAuto ? 1 : 0.55}}>
                    <input
                        type="radio"
                        name="mode"
                        value="AUTO"
                        checked={mode === "AUTO"}
                        onChange={() => {
                            setMode("AUTO")
                            console.log("trow")
                        }
                        }
                        disabled={!canSelectAuto}
                    />
                    <div>
                        <div style={{fontWeight: 600}}>自動（Cron）</div>
                        <div style={desc}>
                            1日1回自動取得。リフレッシュトークンを暗号化して保存します。
                            {!canSelectAuto ? "（※ 同意チェックが必要です）" : ""}
                        </div>
                    </div>
                </label>
            </div>

            {/* 保存 */}
            <div style={{display: "flex", gap: 10, alignItems: "center"}}>
                <button onClick={onSave} disabled={saving} style={btn}>
                    {saving ? "保存中..." : "設定を保存"}
                </button>
                {msg && <span style={{fontSize: 13, color: "#374151"}}>{msg}</span>}
            </div>

            {/* 危険操作 */}
            <div style={{...card, borderColor: "#fecaca"}}>
                <div style={{fontWeight: 700, color: "#991b1b"}}>注意操作(取り消せません)</div>

                <div style={{display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8, opacity: (saving || initial.mode === "AUTO") ? 1 : 0.55}}>
                    <button onClick={onDeleteToken} disabled={saving || initial.mode == "MANUAL"} style={dangerBtn}>
                        保存済みトークンを削除
                    </button>
                    <span className="text-sm">※ トークンを削除するとMANUALに更新します。</span>

                    <button onClick={onDisconnect} disabled={saving} style={dangerBtn}>
                        アカウント削除(本アプリで保管データも削除)
                    </button>
                </div>

                <div style={{fontSize: 12, color: "#6b7280", marginTop: 8}}>

                </div>
            </div>
        </section >
    );
}

const card: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 14,
    background: "white",
};

const checkRow: React.CSSProperties = {
    display: "flex",
    gap: 10,
    alignItems: "center",
    marginTop: 8,
};

const radioRow: React.CSSProperties = {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    marginTop: 10,
};

const desc: React.CSSProperties = {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
};

const btn: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "white",
    cursor: "pointer",
};

const dangerBtn: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#991b1b",
    cursor: "pointer",
};
