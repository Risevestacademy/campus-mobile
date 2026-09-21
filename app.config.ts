import { ConfigContext, ExpoConfig } from "expo/config";

const INVALID_ORIGIN_MESSAGE =
  "API_BASE_URL must be an HTTPS origin or a Railway private HTTP origin.";

function isAllowedProtocol(url: URL): boolean {
  const isHttps = url.protocol === "https:";
  const isRailwayPrivateHttp =
    url.protocol === "http:" && url.hostname.endsWith(".railway.internal");

  return isHttps || isRailwayPrivateHttp;
}

function parseApiOrigin(value: string): URL {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(INVALID_ORIGIN_MESSAGE);
  }

  const isOrigin =
    isAllowedProtocol(url) &&
    !url.username &&
    !url.password &&
    url.pathname === "/" &&
    !url.search &&
    !url.hash;

  if (!isOrigin) {
    throw new Error(INVALID_ORIGIN_MESSAGE);
  }

  return url;
}

function readApiBaseUrl(environment = process.env): string {
  const configuredBaseUrl = environment.API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    throw new Error("API_BASE_URL is required.");
  }

  return parseApiOrigin(configuredBaseUrl).origin;
}

function loadEnv() {
  const appEnv = process.env.APP_ENV;

  if (!appEnv) {
    throw new Error("APP_ENV is required.");
  }

  if (!["development", "staging", "production"].includes(appEnv)) {
    throw new Error(
      `Invalid APP_ENV: ${appEnv}. Expected development, staging, or production.`,
    );
  }

  return {
    env: appEnv as "development" | "staging" | "production",
    apiBaseUrl: readApiBaseUrl(),
  };
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const appConfig = loadEnv();
  const suffix = appConfig.env === "production" ? "" : `.${appConfig.env}`;
  return {
    ...config,
    version: "1.0.0",
    name:
      appConfig.env === "production"
        ? "Rise Campus"
        : `Rise Campus (${appConfig.env})`,
    slug: "rise-campus",
    ios: { ...config.ios, bundleIdentifier: `com.rise.campus${suffix}` },
    android: { ...config.android, package: `com.rise.campus${suffix}` },
    extra: { ...config.extra, appConfig },
  };
};
