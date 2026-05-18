# Price Tag Generator

Small React/Firebase app for managing a bike-shop catalog and printing handlebar price tags. The product is intentionally narrow: catalog search/editing, print queue management, promotions, and reliable price-tag output.

## Stack

- React 19 and TypeScript
- Vite
- pnpm
- Firebase Auth and Realtime Database
- Firebase Emulator Suite for local development and rules tests
- Vitest, React Testing Library, and Playwright
- Firebase Analytics and Sentry for production observability

## Codebase Guide

Architecture, data, development, observability, and verification notes live in [`docs/codebase.md`](docs/codebase.md).

## Local Development

Local development uses Firebase emulators by default so it does not write to production.

Use the Docker emulator path if you do not want to install Java locally:

```bash
pnpm install
pnpm emulators:docker:build
pnpm emulators:seed
pnpm emulators:docker
```

In a second terminal:

```bash
pnpm dev
```

Open:

```text
http://localhost:5173/price-tag-generator/
```

Seeded local login:

```text
owner@example.test
password123
```

Emulator UI:

```text
http://localhost:4000
```

Native emulator path, if you have a local JDK:

```bash
pnpm emulators:seed
pnpm emulators:start
```

## Scripts

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

End-to-end tests own a separate Docker emulator instance and deterministic seed data:

```bash
pnpm test:e2e:install
pnpm test:e2e
```

Rules and repository tests use the Docker Firebase emulator by default, so they do not require Java on the host:

```bash
pnpm test:rules
```

If you have a local JDK and want to use `firebase emulators:exec` directly:

```bash
pnpm test:rules:native
```

Run `pnpm audit --prod` after dependency changes.

## Environment

Development defaults live in `.env.development`; copy `.env.example` for new environments. Production must provide real Firebase config:

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_PROJECT_ID=
VITE_USE_FIREBASE_EMULATORS=false
```

Observability is optional and disabled for emulator/test runs:

```text
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=<sentry public dsn>
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_RELEASE=<optional release name>
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE=0.05
VITE_SENTRY_REPLAY_ERROR_SAMPLE_RATE=1.0
```

Sentry source map upload is build-time only. Set these in the deploy environment, not in committed files:

```text
SENTRY_AUTH_TOKEN=<sentry auth token>
SENTRY_ORG=<sentry org slug>
SENTRY_PROJECT=<sentry project slug>
```

Telemetry uses Firebase UID only. It must not include email, product names, prices, search text, passwords, or catalog payloads. Sentry runs with `sendDefaultPii: false`; replay masks text, inputs, and media, and does not capture request or response bodies.

## Firebase

Production project:

```text
pricetag-generator
```

Realtime Database path:

```text
profi-bike/
  items/
  owners/
  ownerUids/
```

Do not commit production exports, secrets, service account keys, or local emulator state.

## Deployment

Branch policy:

- Feature branches merge directly to `master`.
- `master` is the production branch.
- `gh-pages` is the generated static deployment branch served by GitHub Pages.
- `develop` is not a long-lived integration branch for this project.

CI runs on pull requests targeting `master`. Pushes to `master` run the same quality gates and deploy `dist/` to `gh-pages` after they pass.

Build output goes to `dist/`, with manual GitHub Pages deployment available through:

```bash
pnpm deploy
```

`predeploy` runs `pnpm build`.
