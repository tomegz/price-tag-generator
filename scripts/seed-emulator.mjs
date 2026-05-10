import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const projectId = process.env.FIREBASE_PROJECT_ID || 'demo-price-tag-generator';
const databaseNamespace =
  process.env.FIREBASE_DATABASE_EMULATOR_NAMESPACE || `${projectId}-default-rtdb`;
const seedEmail = process.env.SEED_AUTH_USER_EMAIL || 'owner@example.test';
const seedPassword = process.env.SEED_AUTH_USER_PASSWORD || 'password123';
const seedUid = process.env.SEED_AUTH_USER_UID || 'local-owner';
const exportDir = process.env.FIREBASE_EMULATOR_EXPORT_DIR || 'emulator-data';

async function readSeedData() {
  const candidates = process.env.FIREBASE_SEED_DATA_FILE
    ? [process.env.FIREBASE_SEED_DATA_FILE]
    : ['pricetag-generator-export.json', 'scripts/seed-data.sample.json'];

  for (const candidate of candidates) {
    try {
      return JSON.parse(await readFile(candidate, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  throw new Error('No seed data found.');
}

const data = await readSeedData();

data['profi-bike'] ||= {};
data['profi-bike'].ownerUids ||= {};
data['profi-bike'].owners ||= [];
data['profi-bike'].ownerUids[seedUid] = true;
if (!data['profi-bike'].owners.includes(seedUid)) {
  data['profi-bike'].owners.push(seedUid);
}

const databaseExportDir = join(exportDir, 'database_export');
const authExportDir = join(exportDir, 'auth_export');

await mkdir(databaseExportDir, { recursive: true });
await mkdir(authExportDir, { recursive: true });

await writeFile(
  join(databaseExportDir, `${databaseNamespace}.json`),
  `${JSON.stringify(data, null, 2)}\n`
);

await writeFile(
  join(authExportDir, 'accounts.json'),
  `${JSON.stringify({
    kind: 'identitytoolkit#DownloadAccountResponse',
    users: [
      {
        localId: seedUid,
        email: seedEmail,
        emailVerified: true,
        salt: 'fakeSaltLocalSeed',
        passwordHash: `fakeHash:salt=fakeSaltLocalSeed:password=${seedPassword}`,
        passwordUpdatedAt: Date.now(),
        validSince: String(Math.floor(Date.now() / 1000)),
        createdAt: String(Date.now()),
        providerUserInfo: [
          {
            providerId: 'password',
            email: seedEmail,
            federatedId: seedEmail,
            rawId: seedEmail
          }
        ]
      }
    ]
  })}\n`
);

await writeFile(
  join(authExportDir, 'config.json'),
  `${JSON.stringify({
    signIn: {
      allowDuplicateEmails: false
    },
    emailPrivacyConfig: {
      enableImprovedEmailPrivacy: false
    }
  })}\n`
);

await writeFile(
  join(exportDir, 'firebase-export-metadata.json'),
  `${JSON.stringify({
    version: '15.17.0',
    database: {
      version: '4.11.2',
      path: 'database_export'
    },
    auth: {
      version: '15.17.0',
      path: 'auth_export'
    }
  }, null, 2)}\n`
);

console.log(`Prepared Firebase emulator import data in ${exportDir}.`);
console.log(`Seeded Realtime Database namespace: ${databaseNamespace}`);
console.log(`Seeded Auth emulator owner: ${seedEmail} / ${seedPassword}`);
console.log('Start or restart the Firebase emulators to load this data.');
