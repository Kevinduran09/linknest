export type ResolvedMetadata = {
  requestUrl: string;
  resolvedUrl?: string;
  canonicalUrl?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  faviconUrl?: string;
  siteName?: string;
  domain: string;
  author?: string;
  warnings?: string[];
};

export interface MetadataProvider {
  resolve(url: string, signal?: AbortSignal): Promise<ResolvedMetadata>;
}

