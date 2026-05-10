# Price Tag Generator Modernization Plan

## Goal

Modernize the app without disrupting the single production user or rewriting the database unnecessarily.

The target state is a current React app that keeps the existing product behavior: manage the bike-shop catalog, apply discounts, build a print queue, and print price tags. Security and local/prod separation are part of the modernization, not a later cleanup.

## Decisions

- Keep Firebase Realtime Database for now.
- Harden the existing production database rules.
- Use Firebase Emulator Suite for local development.
- Use pnpm instead of npm.
- Rebuild on Vite, React 19, and TypeScript strict mode.
- Replace Firebase 4 and `re-base` with the Firebase modular SDK.
- UI parity-only work has been superseded by the dedicated redesign execution plan.
- Avoid any silent rewrite of production data.

## Target Stack

```text
React 19
TypeScript strict mode
Vite
pnpm
Firebase modular SDK
Firebase Emulator Suite
Vitest
React Testing Library
Playwright
ESLint and formatting
```

## Environment Model

```text
production:
  existing Firebase project: pricetag-generator
  existing Realtime Database
  hardened rules
  real brother data only

local:
  Firebase Auth emulator
  Realtime Database emulator
  seeded local fixture
  no production writes by default

optional shared dev:
  separate Firebase dev project only if emulator-only workflow is not enough
```

## Milestones

| Milestone | Status | File | Purpose |
| --- | --- | --- | --- |
| 0 | Deferred | [Safety Baseline](milestones/00-safety-baseline.md) | Catalog current state and protect prod data before changes. |
| 1 | Deferred | [Harden Production DB](milestones/01-harden-production-db.md) | Fix insecure rules while preserving current app compatibility. |
| 2 | Done | [Firebase Emulator Local Development](milestones/02-firebase-emulator-local-development.md) | Make local development emulator-first and prod-safe. |
| 3 | Done | [Modern App Scaffold](milestones/03-modern-app-scaffold.md) | Replace CRA/React 15 shell with Vite/React/TypeScript/pnpm. |
| 4 | Done | [Domain Model And Tests](milestones/04-domain-model-and-tests.md) | Extract and test catalog, pricing, print queue, print tag rendering, and storage behavior. |
| 5 | Done | [Firebase Modular Service Layer](milestones/05-firebase-modular-service-layer.md) | Isolate Firebase access behind typed services. |
| 6 | Superseded | [Catalog And Auth Parity](milestones/06-catalog-and-auth-parity.md) | Replaced by the redesign execution plan. |
| 7 | Deferred | [Print Queue And Price Tags](milestones/07-print-queue-and-price-tags.md) | Park legacy print parity work until the new print design is defined. |
| 8 | Planned | [Production Cutover](milestones/08-production-cutover.md) | Deploy the modern app safely against the hardened prod DB. |
| 9 | Planned | [Legacy Cleanup](milestones/09-legacy-cleanup.md) | Remove transitional code and obsolete tooling after cutover. |

## Redesign Track

The original parity-only UI scope is now replaced by the [Profi Bike Redesign Execution Plan](redesign-exec-plan.md), which is complete on `develop`.

Do not implement Milestone 6 or the old Milestone 7 as written if the next user-facing release is the new Profi Bike redesign. The redesign milestones `R0` through `R8` now cover the user-facing app surface, while keeping the Firebase schema, emulator workflow, service layer, and production cutover principles from this modernization plan.

## Completed Work

### Milestone 2

Completed on `develop`.

- Added Firebase emulator configuration for Auth and Realtime Database.
- Added Dockerized emulator runtime so local development does not require a host JDK.
- Added local seed generation from `pricetag-generator-export.json` or committed sample data.
- Added environment split and production-write guardrails for local Vite development.
- Added Realtime Database rules and rules-test scaffolding.
- Verified seeded emulator login and seeded Realtime Database reads manually.

### Milestone 3

Completed on `develop`.

- Replaced CRA/react-scripts with Vite.
- Migrated dependency management from npm to pnpm.
- Updated React to 19 and Firebase to the modular SDK.
- Added TypeScript checking, Vitest, React Testing Library, Playwright config, and ESLint.
- Removed `re-base`, Firebase 4, CRA service worker registration, and old transition dependency usage.
- Preserved the current UI and workflows instead of redesigning the app.

### Milestone 4

Completed on `develop`.

- Established Catalog, Pricing, Print Queue, Print Tag Rendering, and Storage as explicit domain modules.
- Renamed active UI components and props to use Catalog, Print Queue, and Print Tag vocabulary.
- Added unit tests for legacy catalog parsing/filtering, discount calculation, print queue behavior, print queue storage, and print tag render expansion.
- Kept the production Realtime Database field names unchanged.

### Milestone 5

Completed on `develop`.

- Split Firebase setup into config/app initialization, Auth service, and Catalog repository modules.
- Kept React components away from direct Firebase SDK imports.
- Removed client-side owner-list checks from the app flow; Firebase rules are the access boundary.
- Added repository/config tests for env validation, path centralization, write validation, and permission-error normalization.
- Added emulator-backed repository integration tests for owner access and non-owner denial.
- Preserved the legacy Realtime Database schema for reads and writes.

## Execution Principles

- Reduce production risk first.
- Keep the existing database until there is a clear reason to migrate.
- Test rules and data access against emulators before touching prod.
- Keep code paths explicit: legacy DB adapters are allowed, silent data rewrites are not.
- Preserve existing UI behavior before improving it.
- Prefer small, verifiable changes over a single large rewrite.
- Keep production exports, emulator state, `.env` files, and service credentials out of git.

## Definition Of Done

The modernization is complete when:

- The production database denies broad authenticated access.
- Local development runs against Firebase emulators by default.
- The app runs on a modern Node version using pnpm.
- The app is built with React 19, TypeScript, Vite, and Firebase modular SDK.
- Core catalog, pricing, print queue, Firebase rules, and print behavior have tests.
- The production user can complete the same workflows as before.
- Old CRA/React 15/Firebase 4 dependencies are gone.
