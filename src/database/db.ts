import type { SQLiteDatabase } from 'expo-sqlite';

import { migrateDatabase } from '@/src/database/migrate';

export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;`);
  await migrateDatabase(db);
}

