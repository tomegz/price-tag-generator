# Price Tag Generator Agent Guide

## Project Summary

This is a small React/Firebase app used by one production user to manage a bike-shop catalog and print price tags. The live production app may still be the old GitHub Pages deployment, but the `develop` branch is the active modernization branch.

The modernization goal is to keep the product focused while moving it to a current, maintainable stack:

- React 19
- TypeScript in strict mode
- Vite
- pnpm
- Firebase modular SDK
- Firebase Emulator Suite for local development
- Vitest, React Testing Library, and Playwright
- Firebase Realtime Database retained for now

Current `develop` source standards:

- All app source under `src/` is TypeScript or TSX; do not add new JS/JSX files there.
- React components are function components using hooks; do not add class components.
- Runtime `prop-types` has been removed; use TypeScript props, state, event, and ref types.
- Keep component prop types colocated unless a type is shared across domains or services.

Do not expand this into a larger product unless the user explicitly asks. The core workflow is catalog search/editing, print queue management, discounts, and reliable price-tag printing.

The Profi Bike redesign has been implemented on `develop`. Preserve the Carbon design-system direction unless the user explicitly replaces it.

## Current Firebase Context

Production Firebase project: `pricetag-generator`

Current Realtime Database URL:

```text
https://pricetag-generator.firebaseio.com
```

Current database shape:

```text
profi-bike/
  brands/
  items/
  owners/
```

The exported production data is in `pricetag-generator-export.json` when present locally. It contains one store, 9 brands, 649 items, and 4 owner UIDs. Treat this as production data. Do not commit it unless the user explicitly asks.

Realtime Database is JSON, not relational tables. Keep this in mind when discussing schema changes.

## Database Strategy

Keep Realtime Database for this modernization. Do not migrate to Firestore as part of the default plan.

Reasoning:

- The data model is simple and small.
- The app already depends on realtime catalog syncing.
- The urgent problem is insecure rules and shared prod/local usage, not database capability.
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

Current production rules are insecure because every authenticated user can read and write the whole database. Fix that before or during modernization.

Rules should deny by default, then allow only known owners to access `profi-bike`.

Prefer changing `owners` from an array to a UID-keyed map:

```json
{
  "profi-bike": {
    "owners": {
      "BROTHER_UID": true
    }
  }
}
```

Target Realtime Database rules should roughly follow this shape:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "profi-bike": {
      "brands": {
        ".read": "auth != null && root.child('profi-bike/owners/' + auth.uid).val() === true",
        ".write": "auth != null && root.child('profi-bike/owners/' + auth.uid).val() === true"
      },
      "items": {
        ".read": "auth != null && root.child('profi-bike/owners/' + auth.uid).val() === true",
        ".write": "auth != null && root.child('profi-bike/owners/' + auth.uid).val() === true",
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
        ".read": "auth != null && root.child('profi-bike/owners/' + auth.uid).val() === true",
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
VITE_FIREBASE_PROJECT_ID
VITE_USE_FIREBASE_EMULATORS
```

When implementing emulator support, make it difficult to accidentally write to prod from local development.

Use pnpm for the modernized app. Pin the package manager through the `packageManager` field and commit `pnpm-lock.yaml`. Do not keep both `package-lock.json` and `pnpm-lock.yaml` after the package-manager migration is complete.

Milestones 02, 03, 04, and 05 are complete on `develop`. The redesign milestones `R0` through `R8` are also complete on `develop`. Legacy parity-only Milestones 06 and 07 are superseded by the redesign track.

## Modernization Implementation Notes

Prefer this architecture:

```text
src/
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
```

React components must not import Firebase SDK modules directly. Use `authService` for authentication and `catalogRepository` for Realtime Database access.

Feature components should consume domain/service data through typed view models. For the redesign:

- User initials are derived from the Firebase user identity.
- Brand filters are data-backed from the DB `brands` node plus item-derived fallback brands.
- Design-system primitives live in `src/design-system/`; screen/domain components live in `src/features/`.
- Keep print tag rendering separate from app chrome. The physical output still uses `PrintTag` and `PrintTag.css`.

React implementation rules:

- Use function components, `useState`, `useEffect`, `useMemo`, `useCallback`, and `useRef` as appropriate.
- Preserve existing behavior when converting legacy code; do not bundle behavior fixes into mechanical typing or component-shape migrations.
- Type DOM events explicitly when handlers are extracted, for example `ChangeEvent<HTMLInputElement | HTMLSelectElement>` and `FormEvent<HTMLFormElement>`.
- Type refs explicitly, for example `useRef<HTMLInputElement>(null)` or `useRef<HTMLDivElement>(null)`.
- Use domain types such as `LegacyCatalogItem`, `CatalogItemsById`, `PrintQueue`, and `DiscountOptions` rather than ad hoc object shapes.

Core model direction:

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

## Testing Expectations

At minimum, add tests for:

- Discount calculation
- Print Queue add/remove/clear behavior
- Catalog form validation
- Firebase rules access checks
- Print queue and print layout rendering

Rules and repository integration tests live under `tests/` and use `vitest.rules.config.ts`. With the Docker Firebase emulator running, use:

```sh
pnpm exec vitest run --config vitest.rules.config.ts
```

Use Playwright for the print workflow once the modern app runs locally.

Before handing off code changes, run:

```sh
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

Run `pnpm audit --prod` after dependency changes. Run the rules/repository test with the Docker emulator when touching Firebase rules or repository behavior.

## Known Legacy Issues

The legacy production app could not run on modern Node versions such as Node 24 because the old dependency tree used packages that referenced removed Node internals like `http_parser`.

Do not try to solve legacy dependency issues with `npm audit fix --force`. The correct fix is modernization. If the old app must be run temporarily, use an old compatible Node runtime and do not treat that as the target state.

The legacy code had known risks that have mostly been addressed on `develop`:

- React 15 and CRA 1 are obsolete.
- Firebase 4 and `re-base` should be replaced with the modular Firebase SDK.

Current known risks on `develop`:

- Production database hardening/cutover is still deferred.
- Catalog edit writes are still optimistic and should be handled as a separate behavior fix.
- UI workflow test coverage is still thin compared to domain and Firebase repository coverage.
- The print workflow will be redesigned, so do not implement legacy print parity work from Milestone 07 as written.

## Git And Data Safety

The user may have uncommitted local changes. Do not revert them unless explicitly asked.

Do not commit or upload production exports, secrets, Firebase service account keys, or local emulator state unless explicitly requested.

If creating branches for modernization, use `develop` as the integration branch unless the user requests another branch.
