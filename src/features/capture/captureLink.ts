import type { CaptureSource, Link } from '@/src/domain/link';
import { InvalidUrlError } from '@/src/domain/errors';
import { LinksRepository } from '@/src/database/repositories/LinksRepository';
import { extractFirstHttpUrl, isValidHttpUrl } from '@/src/utils/url';

export type CaptureLinkInput = {
  url: string;
  source: CaptureSource;
};

export type CaptureLinkResult = {
  link: Link;
  duplicate: boolean;
};

export async function captureLink(
  repository: LinksRepository,
  input: CaptureLinkInput,
): Promise<CaptureLinkResult> {
  const candidate = extractFirstHttpUrl(input.url) ?? input.url.trim();
  if (!isValidHttpUrl(candidate)) throw new InvalidUrlError();
  return repository.createSaved({ originalUrl: candidate, source: input.source });
}
