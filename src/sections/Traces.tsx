import { useState } from 'react';
import { Heart, Share2, MessageCircle, PenLine, X, Search, Send } from 'lucide-react';
import { traces as initialTraces, snacks } from '@/data/snacks';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Trace, EraFilter } from '@/types';

interface TracesProps {
  onSnackClick?: (snackId: string) => void;
}

export function Traces({ onSnackClick }: TracesProps) {
  const { t } = useLanguage();
  const [eraFilter, setEraFilter] = useState<EraFilter>('all');
  const [emotionFilter, setEmotionFilter] = useState<string>('all');
  const [likedTraces, setLikedTraces] = useState<Set<string>>(new Set());
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [traces, setTraces] = useState<Trace[]>(initialTraces);
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const eraOptions: { value: EraFilter; label: string }[] = [
    { value: 'all', label: t('filter.all') },
    { value: '80s', label: t('filter.80s') },
    { value: '90s', label: t('filter.90s') },
    { value: '00s', label: t('filter.00s') },
  ];

  const emotionOptions: { value: string; label: string; emoji: string }[] = [
    { value: 'all', label: t('filter.all'), emoji: '✨' },
    { value: 'nostalgic', label: t('traces.emotion.nostalgic'), emoji: '🌙' },
    { value: 'happy', label: t('traces.emotion.happy'), emoji: '😊' },
    { value: 'healing', label: t('traces.emotion.healing'), emoji: '💝' },
    { value: 'addictive', label: t('traces.emotion.addictive'), emoji: '🔥' },
    { value: 'surprised', label: t('traces.emotion.surprised'), emoji: '✨' },
  ];

  const filteredTraces = traces.filter((trace) => {
    if (eraFilter !== 'all' && trace.era !== eraFilter) return false;
    if (emotionFilter !== 'all' && trace.emotion !== emotionFilter) return false;
    return true;
  });

  const handleLike = (traceId: string) => {
    setLikedTraces((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(traceId)) {
        newSet.delete(traceId);
      } else {
        newSet.add(traceId);
      }
      return newSet;
    });
  };

  const handlePostTrace = (newTrace: Trace) => {
    setTraces((prev) => [newTrace, ...prev]);
  };

  const handleTraceClick = (trace: Trace) => {
    setSelectedTrace(trace);
    setIsDetailModalOpen(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="min-h-screen pt-14">
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-serif-cn text-[28px] md:text-[32px] text-ink">
            {t('traces.title')}
          </h1>
          <p className="font-serif-cn text-[14px] text-secondary-text mt-2">
            {t('traces.subtitle')}
          </p>
        </div>

        {/* Post Button & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar">
            {eraOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setEraFilter(option.value)}
                className={`filter-pill whitespace-nowrap ${eraFilter === option.value ? 'active' : ''}`}
              >
                {option.label}
              </button>
            ))}
            <div className="w-px h-4 bg-divider mx-2" />
            {emotionOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setEmotionFilter(option.value)}
                className={`filter-pill whitespace-nowrap flex items-center gap-1.5 ${emotionFilter === option.value ? 'active' : ''}`}
              >
                <span>{option.emoji}</span>
                {option.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-ink text-rice-paper rounded-full text-[12px] font-serif-cn hover:bg-ink/90 transition-colors"
          >
            <PenLine className="w-3.5 h-3.5" />
            {t('traces.post')}
          </button>
        </div>

        {/* Traces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTraces.map((trace) => (
            <TraceCard
              key={trace.id}
              trace={trace}
              isLiked={likedTraces.has(trace.id)}
              onLike={() => handleLike(trace.id)}
              onSnackClick={() => onSnackClick?.(trace.snackId)}
              onTraceClick={() => handleTraceClick(trace)}
              formatDate={formatDate}
            />
          ))}
        </div>

        {filteredTraces.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <MessageCircle className="w-12 h-12 text-divider mb-4" />
            <p className="font-serif-cn text-[15px] text-secondary-text">{t('traces.empty')}</p>
            <p className="font-sans text-[12px] text-tertiary-text mt-2">{t('traces.be_first')}</p>
          </div>
        )}
      </main>

      {isPostModalOpen && (
        <PostTraceModal onClose={() => setIsPostModalOpen(false)} onPost={handlePostTrace} />
      )}

      {isDetailModalOpen && selectedTrace && (
        <TraceDetailModal
          trace={selectedTrace}
          isLiked={likedTraces.has(selectedTrace.id)}
          onLike={() => handleLike(selectedTrace.id)}
          onClose={() => { setIsDetailModalOpen(false); setSelectedTrace(null); }}
          onSnackClick={() => onSnackClick?.(selectedTrace.snackId)}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}

interface TraceCardProps {
  trace: Trace;
  isLiked: boolean;
  onLike: () => void;
  onSnackClick: () => void;
  onTraceClick: () => void;
  formatDate: (date: string) => string;
}

function TraceCard({ trace, isLiked, onLike, onSnackClick, onTraceClick, formatDate }: TraceCardProps) {
  const { t } = useLanguage();
  const emotionMap: Record<string, string> = {
    nostalgic: t('traces.emotion.nostalgic'),
    happy: t('traces.emotion.happy'),
    healing: t('traces.emotion.healing'),
    addictive: t('traces.emotion.addictive'),
    surprised: t('traces.emotion.surprised'),
  };

  return (
    <div 
      className="bg-card-bg rounded-2xl p-5 hover:-translate-y-0.5 transition-transform cursor-pointer"
      onClick={onTraceClick}
    >
      <div className="flex items-center gap-3 mb-4">
        <div onClick={(e) => { e.stopPropagation(); onSnackClick(); }} className="w-14 h-14 bg-rice-paper rounded-xl flex items-center justify-center overflow-hidden">
          <img src={trace.snackImage} alt={trace.snackName} className="w-10 h-10 object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 onClick={(e) => { e.stopPropagation(); onSnackClick(); }} className="font-serif-cn text-[13px] text-ink truncate hover:text-cinnabar transition-colors">
            {trace.snackName}
          </h4>
          <p className="font-sans text-[11px] text-tertiary-text truncate">{trace.snackBrand}</p>
        </div>
      </div>

      <p className="font-serif-cn text-[13px] text-secondary-text leading-relaxed mb-4 line-clamp-3">
        {trace.content}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-divider">
        <div className="flex items-center gap-3">
          <img src={trace.userAvatar} alt="头像" className="w-8 h-8 rounded-full object-cover border border-divider" />
          <span className="font-serif-cn text-[11px] text-secondary-text">{trace.userName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="era-tag text-[8px]">{emotionMap[trace.emotion]}</span>
          <span className="font-mono-num text-[10px] text-tertiary-text">{formatDate(trace.createdAt)}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3">
        <button onClick={(e) => { e.stopPropagation(); onLike(); }} className={`flex items-center gap-1.5 text-[11px] transition-colors ${isLiked ? 'text-cinnabar' : 'text-tertiary-text hover:text-ink'}`}>
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-cinnabar' : ''}`} />
          <span className="font-mono-num">{trace.likes + (isLiked ? 1 : 0)}</span>
        </button>
        <button onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-[11px] text-tertiary-text hover:text-ink transition-colors">
          <Share2 className="w-3.5 h-3.5" />
          <span className="font-serif-cn">{t('traces.share')}</span>
        </button>
      </div>
    </div>
  );
}

// Trace Detail Modal
interface TraceDetailModalProps {
  trace: Trace;
  isLiked: boolean;
  onLike: () => void;
  onClose: () => void;
  onSnackClick: () => void;
  formatDate: (date: string) => string;
}

function TraceDetailModal({ trace, isLiked, onLike, onClose, onSnackClick, formatDate }: TraceDetailModalProps) {
  const { t } = useLanguage();
  
  const emotionMap: Record<string, { label: string; emoji: string }> = {
    nostalgic: { label: t('traces.emotion.nostalgic'), emoji: '🌙' },
    happy: { label: t('traces.emotion.happy'), emoji: '😊' },
    healing: { label: t('traces.emotion.healing'), emoji: '💝' },
    addictive: { label: t('traces.emotion.addictive'), emoji: '🔥' },
    surprised: { label: t('traces.emotion.surprised'), emoji: '✨' },
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[600px] max-h-[85vh] bg-rice-paper rounded-2xl shadow-2xl overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-card-bg transition-colors">
          <X className="w-4 h-4 text-secondary-text" />
        </button>
        
        <div className="p-6 overflow-y-auto max-h-[85vh]">
          {/* Snack Info */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-card-bg rounded-xl">
            <div onClick={onSnackClick} className="w-16 h-16 bg-rice-paper rounded-xl flex items-center justify-center cursor-pointer overflow-hidden">
              <img src={trace.snackImage} alt={trace.snackName} className="w-12 h-12 object-contain" />
            </div>
            <div className="flex-1">
              <h3 onClick={onSnackClick} className="font-serif-cn text-[16px] text-ink cursor-pointer hover:text-cinnabar transition-colors">
                {trace.snackName}
              </h3>
              <p className="font-sans text-[12px] text-tertiary-text">{trace.snackBrand}</p>
            </div>
          </div>

          {/* Full Content */}
          <div className="mb-6">
            <p className="font-serif-cn text-[15px] text-ink leading-[2] whitespace-pre-wrap">
              {trace.content}
            </p>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 mb-6">
            <img src={trace.userAvatar} alt="头像" className="w-10 h-10 rounded-full object-cover border border-divider" />
            <div>
              <p className="font-serif-cn text-[14px] text-ink">{trace.userName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[12px]">{emotionMap[trace.emotion]?.emoji}</span>
                <span className="font-serif-cn text-[11px] text-tertiary-text">{emotionMap[trace.emotion]?.label}</span>
                <span className="font-mono-num text-[11px] text-tertiary-text">· {formatDate(trace.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-divider">
            <button onClick={onLike} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${isLiked ? 'bg-cinnabar/10 text-cinnabar' : 'bg-card-bg text-ink hover:bg-card-bg/80'}`}>
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-cinnabar' : ''}`} />
              <span className="font-mono-num text-[13px]">{trace.likes + (isLiked ? 1 : 0)}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-card-bg rounded-full text-ink hover:bg-card-bg/80 transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="font-serif-cn text-[13px]">{t('traces.share')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Post Trace Modal
interface PostTraceModalProps {
  onClose: () => void;
  onPost: (trace: Trace) => void;
}

function PostTraceModal({ onClose, onPost }: PostTraceModalProps) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSnack, setSelectedSnack] = typeof snacks !== 'undefined' ? useState<(typeof snacks)[0] | null>(null) : useState<any>(null);
  const [content, setContent] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<Trace['emotion']>('nostalgic');

  const filteredSnacks = searchQuery
    ? snacks.filter((s) => s.name.includes(searchQuery) || (s.brand && s.brand.includes(searchQuery)))
    : [];

  const emotions: { value: Trace['emotion']; label: string; emoji: string }[] = [
    { value: 'nostalgic', label: t('traces.emotion.nostalgic'), emoji: '🌙' },
    { value: 'happy', label: t('traces.emotion.happy'), emoji: '😊' },
    { value: 'healing', label: t('traces.emotion.healing'), emoji: '💝' },
    { value: 'addictive', label: t('traces.emotion.addictive'), emoji: '🔥' },
    { value: 'surprised', label: t('traces.emotion.surprised'), emoji: '✨' },
  ];

  const handleSubmit = () => {
    if (!selectedSnack || !content.trim()) return;
    
    const newTrace: Trace = {
      id: `t${Date.now()}`,
      snackId: selectedSnack.id,
      snackName: selectedSnack.name,
      snackBrand: selectedSnack.brand,
      snackImage: selectedSnack.image,
      userName: '我',
      userAvatar: '😊',
      content: content.trim(),
      era: selectedSnack.era,
      emotion: selectedEmotion,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    
    onPost(newTrace);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[480px] bg-rice-paper rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
          <h2 className="font-serif-cn text-[16px] text-ink">{language === 'zh' ? '留下你的风味坐标' : 'Leave Your Trace'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-card-bg transition-colors">
            <X className="w-4 h-4 text-secondary-text" />
          </button>
        </div>

        <div className="p-6">
          {selectedSnack ? (
            <div className="flex items-center gap-3 p-3 bg-card-bg rounded-xl mb-4">
              <img src={selectedSnack.image} alt={selectedSnack.name} className="w-12 h-12 object-contain" />
              <div className="flex-1">
                <p className="font-serif-cn text-[13px] text-ink">{selectedSnack.name}</p>
                <p className="font-sans text-[11px] text-tertiary-text">{selectedSnack.brand}</p>
              </div>
              <button onClick={() => setSelectedSnack(null)} className="text-tertiary-text hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary-text" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setIsSearching(e.target.value.length > 0); }}
                placeholder={t('traces.select_snack')}
                className="w-full bg-card-bg rounded-xl pl-11 pr-4 py-3 text-[14px] font-serif-cn text-ink placeholder:text-tertiary-text focus:outline-none focus:ring-1 focus:ring-ink/20"
              />
              {isSearching && filteredSnacks.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-rice-paper border border-divider rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
                  {filteredSnacks.slice(0, 5).map((snack) => (
                    <button
                      key={snack.id}
                      onClick={() => { setSelectedSnack(snack); setSearchQuery(''); setIsSearching(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-card-bg transition-colors"
                    >
                      <img src={snack.image} alt={snack.name} className="w-10 h-10 object-contain" />
                      <div className="text-left">
                        <p className="font-serif-cn text-[13px] text-ink">{snack.name}</p>
                        <p className="font-sans text-[11px] text-tertiary-text">{snack.brand}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('traces.post_placeholder')}
            maxLength={200}
            rows={4}
            className="w-full bg-card-bg rounded-xl px-4 py-3 text-[14px] font-serif-cn text-ink placeholder:text-tertiary-text focus:outline-none focus:ring-1 focus:ring-ink/20 resize-none mb-3"
          />
          <div className="flex justify-end mb-4">
            <span className="font-mono-num text-[10px] text-tertiary-text">{content.length}/200</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {emotions.map((emotion) => (
              <button
                key={emotion.value}
                onClick={() => setSelectedEmotion(emotion.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] transition-colors ${
                  selectedEmotion === emotion.value ? 'bg-ink text-rice-paper' : 'bg-card-bg text-secondary-text hover:text-ink'
                }`}
              >
                <span>{emotion.emoji}</span>
                <span className="font-serif-cn">{emotion.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedSnack || !content.trim()}
            className="w-full h-11 bg-cinnabar text-rice-paper rounded-full font-serif-cn text-[14px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cinnabar/90 transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {t('traces.publish')}
          </button>
        </div>
      </div>
    </div>
  );
}
