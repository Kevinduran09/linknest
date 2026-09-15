import { migration001 } from '@/src/database/migrations/001_initial';

describe('migration 001', () => {
  it('creates the schema and seeds the protected Unsorted collection', async () => {
    const db = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      runAsync: jest.fn().mockResolvedValue(undefined),
    };

    await migration001(db as never);

    expect(db.execAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS links'));
    expect(db.execAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS link_tags'));
    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR IGNORE INTO collections'),
      expect.arrayContaining(['system-unsorted', 'Unsorted']),
    );
  });
});

