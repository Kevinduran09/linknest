import { resolveMetadataForLink } from '@/src/features/metadata/resolveMetadata';
import type { Link } from '@/src/domain/link';
import type { ResolvedMetadata, MetadataProvider } from '@/src/domain/metadata';

const link: Link = {
  id: 'link-1', originalUrl: 'https://example.com', normalizedUrl: 'https://example.com', resolvedUrl: null,
  canonicalUrl: null, urlFingerprint: 'fingerprint', title: null, description: null, imageUrl: null,
  faviconUrl: null, siteName: null, domain: 'example.com', author: null, notes: null, collectionId: null,
  status: 'PENDING', metadataState: 'PENDING', metadataError: null, isFavorite: false, source: 'manual',
  createdAt: 1, updatedAt: 1, lastOpenedAt: null,
};

const metadata: ResolvedMetadata = { requestUrl: link.normalizedUrl, resolvedUrl: link.normalizedUrl, domain: link.domain };

describe('resolveMetadataForLink', () => {
  it('retries transient provider failures before succeeding', async () => {
    const repository = { markMetadataResolving: jest.fn(), updateMetadata: jest.fn(), markMetadataFailed: jest.fn() };
    const provider: MetadataProvider = { resolve: jest.fn().mockRejectedValueOnce(new Error('temporary')).mockResolvedValueOnce(metadata) };

    await resolveMetadataForLink(repository as never, provider, link, { retryDelayMs: 0 });

    expect(provider.resolve).toHaveBeenCalledTimes(2);
    expect(repository.updateMetadata).toHaveBeenCalledWith(link.id, metadata);
    expect(repository.markMetadataFailed).not.toHaveBeenCalled();
  });

  it('stores the final error after exhausting retries', async () => {
    const repository = { markMetadataResolving: jest.fn(), updateMetadata: jest.fn(), markMetadataFailed: jest.fn() };
    const provider: MetadataProvider = { resolve: jest.fn().mockRejectedValue(new Error('offline')) };

    await resolveMetadataForLink(repository as never, provider, link, { maxAttempts: 2, retryDelayMs: 0 });

    expect(provider.resolve).toHaveBeenCalledTimes(2);
    expect(repository.markMetadataFailed).toHaveBeenCalledWith(link.id, 'offline');
  });
});
