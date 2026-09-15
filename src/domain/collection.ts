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

export const COLLECTION_COLORS = ['#665CF6', '#49C7A6', '#FF7A70', '#F3C35A', '#4B9BFF'] as const;
