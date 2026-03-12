import { useState, useMemo } from 'react';
// Plus icon removed
import { SnackCard } from '@/components/SnackCard';
import { SnackModal } from '@/components/SnackModal';
import { FilterBar } from '@/components/FilterBar';
import { WishlistModal } from '@/components/WishlistModal';
import { snacks } from '@/data/snacks';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Snack, EraFilter, StatusFilter } from '@/types';

// Tab type removed

interface ExhibitionProps {
  userCollection: string[];
  userTasted: string[];
  onCollect: (id: string) => void;
  onTaste: (id: string) => void;
}

export function Exhibition({
  userCollection,
  userTasted,
  onCollect,
  onTaste,
}: ExhibitionProps) {
  const { t } = useLanguage();
  const [selectedSnack, setSelectedSnack] = useState<Snack | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [eraFilter, setEraFilter] = useState<EraFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const filteredSnacks = useMemo(() => {
    let result = [...snacks];

    // 年代筛选
    if (eraFilter !== 'all') {
      result = result.filter((s) => s.era === eraFilter);
    }

    // 类别筛选 - 使用口味分类（酸/甜/辣）
    if (categoryFilter !== 'all') {
      result = result.filter((s) => s.flavor_category === categoryFilter);
    }

    // 状态筛选 - 在售/绝版/停产（数据库使用英文status）
    if (statusFilter !== 'all') {
      const statusMap: Record<string, string> = {
        'available': 'on_sale',
        'discontinued': 'discontinued', 
        'rare': 'rare'
      };
      result = result.filter((s) => s.status === statusMap[statusFilter]);
    }

    // 排序：按年代排序（80s -> 90s -> 00s -> 10s）
    const eraOrder = ['80s', '90s', '00s', '10s'];
    result.sort((a, b) => eraOrder.indexOf(a.era) - eraOrder.indexOf(b.era));

    return result;
  }, [eraFilter, categoryFilter, statusFilter]);

  // FIX: 2026-03 使用真实数据查询，禁止编造统计数字
  const availableCount = snacks.filter(s => s.status === 'on_sale').length;
  const discontinuedCount = snacks.filter(s => s.status === 'discontinued').length;
  const rareCount = snacks.filter(s => s.status === 'rare').length;
  
  // 分类统计（用于FilterBar隐藏空分类）
  const categoryCounts = {
    sour: snacks.filter(s => s.flavor_category === 'sour').length,
    sweet: snacks.filter(s => s.flavor_category === 'sweet').length,
    spicy: snacks.filter(s => s.flavor_category === 'spicy').length,
  };
  
  // 状态统计（用于FilterBar隐藏空状态）
  const statusCounts = {
    available: availableCount,
    discontinued: discontinuedCount,
    rare: rareCount,
  };

  const handleSnackClick = (snack: Snack) => {
    setSelectedSnack(snack);
    setIsModalOpen(true);
  };

  // Tab buttons removed as per user request

  return (
    <div className="min-h-screen pt-14">
      {/* Page Header */}
      <div className="bg-rice-paper border-b border-divider">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="font-serif-cn text-[28px] md:text-[32px] text-ink">
            {t('exhibition.title')}
          </h1>
          <p className="font-serif-cn text-[14px] text-secondary-text mt-2">
            {t('exhibition.subtitle')}
          </p>
          {/* 状态分类统计 - FIX: 只显示有内容的分类 */}
          <div className="flex items-center gap-4 mt-4">
            {availableCount > 0 && (
              <>
                <span className="font-mono-num text-[11px] text-tertiary-text">
                  在售: {availableCount} 件
                </span>
                <span className="w-px h-3 bg-divider" />
              </>
            )}
            {discontinuedCount > 0 && (
              <>
                <span className="font-mono-num text-[11px] text-tertiary-text">
                  停产: {discontinuedCount} 件
                </span>
                <span className="w-px h-3 bg-divider" />
              </>
            )}
            {rareCount > 0 && (
              <span className="font-mono-num text-[11px] text-tertiary-text">
                稀有: {rareCount} 件
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        eraFilter={eraFilter}
        categoryFilter={categoryFilter}
        statusFilter={statusFilter}
        onEraChange={setEraFilter}
        onCategoryChange={setCategoryFilter}
        onStatusChange={setStatusFilter}
        totalCount={filteredSnacks.length}
        categoryCounts={categoryCounts}
        statusCounts={statusCounts}
      />

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        {/* Archive Version -->
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono-num text-[10px] text-tertiary-text/60 uppercase tracking-widest">
            {t('exhibition.archive_version')}
          </span>
          <span className="font-mono-num text-[11px] text-tertiary-text">
            {filteredSnacks.length} 件展品
          </span>
        </div>

        {/* Grid */}
        {filteredSnacks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
            {filteredSnacks.map((snack) => (
              <SnackCard
                key={snack.id}
                snack={snack}
                onClick={() => handleSnackClick(snack)}
                onCollect={onCollect}
                onTaste={onTaste}
                isCollected={userCollection.includes(snack.id)}
                isTasted={userTasted.includes(snack.id)}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <p className="font-serif-cn text-[15px] text-secondary-text">
              未找到符合条件的展品
            </p>
            <p className="font-sans text-[12px] text-tertiary-text mt-2">
              尝试调整筛选条件
            </p>
            <button
              onClick={() => {
                setEraFilter('all');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-ink text-rice-paper rounded-full text-[12px] font-serif-cn hover:bg-ink/90 transition-colors"
            >
              清除筛选条件
            </button>
          </div>
        )}
      </main>

      {/* Snack Modal */}
      <SnackModal
        snack={selectedSnack}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSnack(null);
        }}
        onCollect={onCollect}
        onTaste={onTaste}
        isCollected={selectedSnack ? userCollection.includes(selectedSnack.id) : false}
        isTasted={selectedSnack ? userTasted.includes(selectedSnack.id) : false}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />
    </div>
  );
}
