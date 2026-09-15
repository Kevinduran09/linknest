import type { SQLiteDatabase } from 'expo-sqlite';

import type { LinkNestBackup, LinkTagBackup } from '@/src/domain/backup';
import type { Collection } from '@/src/domain/collection';
import type { Link } from '@/src/domain/link';
import type { Tag } from '@/src/domain/tag';
import { isLinkNestBackup } from '@/src/domain/backup';

export async function createBackup(db: SQLiteDatabase): Promise<LinkNestBackup> {
  const collectionRows = await db.getAllAsync<Record<string, unknown>>('SELECT * FROM collections');
  const linkRows = await db.getAllAsync<Record<string, unknown>>('SELECT * FROM links');
  const tagRows = await db.getAllAsync<Record<string, unknown>>('SELECT * FROM tags');
  const linkTags = await db.getAllAsync<LinkTagBackup>('SELECT link_id as linkId, tag_id as tagId FROM link_tags');
  const collections: Collection[] = collectionRows.map((row) => ({
    id: String(row.id), name: String(row.name), icon: String(row.icon), color: String(row.color),
    parentId: row.parent_id ? String(row.parent_id) : null, isSystem: Boolean(row.is_system), sortOrder: Number(row.sort_order),
    createdAt: Number(row.created_at), updatedAt: Number(row.updated_at),
  }));
  const links: Link[] = linkRows.map((row) => ({
    id: String(row.id), originalUrl: String(row.original_url), normalizedUrl: String(row.normalized_url),
    resolvedUrl: row.resolved_url ? String(row.resolved_url) : null, canonicalUrl: row.canonical_url ? String(row.canonical_url) : null,
    urlFingerprint: String(row.url_fingerprint), title: row.title ? String(row.title) : null, description: row.description ? String(row.description) : null,
    imageUrl: row.image_url ? String(row.image_url) : null, faviconUrl: row.favicon_url ? String(row.favicon_url) : null,
    siteName: row.site_name ? String(row.site_name) : null, domain: String(row.domain), author: row.author ? String(row.author) : null,
    notes: row.notes ? String(row.notes) : null, collectionId: row.collection_id ? String(row.collection_id) : null,
    status: row.status as Link['status'], metadataState: row.metadata_state as Link['metadataState'], metadataError: row.metadata_error ? String(row.metadata_error) : null,
    isFavorite: Boolean(row.is_favorite), source: row.source as Link['source'], createdAt: Number(row.created_at), updatedAt: Number(row.updated_at),
    lastOpenedAt: row.last_opened_at ? Number(row.last_opened_at) : null,
  }));
  const tags: Tag[] = tagRows.map((row) => ({ id: String(row.id), name: String(row.name), createdAt: Number(row.created_at) }));
  return { format: 'linknest-backup', version: 1, exportedAt: new Date().toISOString(), collections, links, tags, linkTags };
}

export function parseBackup(json: string): LinkNestBackup {
  const parsed: unknown = JSON.parse(json);
  if (!isLinkNestBackup(parsed)) throw new Error('El backup no es compatible con LinkNest');
  return parsed;
}

export async function restoreBackupReplace(db: SQLiteDatabase, backup: LinkNestBackup): Promise<void> {
  if (!isLinkNestBackup(backup)) throw new Error('El backup no es compatible con LinkNest');
  await db.withTransactionAsync(async () => {
    await db.execAsync('DELETE FROM link_tags; DELETE FROM links; DELETE FROM tags; DELETE FROM collections WHERE is_system = 0;');
    for (const collection of backup.collections.filter((item) => !item.isSystem)) {
      await db.runAsync(
        `INSERT INTO collections (id, name, icon, color, parent_id, is_system, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
        [collection.id, collection.name, collection.icon, collection.color, collection.parentId, collection.sortOrder, collection.createdAt, collection.updatedAt],
      );
    }
    for (const tag of backup.tags) await db.runAsync('INSERT INTO tags (id, name, created_at) VALUES (?, ?, ?)', [tag.id, tag.name, tag.createdAt]);
    for (const link of backup.links) {
      await db.runAsync(
        `INSERT INTO links (id, original_url, normalized_url, resolved_url, canonical_url, url_fingerprint, title, description,
         image_url, favicon_url, site_name, domain, author, notes, collection_id, status, metadata_state, metadata_error,
         is_favorite, source, created_at, updated_at, last_opened_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [link.id, link.originalUrl, link.normalizedUrl, link.resolvedUrl, link.canonicalUrl, link.urlFingerprint, link.title, link.description, link.imageUrl, link.faviconUrl, link.siteName, link.domain, link.author, link.notes, link.collectionId, link.status, link.metadataState, link.metadataError, link.isFavorite ? 1 : 0, link.source, link.createdAt, link.updatedAt, link.lastOpenedAt],
      );
    }
    for (const relation of backup.linkTags) await db.runAsync('INSERT INTO link_tags (link_id, tag_id) VALUES (?, ?)', [relation.linkId, relation.tagId]);
  });
}
