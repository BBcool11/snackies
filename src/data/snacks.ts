import type { Snack, Curation, Trace, UserProfile } from '@/types';
// 导入高级零食数据和策展数据
import snacksJson from './snacks_premium.json';
import hotSnacksJson from './snacks_hot_100.json';
import curationsJson from './curations.json';

// ========== 怀旧零食（经典老零食）==========
const nostalgicSnacks: Snack[] = (snacksJson as any[]).map((item) => {
  return {
    id: String(item.id).padStart(3, '0'),
    name: item.name,
    nameEn: item.en_name || item.name,
    category: item.category,
    categoryEn: item.category,
    era: item.era || '90年代',
    eraEn: item.era === '80年代' ? '1980s' : item.era === '90年代' ? '1990s' : item.era === '00年代' ? '2000s' : '2010s',
    flavor: [...(item.tags || []), '童年回忆'],
    flavorEn: ['Childhood Memory'],
    description: item.factual_desc,
    descriptionEn: item.factual_desc,
    memory: item.nostalgic_quote,
    memoryEn: item.nostalgic_quote,
    price: item.price,
    image: item.image,
    origin: '中国',
    originEn: 'China',
    manufacturer: item.brand || '经典零食',
    manufacturerEn: 'Classic Snacks',
    status: item.status,
    statusEn: item.status === '在售' ? 'Available' : item.status === '停产' ? 'Discontinued' : 'Rare',
    brand: item.brand || item.name.split(/老版|早期|包装/)[0].trim(),
    year: item.era,
    brandOrigin: '中国大陆',
    // 标记为怀旧零食
    isNostalgic: true,
    isHot: false,
  };
});

// ========== 热门零食（近期网红零食）==========
console.log('FIXING_IMAGES_NOW_2');
const trendingSnacks: Snack[] = (hotSnacksJson as any[]).map((item) => {
  // 强制修复图片路径 - 直接硬编码
  let fixedImage = item.image;
  if (item.id === 'HOT_2026_001') fixedImage = '/snack-images-fixed/liziji_luosifen.jpg';
  else if (item.id === 'HOT_2026_002') fixedImage = '/snack-images-fixed/haohuanluo_luosifen.jpg';
  else if (item.id === 'HOT_2026_006') fixedImage = '/snack-images-fixed/moyushuang_spicy.jpg';
  else if (item.id === 'HOT_2026_010') fixedImage = '/snack-images-fixed/moyu_cake.jpg';
  else if (item.id === 'HOT_2026_045') fixedImage = '/snack-images-fixed/banana_milk.jpg';
  else if (item.id === 'HOT_2026_046') fixedImage = '/snack-images-fixed/luosifen_generic.jpg';
  else if (item.id === 'HOT_2026_047') fixedImage = '/snack-images-fixed/zire_hotpot.jpg';
  else if (item.id === 'HOT_2026_048') fixedImage = '/snack-images-fixed/zire_rice.jpg';
  else if (item.id === 'HOT_2026_080') fixedImage = '/snack-images-fixed/zek_fishsausage.jpg';
  else if (item.id === 'HOT_2026_087') fixedImage = '/snack-images-fixed/fenglisu_old.jpg';
  
  return {
    id: item.id,
    name: item.name,
    nameEn: item.en_name || item.name,
    category: item.category,
    categoryEn: item.category,
    era: item.era || '2020年代',
    eraEn: '2020s',
    flavor: [...(item.tags || []), '近期热门'],
    flavorEn: ['Trending'],
    description: item.factual_desc,
    descriptionEn: item.factual_desc,
    memory: item.nostalgic_quote,
    memoryEn: item.nostalgic_quote,
    price: item.price,
    image: fixedImage,
    origin: '中国',
    originEn: 'China',
    manufacturer: item.brand || '热门零食',
    manufacturerEn: 'Trending Snacks',
    status: item.status || 'on_sale',
    statusEn: 'Available',
    brand: item.brand || '网红品牌',
    year: item.era,
    brandOrigin: '中国大陆',
    isNostalgic: false,
    isHot: true,
  };
});

// ========== 合并所有零食数据 ==========
// 使用 concat 确保不覆盖，怀旧零食在前，热门零食在后
export const snacks: Snack[] = [...nostalgicSnacks, ...trendingSnacks];

// 导出分类列表（用于筛选）
export const categories = [
  { id: 'all', name: '全部', nameEn: 'All' },
  { id: '膨化食品', name: '膨化食品', nameEn: 'Puffed Snacks' },
  { id: '饮料汽水', name: '饮料', nameEn: 'Beverage' },
  { id: '糖果巧克力', name: '糖果', nameEn: 'Candy' },
  { id: '辣条豆制品', name: '辣条', nameEn: 'Spicy Strips' },
  { id: '饼干糕点', name: '饼干', nameEn: 'Cookies' },
  { id: '蜜饯与速食', name: '蜜饯速食', nameEn: 'Preserved' }
];

// 导出状态列表（用于筛选）
export const statuses = [
  { id: 'all', name: '全部状态', nameEn: 'All Status' },
  { id: '在售', name: '在售', nameEn: 'Available', color: '#10B981' },
  { id: '停产', name: '停产', nameEn: 'Discontinued', color: '#EF4444' },
  { id: '绝版', name: '绝版', nameEn: 'Rare', color: '#F59E0B' }
];

// 导出总数
export const totalSnacks = snacks.length;
export const nostalgicCount = nostalgicSnacks.length;
export const trendingCount = trendingSnacks.length;

// ========== 主题策展数据（从JSON导入）==========
export const curations: Curation[] = curationsJson as Curation[];

// ========== 用户足迹数据 ==========
export const traces: Trace[] = [
  {
    id: '1',
    snackId: '001',
    snackName: '小浣熊水浒卡版',
    snackBrand: '小浣熊',
    snackImage: snacks.find(s => s.name.includes('小浣熊'))?.image || '',
    userName: '怀旧达人',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    content: '小时候为了集齐108张水浒卡，吃了整整一年的干脆面！',
    era: '90s',
    emotion: 'nostalgic',
    likes: 128,
    createdAt: '2024-03-10'
  },
  {
    id: '2',
    snackId: '135',
    snackName: '卫龙大面筋',
    snackBrand: '卫龙',
    snackImage: snacks.find(s => s.name.includes('卫龙'))?.image || '',
    userName: '辣条小王子',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    content: '五毛钱一包的卫龙，和小伙伴分着吃，一人一根。',
    era: '90s',
    emotion: 'happy',
    likes: 256,
    createdAt: '2024-03-09'
  },
  {
    id: '3',
    snackId: '046',
    snackName: '健力宝老铝罐',
    snackBrand: '健力宝',
    snackImage: snacks.find(s => s.name.includes('健力宝'))?.image || '',
    userName: '汽水收藏家',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    content: '只有过年才能喝到健力宝，橙色的罐子是最美的颜色。',
    era: '80s',
    emotion: 'nostalgic',
    likes: 89,
    createdAt: '2024-03-08'
  }
];

// ========== 当前用户数据 ==========
export const currentUser: UserProfile = {
  id: 'user-001',
  name: '零食收藏家',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
  bio: '收集童年的味道，找回逝去的时光。',
  collection: ['001', '135', '046'],
  tasted: ['002', '136', '047'],
  flavorProfile: {
    spicy: 8,
    sweet: 6,
    salty: 4,
    sour: 2,
    puffed: 7,
    drink: 5
  }
};
// Force reload 2026年 3月11日 星期三 20时11分54秒 CST
console.log('SNACKS_TS_LOADED');
// FORCE RELOAD 1773285444
export const TEST_CONSTANT = 'SNACKS_TS_IS_LOADED';
