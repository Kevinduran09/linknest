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

export const COLLECTION_COLORS = [
  '#F7C928', '#FF5D86', '#A978F2', '#4B91DD', '#13BFA5', '#55B844', '#B5DF3D', '#FF7A1A',
  '#F2D9A5', '#C9CBD0', '#7B96B3', '#C777B9', '#B48257', '#202124', '#FF6868', '#6961F4',
] as const;

export const COLLECTION_ICONS = [
  'folder', 'star', 'heart', 'book-open', 'music', 'camera', 'flag', 'moon',
  'sun', 'cloud', 'map-pin', 'calendar', 'globe', 'gift', 'leaf', 'briefcase',
  'shopping-cart', 'plane', 'car', 'coffee', 'film', 'headphones', 'palette', 'more-horizontal',
] as const;

export type CollectionIconName = (typeof COLLECTION_ICONS)[number];
