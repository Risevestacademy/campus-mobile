import {
  CALENDAR_SCOPES,
  requestCalendarAuthCode,
} from "@features/calendar/helpers";
import {
  GoogleOneTapSignIn,
  type OneTapSuccessData,
} from "react-native-nitro-google-signin";

const google = jest.mocked(GoogleOneTapSignIn);

// Only the fields the flow reads.
const signedIn = {
  user: { email: "ada@example.com" },
} as unknown as OneTapSuccessData;

describe("requestCalendarAuthCode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    google.getCurrentUser.mockReturnValue(signedIn);
  });

  it("asks for read-only calendar access with offline access, then turns it off", async () => {
    google.requestScopes.mockResolvedValue({
      accessToken: "access",
      serverAuthCode: "code-123",
    });

    await expect(requestCalendarAuthCode()).resolves.toBe("code-123");

    expect(google.requestScopes).toHaveBeenCalledWith(CALENDAR_SCOPES);
    expect(google.configure).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ offlineAccess: true }),
    );
    expect(google.configure).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ offlineAccess: true }),
    );
  });

  it("restores the Google session first when the SDK has none", async () => {
    google.getCurrentUser.mockReturnValue(null);
    google.signIn.mockResolvedValueOnce({ type: "success", data: signedIn });
    google.requestScopes.mockResolvedValue({
      accessToken: "access",
      serverAuthCode: "code-123",
    });

    await expect(requestCalendarAuthCode()).resolves.toBe("code-123");
    expect(google.signIn).toHaveBeenCalled();
  });

  it("returns null when the member backs out on iOS", async () => {
    google.requestScopes.mockResolvedValue({
      accessToken: null,
      serverAuthCode: null,
    });

    await expect(requestCalendarAuthCode()).resolves.toBeNull();
  });

  it("returns null when the member backs out on Android, and still turns offline access off", async () => {
    google.requestScopes.mockRejectedValue({
      code: "SIGN_IN_CANCELLED",
      message: "cancelled",
    });

    await expect(requestCalendarAuthCode()).resolves.toBeNull();
    expect(google.configure).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ offlineAccess: true }),
    );
  });

  it("fails when Google grants access without an auth code", async () => {
    google.requestScopes.mockResolvedValue({
      accessToken: "access",
      serverAuthCode: null,
    });

    await expect(requestCalendarAuthCode()).rejects.toThrow("no auth code");
  });
});
