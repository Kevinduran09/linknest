export type Collection = {
  id: string;
  name: string;
  icon: string;
  color: string;
  parentId: string | null;
  isSystem: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
  linkCount?: number;
};

export const UNSORTED_COLLECTION_ID = 'system-unsorted';

