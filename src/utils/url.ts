const TRACKING_PARAM_PATTERNS = [/^utm_/i];
const TRACKING_PARAMS = new Set(['fbclid', 'gclid', 'mc_cid', 'mc_eid']);
const TRAILING_PUNCTUATION = /[.,!?;:)'\]}>]+$/;

function stripTrailingPunctuation(value: string): string {
  let result = value.trim();
  while (TRAILING_PUNCTUATION.test(result)) {
    result = result.replace(TRAILING_PUNCTUATION, '');
  }
  return result;
}

export function extractFirstHttpUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s<>"']+/i);
  if (!match) return null;
  const candidate = stripTrailingPunctuation(match[0]);
  return isValidHttpUrl(candidate) ? candidate : null;
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim());
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

export function normalizeUrl(value: string): string {
  const parsed = new URL(value.trim());
  parsed.hostname = parsed.hostname.toLowerCase();
  if ((parsed.protocol === 'http:' && parsed.port === '80') || (parsed.protocol === 'https:' && parsed.port === '443')) {
    parsed.port = '';
  }

  [...parsed.searchParams.keys()].forEach((key) => {
    if (TRACKING_PARAMS.has(key.toLowerCase()) || TRACKING_PARAM_PATTERNS.some((pattern) => pattern.test(key))) {
      parsed.searchParams.delete(key);
    }
  });

  return parsed.toString();
}

export function domainFromUrl(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return '';
  }
}

/** A small deterministic fingerprint that avoids adding a crypto dependency to the first phase. */
export function fingerprintUrl(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

