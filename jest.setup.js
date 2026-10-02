// jest.setup.js
import "react-native-gesture-handler/jestSetup";

jest.mock("react-native-keyboard-controller", () =>
  require("react-native-keyboard-controller/jest"),
);

jest.mock(
  "react-native-safe-area-context",
  () => require("react-native-safe-area-context/jest/mock").default,
);

jest.mock("react-native-nitro-google-signin", () => ({
  GoogleOneTapSignIn: {
    configure: jest.fn(),
    checkPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({
      status: "success",
      data: { idToken: "mock-google-id-token" },
    }),
    createAccount: jest.fn(),
    presentExplicitSignIn: jest.fn(),
  },
  isSuccessResponse: jest.fn(
    (res) => res && (res.status === "success" || res.type === "success"),
  ),
  isNoSavedCredentialFoundResponse: jest.fn(
    (res) => res && res.status === "noSavedCredentialFound",
  ),
}));

const mockSecureStoreMap = new Map();

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(async (key, value) => {
    mockSecureStoreMap.set(key, String(value));
  }),
  getItemAsync: jest.fn(async (key) => {
    return mockSecureStoreMap.has(key) ? mockSecureStoreMap.get(key) : null;
  }),
  deleteItemAsync: jest.fn(async (key) => {
    mockSecureStoreMap.delete(key);
  }),
  __clearStore: () => mockSecureStoreMap.clear(),
}));

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        appConfig: {
          env: "development",
          apiBaseUrl: "http://localhost:3000",
          googleIosClientId: "mock-ios-client-id",
          googleWebClientId: "mock-web-client-id",
        },
      },
    },
  },
}));
