import { useAppearanceStore } from "@store/appearance";
import * as SecureStore from "expo-secure-store";
import { Uniwind } from "uniwind";

describe("appearance store", () => {
  beforeEach(() => {
    (SecureStore as unknown as { __clearStore: () => void }).__clearStore();
    useAppearanceStore.setState({ preference: "system" });
    jest.spyOn(Uniwind, "setTheme").mockImplementation(() => {});
  });

  it("applies and persists a new preference", async () => {
    await useAppearanceStore.getState().setPreference("dark");

    expect(Uniwind.setTheme).toHaveBeenCalledWith("dark");
    expect(useAppearanceStore.getState().preference).toBe("dark");
    expect(await SecureStore.getItemAsync("appearance_preference")).toBe(
      "dark",
    );
  });

  it("restores the saved preference on hydrate", async () => {
    await SecureStore.setItemAsync("appearance_preference", "light");

    await useAppearanceStore.getState().hydrate();

    expect(Uniwind.setTheme).toHaveBeenCalledWith("light");
    expect(useAppearanceStore.getState().preference).toBe("light");
  });

  it("ignores an unknown saved value", async () => {
    await SecureStore.setItemAsync("appearance_preference", "sepia");

    await useAppearanceStore.getState().hydrate();

    expect(Uniwind.setTheme).not.toHaveBeenCalled();
    expect(useAppearanceStore.getState().preference).toBe("system");
  });
});
