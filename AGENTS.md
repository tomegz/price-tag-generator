# Price Tag Generator Agent Guide

## Project Summary

This is a small React/Firebase app used by one production user to manage a bike-shop catalog and print price tags. The live production app may still be the old GitHub Pages deployment, but the current working branch contains the active modernized app.

Keep the product focused. The current stack is:

- React 19
- TypeScript in strict mode
- Vite
- pnpm
- Firebase modular SDK
- Firebase Emulator Suite for local development
- Vitest, React Testing Library, and Playwright
- Firebase Realtime Database retained for now
- Firebase Analytics and Sentry observability

Current modern app source standards:

- All app source under `src/` is TypeScript or TSX; do not add new JS/JSX files there.
- React components are function components using hooks; do not add class components.
- Runtime `prop-types` has been removed; use TypeScript props, state, event, and ref types.
- Keep component prop types colocated unless a type is shared across domains or services.
- Do not import Firebase, Firebase Analytics, or Sentry SDK modules directly from feature components. Use the service layers.

Do not expand this into a larger product unless the user explicitly asks. The core workflow is catalog search/editing, print queue management, discounts, and reliable price-tag printing.

The Profi Bike redesign has been implemented in the modern app. Preserve the Carbon design-system direction unless the user explicitly replaces it.

The current redesign includes the admin v2 flow: `Edycja` and `Edycja zbiorcza` modes live in the price editor, bulk selection happens in the table, the bulk promotion dialog is one-step configuration/preview for selected rows, bulk delete uses typed `USUŃ` confirmation, and inline single-row delete uses a quick confirm modal.

## Current Firebase Context

Production Firebase project: `pricetag-generator`

Current Realtime Database URL:

```text
https://pricetag-generator.firebaseio.com
```

Current Realtime Database shape:

```text
profi-bike/
  brands/
  items/
  owners/
  ownerUids/
```

The exported production data is in `pricetag-generator-export.json` when present locally. It contains one store, 9 brands, 652 items, and 2 owner UIDs. Treat this as production data. Do not commit it unless the user explicitly asks.

Realtime Database is JSON, not relational tables. Keep this in mind when discussing schema changes.

## Database Strategy

Keep Realtime Database for this modernization. Do not migrate to Firestore as part of the default plan.

Reasoning:

- The data model is simple and small.
- The app already depends on realtime catalog syncing.
- The main database risk is production rules/cutover verification and shared prod/local usage, not database capability.
- Migrating the database and modernizing the frontend at the same time would add risk without enough benefit.

Use this target environment model:

```text
production:
  existing Firebase project and Realtime Database
  hardened rules
  real user data only

local development:
  Firebase Emulator Suite by default
  seeded from an export fixture when needed

optional shared dev/testing:
  separate Firebase dev project only if emulator-based local work is not enough
```

## Security Direction

Rules must deny by default, then allow only known owners to access `profi-bike`. The repository rules currently use `ownerUids` as the UID-keyed authorization map and keep the legacy `owners` node read-only for authorized owners.

Realtime Database rules should follow this shape:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "profi-bike": {
      "brands": {
        ".read": "auth != null && root.child('profi-bike/ownerUids/' + auth.uid).val() === true",
        ".write": "auth != null && root.child('profi-bike/ownerUids/' + auth.uid).val() === true"
      },
      "items": {
        ".read": "auth != null && root.child('profi-bike/ownerUids/' + auth.uid).val() === true",
        ".write": "auth != null && root.child('profi-bike/ownerUids/' + auth.uid).val() === true",
        "$itemId": {
          ".validate": "newData.hasChildren(['name', 'model', 'price', 'discountPrice', 'discountStatus', 'year'])",
          "name": { ".validate": "newData.isString() && newData.val().length > 0" },
          "model": { ".validate": "newData.isString()" },
          "price": { ".validate": "newData.isNumber() && newData.val() >= 0" },
          "discountPrice": { ".validate": "newData.isNumber() && newData.val() >= 0" },
          "discountStatus": { ".validate": "newData.val() === 'on' || newData.val() === 'off'" },
          "year": { ".validate": "newData.isNumber() || newData.isString()" },
          "$other": { ".validate": false }
        }
      },
      "owners": {
        ".read": "auth != null && root.child('profi-bike/ownerUids/' + auth.uid).val() === true",
        ".write": false
      },
      "ownerUids": {
        ".read": "auth != null && root.child('profi-bike/ownerUids/' + auth.uid).val() === true",
        ".write": false
      }
    }
  }
}
```

Do not rely on client-side authorization checks. The app can use auth state for UX, but Firebase rules must be the source of truth.

## Local Development Rules

Local development must not use the production database by default.

Use the Firebase Emulator Suite for:

- Authentication
- Realtime Database
- Rules testing
- Seeded local data

The preferred local emulator path is Docker, because the Realtime Database emulator requires a current Java runtime and the user's host machine may not have one installed. Use:

```text
pnpm emulators:docker:build
pnpm emulators:seed
pnpm emulators:docker
```

Then run the app separately with:

```text
pnpm dev
```

Seeded local emulator login:

```text
owner@example.test
password123
```

The app should load Firebase config from environment variables. Production and local configs must be separate.

Expected Vite env naming:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_DATABASE_URL
VITE_FIREBASE_MEASUREMENT_ID
VITE_FIREBASE_PROJECT_ID
VITE_USE_FIREBASE_EMULATORS
VITE_FIREBASE_AUTH_EMULATOR_URL
VITE_FIREBASE_DATABASE_EMULATOR_HOST
VITE_FIREBASE_DATABASE_EMULATOR_PORT
VITE_ENABLE_ANALYTICS
VITE_SENTRY_DSN
VITE_SENTRY_ENVIRONMENT
VITE_SENTRY_RELEASE
VITE_SENTRY_TRACES_SAMPLE_RATE
VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE
VITE_SENTRY_REPLAY_ERROR_SAMPLE_RATE
```

When implementing emulator support, make it difficult to accidentally write to prod from local development.

Use pnpm for the modernized app. Pin the package manager through the `packageManager` field and commit `pnpm-lock.yaml`. Do not keep both `package-lock.json` and `pnpm-lock.yaml` after the package-manager migration is complete.

Milestones 02, 03, 04, and 05 are complete in the modern app. The redesign milestones `R0` through `R8` are complete, and the later admin v2 bulk-selection revision is implemented. Legacy parity-only Milestones 06 and 07 are superseded by the redesign track. Playwright e2e coverage and the observability service layer are now part of the modern app.

## Modernization Implementation Notes

Prefer this architecture:

```text
src/
  app/
    AppHeader.tsx
    AppShell.tsx
    ProfileMenu.tsx
  design-system/
    tokens.css
    base.css
    Icon.tsx
    Button.tsx
    ...
  features/
    auth/
    catalog/
    printQueue/
    bulkPromotion/
  domains/
    catalog/
    language/
    pricing/
    printQueue/
    printTagRendering/
    storage/
  services/
    firebase/
      app.ts
      authService.ts
      catalogRepository.ts
      config.ts
    observability/
      config.ts
      browserObservability.ts
      singleton.ts
```

React components must not import Firebase SDK modules directly. Use `authService` for authentication and `catalogRepository` for Realtime Database access. Use `src/services/observability` for Firebase Analytics and Sentry; feature code should receive or import the typed facade rather than importing SDKs.

Feature components should consume domain/service data through typed view models. For the current redesign:

- User initials are derived from the Firebase user identity.
- Brand filters are data-backed from the DB `brands` node plus item-derived fallback brands.
- The DB `brands` node is a separate legacy list. Deleting all products for a brand does not automatically delete that brand entry. If changing this behavior, decide deliberately whether filters should use product-derived brands only or also maintain/clean the DB brands list.
- Design-system primitives live in `src/design-system/`; screen/domain components live in `src/features/`.
- Keep print tag rendering separate from app chrome. The physical output still uses `PrintTag` and `PrintTag.css`.
- Print queue state is persisted through the storage domain, not directly through ad hoc localStorage calls outside the print queue hook.
- Catalog writes go through the repository layer and rely on realtime subscriptions to refresh catalog state.
- New catalog item IDs are generated as collision-resistant `item-<uuid>` values in `useCatalogMutations`; preserve existing legacy IDs when reading/updating/deleting.
- Polish copy is intentional: use `Rocznik`, `Cena katalogowa`, `Cena promocyjna`, and `etykieta/etykiety/etykiet` pluralization helpers from `src/domains/language/`.
- Main product rows are not clickable add targets. Keep adding explicit through the `Dodaj` button and quantity stepper to avoid accidental queue additions and invalid nested interactive semantics.
- `FilterPills` owns subtle left/right overflow fades for Windows discoverability while keeping thin scrollbars. Keep the fade inside the component border so the 1px border remains crisp.
- The main print screen has a narrow desktop fallback below `1200px` for Windows laptops/scaling. Keep normal desktop layout unchanged above that breakpoint and do not let responsive app chrome changes affect `@media print`.

React implementation rules:

- Use function components, `useState`, `useEffect`, `useMemo`, `useCallback`, and `useRef` as appropriate.
- Preserve existing behavior when converting legacy code; do not bundle behavior fixes into mechanical typing or component-shape migrations.
- Type DOM events explicitly when handlers are extracted, for example `ChangeEvent<HTMLInputElement | HTMLSelectElement>` and `FormEvent<HTMLFormElement>`.
- Type refs explicitly, for example `useRef<HTMLInputElement>(null)` or `useRef<HTMLDivElement>(null)`.
- Use domain types such as `LegacyCatalogItem`, `CatalogItemsById`, `PrintQueue`, and `DiscountOptions` rather than ad hoc object shapes.

Current persisted catalog data still uses the legacy database shape:

```ts
type LegacyCatalogItem = {
  name: string;
  model: string;
  price: number;
  discountPrice: number;
  discountStatus: "on" | "off";
  year: number | string;
};
```

Future normalized model direction:

```ts
type CatalogItem = {
  id: string;
  brand: string;
  model: string;
  year: number | null;
  priceCents: number;
  discountPriceCents: number | null;
  discountEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
};
```

The current production data uses fields named `name`, `model`, `price`, `discountPrice`, `discountStatus`, and `year`. During migration, either support the legacy fields explicitly or run a documented one-time data migration. Do not silently rewrite production data.

Prices in current data appear to be integer display amounts, not cents in a formally named field. Be careful when renaming to `priceCents`; confirm the intended display semantics first.

## Observability

Production observability uses Firebase Analytics for workflow events and Sentry for error tracking, tracing, source maps, and limited replay.

Rules:

- Keep telemetry free-tier friendly. Do not add paid Sentry features, BigQuery export, logs, profiling, attachments, or high replay sampling unless explicitly requested.
- Use Firebase UID only for identity across Firebase Analytics and Sentry. Do not send email.
- Do not send product names, model names, prices, search text, passwords, full catalog items, or catalog payloads to telemetry.
- Keep `sendDefaultPii: false`; replay should mask text, inputs, and media and should not capture request or response bodies.
- Telemetry must be disabled for tests and local emulator development by default.
- Sentry source-map upload is controlled by build-time `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT`; never commit those values.
- `pnpm-workspace.yaml` allows the `@sentry/cli` postinstall so source-map upload can work in environments that install dependencies from scratch.

## Testing Expectations

At minimum, add tests for:

- Discount calculation
- Print Queue add/remove/clear behavior
- Catalog form validation
- Firebase rules access checks
- Print queue and print layout rendering
- Observability event names, privacy scrubbing, UID-only identity, and disabled local/test defaults when touching telemetry

Rules and repository integration tests live under `tests/` and use `vitest.rules.config.ts`. The default rules-test script starts a Dockerized database emulator and does not require Java on the host:

```sh
pnpm test:rules
```

If you already have a local JDK and want to use Firebase CLI `emulators:exec` directly, use:

```sh
pnpm test:rules:native
```

If a compatible emulator is already running and you only need the Vitest rules suite, use:

```sh
pnpm exec vitest run --config vitest.rules.config.ts
```

Use Playwright for browser workflow coverage when changing user-facing flows.

The Playwright suite lives under `tests/e2e`, owns a separate Docker emulator lifecycle, runs Vite on port `5174`, and uses `.env.e2e`.

Install Chromium once with:

```sh
pnpm test:e2e:install
```

Run e2e tests with:

```sh
pnpm test:e2e
```

Before handing off code changes, run:

```sh
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

Run `pnpm audit --prod` after dependency changes. Run `pnpm test:e2e` when changing user workflows, print queue behavior, auth flow, catalog admin behavior, or Playwright-owned selectors. Run `pnpm test:rules` when touching Firebase rules, repository behavior, rules test config, or emulator test helpers.

## Known Legacy Issues

The legacy production app could not run on modern Node versions such as Node 24 because the old dependency tree used packages that referenced removed Node internals like `http_parser`.

Do not try to solve legacy dependency issues with `npm audit fix --force`. The correct fix is modernization. If the old app must be run temporarily, use an old compatible Node runtime and do not treat that as the target state.

The legacy code had known risks that have mostly been addressed in the modern app:

- React 15 and CRA 1 are obsolete.
- Firebase 4 and `re-base` should be replaced with the modular Firebase SDK.

Current known risks:

- Production cutover may still need verification against the live GitHub Pages/Firebase deployment.
- Production Realtime Database rules may need a deliberate deploy and owner UID data check even though the repository rules are hardened.
- Production observability requires real Firebase measurement ID, Sentry DSN, Sentry project setup, and deploy-time source-map credentials.
- UI workflow coverage exists in Playwright, but broaden it when changing core print, catalog admin, auth, or bulk promotion flows.

## Git And Data Safety

The user may have uncommitted local changes. Do not revert them unless explicitly asked.

Do not commit or upload production exports, secrets, Firebase service account keys, or local emulator state unless explicitly requested.

Feature branches should merge directly to `master`. `master` is the production branch, and `gh-pages` is the generated GitHub Pages deployment branch.
