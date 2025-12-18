"use client";

import {useState} from "react";
import {saveTeslaConsentAndMode} from "./actions";

export default function TeslaConsentPage() {
    const [mode, setMode] = useState<"MANUAL" | "AUTO">("MANUAL");
    const [checked, setChecked] = useState(false);

    return (
        <main className="mx-auto px-6 py-10">
            <p className="mt-3 text-slate-600">このサービスはTesla公式OAuthでログインし車両データを取得します。内容を確認のうえ同意してください。
            </p>

            <section className="mt-6 rounded-xl border bg-slate-50 p-4">
                <h2 className="font-semibold">取得するデータ</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    <li>バッテリー残量（%）</li>
                    <li>走行可能距離</li>
                    <li>走行距離（オドメーター）</li>
                    <li>車外温度・車内温度</li>
                    <li>オンライン / オフライン状態</li>
                </ul>
                <p className="mt-2 text-sm text-slate-600">取得項目は変わる可能性があります。その際はお知らせします。
                </p>
            </section>

            <section className="mt-4 rounded-xl border bg-white p-4">
                <h2 className="font-semibold">取得しないデータ</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    <li>VIN</li>
                    <li>位置情報（GPS）</li>
                    <li>メールアドレス</li>
                    <li>パスワード</li>
                </ul>
            </section>

            {/* AUTO/MANUAL */}
            <section className="mt-4 rounded-xl border bg-white p-4">
                <h2 className="font-semibold">通信モード</h2>
                <p className="mt-1 text-sm text-slate-600">
                    現在は手動のみ。将来的に自動取得を追加予定です。
                </p>

                <div className="mt-3 flex gap-4 text-sm">
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="mode"
                            value="MANUAL"
                            checked={mode === "MANUAL"}
                            onChange={() => setMode("MANUAL")}
                        />
                        MANUAL（手動）
                    </label>
                    {/* 
                    <label className="flex items-center gap-2 disabled:text-gray-400 ">
                        <input
                            disabled
                            className="disabled:cursor-not-allowed"
                            type="radio"
                            name="mode"
                            value="AUTO"
                        />
                        AUTO（自動）
                    </label> */}
                </div>
            </section>

            {/* 同意チェック */}
            <div className="mt-6 flex items-start gap-2">
                <input
                    id="consent"
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                />
                <label htmlFor="consent" className="text-sm text-slate-700">
                    上記内容を確認し、Teslaデータの取得に同意します
                </label>
            </div>

            {/* 保存してから /api/tesla/login へ */}
            <div className="mt-5 flex gap-3">
                <button
                    disabled={!checked}
                    className={[
                        "rounded-xl px-6 py-3 font-semibold",
                        checked ? " text-green-900 hover:bg-slate-800" : "bg-slate-1100 text-slate-500",
                    ].join(" ")}
                    onClick={async () => {
                        if (!checked) return;
                        await saveTeslaConsentAndMode({mode, consentVersion: "v1"});
                        window.location.href = "/api/tesla/login";
                    }}
                >
                    同意してTeslaにログイン
                </button>

                <a className="self-center text-sm text-slate-600 underline" href="/">
                    戻る
                </a>
            </div>
        </main>
    );
}
