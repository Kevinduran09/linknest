import type { SQLiteDatabase } from 'expo-sqlite';

import { migration001 } from '@/src/database/migrations/001_initial';
import { migration002 } from '@/src/database/migrations/002_search';
import { migration003 } from '@/src/database/migrations/003_remove_inbox';

type Migration = {
  version: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
};

const migrations: Migration[] = [
  { version: 1, name: 'initial_schema', up: migration001 },
  { version: 2, name: 'full_text_search', up: migration002 },
  { version: 3, name: 'remove_inbox_flow', up: migration003 },
];

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = row?.user_version ?? 0;

  for (const migration of migrations) {
    if (migration.version <= currentVersion) continue;
    await db.withTransactionAsync(async () => {
      await migration.up(db);
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    });
    currentVersion = migration.version;
  }
}
