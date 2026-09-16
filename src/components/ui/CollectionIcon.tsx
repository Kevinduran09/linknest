import {
  BookOpen, Briefcase, CalendarDays, Camera, Car, Cloud, Coffee, Film, Flag, Folder,
  Gift, Globe2, Headphones, Heart, Leaf, MapPin, Moon, MoreHorizontal, Music2, Palette,
  Plane, ShoppingCart, Star, Sun,
} from 'lucide-react-native';
import { createElement } from 'react';
import type { LucideIcon } from 'lucide-react-native';

import type { CollectionIconName } from '@/src/domain/collection';

const ICONS: Record<CollectionIconName, LucideIcon> = {
  folder: Folder,
  star: Star,
  heart: Heart,
  'book-open': BookOpen,
  music: Music2,
  camera: Camera,
  flag: Flag,
  moon: Moon,
  sun: Sun,
  cloud: Cloud,
  'map-pin': MapPin,
  calendar: CalendarDays,
  globe: Globe2,
  gift: Gift,
  leaf: Leaf,
  briefcase: Briefcase,
  'shopping-cart': ShoppingCart,
  plane: Plane,
  car: Car,
  coffee: Coffee,
  film: Film,
  headphones: Headphones,
  palette: Palette,
  'more-horizontal': MoreHorizontal,
};

export function getCollectionIcon(name: string): LucideIcon {
  return ICONS[name as CollectionIconName] ?? Folder;
}

type CollectionIconProps = { name: string; color: string; size?: number };

export function CollectionIcon({ name, color, size = 24 }: CollectionIconProps): React.JSX.Element {
  return createElement(getCollectionIcon(name), { size, color, strokeWidth: 2.2 }) as React.JSX.Element;
}
