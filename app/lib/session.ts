// lib/session.ts
import {SessionOptions} from "iron-session";

export type SessionData = {
  tesla?: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    created_at?: number; // epoch sec
    scope?: string;
    token_type?: string;
  };
  oauthState?: string;
  teslaSub?: string;
};

export const sessionOptions = {
  cookieName: "tesla_app_session",
  password: process.env.APP_SESSION_SECRET!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
} satisfies SessionOptions;
