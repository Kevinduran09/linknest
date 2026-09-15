import type { Collection } from '@/src/domain/collection';
import type { Link } from '@/src/domain/link';
import type { Tag } from '@/src/domain/tag';

export type LinkTagBackup = { linkId: string; tagId: string };

export type LinkNestBackup = {
  format: 'linknest-backup';
  version: 1;
  exportedAt: string;
  collections: Collection[];
  links: Link[];
  tags: Tag[];
  linkTags: LinkTagBackup[];
};

export function isLinkNestBackup(value: unknown): value is LinkNestBackup {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<LinkNestBackup>;
  return candidate.format === 'linknest-backup'
    && candidate.version === 1
    && typeof candidate.exportedAt === 'string'
    && Array.isArray(candidate.collections)
    && Array.isArray(candidate.links)
    && Array.isArray(candidate.tags)
    && Array.isArray(candidate.linkTags);
}

