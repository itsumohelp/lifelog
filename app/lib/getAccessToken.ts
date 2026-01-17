import {prisma} from "@/prisma";
import {decrypt, encrypt} from "@/app/lib/crypto";

const TESLA_TOKEN_ENDPOINT = "https://auth.tesla.com/oauth2/v3/token";
const REFRESH_EARLY_MS = 5 * 60 * 1000;

type TeslaTokenRefreshResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string; // ローテーションされる可能性があるので optional
  token_type?: string;
  scope?: string;
};

// リフレッシュ失敗時に投げる専用エラー
export class TokenRefreshError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly requiresReauth: boolean = true
  ) {
    super(message);
    this.name = "TokenRefreshError";
  }
}

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
    // 401/403 はリフレッシュトークン無効 → 再認証必要
    if (res.status === 401 || res.status === 403) {
      throw new TokenRefreshError(
        "リフレッシュトークンが無効です。再ログインが必要です。",
        res.status,
        true
      );
    }
    throw new TokenRefreshError(
      `Tesla token refresh failed: ${res.status} ${text}`,
      res.status,
      false
    );
  }
  return JSON.parse(text) as TeslaTokenRefreshResponse;
}

export async function getAccessTokenFromDB(teslaAccountId: string): Promise<string> {
  const row = await prisma.teslaAuthToken.findUnique({
    where: {teslaAccountId},
  });

  if (!row || !row.refreshTokenEnc) {
    throw new TokenRefreshError(
      "トークンが保存されていません。再ログインが必要です。",
      401,
      true
    );
  }

  const now = Date.now();
  if (row.accessTokenEnc && row.expiresAt.getTime() - now > REFRESH_EARLY_MS) {
    return decrypt(row.accessTokenEnc);
  }

  // token almost expired, refresh it
  return await prisma.$transaction(async (tx) => {

    // ロック後に再読込（別スレッドが先に更新している可能性がある）
    const token = await prisma.teslaAuthToken.findUnique({
      where: {teslaAccountId},
      select: {accessTokenEnc: true, refreshTokenEnc: true, expiresAt: true},
    });
    if (!token) throw new Error(`TeslaAuthToken not found : ${teslaAccountId}`);

    const refreshToken = decrypt(token.refreshTokenEnc);
    const refreshed = await refreshTeslaAccessToken(refreshToken, process.env.TESLA_CLIENT_ID!);

    const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000);
    const newAccessTokenEnc = encrypt(refreshed.access_token);

    // with refresh token rotation
    const updateData: {
      accessTokenEnc: string;
      expiresAt: Date;
      refreshTokenEnc?: string;
    } = {
      accessTokenEnc: newAccessTokenEnc,
      expiresAt: newExpiresAt,
    };
    if (refreshed.refresh_token) {
      updateData.refreshTokenEnc = encrypt(refreshed.refresh_token);
    }

    await tx.teslaAuthToken.update({
      where: {teslaAccountId},
      data: updateData,
    });

    return refreshed.access_token;
  });
}
