/** @type {import("jest").Config} */
module.exports = {
  clearMocks: true,
  moduleNameMapper: {
    "^@assets/(.*)$": "<rootDir>/src/assets/$1",
    "^@core/(.*)$": "<rootDir>/src/core/$1",
    "^@design-system/(.*)$": "<rootDir>/src/design-system/$1",
    "^@features/(.*)$": "<rootDir>/src/feature/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
  },
  preset: "jest-expo",
  testMatch: [
    "<rootDir>/src/**/*.test.{ts,tsx}",
    "<rootDir>/tests/**/*.test.{ts,tsx}",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|uniwind|phosphor-react-native))",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
