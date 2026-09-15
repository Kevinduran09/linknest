import { isLinkNestBackup } from '@/src/domain/backup';

describe('isLinkNestBackup', () => {
  it('rejects backups with malformed records', () => {
    expect(isLinkNestBackup({ format: 'linknest-backup', version: 1, exportedAt: new Date().toISOString(), collections: [{}], links: [], tags: [], linkTags: [] })).toBe(false);
  });

  it('accepts the structural shape of a valid empty backup', () => {
    expect(isLinkNestBackup({ format: 'linknest-backup', version: 1, exportedAt: new Date().toISOString(), collections: [], links: [], tags: [], linkTags: [] })).toBe(true);
  });
});
