import { migration002 } from '@/src/database/migrations/002_search';

describe('migration 002', () => {
  it('creates and backfills the full-text search index', async () => {
    const db = { execAsync: jest.fn().mockResolvedValue(undefined) };

    await migration002(db as never);

    expect(db.execAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE VIRTUAL TABLE IF NOT EXISTS links_fts USING fts5'));
    expect(db.execAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TRIGGER IF NOT EXISTS links_fts_ai'));
  });
});
