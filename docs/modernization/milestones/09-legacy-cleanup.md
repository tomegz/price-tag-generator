# Milestone 9: Legacy Cleanup

## Objective

Remove transitional code, obsolete dependencies, and temporary compatibility paths after the modern app is stable in production.

## Prerequisites

- Milestone 8 complete.
- Production user has confirmed normal operation.
- Latest production export exists before any data cleanup.

## Tasks

1. Remove obsolete app artifacts.
   - Remove old CRA files that are no longer used.
   - Remove old service worker code if not retained intentionally.
   - Remove unused legacy helpers/components.
   - Remove old CSS only after confirming no print/layout dependency remains.

2. Remove obsolete dependency artifacts.
   - Ensure `package-lock.json` is gone.
   - Ensure `pnpm-lock.yaml` is committed.
   - Ensure no React 15, CRA, Firebase 4, or `re-base` dependencies remain.
   - Run dependency audit in the pnpm-based app.

3. Clean authorization compatibility.
   - Decide whether legacy `profi-bike/owners` array can be removed.
   - Keep `ownerUids` as the rules source.
   - Do not remove legacy data until current production app no longer depends on it.

4. Optional data normalization.
   - Trim leading/trailing whitespace from brand/model fields.
   - Fix known invalid item where discount price exceeds price.
   - Standardize `year` to number if desired.
   - Document any one-time data migration script.
   - Run migration against emulator first.

5. Optional schema migration planning.
   - Decide whether to keep legacy field names permanently.
   - If moving to `brand`, `discountEnabled`, or `priceCents`, create a separate migration plan.
   - Do not combine schema migration with unrelated cleanup.

6. Final documentation update.
   - Update README with modern local setup.
   - Update AGENTS.md if decisions changed.
   - Document Firebase emulator usage.
   - Document deployment commands.

## Verification

- `pnpm install --frozen-lockfile` works.
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` pass.
- App still works against emulator seed.
- Production app still works after cleanup deploy.

## Rollback

- Revert cleanup commit if production behavior regresses.
- Restore database from export if optional data cleanup corrupts records.

## Risks

- Removing compatibility data too early can block production access.
- Data cleanup can accidentally change printed prices.

## Done Criteria

- The repo no longer carries obsolete runtime/tooling.
- Temporary compatibility paths are removed or explicitly documented.
- Future work starts from the modern architecture, not the old CRA app.
