import { access, readFile } from 'node:fs/promises';

const exportPath = process.env.PROD_EXPORT_FILE || 'pricetag-generator-export.json';
const expectedOwnerUidCount = Number(process.env.PROD_EXPORT_EXPECTED_OWNER_UID_COUNT || 2);

if (!Number.isInteger(expectedOwnerUidCount) || expectedOwnerUidCount < 1) {
  throw new Error('PROD_EXPORT_EXPECTED_OWNER_UID_COUNT must be a positive integer.');
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJson(text) {
  try {
    return { value: JSON.parse(text), error: null };
  } catch (error) {
    return { value: null, error };
  }
}

function validateLegacyCatalogItem(value) {
  const reasons = [];

  if (!isRecord(value)) {
    return ['item must be an object'];
  }

  if (typeof value.name !== 'string' || value.name.length === 0) {
    reasons.push('name must be a non-empty string');
  }
  if (typeof value.model !== 'string') {
    reasons.push('model must be a string');
  }
  if (typeof value.price !== 'number' || !Number.isFinite(value.price) || value.price < 0) {
    reasons.push('price must be a non-negative finite number');
  }
  if (
    typeof value.discountPrice !== 'number' ||
    !Number.isFinite(value.discountPrice) ||
    value.discountPrice < 0
  ) {
    reasons.push('discountPrice must be a non-negative finite number');
  }
  if (value.discountStatus !== 'on' && value.discountStatus !== 'off') {
    reasons.push("discountStatus must be 'on' or 'off'");
  }
  if (typeof value.year !== 'string' && typeof value.year !== 'number') {
    reasons.push('year must be a string or number');
  }

  return reasons;
}

function legacyToCatalogItem(id, item) {
  return {
    id,
    brand: item.name,
    model: item.model,
    year: item.year,
    price: item.price,
    discountPrice: item.discountPrice,
    discountEnabled: item.discountStatus === 'on'
  };
}

function catalogItemToLegacy(item) {
  return {
    name: item.brand,
    model: item.model,
    year: item.year,
    price: item.price,
    discountPrice: item.discountPrice,
    discountStatus: item.discountEnabled ? 'on' : 'off'
  };
}

function stableStringify(value) {
  return JSON.stringify(value, Object.keys(value).sort());
}

function validateExport(data) {
  const errors = [];
  const itemErrors = [];

  if (!isRecord(data)) {
    return {
      errors: ['export root must be a JSON object'],
      itemErrors,
      summary: null
    };
  }

  const store = data['profi-bike'];
  if (!isRecord(store)) {
    return {
      errors: ["export must contain a 'profi-bike' object root"],
      itemErrors,
      summary: null
    };
  }

  if (!isRecord(store.items)) {
    errors.push('profi-bike/items must be an object keyed by item id');
  } else {
    Object.entries(store.items).forEach(([itemId, item]) => {
      const reasons = validateLegacyCatalogItem(item);
      if (reasons.length > 0) {
        itemErrors.push({ itemId, reasons });
        return;
      }

      const roundTrip = catalogItemToLegacy(legacyToCatalogItem(itemId, item));
      if (stableStringify(roundTrip) !== stableStringify(item)) {
        itemErrors.push({
          itemId,
          reasons: ['legacy -> internal -> legacy round-trip changed item data']
        });
      }
    });
  }

  if (!Array.isArray(store.owners)) {
    errors.push('profi-bike/owners must be an array');
  } else {
    store.owners.forEach((owner, index) => {
      if (typeof owner !== 'string' || owner.length === 0) {
        errors.push(`profi-bike/owners/${index} must be a non-empty string`);
      }
    });
  }

  if (!isRecord(store.ownerUids)) {
    errors.push('profi-bike/ownerUids must be an object keyed by trusted Firebase UID');
  } else {
    const ownerUids = Object.entries(store.ownerUids);
    if (ownerUids.length !== expectedOwnerUidCount) {
      errors.push(
        `profi-bike/ownerUids must contain exactly ${expectedOwnerUidCount} trusted owner UIDs; found ${ownerUids.length}`
      );
    }
    ownerUids.forEach(([uid, value]) => {
      if (!uid) {
        errors.push('profi-bike/ownerUids contains an empty UID key');
      }
      if (value !== true) {
        errors.push(`profi-bike/ownerUids/${uid} must be true`);
      }
    });
  }

  return {
    errors,
    itemErrors,
    summary: {
      items: isRecord(store.items) ? Object.keys(store.items).length : 0,
      owners: Array.isArray(store.owners) ? store.owners.length : 0,
      ownerUids: isRecord(store.ownerUids) ? Object.keys(store.ownerUids).length : 0
    }
  };
}

if (!(await fileExists(exportPath))) {
  console.log(`Production export not found at ${exportPath}; skipping local-only validation.`);
  process.exit(0);
}

const { value, error } = parseJson(await readFile(exportPath, 'utf8'));
if (error) {
  console.error(`Production export validation failed: ${exportPath} is not valid JSON.`);
  console.error(error.message);
  process.exit(1);
}

const result = validateExport(value);
const failed = result.errors.length > 0 || result.itemErrors.length > 0;

if (failed) {
  console.error(`Production export validation failed for ${exportPath}.`);

  result.errors.forEach(message => {
    console.error(`- ${message}`);
  });

  result.itemErrors.forEach(({ itemId, reasons }) => {
    console.error(`- profi-bike/items/${itemId}: ${reasons.join('; ')}`);
  });

  process.exit(1);
}

console.log(`Production export validation passed for ${exportPath}.`);
console.log(
  `Validated ${result.summary.items} items, ${result.summary.owners} owners, and ${result.summary.ownerUids} ownerUids.`
);
