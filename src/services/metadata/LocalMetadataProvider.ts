import type { MetadataProvider, ResolvedMetadata } from '@/src/domain/metadata';
import { domainFromUrl } from '@/src/utils/url';

const MAX_HTML_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 8000;
const USER_AGENT = 'LinkNest/1.0 (personal link library)';

function getMetaContent(html: string, key: string): string | undefined {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escapedKey}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escapedKey}["'][^>]*>`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1].trim());
  }
  return undefined;
}

function getTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1] ? decodeHtmlEntities(match[1].replace(/\s+/g, ' ').trim()) : undefined;
}

function getLinkHref(html: string, relation: string): string | undefined {
  const match = html.match(new RegExp(`<link[^>]+rel=["'][^"']*${relation}[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>`, 'i'))
    ?? html.match(new RegExp(`<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*${relation}[^"']*["'][^>]*>`, 'i'));
  return match?.[1];
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)));
}

function cleanText(value: string | undefined, maxLength = 5000): string | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned ? cleaned.slice(0, maxLength) : undefined;
}

function absoluteUrl(value: string | undefined, baseUrl: string): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return undefined;
  }
}

export class LocalMetadataProvider implements MetadataProvider {
  async resolve(url: string, signal?: AbortSignal): Promise<ResolvedMetadata> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const abortFromCaller = (): void => controller.abort();
    signal?.addEventListener('abort', abortFromCaller, { once: true });

    try {
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { Accept: 'text/html,application/xhtml+xml', 'User-Agent': USER_AGENT },
      });
      if (response.ok === false) throw new Error(`El sitio respondió con HTTP ${response.status}`);
      const resolvedUrl = response.url || url;
      const contentType = response.headers.get('content-type') ?? '';
      const contentLength = Number(response.headers.get('content-length') ?? 0);
      if ((contentType && !contentType.toLowerCase().includes('text/html')) || contentLength > MAX_HTML_BYTES) {
        return { requestUrl: url, resolvedUrl, domain: domainFromUrl(resolvedUrl), warnings: ['El recurso no contiene HTML procesable'] };
      }

      const html = await response.text();
      if (html.length > MAX_HTML_BYTES) throw new Error('La respuesta de metadata supera el límite permitido');

      const domain = domainFromUrl(resolvedUrl);
      const imageUrl = absoluteUrl(getMetaContent(html, 'og:image') ?? getMetaContent(html, 'twitter:image'), resolvedUrl);
      const favicon = getLinkHref(html, 'icon');
      return {
        requestUrl: url,
        resolvedUrl,
        canonicalUrl: absoluteUrl(getMetaContent(html, 'og:url') ?? getLinkHref(html, 'canonical'), resolvedUrl),
        title: cleanText(getMetaContent(html, 'og:title') ?? getMetaContent(html, 'twitter:title') ?? getTitle(html), 300),
        description: cleanText(getMetaContent(html, 'og:description') ?? getMetaContent(html, 'twitter:description') ?? getMetaContent(html, 'description')),
        imageUrl,
        faviconUrl: absoluteUrl(favicon, resolvedUrl),
        siteName: cleanText(getMetaContent(html, 'og:site_name'), 200),
        author: cleanText(getMetaContent(html, 'author'), 200),
        domain,
      };
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', abortFromCaller);
    }
  }
}
