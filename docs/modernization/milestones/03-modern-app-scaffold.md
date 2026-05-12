# Milestone 3: Modern App Scaffold

## Status

Done in the modern app.

Verification:

- `pnpm install` works.
- `pnpm typecheck` passes.
- `pnpm test` passes.
- `pnpm lint` passes with two non-blocking Fast Refresh warnings.
- `pnpm build` passes.
- `pnpm audit` reports no known vulnerabilities.
- User manually tested the local app successfully.

Implementation note: the current milestone migrated the existing app/components in place to avoid UI/UX scope creep. The feature-folder rewrite from the original plan is deferred until there is a concrete need.

## Objective

Replace the obsolete Create React App shell with a modern Vite, React, TypeScript, and pnpm foundation.

## Prerequisites

- Milestone 2 has a local emulator plan.
- Agreement that UI redesign is out of scope.
- Current `package-lock.json` state is understood and will be replaced during package-manager migration.

## Tasks

1. Introduce pnpm.
   - Add `packageManager` to `package.json`.
   - Generate `pnpm-lock.yaml`.
   - Remove `package-lock.json` once migration is complete.
   - Update docs and scripts to use `pnpm`.

2. Replace build tooling.
   - Add Vite React setup.
   - Add TypeScript strict config.
   - Add `vite.config.ts`.
   - Move HTML entry handling from CRA to Vite.
   - Remove CRA service worker unless explicitly needed later.

3. Add baseline tooling.
   - Add Vitest.
   - Add React Testing Library.
   - Add Playwright dependency/config placeholder.
   - Add ESLint and formatting setup.
   - Add typecheck script.

4. Create app shell.
   - Build a minimal `App.tsx`.
   - Keep the layout minimal and parity-focused.
   - Do not redesign screens.
   - Add feature folders: `catalog`, `printQueue`, `pricing`, `printTagRendering`.
   - Add `services/firebase`.

5. Remove obsolete dependencies.
   - Remove React 15.
   - Remove `react-scripts`.
   - Remove Firebase 4.
   - Remove `re-base`.
   - Remove old transition dependencies if no longer required.

6. Add scripts.
   - `pnpm dev`
   - `pnpm build`
   - `pnpm preview`
   - `pnpm test`
   - `pnpm typecheck`
   - `pnpm lint`

## Verification

- `pnpm install` works.
- `pnpm dev` starts the app on modern Node.
- `pnpm build` succeeds.
- `pnpm test` succeeds.
- `pnpm typecheck` succeeds.
- `pnpm lint` succeeds or has documented follow-up issues.

## Rollback

- Keep changes on a feature branch until they are ready to merge to `master`.
- If migration blocks, the production app remains deployed from the old branch/state.

## Risks

- Attempting to keep old CRA and new Vite in parallel can create confusing scripts.
- Removing the old lockfile before pnpm setup works can make dependency state harder to reproduce.

## Done Criteria

- The repo has a modern runnable shell.
- Dependency management is pnpm-only.
- The old Node 24 `http_parser` startup failure path is gone.
