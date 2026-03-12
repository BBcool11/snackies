import { useEffect, useState } from 'react';
import { X, Star, Check, Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Snack } from '@/types';
import { PosterGenerator } from './PosterGenerator';

interface SnackModalProps {
  snack: Snack | null;
  isOpen: boolean;
  onClose: () => void;
  onCollect?: (id: string) => void;
  onTaste?: (id: string) => void;
  isCollected?: boolean;
  isTasted?: boolean;
}

export function SnackModal({
  snack,
  isOpen,
  onClose,
  onCollect,
  onTaste,
  isCollected = false,
  isTasted = false,
}: SnackModalProps) {
  const { language } = useLanguage();
  const [showLoginTip, setShowLoginTip] = useState(false);
  const [showPoster, setShowPoster] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setShowPoster(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !snack) return null;

  const handleAction = (action: 'collect' | 'taste') => {
    const isLoggedIn = localStorage.getItem('snackies_user_logged_in');
    if (!isLoggedIn) {
      setShowLoginTip(true);
      setTimeout(() => setShowLoginTip(false), 3000);
      return;
    }

    if (action === 'collect') {
      onCollect?.(snack.id);
    } else {
      onTaste?.(snack.id);
    }
  };

  // 格式化编号
  const formatId = (id: string) => {
    return `NO. ${String(id).padStart(5, '0')}`;
  };

  // 格式化价格显示
  const formatPrice = (price: any) => {
    if (typeof price === 'number') {
      return `¥${price.toFixed(1)}`;
    }
    return '¥--';
  };

  // FIX: 分类标签中文化映射
  const categoryLabels: Record<string, string> = {
    'instant_noodle': '干脆面',
    'puffed': '膨化食品',
    'candy': '糖果',
    'chocolate': '巧克力',
    'beverage': '饮料',
    'drink': '饮料',
    'nuts': '坚果',
    'dried_fruit': '蜜饯果干',
    'preserved': '蜜饯',
    'spicy_strips': '辣条',
    'cookies': '饼干',
    'pastry': '糕点',
    'other': '其他零食',
    'luosifen': '螺蛳粉',
    'instant_noodle_cup': '方便面',
    'self_heating': '自热食品',
    'childhood_90s': '90年代',
    '童年回忆': '童年回忆',
    '绝版': '绝版',
    '膨化': '膨化',
    '怀旧': '怀旧',
    '经典': '经典',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[480px] max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-sm transition-all"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Login Tip */}
        {showLoginTip && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full shadow-sm">
            <span className="text-xs text-amber-700">
              {language === 'zh' ? '请先登录后再操作' : 'Please login first'}
            </span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh]">
          {/* ===== 上半部分：图片区 ===== */}
          <div 
            className="relative w-full h-[360px] flex items-center justify-center"
            style={{ backgroundColor: '#F5F5F7' }}
          >
            <img
              src={snack.missing_image ? '/assets/snack-placeholder.svg' : snack.image}
              alt={snack.name}
              className="max-w-[80%] max-h-[80%] object-contain"
              style={{ 
                filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.15))',
              }}
              onError={(e) => {
                // FIX: 2026-03 使用统一占位图，禁止用相似图片或emoji替代
                (e.target as HTMLImageElement).src = '/assets/snack-placeholder.svg';
              }}
            />
          </div>

          {/* ===== 下半部分：信息区 ===== */}
          <div className="relative px-8 py-8 bg-white">
            {/* 我也吃过印章 */}
            {isTasted && (
              <div className="retro-stamp">
                我也吃过
              </div>
            )}

            {/* 顶部：编号与年代标签 */}
            <div className="flex items-center gap-3 mb-4">
              <span 
                className="text-xs tracking-wider"
                style={{ color: '#999', fontFamily: '"DM Mono", monospace' }}
              >
                {formatId(snack.id)}
              </span>
              <span 
                className="px-3 py-1 text-xs rounded-full border"
                style={{ 
                  borderColor: '#E5AA8F', 
                  color: '#D32F2F',
                  fontFamily: '"Source Han Serif CN", serif'
                }}
              >
                {snack.era}
              </span>
            </div>

            {/* 零食名称 */}
            <h2 
              className="text-2xl font-bold mb-1"
              style={{ 
                color: '#2C2C2C',
                fontFamily: '"Source Han Sans CN", "Noto Sans SC", sans-serif'
              }}
            >
              {snack.name}
            </h2>

            {/* 英文/拼音副标题 */}
            <p 
              className="text-xs italic mb-4"
              style={{ color: '#AAAAAA' }}
            >
              {snack.nameEn || snack.brand}
            </p>

            {/* Tags - FIX: 中文化标签 */}
            <div className="flex flex-wrap gap-2 mb-5">
              {[snack.category, ...(snack.flavor || [])].slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-4 py-1.5 text-xs rounded-full"
                  style={{ 
                    backgroundColor: '#F5F5F7',
                    color: '#666666'
                  }}
                >
                  {categoryLabels[tag] || tag}
                </span>
              ))}
            </div>

            {/* 价格 */}
            <div className="flex items-baseline gap-2 mb-6">
              <span 
                className="text-sm"
                style={{ color: '#999' }}
              >
                参考价格
              </span>
              <span 
                className="text-2xl font-bold"
                style={{ 
                  color: '#D4A373',
                  fontWeight: 700,
                  fontSize: '1.4rem'
                }}
              >
                {formatPrice(snack.price)}
              </span>
            </div>

            {/* 操作按钮 - 虚线包裹 */}
            <div 
              className="flex items-center justify-center gap-6 py-4 mb-6"
              style={{
                borderTop: '1px dashed #E0E0E0',
                borderBottom: '1px dashed #E0E0E0'
              }}
            >
              <button
                onClick={() => handleAction('collect')}
                className="flex items-center gap-2 transition-all"
                style={{ color: isCollected ? '#D32F2F' : '#666' }}
              >
                <Star
                  className="w-4 h-4"
                  fill={isCollected ? '#D32F2F' : 'none'}
                />
                <span className="text-xs" style={{ fontFamily: '"Source Han Serif CN", serif' }}>
                  {isCollected ? '已收藏' : '收藏进卷宗'}
                </span>
              </button>
              <button
                onClick={() => handleAction('taste')}
                className="flex items-center gap-2 transition-all"
                style={{ color: isTasted ? '#D32F2F' : '#666' }}
              >
                <Check
                  className="w-4 h-4"
                  style={{ opacity: isTasted ? 1 : 0.5 }}
                />
                <span className="text-xs" style={{ fontFamily: '"Source Han Serif CN", serif' }}>
                  {isTasted ? '已品鉴' : '标记品鉴过'}
                </span>
              </button>
            </div>

            {/* 客观描述 factual_desc */}
            {snack.description && (
              <div className="mb-6">
                <p 
                  className="text-sm leading-loose"
                  style={{ 
                    color: '#555555',
                    lineHeight: 1.8,
                    fontFamily: '"Source Han Serif CN", "Noto Serif SC", serif'
                  }}
                >
                  {snack.description}
                </p>
              </div>
            )}

            {/* 情绪回忆金句 nostalgic_quote */}
            {snack.memory && (
              <div 
                className="p-5 rounded-lg mb-6"
                style={{ 
                  backgroundColor: '#FFFBF0',
                  borderRadius: '8px'
                }}
              >
                <p 
                  className="text-sm leading-relaxed"
                  style={{ 
                    color: '#8B6914',
                    fontFamily: '"STKaiti", "KaiTi", "Source Han Serif CN", serif',
                    fontStyle: 'italic'
                  }}
                >
                  "{snack.memory}"
                </p>
              </div>
            )}

            {/* 分享按钮 */}
            <button
              onClick={() => setShowPoster(true)}
              className="w-full h-12 rounded-full flex items-center justify-center gap-2 transition-all"
              style={{ 
                backgroundColor: '#2C2C2C',
                color: 'white'
              }}
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">
                {language === 'zh' ? '生成分享海报' : 'Generate Poster'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Poster Generator */}
      {showPoster && snack && (
        <PosterGenerator
          snack={{
            id: snack.id,
            name: snack.name,
            nameEn: snack.nameEn,
            image: snack.image,
            description: snack.description,
            year: snack.year,
            brand: snack.brand,
            nostalgic_quote: snack.memory,
          }}
          isOpen={showPoster}
          onClose={() => setShowPoster(false)}
        />
      )}

      {/* 复古印章样式 */}
      <style>{`
        .retro-stamp {
          position: absolute;
          right: 30px;
          bottom: 100px;
          width: 85px;
          height: 85px;
          border: 4px solid #D32F2F;
          color: #D32F2F;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 900;
          font-family: "STKaiti", "KaiTi", serif;
          transform: rotate(-20deg);
          opacity: 0.85;
          pointer-events: none;
          text-shadow: 0 0 1px #D32F2F;
          box-shadow: inset 0 0 0 2px #D32F2F;
          z-index: 10;
        }
      `}</style>
    </div>
  );
}
