import React from "react";

import { type SpaceCall, useSpaceCall } from "../hooks/useSpaceCall";

const SpaceCallContext = React.createContext<SpaceCall | undefined>(undefined);

/**
 * Holds the latest `call` and `nearby` from the world socket. Mounted at the
 * root because the server sends `call` on arrival, before the space screen
 * exists. Only credentials live here; the LiveKit connection is
 * `SpaceRoomProvider`'s.
 */
export function SpaceCallProvider({ children }: { children: React.ReactNode }) {
  const value = useSpaceCall();
  return (
    <SpaceCallContext.Provider value={value}>
      {children}
    </SpaceCallContext.Provider>
  );
}

export function useSpaceCallContext(): SpaceCall {
  const value = React.useContext(SpaceCallContext);
  if (value === undefined) {
    throw new Error(
      "useSpaceCallContext must be used inside SpaceCallProvider",
    );
  }
  return value;
}
