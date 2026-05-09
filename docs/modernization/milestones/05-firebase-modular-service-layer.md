# Milestone 5: Firebase Modular Service Layer

## Status

Done on `develop`.

The app now uses `src/services/firebase/` for Firebase config, app initialization, auth, and catalog repository access. React components do not import Firebase SDK modules directly.

Verification:

- `pnpm typecheck` passes.
- `pnpm test` passes with service-layer tests.
- `pnpm lint` passes with two existing non-blocking Fast Refresh warnings.
- `pnpm build` passes.
- `pnpm exec vitest run --config vitest.rules.config.ts` passes against the Docker Firebase emulator.
- Browser smoke against the Docker Firebase emulator passes with the seeded owner user.

## Objective

Replace direct Firebase access in components with typed services using the Firebase modular SDK.

## Prerequisites

- Milestone 2 emulator setup works.
- Milestone 4 domain types exist.
- Firebase env variables are defined in `.env.example`.

## Tasks

1. Add Firebase app initialization.
   - Read config from Vite env variables.
   - Initialize Firebase with modular SDK imports.
   - Connect to emulators when `VITE_USE_FIREBASE_EMULATORS=true`.
   - Fail clearly if required config is missing.

2. Add Auth service.
   - Expose current user state.
   - Implement email/password login.
   - Implement logout.
   - Support Auth emulator locally.
   - Avoid storing auth decisions in app-only state.

3. Add Realtime Database repository.
   - Subscribe to `profi-bike/items`.
   - Subscribe to `profi-bike/brands` if still used.
   - Create item.
   - Update item.
   - Delete item.
   - Map legacy DB records to internal types.
   - Map internal writes back to the current DB schema.

4. Add authorization handling.
   - Let Firebase rules enforce data access.
   - Use permission errors for user-facing access failure states.
   - Do not reimplement owner checks as security.

5. Add repository tests.
   - Run against emulator.
   - Verify read/write success for owner.
   - Verify denied access for non-owner.
   - Verify validation rejects malformed items.

## Verification

- Repository works against seeded emulator data.
- Firebase services are isolated from React components.
- Permission failures are handled predictably.
- Rules tests and repository tests pass.

## Rollback

- Keep old production app untouched.
- New Firebase service layer can remain unused until UI is wired.

## Risks

- Misconfigured env values can point local code at production.
- Mixing legacy schema writes with future internal fields can corrupt data if adapters are unclear.

## Done Criteria

- Modern app can authenticate and read/write emulator data through typed services.
- No React component imports Firebase SDK directly.
