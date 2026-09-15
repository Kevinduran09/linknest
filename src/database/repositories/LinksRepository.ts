import type { SQLiteDatabase } from 'expo-sqlite';

import type { Link, CreatePendingLinkInput, FinalizeLinkInput } from '@/src/domain/link';
import type { ResolvedMetadata } from '@/src/domain/metadata';
import { UNSORTED_COLLECTION_ID } from '@/src/domain/collection';
import { createId } from '@/src/utils/ids';
import { now } from '@/src/utils/time';
import { domainFromUrl, fingerprintUrl, normalizeUrl } from '@/src/utils/url';

type LinkRow = Record<string, unknown> & {
  id: string;
  original_url: string;
  normalized_url: string;
  resolved_url: string | null;
  canonical_url: string | null;
  url_fingerprint: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  favicon_url: string | null;
  site_name: string | null;
  domain: string;
  author: string | null;
  notes: string | null;
  collection_id: string | null;
  status: Link['status'];
  metadata_state: Link['metadataState'];
  metadata_error: string | null;
  is_favorite: number;
  source: Link['source'];
  created_at: number;
  updated_at: number;
  last_opened_at: number | null;
};

function mapLink(row: LinkRow): Link {
  return {
    id: row.id,
    originalUrl: row.original_url,
    normalizedUrl: row.normalized_url,
    resolvedUrl: row.resolved_url,
    canonicalUrl: row.canonical_url,
    urlFingerprint: row.url_fingerprint,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    faviconUrl: row.favicon_url,
    siteName: row.site_name,
    domain: row.domain,
    author: row.author,
    notes: row.notes,
    collectionId: row.collection_id,
    status: row.status,
    metadataState: row.metadata_state,
    metadataError: row.metadata_error,
    isFavorite: Boolean(row.is_favorite),
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastOpenedAt: row.last_opened_at,
  };
}

const selectColumns = `id, original_url, normalized_url, resolved_url, canonical_url,
  url_fingerprint, title, description, image_url, favicon_url, site_name, domain, author,
  notes, collection_id, status, metadata_state, metadata_error, is_favorite, source,
  created_at, updated_at, last_opened_at`;

export class LinksRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async getById(id: string): Promise<Link | null> {
    const row = await this.db.getFirstAsync<LinkRow>(`SELECT ${selectColumns} FROM links WHERE id = ?`, id);
    return row ? mapLink(row) : null;
  }

  async getByFingerprint(fingerprint: string): Promise<Link | null> {
    const row = await this.db.getFirstAsync<LinkRow>(
      `SELECT ${selectColumns} FROM links WHERE url_fingerprint = ?`,
      fingerprint,
    );
    return row ? mapLink(row) : null;
  }

  async createPending(input: CreatePendingLinkInput): Promise<{ link: Link; duplicate: boolean }> {
    const normalizedUrl = normalizeUrl(input.originalUrl);
    const fingerprint = fingerprintUrl(normalizedUrl);
    const existing = await this.getByFingerprint(fingerprint);
    if (existing) {
      await this.db.runAsync('UPDATE links SET updated_at = ? WHERE id = ?', now(), existing.id);
      return { link: { ...existing, updatedAt: now() }, duplicate: true };
    }

    const timestamp = now();
    const id = createId('link');
    await this.db.runAsync(
      `INSERT INTO links (
        id, original_url, normalized_url, resolved_url, canonical_url, url_fingerprint,
        title, description, image_url, favicon_url, site_name, domain, author, notes,
        collection_id, status, metadata_state, metadata_error, is_favorite, source,
        created_at, updated_at, last_opened_at
      ) VALUES (?, ?, ?, NULL, NULL, ?, NULL, NULL, NULL, NULL, NULL, ?, NULL, NULL, NULL,
        'PENDING', 'PENDING', NULL, 0, ?, ?, ?, NULL)`,
      [id, input.originalUrl, normalizedUrl, fingerprint, domainFromUrl(normalizedUrl), input.source, timestamp, timestamp],
    );

    const link = await this.getById(id);
    if (!link) throw new Error('No se pudo leer el enlace recién guardado');
    return { link, duplicate: false };
  }

  async listPending(): Promise<Link[]> {
    const rows = await this.db.getAllAsync<LinkRow>(
      `SELECT ${selectColumns} FROM links WHERE status = 'PENDING' ORDER BY created_at DESC`,
    );
    return rows.map(mapLink);
  }

  async listByCollection(collectionId: string): Promise<Link[]> {
    const rows = await this.db.getAllAsync<LinkRow>(
      `SELECT ${selectColumns} FROM links WHERE collection_id = ? AND status != 'ARCHIVED' ORDER BY created_at DESC`,
      collectionId,
    );
    return rows.map(mapLink);
  }

  async listRecent(limit = 8): Promise<Link[]> {
    const rows = await this.db.getAllAsync<LinkRow>(
      `SELECT ${selectColumns} FROM links WHERE status = 'SAVED' ORDER BY created_at DESC LIMIT ?`,
      limit,
    );
    return rows.map(mapLink);
  }

  async countPending(): Promise<number> {
    const row = await this.db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM links WHERE status = 'PENDING'`);
    return row?.count ?? 0;
  }

  async finalize(id: string, input: FinalizeLinkInput): Promise<void> {
    await this.db.runAsync(
      `UPDATE links SET status = 'SAVED', collection_id = ?, notes = ?, updated_at = ? WHERE id = ?`,
      [input.collectionId ?? UNSORTED_COLLECTION_ID, input.notes ?? null, now(), id],
    );
  }

  async markMetadataResolving(id: string): Promise<void> {
    await this.db.runAsync("UPDATE links SET metadata_state = 'RESOLVING', metadata_error = NULL, updated_at = ? WHERE id = ?", now(), id);
  }

  async updateMetadata(id: string, metadata: ResolvedMetadata): Promise<void> {
    await this.db.runAsync(
      `UPDATE links SET resolved_url = ?, canonical_url = ?, title = ?, description = ?, image_url = ?,
       favicon_url = ?, site_name = ?, domain = ?, author = ?, metadata_state = 'READY', metadata_error = NULL, updated_at = ?
       WHERE id = ?`,
      [metadata.resolvedUrl ?? null, metadata.canonicalUrl ?? null, metadata.title ?? null, metadata.description ?? null, metadata.imageUrl ?? null, metadata.faviconUrl ?? null, metadata.siteName ?? null, metadata.domain, metadata.author ?? null, now(), id],
    );
  }

  async markMetadataFailed(id: string, error: string): Promise<void> {
    await this.db.runAsync("UPDATE links SET metadata_state = 'FAILED', metadata_error = ?, updated_at = ? WHERE id = ?", [error.slice(0, 500), now(), id]);
  }

  async move(id: string, collectionId: string): Promise<void> {
    await this.db.runAsync('UPDATE links SET collection_id = ?, status = ?, updated_at = ? WHERE id = ?', [collectionId, 'SAVED', now(), id]);
  }

  async setFavorite(id: string, value: boolean): Promise<void> {
    await this.db.runAsync('UPDATE links SET is_favorite = ?, updated_at = ? WHERE id = ?', [value ? 1 : 0, now(), id]);
  }

  async updateNotes(id: string, notes: string): Promise<void> {
    await this.db.runAsync('UPDATE links SET notes = ?, updated_at = ? WHERE id = ?', [notes, now(), id]);
  }

  async markOpened(id: string): Promise<void> {
    await this.db.runAsync('UPDATE links SET last_opened_at = ?, updated_at = ? WHERE id = ?', [now(), now(), id]);
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM links WHERE id = ?', id);
  }

  async search(query: string): Promise<Link[]> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return [];
    const pattern = `%${normalizedQuery}%`;
    const ftsQuery = normalizedQuery
      .split(/\s+/)
      .filter(Boolean)
      .map((term) => `"${term.replaceAll('"', '""')}"*`)
      .join(' AND ');
    const rows = await this.db.getAllAsync<LinkRow>(
      `SELECT DISTINCT ${selectColumns} FROM links l
       LEFT JOIN link_tags lt ON lt.link_id = l.id
       LEFT JOIN tags t ON t.id = lt.tag_id
       WHERE l.id IN (SELECT link_id FROM links_fts WHERE links_fts MATCH ?)
       OR t.name LIKE ? COLLATE NOCASE
       ORDER BY l.created_at DESC`,
      [ftsQuery, pattern],
    );
    return rows.map(mapLink);
  }
}
