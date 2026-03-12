import { useState } from 'react';
import { Star, Circle, Edit2, Check, X, ExternalLink } from 'lucide-react';
import { snacks, currentUser } from '@/data/snacks';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Snack } from '@/types';

interface ArchiveProps {
  userCollection: string[];
  userTasted: string[];
  onSnackClick?: (snack: Snack) => void;
}

// Wabi-sabi style avatar icons
const avatarIcons = [
  { id: 'popcorn', icon: '🍿', label: '爆米花' },
  { id: 'candy', icon: '🍬', label: '糖果' },
  { id: 'cookie', icon: '🍪', label: '饼干' },
  { id: 'chips', icon: '🥨', label: '脆片' },
  { id: 'icecream', icon: '🍦', label: '冰淇淋' },
  { id: 'donut', icon: '🍩', label: '甜甜圈' },
  { id: 'chocolate', icon: '🍫', label: '巧克力' },
  { id: 'lollipop', icon: '🍭', label: '棒棒糖' },
  { id: 'cake', icon: '🍰', label: '蛋糕' },
  { id: 'pudding', icon: '🍮', label: '布丁' },
  { id: 'honey', icon: '🍯', label: '蜂蜜' },
  { id: 'milk', icon: '🥛', label: '牛奶' },
];

export function Archive({ userCollection, userTasted, onSnackClick }: ArchiveProps) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'collection' | 'tasted'>('collection');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [userName, setUserName] = useState(currentUser.name);
  const [userBio, setUserBio] = useState(currentUser.bio || '');
  const [userAvatar, setUserAvatar] = useState(currentUser.avatar);



  const collectedSnacks = snacks.filter((s) => userCollection.includes(s.id));
  const tastedSnacks = snacks.filter((s) => userTasted.includes(s.id));

  return (
    <div className="min-h-screen pt-14">
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-baseline gap-3 mb-3">
            <h1 className="font-serif-cn text-[28px] md:text-[32px] text-ink">
              {t('archive.title')}
            </h1>
            <span className="font-sans text-[13px] tracking-nav text-tertiary-text">
              {t('nav.archive_en')}
            </span>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-card-bg rounded-3xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            {/* Avatar & Basic Info */}
            <div className="flex items-center gap-4">
              <div 
                className="relative w-16 h-16 md:w-20 md:h-20 bg-rice-paper rounded-2xl flex items-center justify-center text-4xl cursor-pointer hover:ring-2 hover:ring-ink/20 transition-all overflow-hidden"
                onClick={() => setShowAvatarPicker(true)}
              >
                {userAvatar.startsWith('http') ? (
                  <img 
                    src={userAvatar} 
                    alt="用户头像"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/snack-placeholder.svg';
                    }}
                  />
                ) : (
                  <span>{userAvatar}</span>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-card-bg rounded-full flex items-center justify-center">
                  <Edit2 className="w-3 h-3 text-tertiary-text" />
                </div>
              </div>
              <div>
                {isEditingName ? (
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                      className="bg-rice-paper rounded-lg px-3 py-1.5 text-[18px] font-serif-cn text-ink focus:outline-none focus:ring-1 focus:ring-ink/20"
                      autoFocus
                    />
                    <button onClick={() => setIsEditingName(false)} className="text-golden">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-serif-cn text-[20px] md:text-[24px] text-ink">
                      {userName}
                    </h2>
                    <button 
                      onClick={() => setIsEditingName(true)}
                      className="text-tertiary-text hover:text-ink transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                
                {isEditingBio ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={userBio}
                      onChange={(e) => setUserBio(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingBio(false)}
                      placeholder={language === 'zh' ? '写下你的个性签名...' : 'Write your bio...'}
                      className="bg-rice-paper rounded-lg px-3 py-1 text-[13px] font-serif-cn text-secondary-text focus:outline-none focus:ring-1 focus:ring-ink/20 w-full max-w-[250px]"
                      autoFocus
                    />
                    <button onClick={() => setIsEditingBio(false)} className="text-golden">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-serif-cn text-[13px] text-secondary-text">
                      {userBio || (language === 'zh' ? '点击编辑个性签名' : 'Click to edit bio')}
                    </p>
                    <button 
                      onClick={() => setIsEditingBio(true)}
                      className="text-tertiary-text hover:text-ink transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-2">
                  <span className="font-mono-num text-[12px] text-tertiary-text">
                    <span className="text-golden font-semibold">
                      {userCollection.length}
                    </span>{' '}
                    {language === 'zh' ? '收录' : 'collected'}
                  </span>
                  <span className="font-mono-num text-[12px] text-tertiary-text">
                    <span className="text-golden font-semibold">
                      {userTasted.length}
                    </span>{' '}
                    {language === 'zh' ? '品鉴' : 'tasted'}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Curator */}
            <div className="md:ml-auto">
              <a
                href="https://x.com/Zoe_iibb"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-rice-paper rounded-full text-[12px] font-serif-cn hover:bg-ink/90 transition-colors"
              >
                {t('archive.contact_curator')} 𝕏
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Avatar Picker Modal */}
        {showAvatarPicker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={() => setShowAvatarPicker(false)} />
            <div className="relative bg-rice-paper rounded-2xl p-6 shadow-2xl animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif-cn text-[14px] text-ink">{t('archive.change_avatar')}</h3>
                <button onClick={() => setShowAvatarPicker(false)}>
                  <X className="w-4 h-4 text-secondary-text" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {avatarIcons.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => {
                      setUserAvatar(avatar.icon);
                      setShowAvatarPicker(false);
                    }}
                    className={`w-14 h-14 bg-card-bg rounded-xl flex items-center justify-center text-2xl hover:bg-ink/5 transition-colors ${
                      userAvatar === avatar.icon ? 'ring-2 ring-cinnabar' : ''
                    }`}
                  >
                    {avatar.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6">
          <button
            onClick={() => setActiveTab('collection')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-serif-cn transition-colors ${
              activeTab === 'collection'
                ? 'bg-ink text-rice-paper'
                : 'text-secondary-text hover:text-ink'
            }`}
          >
            <Star className="w-4 h-4" />
            {t('archive.my_collection')}
            <span className="font-mono-num text-[11px] opacity-60">
              {collectedSnacks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tasted')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-serif-cn transition-colors ${
              activeTab === 'tasted'
                ? 'bg-ink text-rice-paper'
                : 'text-secondary-text hover:text-ink'
            }`}
          >
            <Circle className="w-4 h-4" />
            {t('archive.my_tasted')}
            <span className="font-mono-num text-[11px] opacity-60">
              {tastedSnacks.length}
            </span>
          </button>
        </div>

        {/* Snack Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {(activeTab === 'collection' ? collectedSnacks : tastedSnacks).map(
            (snack) => (
              <div
                key={snack.id}
                onClick={() => onSnackClick?.(snack)}
                className="product-card cursor-pointer"
              >
                <div className="relative aspect-square bg-card-bg rounded-2xl overflow-hidden p-4">
                  <img
                    src={snack.missing_image ? '/assets/snack-placeholder.svg' : snack.image}
                    alt={snack.name}
                    className="w-full h-full object-contain contact-shadow"
                    onError={(e) => {
                      // FIX: 2026-03 严格一对一映射，图片错误时统一使用占位图
                      // 禁止：emoji替代、相似图片兜底、热门图替换
                      (e.target as HTMLImageElement).src = '/assets/snack-placeholder.svg';
                    }}
                  />
                  {activeTab === 'collection' && (
                    <div className="absolute top-2 right-2">
                      <Star className="w-4 h-4 text-cinnabar fill-cinnabar" />
                    </div>
                  )}
                </div>
                <div className="px-1 py-3">
                  <h3 className="font-serif-cn text-[13px] text-ink truncate">
                    {snack.name}
                  </h3>
                  <p className="font-sans text-[11px] text-tertiary-text truncate mt-0.5">
                    {snack.brand}
                  </p>
                </div>
              </div>
            )
          )}
        </div>

        {/* Empty State */}
        {(activeTab === 'collection' ? collectedSnacks : tastedSnacks).length ===
          0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="font-serif-cn text-[15px] text-secondary-text">
              {activeTab === 'collection'
                ? t('archive.empty_collection')
                : t('archive.empty_tasted')}
            </p>
            <p className="font-sans text-[12px] text-tertiary-text mt-2">
              {t('archive.explore')}
            </p>
          </div>
        )}


      </main>
    </div>
  );
}
