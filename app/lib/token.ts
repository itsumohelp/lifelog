import {prisma} from "@/prisma";

import {decrypt, encrypt} from "@/app/lib/crypto"; // 仮

const REFRESH_EARLY_MS = 10 * 60 * 1000;

type TeslaTokenRefreshResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string; // ローテーションされる可能性があるので optional
  token_type?: string;
  scope?: string;
};

async function refreshTeslaAccessToken(refreshToken: string, clientId: string) {
  const res = await fetch(TESLA_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: clientId,
      refresh_token: refreshToken,
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    // Tesla側のエラーをログに残せるように
    throw new Error(`Tesla token refresh failed: ${res.status} ${text}`);
  }
  return JSON.parse(text) as TeslaTokenRefreshResponse;
}
