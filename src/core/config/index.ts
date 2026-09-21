import Constants from "expo-constants";

type AppConfig = {
  env: "development" | "staging" | "production";
  apiBaseUrl: string;
};

const value = Constants.expoConfig?.extra?.appConfig as AppConfig | undefined;
if (!value) throw new Error("App config missing from manifest.");

export default Object.freeze(value);
