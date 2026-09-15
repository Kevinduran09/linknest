export type LinkStatus = 'PENDING' | 'SAVED' | 'ARCHIVED';
export type MetadataState = 'PENDING' | 'RESOLVING' | 'READY' | 'FAILED';
export type CaptureSource = 'manual' | 'clipboard' | 'share' | 'import';

export type Link = {
  id: string;
  originalUrl: string;
  normalizedUrl: string;
  resolvedUrl: string | null;
  canonicalUrl: string | null;
  urlFingerprint: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  faviconUrl: string | null;
  siteName: string | null;
  domain: string;
  author: string | null;
  notes: string | null;
  collectionId: string | null;
  status: LinkStatus;
  metadataState: MetadataState;
  metadataError: string | null;
  isFavorite: boolean;
  source: CaptureSource;
  createdAt: number;
  updatedAt: number;
  lastOpenedAt: number | null;
};

export type CreatePendingLinkInput = {
  originalUrl: string;
  source: CaptureSource;
};

export type FinalizeLinkInput = {
  collectionId: string | null;
  notes?: string;
};

