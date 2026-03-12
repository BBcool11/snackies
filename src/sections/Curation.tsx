import { useState, useMemo } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { curations, snacks } from '@/data/snacks';
import { SnackCard } from '@/components/SnackCard';
import { SnackModal } from '@/components/SnackModal';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Curation as CurationType, Snack } from '@/types';

export function Curation() {
  const { t, language } = useLanguage();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedCuration, setSelectedCuration] = useState<CurationType | null>(null);
  const [selectedSnack, setSelectedSnack] = useState<Snack | null>(null);
  const [isSnackModalOpen, setIsSnackModalOpen] = useState(false);
  const [userCollection, setUserCollection] = useState<string[]>(['001', '003']);
  const [userTasted, setUserTasted] = useState<string[]>(['002', '004']);

  const handleCollect = (id: string) => {
    setUserCollection((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      return [...prev, id];
    });
  };

  const handleTaste = (id: string) => {
    setUserTasted((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      return [...prev, id];
    });
  };

  const handleSnackClick = (snack: Snack) => {
    setSelectedSnack(snack);
    setIsSnackModalOpen(true);
  };

  const getThemeColor = (theme: string) => {
    const colors: Record<string, string> = {
      era: 'bg-orange-50/50',
      extinct: 'bg-slate-100/50',
      flavor: 'bg-red-50/50',
      drinks: 'bg-cyan-50/50',
      lifestyle: 'bg-amber-50/50',
      region: 'bg-purple-50/50',
      category: 'bg-green-50/50',
      brand: 'bg-blue-50/50',
    };
    return colors[theme] || 'bg-card-bg';
  };

  return (
    <div className="min-h-screen pt-14">
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="font-serif-cn text-[28px] md:text-[32px] text-ink">
            {t('curation.title')}
          </h1>
          <p className="font-serif-cn text-[14px] text-secondary-text mt-2">
            {t('curation.subtitle')}
          </p>
        </div>

        {/* Curation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {curations.map((curation) => (
            <div
              key={curation.id}
              className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                getThemeColor(curation.theme)
              } ${hoveredId === curation.id ? '-translate-y-1 shadow-lg' : ''}`}
              onMouseEnter={() => setHoveredId(curation.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setSelectedCuration(curation)}
            >
              {/* Image Stack */}
              <div className="relative h-48 overflow-hidden p-6">
                <div className="relative w-full h-full flex items-center justify-center">
                  {curation.snackImages.map((img: string, index: number) => (
                    <div
                      key={index}
                      className={`absolute w-24 h-32 transition-all duration-300 ${
                        hoveredId === curation.id
                          ? 'translate-x-0'
                          : index === 0
                          ? '-translate-x-8 -rotate-6'
                          : index === 1
                          ? 'translate-x-0 rotate-0'
                          : 'translate-x-8 rotate-6'
                      }`}
                      style={{
                        zIndex: curation.snackImages.length - index,
                        left: `calc(50% - 48px + ${(index - 1) * 20}px)`,
                      }}
                    >
                      <img
                        src={img}
                        alt=""
                        className={`w-full h-full object-contain contact-shadow ${
                          curation.isDiscontinuedTheme ? 'grayscale' : ''
                        }`}
                        onError={(e) => {
                          // FIX: 2026-03 使用统一占位图，禁止用emoji或相似图片替代
                          (e.target as HTMLImageElement).src = '/assets/snack-placeholder.svg';
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Discontinued Stamp */}
                {curation.isDiscontinuedTheme && (
                  <div className="absolute top-4 right-4">
                    <span className="stamp-discontinued">{t('snack.discontinued')}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 pt-2">
                <h3 className="font-serif-cn text-[16px] text-ink mb-2">
                  {language === 'zh' ? curation.title : curation.subtitle}
                </h3>
                <p className="font-serif-cn text-[12px] text-secondary-text italic mb-4 line-clamp-2">
                  {language === 'zh' ? curation.description : curation.descriptionEn}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-mono-num text-[10px] text-tertiary-text">
                    {t('curation.items_count').replace('{count}', curation.snackCount.toString())}
                  </span>
                  <div
                    className={`flex items-center gap-1 text-[11px] font-serif-cn text-secondary-text transition-all ${
                      hoveredId === curation.id ? 'translate-x-1 text-ink' : ''
                    }`}
                  >
                    {t('curation.enter')}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Curation Detail Modal */}
      {selectedCuration && (
        <CurationDetail
          curation={selectedCuration}
          userCollection={userCollection}
          userTasted={userTasted}
          onCollect={handleCollect}
          onTaste={handleTaste}
          onClose={() => setSelectedCuration(null)}
          onSnackClick={handleSnackClick}
        />
      )}

      {/* Snack Detail Modal */}
      <SnackModal
        snack={selectedSnack}
        isOpen={isSnackModalOpen}
        onClose={() => {
          setIsSnackModalOpen(false);
          setSelectedSnack(null);
        }}
        onCollect={handleCollect}
        onTaste={handleTaste}
        isCollected={selectedSnack ? userCollection.includes(selectedSnack.id) : false}
        isTasted={selectedSnack ? userTasted.includes(selectedSnack.id) : false}
      />
    </div>
  );
}

interface CurationDetailProps {
  curation: CurationType;
  userCollection: string[];
  userTasted: string[];
  onCollect: (id: string) => void;
  onTaste: (id: string) => void;
  onClose: () => void;
  onSnackClick: (snack: Snack) => void;
}

function CurationDetail({
  curation,
  userCollection,
  userTasted,
  onCollect,
  onTaste,
  onClose,
  onSnackClick,
}: CurationDetailProps) {
  const { language } = useLanguage();

  // FIX: 2026-03 使用策展数据中的snackIds获取准确展品，禁止动态筛选导致的不确定性
  const curationSnacks = useMemo(() => {
    // 优先使用 snackIds 获取准确的展品
    if (curation.snackIds && curation.snackIds.length > 0) {
      const snackIdSet = new Set(curation.snackIds.map(id => String(id)));
      return snacks.filter(s => snackIdSet.has(s.id));
    }
    
    // 备用：通过 theme 筛选（向后兼容）
    let filtered = [...snacks];
    
    switch (curation.theme) {
      case 'extinct':
        filtered = filtered.filter(s => s.status === 'discontinued' || s.status === 'rare');
        break;
      case 'flavor':
        if (curation.title.includes('辣')) {
          filtered = filtered.filter(s => s.flavor_category === 'spicy' || s.name.includes('辣'));
        }
        break;
      case 'drinks':
        filtered = filtered.filter(s => s.category === 'beverage');
        break;
      case 'era':
        if (curation.title.includes('90')) {
          filtered = filtered.filter(s => s.era === '90年代' || s.era === '90s');
        }
        break;
      case 'region':
        filtered = filtered.filter(s => ['Japan', 'Korea', 'Taiwan', 'HongKong'].includes(s.origin || ''));
        break;
      case 'category':
        if (curation.title.includes('螺蛳粉') || curation.title.includes('粉面')) {
          filtered = filtered.filter(s => s.category === 'luosifen' || s.name.includes('粉') || s.name.includes('面'));
        } else if (curation.title.includes('糖') || curation.title.includes('甜')) {
          filtered = filtered.filter(s => s.flavor_category === 'sweet');
        }
        break;
      case 'lifestyle':
        if (curation.title.includes('速食') || curation.title.includes('泡面')) {
          filtered = filtered.filter(s => s.category === 'instant_noodle' || s.category === 'self_heating');
        }
        break;
    }
    
    return filtered.slice(0, curation.snackCount || 8);
  }, [curation]);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />

      {/* Content */}
      <div className="relative min-h-screen bg-rice-paper">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-[110] w-10 h-10 flex items-center justify-center rounded-full bg-rice-paper/90 hover:bg-card-bg transition-colors shadow-lg"
        >
          <X className="w-5 h-5 text-secondary-text" />
        </button>

        {/* Hero Section - Background Snacks */}
        <div className="relative h-[40vh] flex items-center justify-center overflow-hidden">
          {/* Background Snacks */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-4 p-8 opacity-30">
              {curationSnacks.slice(0, 20).map((snack, index) => {
                const rotate = ((index * 15) % 30) - 15;
                const scale = 0.5 + ((index % 3) * 0.15);
                
                return (
                  <div
                    key={snack.id}
                    className="transition-all duration-700"
                    style={{
                      transform: `rotate(${rotate}deg) scale(${scale})`,
                      opacity: 0.4 + ((index % 4) * 0.15),
                    }}
                  >
                    <img
                      src={snack.image}
                      alt={snack.name}
                      className="w-20 h-28 object-contain contact-shadow"
                      onError={(e) => {
                        // FIX: 使用透明占位而非固定零食图，避免图文不符
                        (e.target as HTMLImageElement).style.opacity = '0';
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-rice-paper/60 via-rice-paper/80 to-rice-paper" />

          {/* Title Content */}
          <div className="relative z-10 text-center px-6 max-w-2xl">
            <h2 className="font-serif-cn text-[32px] md:text-[40px] text-ink mb-3">
              {language === 'zh' ? curation.title : curation.subtitle}
            </h2>
            <p className="font-serif-cn text-[13px] md:text-[15px] text-secondary-text leading-relaxed mb-4">
              {language === 'zh' ? curation.description : curation.descriptionEn}
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className="font-mono-num text-[12px] text-tertiary-text">
                收录 {curationSnacks.length} 件展品
              </span>
            </div>
          </div>
        </div>

        {/* Grid Section */}
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
          <div className="mb-6">
            <h3 className="font-serif-cn text-[18px] text-ink mb-2">
              {language === 'zh' ? '展览展品' : 'Exhibit Items'}
            </h3>
            <p className="font-serif-cn text-[12px] text-secondary-text">
              {language === 'zh' ? '本展览收录的所有零食，点击可查看详情' : 'All snacks in this exhibition, click for details'}
            </p>
          </div>

          {curationSnacks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {curationSnacks.map((snack) => (
                <SnackCard
                  key={snack.id}
                  snack={snack}
                  onClick={() => onSnackClick(snack)}
                  onCollect={onCollect}
                  onTaste={onTaste}
                  isCollected={userCollection.includes(snack.id)}
                  isTasted={userTasted.includes(snack.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="font-serif-cn text-[15px] text-secondary-text">
                {language === 'zh' ? '该分类下暂无展品' : 'No items in this category'}
              </p>
              <p className="font-sans text-[12px] text-tertiary-text mt-2">
                {language === 'zh' ? '敬请期待更多内容' : 'Stay tuned for more content'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
