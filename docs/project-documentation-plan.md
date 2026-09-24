# Project Documentation Plan

## Goal

Make the repository startup and quality workflow discoverable without requiring
contributors to inspect configuration files.

## Current problems

- The README contains generic Expo starter instructions.
- The documented package manager does not match the pinned pnpm version.
- The README says quality tooling still needs to be configured even though the
  repository already configures it.
- The documented reset script points to a file that does not exist.
- Contributor documentation does not state the local quality gate.
- Required application environment variables have no committed template or
  setup instructions.

## Changes

1. Replace the starter README with project-specific requirements, startup
   commands, structure, and quality practices.
2. Document the contributor setup and mandatory local checks.
3. Remove the dangling reset script.
4. Correct the favicon and splash-image paths.
5. Add a safe environment template documenting the required variables.

## Measurable outcome

A new contributor can use the README to:

1. Install dependencies with the repository's pinned package manager.
2. start the Expo development server;
3. open the application on at least one supported local target; and
4. run every implemented quality gate.

## Verification

Run:

```bash
cp .env.example .env.local
# Replace API_BASE_URL with the Campus API origin.
pnpm format:check
pnpm check
pnpm android
```

Confirm that the Expo development server starts and that the application opens
on at least one supported target.

No automated test or eval is added because this change does not alter
application behavior. The existing deterministic quality gate validates the
configuration and documentation formatting.
