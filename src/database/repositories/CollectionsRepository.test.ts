import { CollectionsRepository } from '@/src/database/repositories/CollectionsRepository';
import { ProtectedCollectionError } from '@/src/domain/errors';

describe('CollectionsRepository.delete', () => {
  it('moves links before deleting the collection', async () => {
    const db = {
      withTransactionAsync: jest.fn(async (callback: () => Promise<void>) => callback()),
      runAsync: jest.fn().mockResolvedValue(undefined),
    };

    await new CollectionsRepository(db as never).delete('collection-1');

    expect(db.runAsync.mock.calls[0]).toEqual(['UPDATE links SET collection_id = ? WHERE collection_id = ?', ['system-unsorted', 'collection-1']]);
    expect(db.runAsync.mock.calls[1][0]).toContain('DELETE FROM collections');
  });

  it('protects the system collection', async () => {
    const db = { withTransactionAsync: jest.fn(), runAsync: jest.fn() };

    await expect(new CollectionsRepository(db as never).delete('system-unsorted')).rejects.toBeInstanceOf(ProtectedCollectionError);
    expect(db.withTransactionAsync).not.toHaveBeenCalled();
  });
});
