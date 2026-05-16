# Codebase Guide

This repository contains the Profi Bike price-tag app. It is a narrow internal tool for catalog search and editing, promotion management, print queue management, and A4 price-tag printing.

## Stack

- React 19 with function components and hooks
- TypeScript in strict mode
- Vite
- pnpm
- Firebase Auth and Realtime Database through the modular SDK
- Firebase Emulator Suite for local development, seeded tests, and database rules checks
- Vitest, React Testing Library, and Playwright
- Firebase Analytics and Sentry behind the observability service layer

## Source Layout

```text
src/
  app/                 top-level shell, header, profile menu, and app mode types
  components/          print-tag rendering components shared by screens
  design-system/       tokens, base CSS, and generic UI primitives
  domains/             framework-free catalog, pricing, language, queue, print, and storage helpers
  features/            auth, catalog admin, product discovery, bulk promotion, and print queue UI
  services/firebase/   Firebase config, Auth service, catalog repository, and runtime singletons
  services/observability/
                       Firebase Analytics and Sentry facade
  styles/              physical print-tag CSS
  test/                shared test helpers
tests/
  e2e/                 Playwright browser workflows with deterministic emulator data
  *.rules.test.*       Realtime Database rules and repository integration tests
scripts/               emulator seeding, rules-test runner, and production export validation
```

Layer boundaries are enforced where practical in `eslint.config.js`:

- `src/domains/` stays framework-free and does not depend on app, feature, UI, or service layers.
- `src/features/` owns screen workflows, hooks, forms, tables, and modals. Feature code uses domain helpers and typed services, not Firebase or Sentry SDK imports.
- `src/services/` owns external SDK integration and translates external data shapes into app/domain types.
- `src/design-system/` stays generic and does not import app-specific domains or services.
- `src/app/` composes the app shell and mode switching. Move reusable business rules down into domains or services.

## Runtime Flow

`src/App.tsx` wires the runtime services and main hooks:

- `useAuthSession` observes Firebase Auth and exposes login/logout state.
- `useCatalog` subscribes to Realtime Database catalog items and brands through `catalogRepository`.
- `usePrintQueue` manages persisted queue state through the storage domain.
- `useCatalogMutations` writes catalog changes through the repository and lets realtime subscriptions refresh the UI.
- `useBulkPromotionActions` applies promotion updates to selected products.

The main app has two modes:

- Print workflow: search, filter, sort, queue, quantity changes, and print.
- Catalog admin: single-product editing, bulk selection, bulk promotion, and typed-confirmation deletes.

## Firebase Data

Production Firebase project:

```text
pricetag-generator
```

Realtime Database URL:

```text
https://pricetag-generator.firebaseio.com
```

Database root:

```text
profi-bike/
  brands/
  items/
  owners/
  ownerUids/
```

Database access control lives in `database.rules.json`, with rules and repository tests under `tests/`.

Catalog items are persisted with these fields:

| Field | Type |
| --- | --- |
| `name` | `string` |
| `model` | `string` |
| `price` | `number` |
| `discountPrice` | `number` |
| `discountStatus` | `"on" \| "off"` |
| `year` | `number \| string` |

The app maps that persisted shape to typed catalog items in `src/domains/catalog/catalogItem.ts`. Prices are display amounts in production data, not formally named cents fields.

Do not commit production exports, local emulator state, secrets, Firebase service accounts, or Sentry credentials.

## Local Development

Local development uses Firebase emulators, not production services. The default Docker path is:

```bash
pnpm install
pnpm emulators:docker:build
pnpm emulators:seed
pnpm emulators:docker
```

Then run the app in another terminal:

```bash
pnpm dev
```

Seeded owner login:

```text
owner@example.test
password123
```

Use `.env.example` as the environment template. Production deploys must provide real Firebase values and must set `VITE_USE_FIREBASE_EMULATORS=false`.

## Styling And Printing

The UI uses a restrained, utility-focused Profi Bike style with Carbon-inspired design-system primitives.

- Generic tokens, base rules, and primitives live in `src/design-system/`.
- Screen and workflow styling lives with the UI that owns it when styles are added or moved.
- Physical printed tag output is separate from app chrome and uses `src/components/PrintTag.tsx` plus `src/styles/PrintTag.css`.
- Print CSS must keep app UI hidden during printing and preserve the A4 output layout.

## Observability

Production observability uses Firebase Analytics for workflow events and Sentry for error tracking, tracing, source maps, and limited replay.

Privacy rules:

- Use Firebase UID only for identity. Do not send email.
- Do not send product names, model names, prices, search text, passwords, full catalog items, or catalog payloads.
- Keep `sendDefaultPii: false`.
- Replay must mask text, inputs, and media and must not capture request or response bodies.
- Telemetry is disabled for tests and local emulator development by default.

Sentry source map upload is build-time only and uses `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` from the deploy environment.

## Verification

Before handing off code changes, run:

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

Additional checks:

- Run `pnpm test:e2e` for auth, catalog admin, bulk promotion, print queue, print rendering, product discovery, or selector changes.
- Run `pnpm test:rules` for database rules, repository behavior, rules-test config, or emulator helper changes.
- Run `pnpm audit --prod` after dependency changes.
