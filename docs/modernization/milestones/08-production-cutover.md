# Milestone 8: Production Cutover

## Objective

Deploy the modern app against the existing hardened production Realtime Database without disrupting the production user.

## Prerequisites

- Milestones 1 through 7 are complete.
- Production database rules are hardened.
- Modern app works against emulator seed data.
- Production env config is prepared but not committed.
- Rollback path to previous deployment is known.

## Tasks

1. Prepare production build config.
   - Set production Firebase env variables.
   - Ensure emulator mode is disabled.
   - Confirm app points at `pricetag-generator` production database.
   - Keep env files untracked.

2. Run full local verification.
   - `pnpm install --frozen-lockfile`
   - `pnpm typecheck`
   - `pnpm lint`
   - `pnpm test`
   - `pnpm build`
   - `pnpm test:e2e` if configured by this point

3. Dry-run with production-like data.
   - Import latest export into emulator.
   - Sign in with emulator owner account.
   - Complete login, search, edit, promotion, queue, and print workflows.

4. Deploy.
   - Deploy hosting only unless rules also changed.
   - Avoid modifying production data during deployment.
   - Record deployed version or commit.

5. Production smoke test.
   - Sign in as owner.
   - Load inventory.
   - Search.
   - Add item to queue.
   - Preview/print sample.
   - Make a minimal edit and revert it, or use a temporary item create/delete test.
   - Verify non-owner still denied.

6. Monitor.
   - Check Firebase console for database errors.
   - Ask production user to confirm normal workflow.
   - Keep rollback option open until confirmed.

## Verification

- Modern production deployment works for owner account.
- Production data remains intact.
- Non-owner access remains denied.
- Existing workflows work in production.

## Rollback

- Redeploy previous app version if production user is blocked.
- Restore prior hosting deployment if available.
- Database rules should remain hardened unless they are the direct cause of outage.

## Risks

- Production env misconfiguration can point the app at the wrong database.
- A latent schema adapter bug may appear only with full production data.

## Done Criteria

- The production user is on the modern app.
- Existing workflows are usable.
- No broad database access is restored.
