# Campus by Rise Mobile

The native mobile client for Campus by Rise. The application is built with
Expo Router, React Native, TypeScript, and Uniwind.

The current repository contains the application shell and initial
infrastructure. See [the architectural plan](docs/architectural-plan.md) for
the planned product scope and dependency boundaries.

## Requirements

- Node.js 22.13 or newer
- pnpm 10.26.2
- Android Studio with an Android emulator for Android development
- Xcode with an iOS Simulator on macOS for iOS development

The supported platform baseline is documented in the
[Expo SDK 57 reference](https://docs.expo.dev/versions/v57.0.0/).

## Local setup

Enable the package manager declared by the repository:

```bash
corepack enable
```

Install dependencies:

```bash
pnpm install
```

Create the local environment file:

```bash
cp .env.example .env.local
```

Then replace `API_BASE_URL` with the HTTPS origin of the Campus API.
`APP_ENV` must be `development`, `staging`, or `production`. Local development
normally uses `development`. Local environment files are ignored by Git.

## Start the application

Build and open the native Android development application:

```bash
pnpm android
```

On macOS, the iOS application can be built and opened with:

```bash
pnpm ios
```

After the native application has been built, start the Expo development server
for later development sessions:

```bash
pnpm start
```

Web can be started with `pnpm web` for development checks but is not a planned
release target. Native development builds are the standard environment for
this application.

## Project structure

```text
src/
├── app/            Expo Router routes and application composition
├── assets/         Images, icons, and other bundled assets
├── core/           Infrastructure and external-system adapters
├── design-system/  Domain-independent UI primitives
├── features/       Product feature modules
└── shared/         Domain-independent types and utilities
```

Only directories with implemented responsibilities are committed. The complete
dependency model is described in
[docs/architectural-plan.md](docs/architectural-plan.md).

## Quality checks

Run the complete local quality gate:

```bash
pnpm check
```

`pnpm check` runs:

1. ESLint with zero warnings allowed.
2. TypeScript in strict mode without emitting files.
3. Prettier verification.
4. Jest tests serially.

Individual commands are also available:

| Command             | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `pnpm start`        | Start the Expo development server          |
| `pnpm android`      | Build and run the Android application      |
| `pnpm ios`          | Build and run the iOS application on macOS |
| `pnpm web`          | Start the development-only web target      |
| `pnpm prebuild`     | Generate native projects from Expo config  |
| `pnpm lint`         | Check source and test files with ESLint    |
| `pnpm lint:fix`     | Apply safe ESLint fixes                    |
| `pnpm typecheck`    | Run strict TypeScript validation           |
| `pnpm format`       | Format supported repository files          |
| `pnpm format:check` | Verify formatting without changing files   |
| `pnpm test`         | Run the Jest test suite                    |
| `pnpm test:watch`   | Run Jest in watch mode                     |
| `pnpm fix`          | Apply lint and formatting fixes            |
| `pnpm api:type-gen` | Generate API types from `/docs-json`       |

## Enforced code-quality practices

The repository currently enforces:

- Strict TypeScript, including rejected explicit `any` and floating promises.
- Sorted imports and exports.
- Rejection of unused imports and variables.
- Rejection of `console` calls except `console.warn` and `console.error`.
- No direct `useEffect` imports in application components.
- Architectural dependency boundaries between app, feature, core,
  design-system, and shared code.
- Prettier formatting and deterministic Tailwind/Uniwind class ordering.
- Jest and React Native Testing Library for unit and component tests.
- Staged-file linting and formatting through the pre-commit hook.
- Conventional commit messages through the commit-message hook.
- Generated API contracts using `openapi-typescript`.

Every feature and bug fix must include its tests and required eval coverage in
the same change. An eval runner is not configured yet and must be introduced
with the first change that requires one.

## Contributing

Read [CONTRIBUTIONS.md](CONTRIBUTIONS.md) before creating a branch or pull
request.

Useful references:

- [Expo SDK 57 documentation](https://docs.expo.dev/versions/v57.0.0/)
- [Expo development server guide](https://docs.expo.dev/get-started/start-developing/)
- [Project architectural plan](docs/architectural-plan.md)
