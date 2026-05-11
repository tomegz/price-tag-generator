# Milestone 2: Firebase Emulator Local Development

## Status

Done in the modern app.

Manual verification completed by the user. Docker-based emulator verification also passed locally:

- Auth emulator started on `9099`.
- Realtime Database emulator started on `9000`.
- Emulator UI started on `4000`.
- `pnpm emulators:seed` prepared import data from the local export.
- Seeded login worked with `owner@example.test` / `password123`.
- Seeded owner UID could read seeded DB data under the rules.

## Objective

Make local development use Firebase emulators by default so local testing never writes to production.

## Prerequisites

- Milestone 1 rules exist in the repo or are ready to copy into `database.rules.json`.
- Local export or sanitized seed data is available.
- pnpm is accepted as the package manager for modernization.

## Tasks

1. Add Firebase project config.
   - Add `firebase.json`.
   - Configure Realtime Database emulator.
   - Configure Auth emulator.
   - Reference `database.rules.json`.

2. Add local seed strategy.
   - Create a seed fixture path that is ignored if it contains production data.
   - Prefer a sanitized seed for committed examples.
   - Keep full production export local-only.
   - Add a script or documented command to prepare emulator import data before startup.

3. Add environment split.
   - Add `.env.example` with non-secret variable names.
   - Use `VITE_USE_FIREBASE_EMULATORS=true` for local emulator mode.
   - Keep production `.env` files untracked.
   - Do not hard-code the production database URL in source code.

4. Add pnpm scripts.
   - `pnpm emulators:start`
   - `pnpm emulators:docker`
   - `pnpm emulators:docker:build`
   - `pnpm emulators:seed` or documented import command
   - `pnpm test:rules`
   - Keep scripts compatible with future CI.

5. Add rules tests.
   - Owner can read/write `items` and `brands`.
   - Non-owner authenticated user is denied.
   - Unauthenticated user is denied.
   - Owner cannot write `ownerUids`.
   - Invalid item data is denied.

6. Add prod-write guardrails.
   - Make emulator usage explicit in dev startup.
   - Fail loudly if a local dev build tries to use production config accidentally.

## Verification

- Auth and Realtime Database emulators start.
- Docker emulator path starts without requiring a host JDK.
- Seed data is prepared before emulator startup and imports into the emulator.
- Rules tests pass locally.
- Local dev config does not point at production by default.

## Rollback

- Emulator setup is additive. If blocked, leave production app untouched and continue using the old app only for production.

## Risks

- Importing full production export into tracked fixtures leaks data.
- A weak env guard can still allow accidental production writes.

## Done Criteria

- Local Firebase work runs through emulators.
- Rules are testable locally.
- Production DB is not required for local development.
