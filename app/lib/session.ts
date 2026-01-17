// lib/session.ts
import {SessionOptions} from "iron-session";

export type SessionData = {
  tesla?: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    expires_at?: string;
    created_at?: number;
    scope?: string;
    token_type?: string;
    id_token?: string;
  };
  oauthState?: string;
  teslaSub?: string;
  pendingTeslaAutoConsent?: boolean;     // 同意済みで、これからcallbackでDB保存するフラグ
  teslaAuthFlowId?: string;              // state検証に使うランダムID
  teslaDesiredMode?: "MANUAL" | "AUTO";  // 基本 AUTO のみ使う
  pendingConsentGivenAt?: string; // ISO
  pendingConsentVersion?: string; // "v1"
  pendingTeslaMode?: "MANUAL" | "AUTO";
};

export const sessionOptions = {
  cookieName: "tesla_app_session",
  password: process.env.APP_SESSION_SECRET!,
  ttl: 60 * 60 * 24 * 45, // 45日間（リフレッシュトークンと同程度）
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 45, // 45日間
  },
} satisfies SessionOptions;
