/**
 * 零食图片生成器
 * 使用 /images/snacks/xxx.jpg 路径
 */

import { getSnackImagePath } from './snackImageMap';

// 颜色调色板 - 零食包装常用色
const colorPalette = [
  { bg: '#FF6B6B', text: '#FFFFFF' },
  { bg: '#4ECDC4', text: '#FFFFFF' },
  { bg: '#45B7D1', text: '#FFFFFF' },
  { bg: '#96CEB4', text: '#FFFFFF' },
  { bg: '#FFEAA7', text: '#2D3436' },
  { bg: '#DDA0DD', text: '#FFFFFF' },
  { bg: '#98D8C8', text: '#2D3436' },
  { bg: '#F7DC6F', text: '#2D3436' },
  { bg: '#BB8FCE', text: '#FFFFFF' },
  { bg: '#85C1E9', text: '#FFFFFF' },
  { bg: '#F8C471', text: '#2D3436' },
  { bg: '#82E0AA', text: '#2D3436' },
  { bg: '#F1948A', text: '#FFFFFF' },
  { bg: '#AED6F1', text: '#2D3436' },
  { bg: '#D5DBDB', text: '#2D3436' },
  { bg: '#A9DFBF', text: '#2D3436' },
];

function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function adjustColor(color: string, amount: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x00FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function getCategoryIcon(category: string): string {
  if (category.includes('辣条') || category.includes('Spicy')) return '🌶️';
  if (category.includes('薯片') || category.includes('Puffed')) return '🥔';
  if (category.includes('饼干') || category.includes('Cookie')) return '🍪';
  if (category.includes('糖果') || category.includes('Candy')) return '🍬';
  if (category.includes('巧克力') || category.includes('Chocolate')) return '🍫';
  if (category.includes('饮料') || category.includes('Drink')) return '🥤';
  if (category.includes('方便面') || category.includes('Noodle')) return '🍜';
  if (category.includes('坚果') || category.includes('Nut')) return '🥜';
  if (category.includes('肉干') || category.includes('Jerky')) return '🥓';
  if (category.includes('果冻') || category.includes('Jelly')) return '🍮';
  if (category.includes('蛋糕') || category.includes('Cake')) return '🧁';
  if (category.includes('面包') || category.includes('Bread')) return '🍞';
  if (category.includes('瓜子') || category.includes('Seed')) return '🌻';
  if (category.includes('膨化')) return '🍿';
  if (category.includes('派') || category.includes('Pie')) return '🥧';
  if (category.includes('虾')) return '🦐';
  if (category.includes('鱼')) return '🐟';
  if (category.includes('素肉') || category.includes('Vegetarian')) return '🥩';
  return '🍪';
}

// 生成占位图
export function generatePlaceholderImage(id: string, name: string, category: string): string {
  const hash = stringToHash(id + name);
  const colorIndex = hash % colorPalette.length;
  const colors = colorPalette[colorIndex];
  const categoryIcon = getCategoryIcon(category);
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="grad${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${adjustColor(colors.bg, -20)};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#grad${id})" rx="20"/>
      <text x="100" y="90" font-size="60" text-anchor="middle">${categoryIcon}</text>
      <text x="100" y="160" font-family="sans-serif" font-size="14" font-weight="bold" 
            text-anchor="middle" fill="${colors.text}">${truncateText(name, 5)}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

// 生成零食图片路径
export function generateSnackImage(id: string, _name?: string, _category?: string): string {
  return getSnackImagePath(id);
}

// 批量生成
export function generateSnackImageMap(snacks: { id: string; name: string; category: string }[]): Record<string, string> {
  const imageMap: Record<string, string> = {};
  snacks.forEach((snack) => {
    imageMap[snack.id] = generateSnackImage(snack.id, snack.name, snack.category);
  });
  return imageMap;
}
