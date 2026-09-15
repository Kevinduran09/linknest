import type { SQLiteDatabase } from 'expo-sqlite';

import type { Tag } from '@/src/domain/tag';
import { createId } from '@/src/utils/ids';
import { now } from '@/src/utils/time';

type TagRow = { id: string; name: string; created_at: number };

function mapTag(row: TagRow): Tag {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

export class TagsRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async list(): Promise<Tag[]> {
    return (await this.db.getAllAsync<TagRow>('SELECT id, name, created_at FROM tags ORDER BY name ASC')).map(mapTag);
  }

  async getOrCreate(name: string): Promise<Tag> {
    const normalizedName = name.trim();
    const existing = await this.db.getFirstAsync<TagRow>('SELECT id, name, created_at FROM tags WHERE name = ? COLLATE NOCASE', normalizedName);
    if (existing) return mapTag(existing);
    const tag = { id: createId('tag'), name: normalizedName, createdAt: now() };
    await this.db.runAsync('INSERT INTO tags (id, name, created_at) VALUES (?, ?, ?)', [tag.id, tag.name, tag.createdAt]);
    return tag;
  }

  async listForLink(linkId: string): Promise<Tag[]> {
    return (await this.db.getAllAsync<TagRow>(
      `SELECT t.id, t.name, t.created_at FROM tags t
       INNER JOIN link_tags lt ON lt.tag_id = t.id WHERE lt.link_id = ? ORDER BY t.name ASC`,
      linkId,
    )).map(mapTag);
  }

  async addToLink(linkId: string, tagId: string): Promise<void> {
    await this.db.runAsync('INSERT OR IGNORE INTO link_tags (link_id, tag_id) VALUES (?, ?)', [linkId, tagId]);
  }

  async removeFromLink(linkId: string, tagId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM link_tags WHERE link_id = ? AND tag_id = ?', [linkId, tagId]);
  }
}

