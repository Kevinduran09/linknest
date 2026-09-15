import { LocalMetadataProvider } from '@/src/services/metadata/LocalMetadataProvider';

describe('LocalMetadataProvider', () => {
  it('prioritizes Open Graph over Twitter and standard HTML metadata', async () => {
    const html = `<!doctype html><html><head>
      <title>HTML title</title>
      <meta name="description" content="HTML description">
      <meta name="twitter:title" content="Twitter title">
      <meta name="twitter:description" content="Twitter description">
      <meta property="og:title" content="OG title">
      <meta property="og:description" content="OG description">
      <meta property="og:site_name" content="Example Site">
      <link rel="canonical" href="https://example.com/article">
    </head></html>`;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = jest.fn().mockResolvedValue({
      url: 'https://example.com/article',
      headers: { get: (name: string) => name === 'content-type' ? 'text/html' : null },
      text: async () => html,
    } as unknown as Response);

    await expect(new LocalMetadataProvider().resolve('https://example.com/article')).resolves.toMatchObject({
      title: 'OG title',
      description: 'OG description',
      siteName: 'Example Site',
      canonicalUrl: 'https://example.com/article',
    });
    globalThis.fetch = originalFetch;
  });
});
