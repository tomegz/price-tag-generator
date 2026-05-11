import { describe, expect, it } from "vitest";

import {
  getProductionChunkName,
  shouldUploadSentrySourceMaps
} from "../vite.config";

describe("Vite production build config", () => {
  it("splits major production vendors into named chunks", () => {
    expect(getProductionChunkName("/project/node_modules/react/index.js")).toBe("vendor-react");
    expect(getProductionChunkName("/project/node_modules/react-dom/client.js")).toBe("vendor-react");
    expect(getProductionChunkName("/project/node_modules/firebase/app/dist/index.js")).toBe("vendor-firebase");
    expect(getProductionChunkName("/project/node_modules/@firebase/database/dist/index.js")).toBe("vendor-firebase");
    expect(getProductionChunkName("/project/node_modules/@sentry/react/build/index.js")).toBe("vendor-observability");
    expect(getProductionChunkName("/project/node_modules/.pnpm/@sentry-internal+replay@10.52.0/node_modules/@sentry-internal/replay/build/npm/index.js")).toBe("vendor-sentry-replay");
    expect(getProductionChunkName("/project/src/services/observability/browserObservability.ts")).toBe("observability");
    expect(getProductionChunkName("/project/src/services/observability/singleton.ts")).toBe("observability");
  });

  it("enables hidden source maps only when Sentry upload credentials exist", () => {
    expect(
      shouldUploadSentrySourceMaps({
        SENTRY_AUTH_TOKEN: "token",
        SENTRY_ORG: "org",
        SENTRY_PROJECT: "project"
      })
    ).toBe(true);
    expect(
      shouldUploadSentrySourceMaps({
        SENTRY_AUTH_TOKEN: "token",
        SENTRY_ORG: "org"
      })
    ).toBe(false);
  });
});
