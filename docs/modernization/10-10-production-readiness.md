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
- [ ] Add GitHub Actions production Firebase env vars/secrets.
- [ ] Add optional Sentry secrets/vars if production observability is enabled.
- [ ] Confirm GitHub Pages still serves from `gh-pages`.
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

- [ ] Change CI triggers from `develop` to `master`.
- [ ] Run PR CI against `master`.
- [ ] Run push-to-`master` CI before deployment.
- [ ] Use `pnpm install --frozen-lockfile`.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm test:rules`.
- [ ] Run `pnpm test:e2e`.
- [ ] Run `pnpm build`.
- [ ] Run `pnpm audit --prod`.
- [ ] Build production app with GitHub secrets/vars.
- [ ] Set `VITE_SENTRY_RELEASE` from the commit SHA.
- [ ] Deploy `dist/` to `gh-pages` only after gates pass.
- [ ] Keep database rules deployment separate and manual.

## Milestone 3: Internal Catalog Adapter

- [ ] Keep the production Realtime Database item shape unchanged.
- [ ] Keep `LegacyCatalogItem` as the persisted DTO at repository and database boundaries.
- [ ] Introduce an internal normalized `CatalogItem` type.
- [ ] Add a mapper from `LegacyCatalogItem` to `CatalogItem`.
- [ ] Add a mapper from `CatalogItem` to `LegacyCatalogItem`.
- [ ] Preserve current price semantics exactly.
- [ ] Do not silently convert display amounts to cents.
- [ ] Move feature/domain code toward the internal `CatalogItem` shape.
- [ ] Confine legacy field names to repository and adapter code.

## Milestone 4: Production Export Validation

- [ ] Add `pnpm validate:prod-export`.
- [ ] Treat a missing export as a skipped local check with a successful exit.
- [ ] Validate the expected `profi-bike` root when an export exists.
- [ ] Validate that `brands`, `items`, `owners`, and `ownerUids` have expected shapes.
- [ ] Validate all item records parse as legacy catalog records.
- [ ] Validate every item round-trips legacy to internal to legacy without losing data.
- [ ] Validate `ownerUids` exists and contains the expected trusted owner count.
- [ ] Print failing item IDs and reasons.
- [ ] Keep the export local-only and uncommitted.

## Milestone 5: Rules Coverage

- [ ] Owner can read and write `profi-bike/brands`.
- [ ] Owner can read and write `profi-bike/items`.
- [ ] Owner can read `profi-bike/owners`.
- [ ] Owner can read `profi-bike/ownerUids`.
- [ ] Client writes to `owners` are denied.
- [ ] Client writes to `ownerUids` are denied.
- [ ] Unauthenticated reads and writes are denied.
- [ ] Non-owner reads and writes are denied.
- [ ] Unrelated root paths are denied.
- [ ] Owner batch delete succeeds.
- [ ] Malformed `discountStatus` is rejected.
- [ ] Malformed `discountPrice` is rejected.
- [ ] Malformed `price` is rejected.
- [ ] Malformed `year` is rejected.
- [ ] Keep `ownerUids` as the rules source of truth.

## Milestone 6: Bundle And Observability Readiness

- [ ] Split React vendor code into a separate production chunk.
- [ ] Split Firebase vendor code into a separate production chunk.
- [ ] Split Sentry and observability code into a separate production chunk.
- [ ] Remove the Vite large chunk warning.
- [ ] Keep source maps hidden and uploaded only when Sentry build secrets exist.
- [ ] Tighten telemetry URL and request metadata sanitization.
- [ ] Test that telemetry excludes email.
- [ ] Test that telemetry excludes product names.
- [ ] Test that telemetry excludes prices.
- [ ] Test that telemetry excludes search text.
- [ ] Test that telemetry excludes passwords.
- [ ] Test that telemetry excludes item IDs.
- [ ] Test that telemetry excludes catalog payloads.
- [ ] Confirm telemetry remains disabled in test and emulator modes.

## Milestone 7: Production Cutover

- [ ] Confirm your production Auth user and owner UID access.
- [ ] Take a fresh production DB export.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm test:rules`.
- [ ] Run `pnpm test:e2e`.
- [ ] Run `pnpm build`.
- [ ] Run `pnpm audit --prod`.
- [ ] Run `pnpm validate:prod-export`.
- [ ] Import the latest production export into the emulator.
- [ ] Smoke-test login locally.
- [ ] Smoke-test catalog load and search locally.
- [ ] Smoke-test temporary create and delete locally.
- [ ] Smoke-test print queue and print action locally.
- [ ] Merge feature branch to `master`.
- [ ] Verify master CI deploys to GitHub Pages.
- [ ] Smoke-test production owner login.
- [ ] Smoke-test production catalog load and search.
- [ ] Smoke-test production temporary create and delete.
- [ ] Smoke-test production print queue and print action.
- [ ] Confirm a non-owner is denied.
- [ ] Confirm observability if enabled.
- [ ] Keep rollback available until the production user confirms normal workflow.
