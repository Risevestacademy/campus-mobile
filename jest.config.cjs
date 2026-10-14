/** @type {import("jest").Config} */
module.exports = {
  clearMocks: true,
  moduleNameMapper: {
    "^@assets/(.*)$": "<rootDir>/src/assets/$1",
    "^@core/(.*)$": "<rootDir>/src/core/$1",
    "^@design-system/(.*)$": "<rootDir>/src/design-system/$1",
    "^@features/(.*)$": "<rootDir>/src/feature/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
    // Jest resolves the ESM "react-native" export condition, which it can't parse.
    "^lucide-react-native$":
      "<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js",
  },
  preset: "jest-expo",
  testMatch: [
    "<rootDir>/src/**/*.test.{ts,tsx}",
    "<rootDir>/tests/**/*.test.{ts,tsx}",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|uniwind|phosphor-react-native|moti))",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
