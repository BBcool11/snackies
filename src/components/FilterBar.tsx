import type { EraFilter, StatusFilter } from '@/types';

interface FilterBarProps {
  eraFilter: EraFilter;
  categoryFilter: string;
  statusFilter: StatusFilter;
  onEraChange: (era: EraFilter) => void;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: StatusFilter) => void;
  totalCount: number;
  // FIX: 2026-03 添加真实统计数据，用于隐藏空分类
  categoryCounts?: Record<string, number>;
  statusCounts?: Record<string, number>;
}

export function FilterBar({
  eraFilter,
  categoryFilter,
  statusFilter,
  onEraChange,
  onCategoryChange,
  onStatusChange,
  totalCount,
  categoryCounts = {},
  statusCounts = {},
}: FilterBarProps) {

  // 年代筛选
  const eraOptions: { value: EraFilter; label: string }[] = [
    { value: 'all', label: '全部年代' },
    { value: '80s', label: '80年代' },
    { value: '90s', label: '90年代' },
    { value: '00s', label: '00年代' },
    { value: '10s', label: '10年代' },
  ];

  // 类别筛选 - 精简为酸/甜/辣三个口味维度
  const categoryOptions: { value: string; label: string; emoji?: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'sour', label: '酸', emoji: '🍋' },
    { value: 'sweet', label: '甜', emoji: '🍬' },
    { value: 'spicy', label: '辣', emoji: '🌶️' },
  ];

  // 状态筛选
  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: '全部状态' },
    { value: 'available', label: '在售' },
    { value: 'discontinued', label: '停产' },
    { value: 'rare', label: '稀有' },
  ];

  return (
    <div className="sticky top-14 z-[100] bg-rice-paper/95 backdrop-blur-nav border-b border-divider">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Filter Row - 使用 Grid 布局避免 overflow 裁剪 */}
        <div className="flex items-center gap-2">
          {/* Filter Pills - 可滚动区域 */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 flex-1 min-w-0">
            {/* Era Filters */}
            <div className="flex items-center gap-1.5 shrink-0">
              {eraOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onEraChange(option.value)}
                  className={`filter-pill whitespace-nowrap ${
                    eraFilter === option.value ? 'active' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="w-px h-4 bg-divider mx-2 shrink-0" />

            {/* Category Filters - FIX: 只显示有内容的分类 */}
            <div className="flex items-center gap-1.5 shrink-0">
              {categoryOptions
                .filter(option => option.value === 'all' || (categoryCounts[option.value] || 0) > 0)
                .map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onCategoryChange(option.value)}
                    className={`filter-pill whitespace-nowrap ${
                      categoryFilter === option.value ? 'active' : ''
                    }`}
                  >
                    {option.label}
                    {option.value !== 'all' && categoryCounts[option.value] > 0 && (
                      <span className="ml-1 text-[9px] opacity-60">({categoryCounts[option.value]})</span>
                    )}
                  </button>
                ))}
            </div>

            <div className="w-px h-4 bg-divider mx-2 shrink-0" />

            {/* Status Filters - FIX: 只显示有内容的状态 */}
            <div className="flex items-center gap-1.5 shrink-0">
              {statusOptions
                .filter(option => option.value === 'all' || (statusCounts[option.value] || 0) > 0)
                .map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onStatusChange(option.value)}
                    className={`filter-pill whitespace-nowrap ${
                      statusFilter === option.value ? 'active' : ''
                    }`}
                  >
                    {option.label}
                    {option.value !== 'all' && statusCounts[option.value] > 0 && (
                      <span className="ml-1 text-[9px] opacity-60">({statusCounts[option.value]})</span>
                    )}
                  </button>
                ))}
            </div>
          </div>


        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-2">
          <span className="font-mono-num text-[10px] text-tertiary-text uppercase tracking-widest">
            共收录 {totalCount} 件展品
          </span>
        </div>
      </div>
    </div>
  );
}
