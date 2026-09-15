import type { SQLiteDatabase } from 'expo-sqlite';

import { UNSORTED_COLLECTION_ID } from '@/src/domain/collection';

export async function migration001(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'folder',
      color TEXT NOT NULL DEFAULT '#665CF6',
      parent_id TEXT NULL,
      is_system INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (parent_id) REFERENCES collections(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY NOT NULL,
      original_url TEXT NOT NULL,
      normalized_url TEXT NOT NULL,
      resolved_url TEXT NULL,
      canonical_url TEXT NULL,
      url_fingerprint TEXT NOT NULL,
      title TEXT NULL,
      description TEXT NULL,
      image_url TEXT NULL,
      favicon_url TEXT NULL,
      site_name TEXT NULL,
      domain TEXT NOT NULL,
      author TEXT NULL,
      notes TEXT NULL,
      collection_id TEXT NULL,
      status TEXT NOT NULL CHECK(status IN ('PENDING','SAVED','ARCHIVED')),
      metadata_state TEXT NOT NULL CHECK(metadata_state IN ('PENDING','RESOLVING','READY','FAILED')),
      metadata_error TEXT NULL,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'manual',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      last_opened_at INTEGER NULL,
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_links_fingerprint ON links(url_fingerprint);
    CREATE INDEX IF NOT EXISTS idx_links_status_created ON links(status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_links_collection_created ON links(collection_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL COLLATE NOCASE UNIQUE,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS link_tags (
      link_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (link_id, tag_id),
      FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  const timestamp = Date.now();
  await db.runAsync(
    `INSERT OR IGNORE INTO collections
      (id, name, icon, color, parent_id, is_system, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, NULL, 1, 0, ?, ?)`,
    [UNSORTED_COLLECTION_ID, 'Unsorted', 'inbox', '#49C7A6', timestamp, timestamp],
  );
}

