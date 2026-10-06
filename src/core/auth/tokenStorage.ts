import * as SecureStore from "expo-secure-store";

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string | null;
  accessExpiresAt?: string | null;
  refreshExpiresAt?: string | null;
}

const KEYS = {
  ACCESS_TOKEN: "campus_access_token",
  REFRESH_TOKEN: "campus_refresh_token",
  ACCESS_EXPIRES_AT: "campus_access_expires_at",
  REFRESH_EXPIRES_AT: "campus_refresh_expires_at",
} as const;

export async function saveAuthTokens(tokens: AuthTokens): Promise<void> {
  if (tokens.accessToken) {
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, tokens.accessToken);
  }
  if (tokens.refreshToken !== undefined) {
    if (tokens.refreshToken) {
      await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, tokens.refreshToken);
    } else {
      await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
    }
  }
  if (tokens.accessExpiresAt !== undefined) {
    if (tokens.accessExpiresAt) {
      await SecureStore.setItemAsync(
        KEYS.ACCESS_EXPIRES_AT,
        tokens.accessExpiresAt,
      );
    } else {
      await SecureStore.deleteItemAsync(KEYS.ACCESS_EXPIRES_AT);
    }
  }
  if (tokens.refreshExpiresAt !== undefined) {
    if (tokens.refreshExpiresAt) {
      await SecureStore.setItemAsync(
        KEYS.REFRESH_EXPIRES_AT,
        tokens.refreshExpiresAt,
      );
    } else {
      await SecureStore.deleteItemAsync(KEYS.REFRESH_EXPIRES_AT);
    }
  }
}

export async function getAuthTokens(): Promise<AuthTokens | null> {
  const accessToken = await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  if (!accessToken) return null;

  const refreshToken = await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  const accessExpiresAt = await SecureStore.getItemAsync(
    KEYS.ACCESS_EXPIRES_AT,
  );
  const refreshExpiresAt = await SecureStore.getItemAsync(
    KEYS.REFRESH_EXPIRES_AT,
  );

  return {
    accessToken,
    refreshToken: refreshToken ?? null,
    accessExpiresAt: accessExpiresAt ?? null,
    refreshExpiresAt: refreshExpiresAt ?? null,
  };
}

export async function clearAuthTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
    SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
    SecureStore.deleteItemAsync(KEYS.ACCESS_EXPIRES_AT),
    SecureStore.deleteItemAsync(KEYS.REFRESH_EXPIRES_AT),
  ]);
}

export async function isAccessTokenExpired(
  bufferSeconds = 30,
): Promise<boolean> {
  const expiresAt = await SecureStore.getItemAsync(KEYS.ACCESS_EXPIRES_AT);
  if (!expiresAt) return false;
  const expiryTime = new Date(expiresAt).getTime();
  if (isNaN(expiryTime)) return true;
  const nowWithBuffer = Date.now() + bufferSeconds * 1000;
  return nowWithBuffer >= expiryTime;
}

export async function isRefreshTokenExpired(): Promise<boolean> {
  const expiresAt = await SecureStore.getItemAsync(KEYS.REFRESH_EXPIRES_AT);
  if (!expiresAt) return true;
  const expiryTime = new Date(expiresAt).getTime();
  if (isNaN(expiryTime)) return true;
  return Date.now() >= expiryTime;
}
