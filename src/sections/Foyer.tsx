import { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { snacks } from '@/data/snacks';
import { CuratorNote } from '@/components/CuratorNote';
import { ArrowRight } from 'lucide-react';
import type { ViewType, Snack } from '@/types';

interface FoyerProps {
  onEnterMuseum: () => void;
  onViewChange?: (view: ViewType) => void;
}

// Grid 配置：11列 x 7行，挖空中心区域
const GRID_COLS = 11;
const GRID_ROWS = 7;
const CENTER_EMPTY_COLS = [4, 5, 6, 7]; // 第4-8列（索引从0开始）
const CENTER_EMPTY_ROWS = [2, 3, 4];    // 第3-5行

export function Foyer({ onEnterMuseum }: FoyerProps) {
  const { language } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 生成背景网格数据：中心区域挖空，热门零食占30%穿插
  const gridItems = useMemo(() => {
    const items = [];
    let cellIndex = 0;
    
    // 分离怀旧零食和热门零食
    const nostalgicSnacks = snacks.filter(s => s.isNostalgic);
    const trendingSnacks = snacks.filter(s => s.isHot);
    
    // 计算需要填充的单元格数量（排除中心空区域）
    const totalCells = GRID_COLS * GRID_ROWS;
    const emptyCells = CENTER_EMPTY_COLS.length * CENTER_EMPTY_ROWS.length;
    const snackCells = totalCells - emptyCells;
    
    // 30% 热门零食，70% 怀旧零食
    const trendingTarget = Math.floor(snackCells * 0.3);
    
    // 创建混合数组：随机穿插但保持30/70比例
    const mixedSnacks: Snack[] = [];
    let trendingIndex = 0;
    let nostalgicIndex = 0;
    
    for (let i = 0; i < snackCells; i++) {
      // 前30%位置放热门零食（分散穿插）
      const shouldUseTrending = i % 3 === 0 && trendingIndex < trendingTarget;
      
      if (shouldUseTrending && trendingIndex < trendingSnacks.length) {
        mixedSnacks.push(trendingSnacks[trendingIndex % trendingSnacks.length]);
        trendingIndex++;
      } else {
        mixedSnacks.push(nostalgicSnacks[nostalgicIndex % nostalgicSnacks.length]);
        nostalgicIndex++;
      }
    }
    
    // 打乱顺序使分布更自然（Fisher-Yates算法）
    for (let i = mixedSnacks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mixedSnacks[i], mixedSnacks[j]] = [mixedSnacks[j], mixedSnacks[i]];
    }
    
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const isCenterEmpty = CENTER_EMPTY_COLS.includes(col) && CENTER_EMPTY_ROWS.includes(row);
        
        if (isCenterEmpty) {
          // 中心区域：空占位
          items.push({
            type: 'empty' as const,
            id: `empty-${row}-${col}`,
            row,
            col,
          });
        } else {
          // 其他区域：零食图片（按混合比例）
          const snack = mixedSnacks[cellIndex % mixedSnacks.length];
          items.push({
            type: 'snack' as const,
            id: `snack-${row}-${col}-${snack.id}-${cellIndex}`,
            row,
            col,
            snack,
            // 轻微的伪随机偏移，保持整齐但有呼吸感
            offset: {
              scale: 0.75 + ((cellIndex * 7) % 20) / 100,
            }
          });
          cellIndex++;
        }
      }
    }
    return items;
  }, []);

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ backgroundColor: '#f8f8f6' }}>
      {/* ========== 背景层：Grid布局，中心挖空 ========== */}
      <div className="homepage-bg">
        <div 
          className="bg-grid-container"
          style={{
            opacity: isLoaded ? 0.55 : 0, // 整体降低透明度，不喧宾夺主
            transition: 'opacity 1s ease-out',
          }}
        >
          {gridItems.map((item) => {
            if (item.type === 'empty') {
              // 中心空区域：透明占位
              return (
                <div
                  key={item.id}
                  className="bg-grid-empty"
                  style={{
                    gridColumn: item.col + 1,
                    gridRow: item.row + 1,
                  }}
                />
              );
            }
            
            // 零食项
            const isHovered = hoveredId === item.id;
            return (
              <div
                key={item.id}
                className="bg-snack-item"
                style={{
                  gridColumn: item.col + 1,
                  gridRow: item.row + 1,
                  transform: `scale(${isHovered ? 1.12 : item.offset.scale})`,
                  opacity: isHovered ? 0.9 : 1,
                  transition: 'all 0.4s ease',
                  zIndex: isHovered ? 10 : 1,
                }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <img
                  src={item.snack.missing_image ? '/assets/snack-placeholder.svg' : item.snack.image}
                  alt=""
                  className="bg-snack-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/snack-placeholder.svg';
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ========== 前景层：标题和按钮（放置在视觉中心）========== */}
      <div 
        className="hero-content"
        style={{
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease-out 0.3s',
        }}
      >
        {/* 标题区域 */}
        <div className="text-center mb-8">
          {/* 中文主标题 */}
          <h1 
            className="hero-title"
            style={{
              fontFamily: '"Source Han Serif CN", "Noto Serif SC", serif',
            }}
          >
            Snackies
          </h1>
          
          {/* 英文副标题 */}
          <p 
            className="hero-subtitle"
            style={{ fontFamily: '"DM Sans", sans-serif' }}
          >
            Chinese Snack Museum
          </p>
          
          {/* 馆长便签 */}
          <div className="mb-10 flex justify-center">
            <CuratorNote />
          </div>
          
          {/* 进入按钮 */}
          <button
            onClick={onEnterMuseum}
            className="enter-btn"
            style={{
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            }}
          >
            <span 
              className="enter-btn-text"
              style={{ fontFamily: '"Source Han Serif CN", serif' }}
            >
              {language === 'zh' ? '进入陈列室' : 'Enter Exhibition'}
            </span>
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        {/* 统计数字 */}
        <div 
          className="stats-bar"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.8s ease-out 0.6s',
          }}
        >
          <div>
            <div className="stats-number" style={{ fontFamily: '"DM Sans", sans-serif' }}>
              {snacks.length}
            </div>
            <div className="stats-label">
              {language === 'zh' ? '件展品' : 'Exhibits'}
            </div>
          </div>
          <div className="stats-divider" />
          <div>
            <div className="stats-number" style={{ fontFamily: '"DM Sans", sans-serif' }}>
              6
            </div>
            <div className="stats-label">
              {language === 'zh' ? '大主题' : 'Themes'}
            </div>
          </div>
          <div className="stats-divider" />
          <div>
            <div className="stats-number" style={{ fontFamily: '"DM Sans", sans-serif' }}>
              3
            </div>
            <div className="stats-label">
              {language === 'zh' ? '种状态' : 'Statuses'}
            </div>
          </div>
        </div>
      </div>

      {/* 悬浮零食提示 */}
      {hoveredId && (
        <div className="hover-tooltip">
          <span className="hover-tooltip-text">
            {gridItems.find(i => i.id === hoveredId)?.type === 'snack' 
              ? (gridItems.find(i => i.id === hoveredId) as any)?.snack?.name 
              : ''}
          </span>
        </div>
      )}

      {/* 强制CSS样式 */}
      <style>{`
        /* 背景墙容器 - 纯色背景，无遮罩 */
        .homepage-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
          overflow: hidden;
          background-color: #f8f8f6;
          /* 完全移除 mask-image 遮罩 */
        }

        /* Grid布局容器 - 固定行列 */
        .bg-grid-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 95vw;
          height: 95vh;
          display: grid;
          grid-template-columns: repeat(11, 1fr);
          grid-template-rows: repeat(7, 1fr);
          gap: 20px;
          padding: 20px;
        }

        /* 中心空区域 */
        .bg-grid-empty {
          visibility: hidden;
        }

        /* 单个零食项 */
        .bg-snack-item {
          display: flex;
          align-items: center;
          justify-content: center;
          will-change: transform;
        }

        /* 零食图片 */
        .bg-snack-img {
          width: 85%;
          height: 85%;
          object-fit: contain;
          pointer-events: none;
          filter: drop-shadow(0 3px 6px rgba(0,0,0,0.08));
        }

        /* 前景内容层 */
        .hero-content {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 1rem;
        }

        /* 主标题样式 */
        .hero-title {
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 700;
          color: #1A1A18;
          margin-bottom: 1.5rem;
          letter-spacing: 0.08em;
        }

        /* 副标题样式 */
        .hero-subtitle {
          font-size: clamp(0.9rem, 2.5vw, 1.5rem);
          letter-spacing: 0.35em;
          color: #6B6B65;
          text-transform: uppercase;
          margin-bottom: 2.5rem;
        }

        /* 进入按钮 */
        .enter-btn {
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 2.5rem;
          background-color: #1A1A18;
          color: #FAFAF8;
          border-radius: 9999px;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .enter-btn:hover {
          background-color: #0F0F0E;
          transform: scale(1.05);
          box-shadow: 0 15px 50px rgba(0,0,0,0.25);
        }

        .enter-btn-text {
          font-size: 1rem;
          letter-spacing: 0.15em;
          font-weight: 500;
        }

        /* 统计栏 */
        .stats-bar {
          position: absolute;
          bottom: 3rem;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          gap: 3rem;
          text-align: center;
        }

        .stats-number {
          font-size: 2rem;
          font-weight: 700;
          color: #1A1A18;
        }

        .stats-label {
          font-size: 0.75rem;
          color: #6B6B65;
          margin-top: 0.25rem;
          letter-spacing: 0.1em;
        }

        .stats-divider {
          width: 1px;
          height: 3rem;
          background-color: #E8E8E4;
        }

        /* 悬浮提示 */
        .hover-tooltip {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          padding: 0.5rem 1rem;
          background-color: rgba(255,255,255,0.95);
          backdrop-filter: blur(4px);
          border-radius: 9999px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          pointer-events: none;
        }

        .hover-tooltip-text {
          font-size: 0.875rem;
          color: #1A1A18;
          font-weight: 500;
        }

        /* 响应式调整 */
        @media (max-width: 1024px) {
          .bg-grid-container {
            width: 98vw;
            height: 98vh;
            gap: 12px;
            padding: 12px;
          }
        }

        @media (max-width: 768px) {
          .bg-grid-container {
            grid-template-columns: repeat(7, 1fr);
            grid-template-rows: repeat(9, 1fr);
            gap: 8px;
            padding: 8px;
          }
          
          /* 移动端调整中心空区域 */
          .bg-grid-empty {
            display: none;
          }
          
          .stats-bar {
            gap: 1.5rem;
          }
          
          .stats-number {
            font-size: 1.5rem;
          }
          
          .hero-title {
            font-size: clamp(2rem, 10vw, 3.5rem);
          }
        }
      `}</style>
    </div>
  );
}
