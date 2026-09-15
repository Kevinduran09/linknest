import type { SQLiteDatabase } from 'expo-sqlite';

import type { Collection } from '@/src/domain/collection';
import { UNSORTED_COLLECTION_ID } from '@/src/domain/collection';
import { ProtectedCollectionError } from '@/src/domain/errors';
import { createId } from '@/src/utils/ids';
import { now } from '@/src/utils/time';

type CollectionRow = {
  id: string;
  name: string;
  icon: string;
  color: string;
  parent_id: string | null;
  is_system: number;
  sort_order: number;
  created_at: number;
  updated_at: number;
  link_count: number;
};

function mapCollection(row: CollectionRow): Collection {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    parentId: row.parent_id,
    isSystem: Boolean(row.is_system),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    linkCount: row.link_count,
  };
}

export class CollectionsRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async list(): Promise<Collection[]> {
    const rows = await this.db.getAllAsync<CollectionRow>(
      `SELECT c.*, COUNT(l.id) AS link_count
       FROM collections c LEFT JOIN links l ON l.collection_id = c.id AND l.status != 'ARCHIVED'
       GROUP BY c.id ORDER BY c.is_system DESC, c.sort_order ASC, c.created_at ASC`,
    );
    return rows.map(mapCollection);
  }

  async getById(id: string): Promise<Collection | null> {
    const row = await this.db.getFirstAsync<CollectionRow>(
      `SELECT c.*, COUNT(l.id) AS link_count FROM collections c
       LEFT JOIN links l ON l.collection_id = c.id AND l.status != 'ARCHIVED'
       WHERE c.id = ? GROUP BY c.id`,
      id,
    );
    return row ? mapCollection(row) : null;
  }

  async create(input: Pick<Collection, 'name' | 'icon' | 'color'>): Promise<Collection> {
    const name = input.name.trim();
    if (!name) throw new Error('El nombre de la colección no puede estar vacío');
    const timestamp = now();
    const id = createId('collection');
    await this.db.runAsync(
      `INSERT INTO collections (id, name, icon, color, parent_id, is_system, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, NULL, 0, 0, ?, ?)`,
      [id, name, input.icon, input.color, timestamp, timestamp],
    );
    const collection = await this.getById(id);
    if (!collection) throw new Error('No se pudo crear la colección');
    return collection;
  }

  async update(id: string, input: Pick<Collection, 'name' | 'icon' | 'color'>): Promise<void> {
    const name = input.name.trim();
    if (!name) throw new Error('El nombre de la colección no puede estar vacío');
    await this.db.runAsync('UPDATE collections SET name = ?, icon = ?, color = ?, updated_at = ? WHERE id = ? AND is_system = 0', [name, input.icon, input.color, now(), id]);
  }

  async delete(id: string): Promise<void> {
    if (id === UNSORTED_COLLECTION_ID) throw new ProtectedCollectionError();
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync('UPDATE links SET collection_id = ? WHERE collection_id = ?', [UNSORTED_COLLECTION_ID, id]);
      await this.db.runAsync('DELETE FROM collections WHERE id = ? AND is_system = 0', id);
    });
  }
}
