import { domainFromUrl, extractFirstHttpUrl, fingerprintUrl, isValidHttpUrl, normalizeUrl } from '@/src/utils/url';

describe('URL pipeline', () => {
  it('extracts the first HTTP URL from shared text and removes trailing punctuation', () => {
    expect(extractFirstHttpUrl('Mira esto: https://Example.com/video?utm_source=share.')).toBe('https://Example.com/video?utm_source=share');
  });

  it('accepts only HTTP and HTTPS URLs', () => {
    expect(isValidHttpUrl('https://example.com')).toBe(true);
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isValidHttpUrl('not a url')).toBe(false);
  });

  it('normalizes hostname, default port and known tracking parameters', () => {
    expect(normalizeUrl('HTTPS://WWW.Example.com:443/path?utm_campaign=x&keep=1#section')).toBe('https://www.example.com/path?keep=1#section');
    expect(domainFromUrl('https://WWW.Example.com/path')).toBe('example.com');
  });

  it('creates deterministic fingerprints', () => {
    expect(fingerprintUrl('https://example.com')).toBe(fingerprintUrl('https://example.com'));
    expect(fingerprintUrl('https://example.com')).not.toBe(fingerprintUrl('https://example.org'));
  });
});

