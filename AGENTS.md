# Price Tag Generator Agent Guide

## Project Summary

This is a small React/Firebase app used by one production user to manage bike-shop inventory and print price tags. The current production app is old but live: React 15, Create React App 1, Firebase 4, Realtime Database, and `re-base`.

The modernization goal is to keep the product focused while moving it to a current, maintainable stack:

- React 19
- TypeScript in strict mode
- Vite
- pnpm
- Firebase modular SDK
- Firebase Emulator Suite for local development
- Vitest, React Testing Library, and Playwright
- Firebase Realtime Database retained for now

Do not expand this into a larger product unless the user explicitly asks. The core workflow is inventory search/editing, print queue management, discounts, and reliable price-tag printing.

UI/UX redesign is out of scope for the modernization unless the user explicitly reopens it. Preserve the existing workflows and visual intent first; only make UI changes required by the framework migration, accessibility correctness, or bug fixes.

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
- The app already depends on realtime inventory syncing.
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

Milestones 02 and 03 are complete on `develop`. The current scaffold intentionally keeps the legacy UI/component structure mostly intact and migrates it to the modern runtime instead of redesigning or reorganizing the whole app.

## Modernization Implementation Notes

Prefer this architecture:

```text
src/
  app/
  features/
    inventory/
    order/
    pricing/
    print/
  services/
    firebase/
  shared/
```

Core model direction:

```ts
type InventoryItem = {
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
- Order add/remove/clear behavior
- Inventory form validation
- Firebase rules access checks
- Print queue and print layout rendering

Use Playwright for the print workflow once the modern app runs locally.

## Known Legacy Issues

The current app cannot run on modern Node versions such as Node 24 because the old dependency tree uses packages that reference removed Node internals like `http_parser`.

Do not try to solve this with `npm audit fix --force`. The correct fix is modernization. If the old app must be run temporarily, use an old compatible Node runtime and do not treat that as the target state.

The current code has known risks:

- React 15 and CRA 1 are obsolete.
- Firebase 4 and `re-base` should be replaced with the modular Firebase SDK.
- The current auth/authorization flow is client-heavy.
- Local and production currently share the same database.
- The only test is a render smoke test.
- `AddPromotionForm` uses `this` inside a function component.
- `Inventory` reads `this.state.uid` immediately after `setState`.

## Git And Data Safety

The user may have uncommitted local changes. Do not revert them unless explicitly asked.

Do not commit or upload production exports, secrets, Firebase service account keys, or local emulator state unless explicitly requested.

If creating branches for modernization, use `develop` as the integration branch unless the user requests another branch.
