"use client";

import { useState } from "react";
import { saveTeslaConsentAndMode } from "./actions";

export default function TeslaConsentPage() {
  const [mode, setMode] = useState<"MANUAL" | "AUTO">("MANUAL");
  const [checked, setChecked] = useState(false);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #0f172a, #1e293b)",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          maxWidth: "448px",
          margin: "0 auto",
          padding: "32px 24px",
        }}
      >
        {/* ヘッダー */}
        <header style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1
            style={{ fontSize: "22px", fontWeight: "bold", color: "#ffffff" }}
          >
            利用規約
          </h1>
          <p style={{ marginTop: "8px", color: "#94a3b8", fontSize: "14px" }}>
            Tesla公式OAuthでログインし車両データを取得します。遵守していただきたい内容、禁止事項等を利用規約として、以下に定めます。
          </p>
        </header>

        <h2
          style={{
            fontWeight: 600,
            color: "#ffffff",
            fontSize: "15px",
            marginBottom: "5px",
          }}
        >
          第1条(定義・適用)
        </h2>
        <ul
          style={{
            margin: 0,
            paddingLeft: "20px",
            color: "#cbd5e1",
            fontSize: "13px",
            lineHeight: "1.8",
          }}
        >
          <li>
            利用者は、本利用規約に同意頂いた上で、本サービスを利用できるものとします。
          </li>
        </ul>

        <h2
          style={{
            fontWeight: 600,
            color: "#ffffff",
            fontSize: "15px",
            marginBottom: "5px",
          }}
        >
          第2条(情報と投稿)
        </h2>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            color: "#cbd5e1",
            fontSize: "13px",
          }}
        >
          <li>
            情報の真偽について保証するものではありません。取得した情報の表現方法・利用方法・範囲に関しては、運営が責任と権利を保有するものとします。
          </li>
        </ul>

        <h2
          style={{
            fontWeight: 600,
            color: "#ffffff",
            fontSize: "15px",
            marginBottom: "5px",
          }}
        >
          第3条(ユーザー登録)
        </h2>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            color: "#cbd5e1",
            fontSize: "13px",
          }}
        >
          <li>
            利用者は、ユーザー登録が可能です。ユーザー登録には、テスラ社が提供するアカウントが必要です。ユーザー登録の削除は、設定ページから可能です。ユーザーの重複登録は禁止です。発覚した場合やサービス運用上不適切と判断した場合は、告知なく削除する場合があります。
          </li>
        </ul>

        <h2
          style={{
            fontWeight: 600,
            color: "#ffffff",
            fontSize: "15px",
            marginBottom: "5px",
          }}
        >
          第4条(禁止事項)
        </h2>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            color: "#cbd5e1",
            fontSize: "13px",
          }}
        >
          <li>以下の行為を禁止します。</li>
          <li>法令または公序良俗に違反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>他者に対する誹謗中傷行為</li>
          <li>不正アクセス、またはこれを試みる行為</li>
          <li>運営を妨害する行為</li>
          <li>
            第三者の知的財産権，肖像権，プライバシー，名誉その他の権利または利益を侵害する行為
          </li>
          <li>特定の団体等についての宣伝行為</li>
          <li>その他，運営が不適切と判断する行為</li>
        </ul>

        <h2
          style={{
            fontWeight: 600,
            color: "#ffffff",
            fontSize: "15px",
            marginBottom: "5px",
          }}
        >
          第5条(免責事項)
        </h2>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            color: "#cbd5e1",
            fontSize: "13px",
          }}
        >
          <li>
            本サービスの利用によって発生した利用者の損害について、運営は一切の賠償責任を負えません。
          </li>
        </ul>

        <h2
          style={{
            fontWeight: 600,
            color: "#ffffff",
            fontSize: "15px",
            marginBottom: "5px",
          }}
        >
          第5条(免責事項)
        </h2>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            color: "#cbd5e1",
            fontSize: "13px",
          }}
        >
          <li>
            本サービスの利用によって発生した利用者の損害について、運営は一切の賠償責任を負えません。
          </li>
          <li>
            プログラム的欠陥等によって発生した問題や、利用者の投稿による著作権侵害などの対応について、運営は迅速な対応を努力しますが、賠償責任は負えません。
            <br />
          </li>
        </ul>

        <h2
          style={{
            fontWeight: 600,
            color: "#ffffff",
            fontSize: "15px",
            marginBottom: "5px",
          }}
        >
          第6条(サービスの停止・終了)
        </h2>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            color: "#cbd5e1",
            fontSize: "13px",
          }}
        >
          <li>
            本サービスは、運営の事情にて予告なく停止・終了する場合があります。
          </li>
        </ul>

        <h2
          style={{
            fontWeight: 600,
            color: "#ffffff",
            fontSize: "15px",
            marginBottom: "5px",
          }}
        >
          第7条(利用規約の変更)
        </h2>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            color: "#cbd5e1",
            fontSize: "13px",
          }}
        >
          <li>
            運営は，必要と判断した場合に，予告なく本規約を変更することができるものとします。
          </li>
        </ul>
        <h2
          style={{
            fontWeight: 600,
            color: "#ffffff",
            fontSize: "15px",
            marginBottom: "5px",
          }}
        >
          第8条(個人情報)
        </h2>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            color: "#cbd5e1",
            fontSize: "13px",
          }}
        >
          <li>
            個人情報に関しては「プライバシーポリシー」に従い適切に取り扱うものとします。
          </li>
        </ul>
        <h2
          style={{
            fontWeight: 600,
            color: "#ffffff",
            fontSize: "15px",
            marginBottom: "5px",
          }}
        >
          第9条(準拠法・裁判管轄)
        </h2>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            color: "#cbd5e1",
            fontSize: "13px",
          }}
        >
          <li>
            本規約の解釈にあたっては，日本法を準拠法とします。
            本サービスに関して紛争が生じた場合には，東京簡易裁判所ないし東京地方裁判所を第一審の専属管轄裁判所とします。
          </li>
        </ul>

        <br />
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1
            style={{ fontSize: "22px", fontWeight: "bold", color: "#ffffff" }}
          >
            プライバシーポリシー
          </h1>
          <p style={{ marginTop: "8px", color: "#94a3b8", fontSize: "14px" }}>
            個人情報の取り扱いについて以下に記載します。
          </p>
        </div>

        <h2
          style={{
            fontWeight: 600,
            color: "#ffffff",
            fontSize: "15px",
            marginBottom: "5px",
          }}
        >
          (1)基本方針
        </h2>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            color: "#cbd5e1",
            fontSize: "13px",
          }}
        >
          <li>個人の特定につながるような情報は、極力取得しない。</li>
          <li>個人情報と思われる投稿に関しては掲載しない。</li>
          <li>個人情報に対する問い合わせには迅速に対応する。</li>
        </ul>

        <h2
          style={{
            fontWeight: 600,
            color: "#ffffff",
            fontSize: "15px",
            marginBottom: "5px",
          }}
        >
          (2)このシステムで保存される情報
        </h2>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            color: "#cbd5e1",
            fontSize: "13px",
          }}
        >
          <li>
            ユーザー登録にて、利用者が登録する情報(テスラ社のOpenIdConnectで得られたユーザー識別ID)
          </li>
          <li>
            アクセスログとして取得できる情報（IPアドレス、リファラー、ブラウザ情報等）
          </li>
          <li>
            ログ情報は、アクセス統計解析や、不具合発生時の原因調査等に利用されます。
          </li>
          <li>
            車両からデータを取得する際に毎回ログインを避けるため、アクセストークンとリフレッシュトークンを暗号化した状態でDBに保管します。
          </li>
          <li>
            取得した車両情報はユーザーの情報が特定できない形の統計データ(平均値)などの試算に利用することがあります。
          </li>
          <li>取得するデータは以下を参照してください。</li>
        </ul>

        {/* 取得するデータ */}
        <section
          style={{
            marginTop: "16px",
            padding: "16px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h2
            style={{
              fontWeight: 600,
              color: "#ffffff",
              fontSize: "15px",
              marginBottom: "12px",
            }}
          >
            取得するデータ
          </h2>
          <ul
            style={{
              margin: 0,
              paddingLeft: "20px",
              color: "#cbd5e1",
              fontSize: "13px",
              lineHeight: "1.8",
            }}
          >
            <li>車体グレード、色、内装、タイヤ</li>
            <li>バッテリー残量（%）</li>
            <li>走行可能距離</li>
            <li>走行距離（オドメーター）</li>
            <li>車外温度・車内温度</li>
            <li>アクセストークン</li>
            <li>リフレッシュトークン</li>
          </ul>
          <p style={{ marginTop: "12px", fontSize: "12px", color: "#64748b" }}>
            取得項目は変わる可能性があります。その際はお知らせします。
          </p>
        </section>

        {/* 取得しないデータ */}
        <section
          style={{
            marginTop: "12px",
            padding: "16px",
            borderRadius: "12px",
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
          <h2
            style={{
              fontWeight: 600,
              color: "#4ade80",
              fontSize: "15px",
              marginBottom: "12px",
            }}
          >
            取得しないデータ
          </h2>
          <ul
            style={{
              margin: 0,
              paddingLeft: "20px",
              color: "#86efac",
              fontSize: "13px",
              lineHeight: "1.8",
            }}
          >
            <li>VIN(フロントガラスに載っている車両番号)</li>
            <li>位置情報（GPS）</li>
            <li>メールアドレス</li>
            <li>パスワード</li>
          </ul>
        </section>

        <h2
          style={{
            fontWeight: 600,
            color: "#ffffff",
            fontSize: "15px",
            marginBottom: "5px",
          }}
        >
          (3)cookieの利用
        </h2>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            color: "#cbd5e1",
            fontSize: "13px",
          }}
        >
          <li>以下の用途にてcookieを利用します</li>
          <li>ログイン状態の保存</li>
          <li>広告・アクセス解析ツールによる利用。</li>
        </ul>

        <h2
          style={{
            fontWeight: 600,
            color: "#ffffff",
            fontSize: "15px",
            marginBottom: "5px",
          }}
        >
          (4)個人情報の開示
        </h2>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            color: "#cbd5e1",
            fontSize: "13px",
          }}
        >
          <li>
            本人の同意がある場合、または、法令に基づき当局より開示を求められた場合に限り、個人情報を第三者に開示します。
          </li>
        </ul>

        <h2
          style={{
            fontWeight: 600,
            color: "#ffffff",
            fontSize: "15px",
            marginBottom: "5px",
          }}
        >
          (5)広告の表示
        </h2>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            color: "#cbd5e1",
            fontSize: "13px",
          }}
        >
          <li>
            Googleなどの第三者配信事業者がCookieを使用して、ユーザーがそのウェブサイトや他のウェブサイトに過去にアクセスした際の情報に基づいて広告を配信する場合があります。
          </li>
          <li>
            Googleは、広告Cookieを使用することにより、ユーザーがそのサイトや他のサイトにアクセスした際の情報に基づいて、Googleやそのパートナーが適切な広告をユーザーに表示できます。
          </li>
          <li>
            ユーザーは、Googleの広告設定にてパーソナライズ広告を無効にすることも可能です。
          </li>
        </ul>

        <h2
          style={{
            fontWeight: 600,
            color: "#ffffff",
            fontSize: "15px",
            marginBottom: "5px",
          }}
        >
          (6)プライバシーポリシーの変更
        </h2>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            color: "#cbd5e1",
            fontSize: "13px",
          }}
        >
          <li>
            プライバシーポリシーは、予告なく変更することがあります。重大な変更はサイトトップにて掲示を行います。
          </li>
        </ul>
        <h2
          style={{
            fontWeight: 600,
            color: "#ffffff",
            fontSize: "15px",
            marginBottom: "5px",
          }}
        >
          (6)プライバシーポリシーの変更
        </h2>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            color: "#cbd5e1",
            fontSize: "13px",
          }}
        >
          <li>(7)連絡先：jamcook.japan@gmail.com</li>
        </ul>

        <br />

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1
            style={{ fontSize: "22px", fontWeight: "bold", color: "#ffffff" }}
          >
            情報発信
          </h1>
          <p style={{ marginTop: "8px", color: "#94a3b8", fontSize: "14px" }}>
            不具合や取得項目追加は公式のディスコードサーバの
            <a href="https://discord.gg/8fzAtaDj">announcements</a>
            で行います。
            <br />
            URL https://discord.gg/8fzAtaDj
            <br />
            ※メールアドレスを保持していないので個別に連絡はできません。
          </p>
        </div>

        {/* 同意チェック */}
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          <input
            id="consent"
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            style={{
              marginTop: "3px",
              width: "18px",
              height: "18px",
              accentColor: "#f97316",
              cursor: "pointer",
            }}
          />
          <label
            htmlFor="consent"
            style={{
              fontSize: "14px",
              color: "#e2e8f0",
              cursor: "pointer",
            }}
          >
            上記内容を確認し、Teslaデータの取得に同意します
          </label>
        </div>

        {/* ボタン */}
        <div style={{ marginTop: "24px", display: "grid", gap: "12px" }}>
          <button
            disabled={!checked}
            onClick={async () => {
              if (!checked) return;
              await saveTeslaConsentAndMode({ mode, consentVersion: "v1" });
              window.location.href = "/api/tesla/login";
            }}
            style={{
              width: "100%",
              padding: "16px 24px",
              textAlign: "center",
              fontWeight: 600,
              fontSize: "16px",
              borderRadius: "12px",
              border: "none",
              background: checked
                ? "linear-gradient(to right, #f97316, #dc2626)"
                : "rgba(100,116,139,0.3)",
              color: checked ? "#ffffff" : "#64748b",
              cursor: checked ? "pointer" : "not-allowed",
              boxShadow: checked
                ? "0 10px 15px -3px rgba(249,115,22,0.3)"
                : "none",
              transition: "all 0.2s",
            }}
          >
            同意してTeslaにログイン
          </button>
          <a
            href="/"
            style={{
              display: "block",
              textAlign: "center",
              fontSize: "14px",
              color: "#64748b",
              textDecoration: "none",
            }}
          >
            戻る
          </a>
        </div>

        {/* フッター */}
        <footer
          style={{
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(100,116,139,0.3)",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "12px", color: "#64748b" }}>
            Marsflare は Tesla, Inc. の公式サービスではありません。
          </p>
        </footer>
      </div>
    </main>
  );
}
