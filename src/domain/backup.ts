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
  if (!(candidate.format === 'linknest-backup'
    && candidate.version === 1
    && typeof candidate.exportedAt === 'string'
    && Array.isArray(candidate.collections)
    && Array.isArray(candidate.links)
    && Array.isArray(candidate.tags)
    && Array.isArray(candidate.linkTags))) return false;

  if (candidate.collections.some((item) => !isRecord(item) || typeof item.id !== 'string' || typeof item.name !== 'string' || typeof item.icon !== 'string' || typeof item.color !== 'string')) return false;
  if (candidate.links.some((item) => !isRecord(item) || typeof item.id !== 'string' || typeof item.originalUrl !== 'string' || typeof item.normalizedUrl !== 'string' || typeof item.urlFingerprint !== 'string' || typeof item.domain !== 'string')) return false;
  if (candidate.tags.some((item) => !isRecord(item) || typeof item.id !== 'string' || typeof item.name !== 'string')) return false;
  return candidate.linkTags.every((item) => isRecord(item) && typeof item.linkId === 'string' && typeof item.tagId === 'string');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}
