# Domain And Feature Boundaries

## Purpose

The modern app is small, but the catalog, pricing, print queue, and observability flows now have enough moving parts that shared logic needs a stable home. Use these rules when deciding whether new code belongs in `domains/`, `features/`, `services/`, `design-system/`, or `app/`.

## Layer Rules

| Layer | Owns | May depend on | Must not depend on |
| --- | --- | --- | --- |
| `domains/` | Business rules, data parsing, calculations, stable model types, copy helpers that are not tied to a screen | Other domains | React, app shell, feature workflows, service SDK adapters, design-system components |
| `features/` | Screen workflows, hooks, view state, user actions, forms, tables, modals, feature-specific composition | Domains, services, design-system, sibling feature UI when intentionally composing a workflow | App shell, direct Firebase/Sentry SDK imports |
| `services/` | Firebase, observability, and other integration adapters behind typed facades | Domains and external SDKs needed by the service | App shell, feature UI, design-system components |
| `design-system/` | Generic visual primitives and interaction controls | React and local design-system modules | App-specific domains, features, services, app shell |
| `app/` | Top-level composition, mode routing, shell/header/profile wiring | All app layers as needed | Business logic that should be reusable below the app layer |

## Placement Heuristics

Put code in `domains/` when it can run without React, browser globals, Firebase, Sentry, or screen state. Good domain code is easy to unit test with plain inputs and outputs: price math, catalog item parsing, filtering/sorting rules, queue mutation rules, print-tag expansion, language pluralization, and stable model types.

Put code in `features/` when it coordinates user intent with UI state or services: hooks, click handlers, form drafts, selection state, dialogs, table rows, screen-specific labels, and calls to repositories or telemetry facades. If a feature helper starts being reused and does not need React or services, move it down to `domains/`.

Put code in `services/` when it talks to an external system or wraps an SDK. Firebase schema adapters, auth, repository writes, Analytics, Sentry, and telemetry facades belong here. Feature code should call the typed service facade rather than importing SDK modules.

Put code in `design-system/` only when it is reusable UI infrastructure. Do not add catalog, pricing, Firebase, observability, or print-queue knowledge to these components.

## Current Exceptions

`features/catalog/CatalogAdminScreen.tsx` composes `features/bulkPromotion/BulkPromotionModal.tsx` because the catalog admin screen owns that workflow. Keep this kind of feature-to-feature dependency explicit and UI-level. Shared calculations, copy, or data shaping from that workflow should live in `domains/`.

`domains/storage` accepts a `StorageLike` dependency so queue persistence can be tested without directly reading browser globals. Keep browser access in features or app code and pass dependencies into domain helpers.

## Enforcement

`eslint.config.js` enforces the layer boundaries that are safe for the current codebase:

- Domains cannot import React, app, design-system, feature, or service modules.
- Features cannot import the app layer or direct Firebase/Sentry SDK modules.
- Services cannot import app, design-system, or feature modules.
- Design-system modules cannot import app-specific layers.

When a lint rule blocks a change, move the shared contract to a lower layer instead of weakening the boundary locally.
