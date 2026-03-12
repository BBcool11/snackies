import { useState } from 'react';
import { Star, Circle, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Snack } from '@/types';

interface SnackCardProps {
  snack: Snack;
  onClick: () => void;
  onCollect?: (id: string) => void;
  onTaste?: (id: string) => void;
  isCollected?: boolean;
  isTasted?: boolean;
}

// FIX: 2026-03 统一占位图路径，禁止emoji替代
const FALLBACK_IMAGE = '/assets/snack-placeholder.svg';

export function SnackCard({
  snack,
  onClick,
  onCollect,
  onTaste,
  isCollected = false,
  isTasted = false,
}: SnackCardProps) {
  const { t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const eraMap: Record<string, string> = {
    'pre-60s': t('filter.60s'),
    '70s': t('filter.70s'),
    '80s': t('filter.80s'),
    '90s': t('filter.90s'),
    '00s': t('filter.00s'),
    '10s': t('filter.10s'),
  };

  // FIX: 分类标签中文化映射
  const categoryMap: Record<string, string> = {
    spicy: '辣味',
    sweet: '甜味',
    salty: '咸味',
    sour: '酸味',
    puffed: '膨化',
    drink: '饮料',
    '童年回忆': '童年回忆',
    '绝版': '绝版',
    '膨化': '膨化',
    '近期热门': '近期热门',
  };

  // FIX: 严格一对一映射，图片只能来自当前snack的image字段
  // 禁止：用热门零食图兜底、用同分类其他零食图、用emoji、用随机图
  const getImageUrl = (): string => {
    // 防御性检查
    if (!snack) {
      console.error('[SnackCard] snack is undefined');
      return FALLBACK_IMAGE;
    }
    // 如果标记了缺失图片，直接使用占位图
    if (snack.missing_image) {
      return FALLBACK_IMAGE;
    }
    // 如果没有图片URL，使用占位图
    if (!snack.image) {
      console.error(`[SnackCard] snack.image is empty for ${snack.name} (${snack.id})`);
      return FALLBACK_IMAGE;
    }
    // 图片加载错误时也使用占位图
    if (imageError) {
      return FALLBACK_IMAGE;
    }
    // 返回该零食专属的图片URL
    return snack.image;
  };

  // 判断是否应该显示"图片待补充"提示
  const shouldShowMissingIndicator = snack.missing_image || imageError || !snack.image;

  return (
    <div
      className="product-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Area */}
      <div
        onClick={onClick}
        className="relative aspect-square bg-card-bg rounded-2xl overflow-hidden cursor-pointer"
      >
        {/* Product Image - 一对一映射 */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <img
            src={getImageUrl()}
            alt={snack.name}
            loading="lazy"
            className={`w-[75%] h-[75%] object-contain contact-shadow transition-transform duration-500 ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
            onError={() => {
              // FIX: 图片加载失败时显示占位图，不使用任何其他零食图片
              console.warn(`[SnackCard] Image failed to load: ${snack.image} for ${snack.name}`);
              setImageError(true);
            }}
          />
        </div>

        {/* Rare Item Lock Overlay */}
        {snack.status === 'rare' && (
          <div className="absolute inset-0 bg-rice-paper/60 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Lock className="w-6 h-6 text-golden" />
              <span className="text-[9px] font-serif-cn text-secondary-text">
                {t('snack.locked')}
              </span>
            </div>
          </div>
        )}

        {/* Discontinued Stamp */}
        {snack.status === 'discontinued' && (
          <div className="absolute top-3 right-3">
            <span className="stamp-discontinued">{t('snack.discontinued')}</span>
          </div>
        )}

        {/* Hover Overlay */}
        {isHovered && snack.status !== 'rare' && (
          <div className="absolute inset-0 bg-card-bg/95 backdrop-blur-sm flex flex-col justify-end p-4 animate-fade-in">
            {/* Era & Category Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="era-tag">{eraMap[snack.era] || snack.era}</span>
              {snack.flavor.slice(0, 2).map((f) => (
                <span key={f} className="era-tag">
                  {categoryMap[f] || f}
                </span>
              ))}
            </div>

            {/* English Name */}
            <p className="font-sans text-[12px] text-secondary-text mb-2 line-clamp-2">
              {snack.nameEn}
            </p>

            {/* Price - FIX: 统一价格显示 */}
            <p className="font-mono-num text-golden text-[13px] font-semibold mb-3">
              {typeof snack.price === 'number' ? `¥${snack.price.toFixed(1)}` : '¥--'}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCollect?.(snack.id);
                }}
                className={`flex-1 h-8 rounded-full border flex items-center justify-center gap-1.5 transition-all ${
                  isCollected
                    ? 'border-cinnabar bg-cinnabar/10 text-cinnabar'
                    : 'border-divider hover:border-ink/30'
                }`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${isCollected ? 'fill-cinnabar' : ''}`}
                />
                <span className="text-[10px] font-serif-cn">
                  {isCollected ? t('snack.collected') : t('snack.collect')}
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTaste?.(snack.id);
                }}
                className={`flex-1 h-8 rounded-full border flex items-center justify-center gap-1.5 transition-all ${
                  isTasted
                    ? 'border-cinnabar bg-cinnabar/10 text-cinnabar'
                    : 'border-divider hover:border-ink/30'
                }`}
              >
                <Circle
                  className={`w-3.5 h-3.5 ${isTasted ? 'fill-cinnabar' : ''}`}
                />
                <span className="text-[10px] font-serif-cn">
                  {isTasted ? t('snack.tasted') : t('snack.taste')}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Missing Image Indicator */}
        {shouldShowMissingIndicator && (
          <div className="absolute bottom-2 left-2 right-2 text-center">
            <span className="text-[8px] text-tertiary-text/60">
              图片待补充
            </span>
          </div>
        )}
      </div>

      {/* Info Area - FIX: 增加留白和间距 */}
      <div className="px-2 py-4">
        <h3 className="font-serif-cn text-[14px] text-ink tracking-wide truncate leading-relaxed">
          {snack.name}
        </h3>
        <p className="font-sans text-[11px] text-tertiary-text truncate mt-2">
          {snack.brand}
        </p>
      </div>
    </div>
  );
}
