import type { TelemetryParams, TelemetryPrimitive } from "./types";

const blockedKeyPattern = /(catalog|email|item_id|model|name|password|price|search|query)/i;

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
