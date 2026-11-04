import { GOOGLE_SIGN_IN_CONFIG } from "@core/auth/googleSignIn";
import {
  GoogleOneTapSignIn,
  isErrorWithCode,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
  statusCodes,
} from "react-native-nitro-google-signin";

/** What the API asks Google's SDK for: read-only events, plus `openid`. */
export const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "openid",
];

/**
 * Asks Google for read-only calendar access and returns the server auth code
 * for POST /v1/calendar/connect, or null when the member backs out.
 */
export async function requestCalendarAuthCode(): Promise<string | null> {
  await GoogleOneTapSignIn.checkPlayServices();

  // Adding scopes needs a Google session in the SDK, which an app restart
  // drops on iOS. Restore it quietly, picking an account only if we must.
  if (!GoogleOneTapSignIn.getCurrentUser()) {
    let response = await GoogleOneTapSignIn.signIn();
    if (isNoSavedCredentialFoundResponse(response)) {
      response = await GoogleOneTapSignIn.createAccount();
    }
    if (!isSuccessResponse(response)) return null;
  }

  // A server auth code needs offline access, for this request only.
  GoogleOneTapSignIn.configure({
    ...GOOGLE_SIGN_IN_CONFIG,
    offlineAccess: true,
  });
  try {
    const { accessToken, serverAuthCode } =
      await GoogleOneTapSignIn.requestScopes(CALENDAR_SCOPES);
    // iOS reports a cancel as a result with no tokens rather than an error.
    if (!accessToken && !serverAuthCode) return null;
    if (!serverAuthCode) {
      throw new Error("Google granted access but returned no auth code.");
    }
    return serverAuthCode;
  } catch (error) {
    if (
      isErrorWithCode(error) &&
      error.code === statusCodes.SIGN_IN_CANCELLED
    ) {
      return null;
    }
    throw error;
  } finally {
    GoogleOneTapSignIn.configure(GOOGLE_SIGN_IN_CONFIG);
  }
}
