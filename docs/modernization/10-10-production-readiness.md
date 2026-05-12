# 10/10 Production Readiness Plan

> Keep this file updated as work progresses. Mark checklist items as done as soon as they are completed, and revise milestones when decisions change.

## Current Decisions

- [x] Feature branches merge directly to `master`.
- [x] `master` is the production branch.
- [x] `gh-pages` remains the static deployment branch.
- [x] The current `develop` branch is a poorly named working branch, not the future branch policy.
- [x] Realtime Database schema stays unchanged for production.
- [x] Only UIDs listed under `profi-bike/ownerUids` are trusted production owners.
- [x] Hardened rules should allow only the 2 users currently in `ownerUids`.
- [x] Production exports may be used locally for emulator seeding and validation.
- [x] Production exports must not be committed.

## Out Of Scope

- [x] Skip Dependabot or Renovate.
- [x] Skip immediate dev-tool dependency updates unless needed by CI.
- [x] Skip broad UI, print, and accessibility expansion.
- [x] Skip broad mutation UX work.
- [x] Keep only the normalized catalog adapter and local export validation from the mutation/data-integrity track.

## Manual Prework

- [x] Download latest production Realtime Database export.
- [x] Rename latest export to local canonical file: `pricetag-generator-export.json`.
- [x] Confirm `pricetag-generator-export.json` is ignored.
- [x] Add your UID to legacy `profi-bike/owners`.
- [x] Add your UID to `profi-bike/ownerUids`.
- [x] Confirm old app login works.
- [x] Confirm `ownerUids` exists in the latest export.
- [x] Decide that only the 2 `ownerUids` users keep access after hardened rules deploy.
- [x] Refresh local emulator seed data from the latest production export.
- [ ] Keep current production rules unchanged until rules tests and cutover checks pass.
- [x] Add GitHub Actions production Firebase env vars/secrets.
- [x] Add optional Sentry secrets/vars if production observability is enabled.
- [x] Confirm GitHub Pages still serves from `gh-pages`.
- [ ] Identify a known-good rollback deployment or commit before cutover.

## Milestone 1: Branch And Repo Hygiene

- [x] Remove local redesign reference artifacts from the working tree.
- [x] Remove local v2 zip artifact from the working tree.
- [x] Ignore production export filename variants with `/pricetag-generator-export*.json`.
- [x] Update docs to state that feature branches merge directly to `master`.
- [x] Update docs to state that `master` is production and `gh-pages` is deployed static output.
- [x] Remove or rewrite stale guidance that treats `develop` as the integration branch.
- [x] Add Node runtime metadata to `package.json`.
- [x] Verify `git status --short` shows no production exports, zips, or redesign reference files as commit candidates.

## Milestone 2: Master CI And Auto Deploy

- [x] Change CI triggers from `develop` to `master`.
- [x] PR workflow runs on pull requests targeting `master`.
- [x] Deploy workflow runs on pushes to `master`.
- [x] Deploy workflow starts only after the required CI gates pass.
- [x] CI installs dependencies with `pnpm install --frozen-lockfile`.
- [x] CI typechecks with `pnpm typecheck`.
- [x] CI lints with `pnpm lint`.
- [x] CI runs unit tests with `pnpm test`.
- [x] CI runs Firebase rules tests with `pnpm test:rules`.
- [x] CI runs browser E2E tests with `pnpm test:e2e`.
- [x] CI verifies the production build with `pnpm build`.
- [x] CI checks production dependency advisories with `pnpm audit --prod`.
- [x] Deploy workflow builds the production app with GitHub repository variables/secrets.
- [x] Deploy workflow sets `VITE_SENTRY_RELEASE` from the commit SHA.
- [x] Deploy `dist/` to `gh-pages` only after gates pass.
- [x] Keep database rules deployment separate and manual.

## Milestone 3: Internal Catalog Adapter

- [x] Keep the production Realtime Database item shape unchanged.
- [x] Keep `LegacyCatalogItem` as the persisted DTO at repository and database boundaries.
- [x] Introduce an internal normalized `CatalogItem` type.
- [x] Add a mapper from `LegacyCatalogItem` to `CatalogItem`.
- [x] Add a mapper from `CatalogItem` to `LegacyCatalogItem`.
- [x] Preserve current price semantics exactly.
- [x] Do not silently convert display amounts to cents.
- [x] Move feature/domain code toward the internal `CatalogItem` shape.
- [x] Confine legacy field names to repository and adapter code.

## Milestone 4: Production Export Validation

- [x] Add `pnpm validate:prod-export`.
- [x] Treat a missing export as a skipped local check with a successful exit.
- [x] Validate the expected `profi-bike` root when an export exists.
- [x] Validate that `brands`, `items`, `owners`, and `ownerUids` have expected shapes.
- [x] Validate all item records parse as legacy catalog records.
- [x] Validate every item round-trips legacy to internal to legacy without losing data.
- [x] Validate `ownerUids` exists and contains the expected trusted owner count.
- [x] Print failing item IDs and reasons.
- [x] Keep the export local-only and uncommitted.

## Milestone 5: Rules Coverage

- [x] Owner can read and write `profi-bike/brands`.
- [x] Owner can read and write `profi-bike/items`.
- [x] Owner can read `profi-bike/owners`.
- [x] Owner can read `profi-bike/ownerUids`.
- [x] Client writes to `owners` are denied.
- [x] Client writes to `ownerUids` are denied.
- [x] Unauthenticated reads and writes are denied.
- [x] Non-owner reads and writes are denied.
- [x] Unrelated root paths are denied.
- [x] Owner batch delete succeeds.
- [x] Malformed `discountStatus` is rejected.
- [x] Malformed `discountPrice` is rejected.
- [x] Malformed `price` is rejected.
- [x] Malformed `year` is rejected.
- [x] Keep `ownerUids` as the rules source of truth.

## Milestone 6: Bundle And Observability Readiness

- [x] Split React vendor code into a separate production chunk.
- [x] Split Firebase vendor code into a separate production chunk.
- [x] Split Sentry and observability code into a separate production chunk.
- [x] Remove the Vite large chunk warning.
- [x] Keep source maps hidden and uploaded only when Sentry build secrets exist.
- [x] Tighten telemetry URL and request metadata sanitization.
- [x] Test that telemetry excludes email.
- [x] Test that telemetry excludes product names.
- [x] Test that telemetry excludes prices.
- [x] Test that telemetry excludes search text.
- [x] Test that telemetry excludes passwords.
- [x] Test that telemetry excludes item IDs.
- [x] Test that telemetry excludes catalog payloads.
- [x] Confirm telemetry remains disabled in test and emulator modes.

## Milestone 7: Production Cutover

- [x] Confirm your production Auth user and owner UID access.
- [x] Take a fresh production DB export.
- [x] Run `pnpm typecheck`.
- [x] Run `pnpm lint`.
- [x] Run `pnpm test`.
- [x] Run `pnpm test:rules`.
- [x] Run `pnpm test:e2e`.
- [x] Run `pnpm build`.
- [x] Run `pnpm audit --prod`.
- [x] Run `pnpm validate:prod-export`.
- [x] Import the latest production export into the emulator.
- [x] Smoke-test login locally.
- [x] Smoke-test catalog load and search locally.
- [x] Smoke-test temporary create and delete locally.
- [x] Smoke-test print queue and print action locally.
- [x] Confirm latest production DB export contains the intended `ownerUids` allowlist.
- [x] Manually deploy hardened Realtime Database rules.
- [x] Confirm current broad production rules are replaced.
- [x] Keep app deployment and DB rules deployment as separate actions.
- [ ] Merge feature branch to `master`.
- [ ] Verify master CI deploys to GitHub Pages.
- [ ] Smoke-test production owner login.
- [ ] Smoke-test production catalog load and search.
- [ ] Smoke-test production temporary create and delete.
- [ ] Smoke-test production print queue and print action.
- [ ] Confirm a non-owner is denied.
- [ ] Confirm observability if enabled.
- [ ] Keep rollback available until the production user confirms normal workflow.
