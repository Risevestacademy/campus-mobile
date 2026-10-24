import * as SecureStore from "expo-secure-store";
import { Uniwind } from "uniwind";
import { create } from "zustand";

export type AppearancePreference = "system" | "light" | "dark";

const APPEARANCE_KEY = "appearance_preference";

const isPreference = (value: unknown): value is AppearancePreference =>
  value === "system" || value === "light" || value === "dark";

type AppearanceStore = {
  preference: AppearancePreference;

  hydrate: () => Promise<void>;
  setPreference: (preference: AppearancePreference) => Promise<void>;
};

export const useAppearanceStore = create<AppearanceStore>((set) => ({
  preference: "system",

  hydrate: async () => {
    try {
      const stored = await SecureStore.getItemAsync(APPEARANCE_KEY);
      if (!isPreference(stored)) return;

      Uniwind.setTheme(stored);
      set({ preference: stored });
    } catch (error) {
      console.error("Failed to hydrate appearance:", error);
    }
  },

  setPreference: async (preference) => {
    Uniwind.setTheme(preference);
    set({ preference });

    try {
      await SecureStore.setItemAsync(APPEARANCE_KEY, preference);
    } catch (error) {
      console.error("Failed to persist appearance:", error);
    }
  },
}));
