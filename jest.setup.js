// jest.setup.js
import "react-native-gesture-handler/jestSetup";

jest.mock("react-native-keyboard-controller", () =>
  require("react-native-keyboard-controller/jest"),
);

jest.mock("react-native-worklets", () =>
  require("react-native-worklets/lib/module/mock"),
);

jest.mock("react-native-reanimated", () => {
  const mock = require("react-native-reanimated/lib/module/mock");
  // The mock imports these enums from reanimated itself, which resolves back
  // to this mock, so they arrive undefined. Moti and interpolate need them.
  mock.Extrapolation = {
    IDENTITY: "identity",
    CLAMP: "clamp",
    EXTEND: "extend",
  };
  mock.ReduceMotion = { System: "system", Always: "always", Never: "never" };
  return mock;
});

jest.mock("@gorhom/bottom-sheet", () => require("@gorhom/bottom-sheet/mock"));

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
    getCurrentUser: jest.fn(() => null),
    requestScopes: jest.fn(),
  },
  statusCodes: { SIGN_IN_CANCELLED: "SIGN_IN_CANCELLED" },
  isErrorWithCode: jest.fn(
    (error) =>
      typeof error?.code === "string" && typeof error?.message === "string",
  ),
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
          worldUrl: "wss://localhost:3001/socket",
          webOrigin: "https://localhost:3000",
          googleIosClientId: "mock-ios-client-id",
          googleWebClientId: "mock-web-client-id",
        },
      },
    },
  },
}));
