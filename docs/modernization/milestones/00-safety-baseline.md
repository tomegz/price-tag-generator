# Milestone 0: Safety Baseline

## Objective

Capture the current production state and put guardrails in place before any production rules, data, or app migration work begins.

## Prerequisites

- Current branch is `develop`.
- Latest production Realtime Database export exists locally.
- Access to Firebase Console for `pricetag-generator`.
- Agreement on which Firebase Auth UID should be the production owner.

## Tasks

1. Confirm production users.
   - Identify brother's active Firebase Auth UID.
   - Decide whether the other existing UIDs should remain owners, become test users, or be removed later.
   - Record the decision in a local note or issue.

2. Confirm production data shape.
   - Inspect `profi-bike/brands`.
   - Inspect `profi-bike/items`.
   - Inspect `profi-bike/owners`.
   - Record counts and unusual data cases.

3. Protect local exports.
   - Keep `pricetag-generator-export.json` untracked.
   - Ensure `.gitignore` ignores the export and future emulator/export directories.
   - Do not commit production exports.

4. Snapshot current app behavior.
   - Document login flow.
   - Document search/filter behavior.
   - Document add/edit/delete item behavior.
   - Document bulk discount behavior.
   - Document print queue and print behavior.

5. Establish rollback assets.
   - Keep the current DB export available locally.
   - Confirm the current deployed app URL.
   - Confirm how to redeploy the old app if needed.

## Verification

- `git status --short` shows the export file ignored or intentionally untracked.
- Production owner UID decision is known.
- Current database object counts are recorded.
- Current user workflows are listed.

## Risks

- Mistaking an old UID for the active production user can lock out the real user later.
- Committing the production export would leak real operational data.

## Done Criteria

- The team knows what must be protected.
- The owner UID decision is explicit.
- Production export data is not tracked by git.
- There is a clear rollback reference before any production change.
