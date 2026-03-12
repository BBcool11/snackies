export interface Snack {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  categoryEn: string;
  era: string;
  eraEn: string;
  flavor: string[];
  flavorEn: string[];
  description: string;
  descriptionEn: string;
  memory: string;
  memoryEn: string;
  image: string;
  origin: string;
  originEn: string;
  manufacturer: string;
  manufacturerEn: string;
  status: string;
  statusEn: string;
  // 兼容旧代码的字段
  brand?: string;
  brandEn?: string;
  brandOrigin?: string;
  year?: string;
  price?: number;
  // 口味分类：酸/甜/辣
  flavor_category?: 'sour' | 'sweet' | 'spicy';
  // 图片校验标记
  missing_image?: boolean;
  image_valid?: boolean;
  weight?: string;
  collectionCount?: number;
  tasteCount?: number;
  // 分类标记
  isNostalgic?: boolean;
  isHot?: boolean;
}

export interface Curation {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  descriptionEn: string;
  coverImage: string;
  snackImages: string[];
  snackCount: number;
  era?: string;
  theme: string;
  isDiscontinuedTheme?: boolean;
  snackIds?: (string | number)[]; // FIX: 2026-03 添加展品ID列表，确保展品准确匹配
}

export interface Trace {
  id: string;
  snackId: string;
  snackName: string;
  snackBrand: string;
  snackImage: string;
  userName: string;
  userAvatar: string;
  content: string;
  era: string;
  emotion: 'nostalgic' | 'happy' | 'healing' | 'addictive' | 'surprised';
  likes: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  collection: string[];
  tasted: string[];
  flavorProfile: {
    spicy: number;
    sweet: number;
    salty: number;
    sour: number;
    puffed: number;
    drink: number;
  };
}

export type ViewType = 'exhibition' | 'curation' | 'traces' | 'archive';
export type EraFilter = 'all' | '80s' | '90s' | '00s' | '10s' | 'Post-80s' | 'Post-90s' | 'Post-00s' | 'Post-10s';
export type FlavorFilter = 'all' | 'spicy' | 'sweet' | 'salty' | 'sour' | 'puffed' | 'drink';
export type CategoryFilter = 'all' | 'sour' | 'sweet' | 'spicy';
export type StatusFilter = 'all' | 'available' | 'discontinued' | 'rare' | '在售' | '停产';
export type SortType = 'price-asc' | 'price-desc' | 'era';

// 状态配置（兼容旧代码）
export const STATUS_CONFIG: Record<string, { text: string; color: string }> = {
  available: { text: '在售', color: '#10B981' },
  discontinued: { text: '停产', color: '#EF4444' },
  rare: { text: '稀有', color: '#F59E0B' },
  '在售': { text: '在售', color: '#10B981' },
  '停产': { text: '停产', color: '#EF4444' },
};
