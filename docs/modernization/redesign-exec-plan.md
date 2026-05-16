# Profi Bike Redesign Execution Plan

## Goal

Implement the supplied Profi Bike redesign in the modern React/TypeScript app while preserving the existing Firebase data model, catalog behavior, print queue behavior, and print-tag rendering responsibilities.

This plan replaces the old "UI parity only" direction for the app surface. It does not replace the database hardening and production cutover work.

## Source References

- `Design system & app redesign/Design System.html`
- `Design system & app redesign/Profi Bike Redesign.html`
- `Design system & app redesign/ds-tokens.jsx`
- `Design system & app redesign/ds-components.jsx`
- `Design system & app redesign/login.jsx`
- `Design system & app redesign/layout-a.jsx`
- `Design system & app redesign/admin.jsx`
- `Design system & app redesign/bulk-promo.jsx`
- `Design system & app redesign/shared.jsx`
- `Design system & app redesign/app-shared.jsx`

The JSX files are reference mockups, not production source. Rebuild the UI natively in the app's React 19 and TypeScript codebase.

## Styling Decision

Use a local app design system built with CSS variables and plain CSS or CSS Modules.

Do not introduce Tailwind for this redesign unless the decision is revisited later. The design language is narrow and token-driven enough that a small internal design system is lower-risk than a utility framework.

Design system target:

```text
src/design-system/
  tokens.css
  base.css
  Icon.tsx
  Button.tsx
  TextField.tsx
  SearchInput.tsx
  FilterPills.tsx
  SegmentedControl.tsx
  Stepper.tsx
  PromoPrice.tsx
  Modal.tsx
  Table.tsx
```

Feature code target:

```text
src/features/
  auth/
  catalog/
  printQueue/
  bulkPromotion/
  printTagRendering/
```

Extract reusable primitives, not full product screens. Components that know about catalog items, Firebase writes, print queue semantics, or promotion rules belong in feature folders.

## Global Design Rules

- Palette is Carbon only: `#fafafa`, `#ffffff`, `#fff0ee`, `#17171a`, `#6b6b72`, `#e8e6e0`, `#ff3b30`, `#c1272d`, `#ffffff`.
- Red is signal only: promotion, destructive action, dirty commit state.
- All borders use one pixel `line`; no shadows except modal overlays.
- UI font is IBM Plex Sans.
- Numeric, price, count, table-header, SKU-like, and status-counter text uses JetBrains Mono.
- Desktop-only counter workflow. Do not spend scope on mobile layouts.
- Product data remains in the legacy Realtime Database shape.
- Print tag rendering remains a separate responsibility from app chrome.

## Milestones

| Milestone | Status | Purpose |
| --- | --- | --- |
| R0 | Done | Redesign baseline and screen inventory |
| R1 | Done | Design-system foundation |
| R2 | Done | App shell, routing mode, and auth screen |
| R3 | Done | Catalog view model and filtering |
| R4 | Done | Main find-tag-print workflow |
| R5 | Done | Catalog admin editor |
| R6 | Done | Bulk promotion wizard |
| R7 | Done | Print tag rendering integration |
| R8 | Done | Visual QA, tests, and production-readiness pass |

## Completed Implementation

Completed in the modern app.

- Added `src/design-system/` with Carbon tokens, base CSS, icons, buttons, inputs, filters, segmented controls, steppers, promo price treatment, and modal primitives.
- Added `src/features/` for auth, catalog, print queue, and bulk promotion screens.
- Rebuilt login, main find-tag-print workflow, catalog admin editor, and bulk promotion wizard against real Firebase data.
- Derived user initials from Firebase user identity.
- Built brand filters from DB brands plus catalog item names as a fallback.
- Preserved the legacy Realtime Database item shape.
- Preserved the existing `PrintTag` component and print CSS behavior for physical label output.
- Added tests for catalog view-model behavior and bulk promotion math.
- Verified the redesigned app against the Docker Firebase emulator and seeded data.

## R0: Redesign Baseline And Screen Inventory

### Objective

Turn the redesign folder into a concrete implementation checklist before changing app UI.

### Tasks

1. Open `Design System.html` and `Profi Bike Redesign.html`.
2. Identify each production screen/state:
   - Login.
   - Main find-tag-print workflow.
   - Empty print queue.
   - Populated print queue.
   - Admin catalog editor.
   - Inline edit row clean/dirty states.
   - Add product row or modal.
   - Bulk promotion step 1.
   - Bulk promotion step 2.
   - Access denied, loading, empty results, repository error states.
3. Map mockup sample fields to `LegacyCatalogItem`.
4. Decide exact status/filter semantics:
   - Search across brand and model.
   - Brand pills.
   - Promotion filter if retained from prototype shell.
   - Sort options if retained from prototype shell.
5. Capture screenshots for visual comparison if needed.

### Deliverables

- Implementation checklist in this plan or a child note.
- Confirmed scope for screens and states.

### Verification

- No code behavior changed.
- We can point each expected screen state to either a mockup reference or an explicit app-specific decision.

## R1: Design-System Foundation

### Objective

Create reusable primitives that enforce the Carbon design rules and reduce copy-pasted styling across screens.

### Tasks

1. Add design tokens:
   - Color CSS variables.
   - Font-family variables.
   - Radius variables.
   - Type scale helper classes.
   - Mono numeric helper class.
2. Add global base CSS:
   - `box-sizing`.
   - body background and font.
   - button/input font inheritance.
   - focus-visible treatment using Carbon palette.
3. Add icon system:
   - Inline SVG component.
   - Stroke-only icons.
   - Current-color styling.
   - Required icon set from the brief.
4. Add primitives:
   - `Button`.
   - `TextField`.
   - `SearchInput`.
   - `FilterPills`.
   - `SegmentedControl`.
   - `QuantityStepper`.
   - `FlowStepper`.
   - `PromoPrice`.
   - `Modal`.
   - Table/card shell components where useful.
5. Add small component tests for behavior-heavy primitives:
   - Filter pill selection.
   - Stepper increment/decrement bounds.
   - Modal close action.

### Deliverables

- `src/design-system/` folder.
- App imports tokens/base CSS once.
- No product screen rewrite yet, except harmless base style changes.

### Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- Visual spot-check of primitive states against `Design System.html`.

## R2: App Shell, Mode, And Auth Screen

### Objective

Replace the legacy header/catalog-embedded login with a proper app shell and standalone login screen.

### Tasks

1. Split auth state from catalog editing UI.
2. Show login screen when no authenticated user exists.
3. Keep existing `authService` and Firebase emulator/prod config paths.
4. Implement centered login card:
   - 420px card.
   - Profi Bike mark/wordmark.
   - `PROFI BIKE · INTERNAL` mono label.
   - Email/password fields.
   - Full-width ink submit button.
5. Add auth states:
   - Initial loading.
   - Failed login.
   - Access denied or catalog permission denied.
6. Add shell mode state:
   - Print mode.
   - Admin edit mode.
   - Bulk promotion modal open/closed.
7. Keep logout available in the shell.

### Deliverables

- `src/features/auth/LoginScreen.tsx`.
- App shell that can switch between print and admin workflows after login.

### Verification

- Component tests for login rendering and submit.
- Manual emulator login smoke test.
- No production DB config changes.

## R3: Catalog View Model And Filtering

### Objective

Create typed UI-facing catalog helpers so screens can render arrays, filters, counters, and prices consistently without duplicating logic.

### Tasks

1. Add catalog UI adapter helpers:
   - Convert `CatalogItemsById` to `CatalogProduct[]` with stable `id`.
   - Extract sorted brand list.
   - Filter by search and brand.
   - Optionally sort by brand, price, year, promotion status.
2. Add pricing display helpers:
   - `formatPLN`.
   - active promo checks.
   - effective print price.
3. Add tests for:
   - Search matching brand/model case-insensitively.
   - Brand filter composition.
   - Promo price display behavior.
   - Empty/missing catalog data.
4. Keep legacy database write shape untouched.

### Deliverables

- Feature/domain helpers for catalog screen rendering.
- Tests covering filter and mapping behavior.

### Verification

- `pnpm test`
- `pnpm typecheck`

## R4: Main Find-Tag-Print Workflow

### Objective

Implement the primary shop-counter workflow from `layout-a.jsx`: searchable product list on the left, sticky print queue on the right.

### Tasks

1. Build main print screen layout:
   - Full viewport.
   - Product list flex area.
   - Sticky/right print queue panel, 380-420px target width.
2. Build product list:
   - Sticky search and brand pills.
   - Result count.
   - Rows showing brand, model, year, price, promo price.
   - Click/add action adds item to print queue.
3. Build print queue panel:
   - Empty state: `Wybierz produkty z listy`.
   - Item rows with quantity stepper.
   - Remove item.
   - Clear queue if retained.
   - `Drukuj N etykiet` CTA.
4. Reuse existing print queue domain functions and localStorage persistence.
5. Keep app chrome hidden in print media.

### Deliverables

- `src/features/catalog/ProductList.tsx`.
- `src/features/catalog/ProductRow.tsx`.
- `src/features/printQueue/PrintQueuePanel.tsx`.
- Main screen wired to real catalog data and real print queue state.

### Verification

- Component tests:
   - Empty queue state.
   - Add product to queue.
   - Increment/decrement quantity.
   - Remove item.
   - Search and brand filters compose.
- Manual emulator smoke:
   - Login.
   - Search.
   - Add several tags.
   - Refresh and confirm queue persistence if expected.

## R5: Catalog Admin Editor

### Objective

Implement the redesigned `Edycja cennika` workflow with explicit per-row Save/Cancel commits.

### Tasks

1. Build edit-mode top bar:
   - Charcoal background.
   - Red underline.
   - `EDYCJA CENNIKA` mono label.
   - `Promocja zbiorcza` CTA.
   - `Wróć do druku` button.
2. Build title/filter area:
   - `Cennik produktów`.
   - Subtitle.
   - `Dodaj produkt` button.
   - Search input.
   - Brand pills.
   - `n/total` mono counter.
3. Build table:
   - Sticky header.
   - Columns: MARKA, MODEL, ROK, CENA, CENA PROMO, actions.
   - Read row with edit and delete actions.
   - Edit row with local draft state.
   - Dirty cell border in accent.
   - Save disabled until row differs.
   - Save writes only that row and exits edit mode.
   - Cancel discards draft.
4. Support multiple rows in edit mode at once.
5. Add product flow:
   - Reuse table-row styling.
   - Validate required fields and numeric fields.
   - Commit only on explicit save.
6. Delete product with confirmation.
7. Footer status:
   - `N wierszy w trakcie edycji · niezapisane`.
   - `Wszystkie zmiany zapisane`.
8. Keep write calls through `catalogRepository`.

### Deliverables

- `src/features/catalog/CatalogAdminScreen.tsx`.
- `src/features/catalog/InlineCatalogRow.tsx`.
- Explicit commit behavior replacing current keystroke writes.

### Verification

- Component tests:
   - Edit opens with current values.
   - Dirty state appears only after changes.
   - Save calls update once.
   - Cancel does not write.
   - Multiple rows can be dirty.
   - Add and delete call expected repository callbacks.
- Manual emulator smoke for add/edit/delete.

## R6: Bulk Promotion Wizard

### Objective

Implement the two-step bulk promotion modal with product selection, discount configuration, live preview, and explicit apply gate.

### Tasks

1. Build modal shell:
   - Max width 1080px.
   - Full viewport height.
   - Overlay shadow allowed.
   - Two-step flow indicator.
2. Step 1:
   - Search input.
   - Brand pills.
   - Scrollable selectable table.
   - Select all filtered.
   - `Wybrano: N / total` counter.
   - `Dalej (N)` disabled when N is zero.
3. Step 2:
   - Percent/amount segmented control.
   - Big mono discount value.
   - Slider.
   - Quick-pick chips.
   - Info note.
   - Scrollable preview of all selected items.
4. Discount math:
   - Percent: `round(price * (1 - pct / 100))`.
   - Amount: `max(0, price - amount)`.
   - Existing promotion is overwritten.
   - `discountStatus` becomes `on`.
5. Apply:
   - Red accent CTA.
   - Writes selected products only.
   - Closes on success.
   - Shows/save error state if any write fails.
6. Use the bulk-promotion helper as the active discount calculation path; do not keep obsolete discount helpers alive only for legacy tests.

### Deliverables

- `src/features/bulkPromotion/BulkPromotionModal.tsx`.
- New bulk-promotion calculation helper and tests if needed.
- Admin screen opens modal and applies real updates.

### Verification

- Component tests:
   - Cannot continue with zero selected.
   - Selection persists across filters.
   - Percent preview math.
   - Amount preview math.
   - Apply writes selected item updates only.
- Manual emulator smoke for applying a promotion.

## R7: Print Tag Rendering Integration

### Objective

Keep the print rendering responsibility separate while making it work from the redesigned queue.

### Tasks

1. Preserve or refactor `PrintTag` as a dedicated print-only component.
2. Keep print DOM separate from app chrome.
3. Confirm print queue expands to the expected number of rendered tags.
4. Preserve A4 print CSS unless new physical label design says otherwise.
5. Ensure the redesign UI does not leak into print media.
6. Add or update tests for:
   - queue expansion.
   - promo vs regular price rendering.
   - missing catalog item handling if relevant.

### Deliverables

- Print queue CTA calls `window.print()`.
- Hidden print area renders only tags.
- Print CSS remains isolated in `src/styles/PrintTag.css` or a dedicated feature style file.

### Verification

- `pnpm test`
- Browser print preview smoke.
- Compare with `example.pdf` until a new physical label design replaces it.

## R8: Visual QA, Tests, And Production Readiness

### Objective

Harden the redesigned app before production cutover.

### Tasks

1. Visual QA:
   - Compare login, main screen, admin, and bulk promo against mockups.
   - Verify no non-Carbon colors in app UI.
   - Verify numbers use JetBrains Mono.
   - Verify no shadows except modal overlays.
   - Verify red is only promo/destructive/dirty state.
2. Browser smoke tests:
   - Login.
   - Search/filter.
   - Add to print queue.
   - Update quantity.
   - Open admin.
   - Edit row with Save/Cancel.
   - Apply bulk promotion.
3. Automated coverage:
   - Add Playwright smoke tests if local emulator workflow is stable enough.
   - Keep unit/component tests focused on behavior, not snapshots.
4. Accessibility:
   - Keyboard focus states.
   - Labels for form controls.
   - Button accessible names.
   - Modal focus/close behavior.
5. Production-readiness review:
   - No production DB config changes hidden in UI work.
   - No untracked export data committed.
   - No mockup-only sample data in production path.
   - Build uses current Firebase env model.

### Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- Manual emulator smoke test.
- Optional browser screenshot review.
- Optional Firebase rules/repository tests if Firebase access behavior changed.

## Cutover Relationship

The redesign should complete before the production cutover milestone if the new UI is intended to be what the production user receives.

Recommended order from current state:

```text
R0 -> R1 -> R2 -> R3 -> R4 -> R5 -> R6 -> R7 -> R8 -> DB hardening/cutover work
```

If production DB hardening becomes urgent, it can still be done independently because this redesign should not require a database schema migration.

## Open Decisions

- Whether sort controls from the prototype shell are in scope for the first redesign release.
- Whether the main product row should add on row click or only through an explicit `Dodaj` button.
- Whether `Dodaj produkt` should be inline in the table or modal-based.
- Whether clear-queue needs a confirmation dialog.
- Whether physical print tag design remains old parity or gets a new design brief.

## Definition Of Done

- All four target screens render from real app data: login, main print workflow, admin editor, bulk promotion wizard.
- Design-system primitives are reused across screens.
- Catalog writes are explicit in admin edit and bulk promotion workflows.
- Existing Firebase schema and repository layer remain intact.
- Print rendering remains isolated from app chrome.
- Test, lint, typecheck, and build pass.
