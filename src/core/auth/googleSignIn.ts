import config from "@core/config";

/**
 * The app's Google Sign-In configuration. Offline access stays off here:
 * turning it on makes Android add an authorization step to every sign-in, so
 * only the calendar request enables it, for that one call.
 */
export const GOOGLE_SIGN_IN_CONFIG = {
  webClientId: config.googleWebClientId,
  iosClientId: config.googleIosClientId,
};
