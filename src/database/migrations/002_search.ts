import type { SQLiteDatabase } from 'expo-sqlite';

/** Keeps the FTS5 index synchronized with searchable link fields. */
export async function migration002(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE VIRTUAL TABLE IF NOT EXISTS links_fts USING fts5(
      link_id UNINDEXED,
      title,
      description,
      original_url,
      resolved_url,
      domain,
      site_name,
      author,
      notes,
      tokenize = 'unicode61 remove_diacritics 2'
    );

    DELETE FROM links_fts;

    INSERT INTO links_fts (link_id, title, description, original_url, resolved_url, domain, site_name, author, notes)
      SELECT id, COALESCE(title, ''), COALESCE(description, ''), original_url, COALESCE(resolved_url, ''),
        domain, COALESCE(site_name, ''), COALESCE(author, ''), COALESCE(notes, '')
      FROM links;

    CREATE TRIGGER IF NOT EXISTS links_fts_ai AFTER INSERT ON links BEGIN
      INSERT INTO links_fts (link_id, title, description, original_url, resolved_url, domain, site_name, author, notes)
      VALUES (new.id, COALESCE(new.title, ''), COALESCE(new.description, ''), new.original_url,
        COALESCE(new.resolved_url, ''), new.domain, COALESCE(new.site_name, ''), COALESCE(new.author, ''), COALESCE(new.notes, ''));
    END;

    CREATE TRIGGER IF NOT EXISTS links_fts_au AFTER UPDATE OF title, description, original_url, resolved_url, domain, site_name, author, notes ON links BEGIN
      DELETE FROM links_fts WHERE link_id = old.id;
      INSERT INTO links_fts (link_id, title, description, original_url, resolved_url, domain, site_name, author, notes)
      VALUES (new.id, COALESCE(new.title, ''), COALESCE(new.description, ''), new.original_url,
        COALESCE(new.resolved_url, ''), new.domain, COALESCE(new.site_name, ''), COALESCE(new.author, ''), COALESCE(new.notes, ''));
    END;

    CREATE TRIGGER IF NOT EXISTS links_fts_ad AFTER DELETE ON links BEGIN
      DELETE FROM links_fts WHERE link_id = old.id;
    END;
  `);
}
