# Milestone 4: Domain Model And Tests

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
   - Define internal inventory item shape.
   - Define print order state.
   - Define pricing input/output types.
   - Document any mapping between legacy DB fields and internal fields.

3. Extract pricing logic.
   - Port current discount calculation.
   - Decide and document rounding behavior.
   - Test percent validation.
   - Test round-down behavior.
   - Test invalid inputs.

4. Extract order logic.
   - Add item to order.
   - Increment quantity.
   - Reject invalid quantities.
   - Remove one item from order.
   - Clear order.
   - Compute total tag count.

5. Add storage safety.
   - Wrap localStorage access.
   - Validate parsed order data.
   - Recover from invalid/corrupt JSON.
   - Avoid throwing during app startup due to bad localStorage.

6. Add fixtures.
   - Add small synthetic fixtures for tests.
   - Do not commit the production export.

## Verification

- Pricing tests cover current behavior.
- Order tests cover add/remove/clear/count behavior.
- Storage tests cover invalid localStorage data.
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
