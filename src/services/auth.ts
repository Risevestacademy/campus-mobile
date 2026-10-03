import { client } from "@core/api";
import { unwrap } from "@core/api/error";
import type { paths } from "@core/api/generated/schema";
import { getAuthTokens, saveAuthTokens } from "@core/auth/tokenStorage";
import { useSessionStore } from "@store/session";
import { GoogleOneTapSignIn } from "react-native-nitro-google-signin";

type SignInWithGoogleResponse =
  paths["/v1/auth/google/token"]["post"]["responses"]["200"]["content"]["application/json"];

type GetSignedInUserResponse =
  paths["/v1/auth/me"]["get"]["responses"]["200"]["content"]["application/json"];

export class AuthService {
  static async signInWithGoogle(
    idToken: string,
  ): Promise<SignInWithGoogleResponse | undefined> {
    const data = await unwrap<SignInWithGoogleResponse>(
      client.POST("/v1/auth/google/token", { body: { idToken } }),
    );

    if (data?.accessToken) {
      await saveAuthTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        accessExpiresAt: data.expiresAt,
        refreshExpiresAt: data.refreshExpiresAt,
      });
      useSessionStore.getState().setAuthenticated();
    }

    return data;
  }

  static async getMe(): Promise<GetSignedInUserResponse | undefined> {
    return unwrap<GetSignedInUserResponse>(client.GET("/v1/auth/me"));
  }

  static async signOut(): Promise<void> {
    try {
      const tokens = await getAuthTokens();
      if (tokens?.refreshToken) {
        await client
          .POST("/v1/auth/logout", {
            body: { refreshToken: tokens.refreshToken },
          })
          .catch(() => {});
      }
    } catch (error) {
      console.error("Backend logout failed:", error);
    }

    try {
      await GoogleOneTapSignIn.signOut();
    } catch (error) {
      console.error("Google sign out failed:", error);
    }

    await useSessionStore.getState().clearSession();
  }

  static async logout(): Promise<void> {
    return AuthService.signOut();
  }
}
