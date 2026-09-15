import type { Link } from '@/src/domain/link';
import type { MetadataProvider } from '@/src/domain/metadata';
import { LinksRepository } from '@/src/database/repositories/LinksRepository';

type MetadataRetryOptions = {
  maxAttempts?: number;
  retryDelayMs?: number;
};

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function resolveMetadataForLink(
  repository: LinksRepository,
  provider: MetadataProvider,
  link: Link,
  options: MetadataRetryOptions = {},
): Promise<void> {
  const maxAttempts = Math.max(1, options.maxAttempts ?? 3);
  const retryDelayMs = Math.max(0, options.retryDelayMs ?? 350);
  await repository.markMetadataResolving(link.id);
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const metadata = await provider.resolve(link.resolvedUrl || link.normalizedUrl);
      await repository.updateMetadata(link.id, metadata);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) await wait(retryDelayMs * 2 ** (attempt - 1));
    }
  }
  await repository.markMetadataFailed(link.id, lastError instanceof Error ? lastError.message : 'No se pudo resolver la metadata');
}
