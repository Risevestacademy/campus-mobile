import NitroCookies from "react-native-nitro-cookies";

const SESSION_COOKIE = "campus_session";

/** Accepts http(s) or ws(s) URLs; cookies are stored against the http origin. */
function toHttpUrl(url: string): string {
  return url.replace(/^ws(s?):\/\//, "http$1://");
}

export function getSessionCookieHeader(url: string): string | null {
  const cookie = NitroCookies.getSync(toHttpUrl(url))[SESSION_COOKIE];
  return cookie?.value ? `${SESSION_COOKIE}=${cookie.value}` : null;
}

export async function clearSessionCookie(url: string): Promise<void> {
  await NitroCookies.clearByName(toHttpUrl(url), SESSION_COOKIE);
}
