# Price Tag Generator Agent Guide

This is the Profi Bike price-tag app: a small React/Firebase tool for catalog search and editing, promotion management, print queue management, and reliable A4 price-tag printing.

Keep the product narrow. Do not expand it into a broader retail platform unless the user explicitly asks.

## Stack

- React 19
- TypeScript in strict mode
- Vite
- pnpm
- Firebase Auth and Realtime Database through the modular SDK
- Firebase Emulator Suite for local development and rules tests
- Vitest, React Testing Library, and Playwright
- Firebase Analytics and Sentry through typed service layers

## Source Standards

- All app source under `src/` is TypeScript or TSX.
- Use React function components and hooks; do not add class components.
- Use TypeScript props, state, event, and ref types instead of runtime `prop-types`.
- Keep component prop types colocated unless a type is shared across domains or services.
- Do not import Firebase, Firebase Analytics, or Sentry SDK modules directly from feature components. Use `src/services/firebase` and `src/services/observability`.
- Use domain types such as `CatalogItemInput`, `CatalogProduct`, `CatalogItemsById`, `CatalogDisplayPrice`, `CatalogYear`, `PrintQueue`, and `BulkPromotionOptions` instead of ad hoc object shapes.

## Architecture

Codebase documentation lives in `docs/codebase.md`.

Layer rules:

- `src/app/`: app shell, header/profile UI, and top-level mode composition.
- `src/design-system/`: generic tokens, base CSS, and reusable UI primitives.
- `src/features/`: screen workflows, hooks, forms, tables, modals, and user-action orchestration.
- `src/domains/`: framework-free business rules, model conversions, validation, calculations, copy helpers, and storage helpers.
- `src/services/`: Firebase and observability adapters behind typed facades.
- `src/features/printTags/`: print-tag rendering components and physical print CSS.

ESLint enforces the main layer boundaries. Do not bypass those rules with direct SDK imports or cross-layer shortcuts.

## Product Behavior

- The print workflow supports product search, brand filtering, sorting, queue quantities, clearing, and printing.
- The catalog admin supports single-row editing, adding, deleting, bulk selection, bulk promotion, and typed-confirmation bulk delete.
- User initials come from Firebase user identity.
- Brand filters are derived from catalog items. The app does not read or write a separate `brands` node.
- Catalog writes go through the repository layer and rely on realtime subscriptions to refresh catalog state.
- New catalog item IDs are generated as collision-resistant `item-<uuid>` values in `useCatalogMutations`; preserve existing IDs when reading, updating, or deleting.
- Polish product and print copy is intentional. Use helpers from `src/domains/language/` for pluralization.
- Main product rows are not clickable add targets. Keep adding explicit through the `Dodaj` button and quantity stepper.
- Keep print tag rendering separate from app chrome. The physical output uses `src/features/printTags/PrintTag.tsx` and `src/features/printTags/PrintTag.css`.

## Firebase And Data

Production Firebase project:

```text
pricetag-generator
```

Realtime Database URL:

```text
https://pricetag-generator.firebaseio.com
```

Database shape:

```text
profi-bike/
  items/
  owners/
  ownerUids/
```

Catalog items are persisted with these fields: `name`, `model`, `price`, `discountPrice`, `discountStatus`, and `year`.

Prices are display amounts in production data. Do not rewrite production data or rename price fields to cents semantics without explicit confirmation.

Do not commit or upload production exports, secrets, Firebase service account keys, Sentry credentials, or local emulator state.

## Local Development

Local development must use Firebase emulators by default. The preferred Docker path is:

```bash
pnpm emulators:docker:build
pnpm emulators:seed
pnpm emulators:docker
```

Run the app separately:

```bash
pnpm dev
```

Seeded owner login:

```text
owner@example.test
password123
```

Use `.env.example` as the environment template. Production and local Firebase configs must stay separate.

## Observability

- Keep telemetry free-tier friendly.
- Use Firebase UID only for identity across Firebase Analytics and Sentry. Do not send email.
- Do not send product names, model names, prices, search text, passwords, full catalog items, or catalog payloads.
- Keep `sendDefaultPii: false`.
- Replay masks text, inputs, and media and does not capture request or response bodies.
- Telemetry must be disabled for tests and local emulator development by default.
- Sentry source-map upload is controlled by build-time `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT`; never commit those values.

## Testing

Before handing off code changes, run:

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

Run targeted checks when relevant:

- `pnpm test:e2e` for auth, catalog admin, bulk promotion, print queue, print rendering, product discovery, or Playwright selector changes.
- `pnpm test:rules` for Firebase rules, repository behavior, rules-test config, or emulator test helpers.
- `pnpm audit --prod` after dependency changes.

## Git

The user may have uncommitted local changes. Do not revert them unless explicitly asked.

Feature branches merge directly to `master`. `master` is the production branch, and `gh-pages` is the generated GitHub Pages deployment branch.
