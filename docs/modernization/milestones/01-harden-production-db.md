# Milestone 1: Harden Production DB

## Objective

Fix the insecure Realtime Database rules while keeping the current production app working.

## Prerequisites

- Milestone 0 complete.
- Brother's Firebase Auth UID confirmed.
- Current app compatibility requirement accepted.
- Fresh DB export available before changing rules or owner data.

## Tasks

1. Add a UID-keyed owner map.
   - Keep the legacy `profi-bike/owners` array for current app compatibility.
   - Add `profi-bike/ownerUids`.
   - Set `ownerUids/BROTHER_UID` to `true`.
   - Add any intentionally retained owner UIDs as `true`.

2. Create `database.rules.json`.
   - Deny root reads and writes by default.
   - Allow `profi-bike/brands` reads/writes only for `ownerUids` users.
   - Allow `profi-bike/items` reads/writes only for `ownerUids` users.
   - Allow owner-only reads of legacy `owners`.
   - Deny client writes to `owners` and `ownerUids`.
   - Validate item fields: `name`, `model`, `price`, `discountPrice`, `discountStatus`, `year`.
   - Keep `year` validation compatible with current mixed string/number data.

3. Test rules before production deployment.
   - Use Firebase rules playground or emulator tests.
   - Verify owner can read/write `brands`.
   - Verify owner can read/write `items`.
   - Verify non-owner authenticated user cannot read or write.
   - Verify unauthenticated user cannot read or write.
   - Verify invalid item shape is rejected.

4. Deploy rules.
   - Deploy only database rules and owner map changes.
   - Avoid app deployment in this milestone.

5. Production smoke test.
   - Sign in as the production user.
   - Load inventory.
   - Edit a harmless item field and revert it, or create/delete a temporary item.
   - Confirm print queue still works.
   - Confirm Firebase warning is resolved or no longer reports broad authenticated access.

## Verification

- Owner account can use the existing production app.
- A non-owner authenticated account cannot read or write `profi-bike`.
- Root access is denied.
- Client cannot write owner lists.
- Firebase no longer warns that any authenticated user can read/write the database.

## Rollback

- Restore previous rules if the production app is blocked.
- Restore owner data from export if owner map changes are wrong.

## Risks

- Current app reads `owners.includes(user)`, so removing the legacy array too early breaks authorization.
- Rules validation that is stricter than existing data can block legitimate edits.

## Done Criteria

- Production app still works for the intended user.
- Broad authenticated access is removed.
- Rules are stored in the repo for later emulator testing.
