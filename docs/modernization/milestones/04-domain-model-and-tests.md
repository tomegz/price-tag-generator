# Milestone 4: Domain Model And Tests

## Status

Done in the modern app.

The current milestone extracts typed and tested domain modules for Catalog, Pricing, Print Queue, Print Tag Rendering, and Storage. The existing UI remains visually unchanged, but active component and prop names now use the new domain vocabulary.

Verification:

- `pnpm typecheck` passes.
- `pnpm test` passes with domain coverage.
- `pnpm lint` passes with two existing non-blocking Fast Refresh warnings.
- `pnpm build` passes.

## Naming

Use these domain names in code and documentation:

- Catalog, not Inventory, for the persisted product/item list.
- Print Queue, not Print Order, for the user's selected tags and quantities.
- Print Tag Rendering for the CSS/layout-specific printable tag output.

## Objective

Extract core behavior into typed, tested modules before connecting the modern UI to Firebase.

## Prerequisites

- Milestone 3 app scaffold builds and tests.
- Current DB field semantics are understood.
- No production schema migration is planned in this milestone.

## Tasks

1. Define legacy data types.
   - Model current DB item fields: `name`, `model`, `price`, `discountPrice`, `discountStatus`, `year`.
   - Allow `year` as string or number while legacy data remains mixed.
   - Add runtime parsing/validation helpers where Firebase data enters the app.

2. Define domain types.
   - Define internal catalog item shape.
   - Define print queue state.
   - Define pricing input/output types.
   - Document any mapping between legacy DB fields and internal fields.

3. Extract pricing logic.
   - Port current discount calculation.
   - Decide and document rounding behavior.
   - Test percent validation.
   - Test round-down behavior.
   - Test invalid inputs.

4. Extract print queue logic.
   - Add item to print queue.
   - Increment quantity.
   - Reject invalid quantities.
   - Remove one item from print queue.
   - Clear print queue.
   - Compute total tag count.

5. Add storage safety.
   - Wrap localStorage access.
   - Validate parsed print queue data.
   - Recover from invalid/corrupt JSON.
   - Avoid throwing during app startup due to bad localStorage.

6. Extract print tag rendering logic.
   - Keep printable tag CSS/layout responsibility separate from catalog and print queue state.
   - Convert catalog items plus print queue quantities into render entries.
   - Skip missing catalog items safely.

7. Add fixtures.
   - Add small synthetic fixtures for tests.
   - Do not commit the production export.

## Verification

- Pricing tests cover current behavior.
- Print queue tests cover add/remove/clear/count behavior.
- Storage tests cover invalid localStorage data.
- Print tag rendering tests cover queue-to-render-entry expansion.
- Typecheck passes.

## Rollback

- Domain modules are additive until wired into UI.
- If a new model choice is wrong, adjust adapters before touching production data.

## Risks

- Renaming `price` to `priceCents` can be wrong if current values are display units, not cents.
- Over-normalizing data too early can hide legacy compatibility problems.

## Done Criteria

- Core behavior has test coverage independent of React and Firebase.
- The app has a clear legacy-data boundary.
