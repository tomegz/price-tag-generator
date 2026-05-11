import type { TelemetryParams, TelemetryPrimitive } from "./types";

const blockedKeyPattern =
  /(brand|catalog|email|item[-_]?id|itemId|model|name|password|price|product[-_]?id|productId|query|search)/i;
const blockedPathSegmentPattern = /(@|email|item[-_][A-Za-z0-9]|password|price|product[-_][A-Za-z0-9]|query|search)/i;

export function sanitizeTelemetryParams(params: TelemetryParams = {}): TelemetryParams {
  return Object.entries(params).reduce<TelemetryParams>((nextParams, [key, value]) => {
    if (value === undefined || blockedKeyPattern.test(key)) return nextParams;

    const cleanValue = sanitizeTelemetryValue(value);
    if (cleanValue !== undefined) nextParams[key] = cleanValue;

    return nextParams;
  }, {});
}

function sanitizeTelemetryValue(value: TelemetryPrimitive): TelemetryPrimitive | undefined {
  if (value === null || typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "string") return value.slice(0, 80);
  return undefined;
}

export function sanitizeTelemetryUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value, globalThis.location?.origin || "https://invalid.local");
    const redactedPathname = url.pathname
      .split("/")
      .map(segment => sanitizePathSegment(segment))
      .join("/");

    return `${url.origin}${redactedPathname}`;
  } catch {
    return undefined;
  }
}

function sanitizePathSegment(segment: string): string {
  const decoded = safeDecodeURIComponent(segment);
  if (!decoded) return segment;
  if (blockedPathSegmentPattern.test(decoded)) return ":redacted";
  if (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(decoded)) return ":redacted";
  if (/^[A-Za-z0-9_-]{24,}$/.test(decoded)) return ":redacted";
  return segment;
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
