import type { SQLiteDatabase } from 'expo-sqlite';

import { UNSORTED_COLLECTION_ID } from '@/src/domain/collection';

/** Moves captures from the previous Inbox flow into the permanent Unsorted collection. */
export async function migration003(db: SQLiteDatabase): Promise<void> {
  await db.runAsync(
    "UPDATE links SET status = 'SAVED', collection_id = ? WHERE status = 'PENDING'",
    UNSORTED_COLLECTION_ID,
  );
  await db.runAsync("UPDATE collections SET icon = 'folder' WHERE id = ?", UNSORTED_COLLECTION_ID);
}
