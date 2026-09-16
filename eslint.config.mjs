import path from "node:path";

import { defineConfig, globalIgnores } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";
import prettier from "eslint-config-prettier/flat";
import boundaries from "eslint-plugin-boundaries";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";

import architectureBoundaries from "./config/architecture-boundaries.json" with { type: "json" };

const sourceRoot = path.join(import.meta.dirname, "src");

export default defineConfig([
  expoConfig,
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    plugins: {
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    rules: {
      "no-console": ["error", { allow: ["error", "warn"] }],
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": "error",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          vars: "all",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["src/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              importNames: ["useEffect"],
              message:
                "Derive state, use event handlers, useSyncExternalStore, a data-fetching library, or a focused hook instead.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-floating-promises": "error",
    },
  },
  {
    files: [
      "src/app/**/*.{js,jsx,ts,tsx}",
      "src/core/**/*.{js,jsx,ts,tsx}",
      "src/design-system/**/*.{js,jsx,ts,tsx}",
      "src/features/**/*.{js,jsx,ts,tsx}",
      "src/shared/**/*.{js,jsx,ts,tsx}",
    ],
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/root-path": sourceRoot,
      "boundaries/elements": architectureBoundaries.elements,
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        architectureBoundaries.dependencyRule,
      ],
    },
  },
  prettier,
  globalIgnores([
    ".expo/**",
    "coverage/**",
    "dist/**",
    "node_modules/**",
    "test-results/**",
    "expo-env.d.ts",
    "src/uniwind-types.d.ts",
  ]),
]);
