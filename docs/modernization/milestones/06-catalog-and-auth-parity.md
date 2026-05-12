# Milestone 6: Catalog And Auth Parity

## Objective

Rebuild the existing auth and catalog workflows in the modern app without UI redesign.

## Prerequisites

- Milestone 5 service layer works against emulator.
- Domain model and print queue tests pass.
- Current workflow notes from Milestone 0 are available.

## Scope Rule

Preserve behavior and visual intent. Do not introduce a new layout, design system, navigation model, or extra product workflows in this milestone.

## Tasks

1. Rebuild login/logout.
   - Email/password login.
   - Logout.
   - Loading state while auth initializes.
   - Access-denied state for authenticated non-owner.
   - No client-side security assumptions.

2. Rebuild catalog listing.
   - Load items from repository.
   - Show item brand/name, model, year, price, discount price, discount status.
   - Preserve searchable catalog behavior.
   - Handle empty and loading states.
   - Handle permission and network errors.

3. Rebuild item form.
   - Add item.
   - Edit item.
   - Delete item with confirmation.
   - Keep current fields.
   - Validate numbers before write.
   - Keep legacy schema compatibility.

4. Rebuild bulk promotion.
   - Apply percentage discount to currently filtered items.
   - Preserve existing rounding behavior unless explicitly changed.
   - Show clear failure if invalid input is entered.

5. Add component tests.
   - Login state rendering.
   - Catalog list rendering.
   - Search behavior.
   - Add/edit/delete submission behavior with mocked repository.
   - Bulk promotion triggers expected updates.

## Verification

- Brother's main catalog workflow can be completed against emulator data.
- Component tests pass.
- No production database is required for local verification.
- No intentional UI redesign was introduced.

## Rollback

- UI wiring is isolated to the modern app.
- Old production app remains available until cutover.

## Risks

- Recreating old uncontrolled form behavior can reintroduce validation bugs.
- Adding new UI patterns can expand scope and delay cutover.

## Done Criteria

- Auth and catalog behavior reach parity with the old app against emulator data.
