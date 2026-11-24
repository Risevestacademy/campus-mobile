/**
 * Development only: after a failed join, asks the LiveKit server what it
 * makes of the token, and logs its answer. LiveKit's own error ("could not
 * establish signal connection") reads the same whether the server refused the
 * token or the phone never reached it; this tells them apart.
 *
 * - 200: the token is fine, so the WebSocket itself is failing on the device
 *   (network, proxy, TLS).
 * - 401/403 with a reason: the token is refused (expired, wrong key or room).
 * - A fetch error: the phone can't reach the LiveKit host at all.
 */
export async function explainJoinFailure(
  label: string,
  url: string,
  token: string,
) {
  if (!__DEV__) return;
  const validate = `${url.replace(/^ws/, "http")}/rtc/v1/validate?access_token=${encodeURIComponent(token)}`;
  try {
    const response = await fetch(validate);
    const body = await response.text();
    console.warn(
      `[${label}] LiveKit validate: ${response.status} ${body.trim() || "(empty)"}`,
    );
  } catch (error) {
    console.warn(
      `[${label}] LiveKit validate unreachable:`,
      error instanceof Error ? error.message : error,
    );
  }
}
