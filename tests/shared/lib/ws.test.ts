import { closeAction, withCohort } from "@shared/lib/ws";

describe("closeAction", () => {
  it.each([
    [1001, "server shutting down", "reconnect"],
    [1011, "internal_error", "reconnect"],
    [1006, "", "reconnect"],
    [1009, "", "reconnect"],
    [4000, "entered_elsewhere", "replaced"],
    [4000, "", "replaced"],
    [1008, "token_not_usable", "refresh"],
    [1008, "session_expired", "refresh"],
    [1008, "session_ended", "refresh"],
    [1008, "no_token", "signOut"],
    [1008, "session_revoked", "signOut"],
    [1008, "account_suspended", "signOut"],
    [1008, "account_gone", "signOut"],
    [1008, "wrong_scope", "stop"],
    [1008, "origin_not_allowed", "stop"],
    [1008, "no_cohort", "stop"],
    [1008, "not_a_member", "stop"],
    [1008, "rate_limited", "reconnect"],
  ])("%i %s → %s", (code, reason, action) => {
    expect(closeAction(code, reason)).toBe(action);
  });

  it("never retries a 1008 reason it does not know", () => {
    expect(closeAction(1008, "something_new")).toBe("stop");
    expect(closeAction(1008, "")).toBe("stop");
  });

  it("does not match inherited object keys as reasons", () => {
    expect(closeAction(1008, "toString")).toBe("stop");
    expect(closeAction(1008, "__proto__")).toBe("stop");
  });
});

describe("withCohort", () => {
  it("adds cohortId as a query parameter", () => {
    expect(withCohort("wss://ws.example.com", "c1")).toBe(
      "wss://ws.example.com?cohortId=c1",
    );
  });

  it("appends to an existing query", () => {
    expect(withCohort("wss://ws.example.com/?v=1", "c1")).toBe(
      "wss://ws.example.com/?v=1&cohortId=c1",
    );
  });

  it("encodes the cohort id", () => {
    expect(withCohort("wss://ws.example.com", "a b&c")).toBe(
      "wss://ws.example.com?cohortId=a%20b%26c",
    );
  });
});
