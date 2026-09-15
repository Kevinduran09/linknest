import type { Link } from '@/src/domain/link';
import type { MetadataProvider } from '@/src/domain/metadata';
import { LinksRepository } from '@/src/database/repositories/LinksRepository';

export async function resolveMetadataForLink(
  repository: LinksRepository,
  provider: MetadataProvider,
  link: Link,
): Promise<void> {
  await repository.markMetadataResolving(link.id);
  try {
    const metadata = await provider.resolve(link.resolvedUrl || link.normalizedUrl);
    await repository.updateMetadata(link.id, metadata);
  } catch (error) {
    await repository.markMetadataFailed(link.id, error instanceof Error ? error.message : 'No se pudo resolver la metadata');
  }
}

