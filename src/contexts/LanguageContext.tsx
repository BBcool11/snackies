import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  zh: {
    // Navigation
    'nav.exhibition': '陈列室',
    'nav.exhibition_en': 'EXHIBITION',
    'nav.curation': '主题策展',
    'nav.curation_en': 'CURATION',
    'nav.traces': '时代留痕',
    'nav.traces_en': 'TRACES',
    'nav.archive': '私人卷宗',
    'nav.archive_en': 'ARCHIVE',
    'nav.guest_log': '访客登记',
    'nav.guest_log_en': 'GUEST LOG',
    'nav.search_placeholder': '在陈列室里搜索...',
    
    // Exhibition
    'exhibition.title': '陈列室',
    'exhibition.subtitle': '每一件展品，都是一段无法复制的时光',
    'exhibition.stats': '当前陈列 {count} 件展品',
    'exhibition.archive_version': 'Archive v2.4',
    
    // Filters
    'filter.all': '全部',
    'filter.80s': '80年代',
    'filter.90s': '90年代',
    'filter.00s': '00年代',
    'filter.10s': '2010年后',
    'filter.spicy': '辣',
    'filter.sweet': '甜',
    'filter.salty': '咸',
    'filter.sour': '酸',
    'filter.puffed': '膨化',
    'filter.drink': '饮料',
    'filter.available': '在售',
    'filter.discontinued': '停产',
    'filter.rare': '绝版',
    'filter.sort_newest': '最新收录',
    'filter.sort_price_asc': '价格从低到高',
    'filter.sort_price_desc': '价格从高到低',
    'filter.sort_era': '年代排序',
    
    // Snack Card
    'snack.collect': '收录',
    'snack.collected': '已收录',
    'snack.taste': '品鉴',
    'snack.tasted': '已品鉴',
    'snack.discontinued': '已停产',
    'snack.locked': '联络主理人以解锁',
    
    // Modal
    'modal.collection_no': '藏品编号',
    'modal.price_ref': '参考价格',
    'modal.collect_to_archive': '收录进卷宗',
    'modal.mark_tasted': '标记品鉴过',
    'modal.archive_info': '展品档案',
    'modal.launch_year': '上市年代',
    'modal.origin': '原产地',
    'modal.spec': '规格类型',
    'modal.retail_price': '参考零售价',
    'modal.status': '当前状态',
    'modal.status_available': '在售',
    'modal.status_discontinued': '已停产',
    'modal.status_rare': '绝版',
    'modal.collectors': '人收录',
    'modal.tasters': '人品鉴',
    'modal.login_tip': '请先登记入馆',
    
    // Curation
    'curation.title': '主题策展',
    'curation.subtitle': '每一场展览，是一段集体记忆的切片',
    'curation.enter': '进入展览',
    'curation.items_count': '收录 {count} 件展品',
    'curation.curator_note': '馆长说',
    'curation.curator_letter_title': '致正在看展的你：',
    
    // Traces
    'traces.title': '时代留痕',
    'traces.subtitle': '每一条留言，是时间轴上的一个坐标',
    'traces.empty': '暂无该年代的留言',
    'traces.be_first': '成为第一个留下记忆的人',
    'traces.expand': '展开',
    'traces.collapse': '收起',
    'traces.share': '分享',
    'traces.post_placeholder': '写下你的风味坐标...',
    'traces.select_snack': '选择关联的零食',
    'traces.publish': '发布',
    'traces.post': '留下记忆',
    'traces.emotion.nostalgic': '怀念',
    'traces.emotion.happy': '开心',
    'traces.emotion.healing': '治愈',
    'traces.emotion.addictive': '上头',
    'traces.emotion.surprised': '惊喜',
    
    // Archive
    'archive.title': '私人卷宗',
    'archive.flavor_profile': '风味画像',
    'archive.my_collection': '我的收录',
    'archive.my_tasted': '我的品鉴',
    'archive.empty_collection': '还没有收录任何零食',
    'archive.empty_tasted': '还没有品鉴过任何零食',
    'archive.explore': '去陈列室探索更多展品',
    'archive.contact_curator': '联络馆长',
    'archive.export_profile': '导出画像至 𝕏',
    'archive.edit_nickname': '编辑昵称',
    'archive.edit_bio': '编辑签名',
    'archive.change_avatar': '更换头像',
    
    // Chat
    'chat.title': '展馆茶室',
    'chat.title_en': 'THE LOUNGE',
    'chat.online_count': '{count} 人在线',
    'chat.placeholder': '说点什么...',
    'chat.enter_message': '{user} 进入了展馆茶室',
    'chat.leave_message': '{user} 离开了展馆茶室',
    
    // Wishlist
    'wishlist.title': '我想找一款',
    'wishlist.placeholder': '写下你想找的零食名字，越详细越好',
    'wishlist.description': '补充描述（包装颜色、年代、在哪里吃过）',
    'wishlist.submit': '提交',
    'wishlist.success': '已加入心愿档案',
    'wishlist.my_wishes': '我的心愿档案',
    'wishlist.status_pending': '待寻找',
    'wishlist.status_found': '已收录',
    'wishlist.status_unavailable': '暂无资料',
    
    // Common
    'common.close': '关闭',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.loading': '加载中...',
  },
  en: {
    // Navigation
    'nav.exhibition': 'Exhibition',
    'nav.exhibition_en': 'EXHIBITION',
    'nav.curation': 'Curation',
    'nav.curation_en': 'CURATION',
    'nav.traces': 'Traces',
    'nav.traces_en': 'TRACES',
    'nav.archive': 'Archive',
    'nav.archive_en': 'ARCHIVE',
    'nav.guest_log': 'Sign In',
    'nav.guest_log_en': 'SIGN IN',
    'nav.search_placeholder': 'Search the exhibition...',
    
    // Exhibition
    'exhibition.title': 'Exhibition',
    'exhibition.subtitle': 'Every artifact is a moment that cannot be replicated',
    'exhibition.stats': 'Currently displaying {count} artifacts',
    'exhibition.archive_version': 'Archive v2.4',
    
    // Filters
    'filter.all': 'All',
    'filter.80s': '80s',
    'filter.90s': '90s',
    'filter.00s': '00s',
    'filter.10s': '2010s+',
    'filter.spicy': 'Spicy',
    'filter.sweet': 'Sweet',
    'filter.salty': 'Salty',
    'filter.sour': 'Sour',
    'filter.puffed': 'Puffed',
    'filter.drink': 'Drinks',
    'filter.available': 'Available',
    'filter.discontinued': 'Discontinued',
    'filter.rare': 'Rare',
    'filter.sort_newest': 'Newest',
    'filter.sort_price_asc': 'Price: Low to High',
    'filter.sort_price_desc': 'Price: High to Low',
    'filter.sort_era': 'By Era',
    
    // Snack Card
    'snack.collect': 'Collect',
    'snack.collected': 'Collected',
    'snack.taste': 'Taste',
    'snack.tasted': 'Tasted',
    'snack.discontinued': 'Discontinued',
    'snack.locked': 'Contact curator to unlock',
    
    // Modal
    'modal.collection_no': 'No.',
    'modal.price_ref': 'Reference Price',
    'modal.collect_to_archive': 'Add to Archive',
    'modal.mark_tasted': 'Mark as Tasted',
    'modal.archive_info': 'Artifact Archive',
    'modal.launch_year': 'Launch Year',
    'modal.origin': 'Origin',
    'modal.spec': 'Specification',
    'modal.retail_price': 'Retail Price',
    'modal.status': 'Status',
    'modal.status_available': 'Available',
    'modal.status_discontinued': 'Discontinued',
    'modal.status_rare': 'Rare',
    'modal.collectors': 'collectors',
    'modal.tasters': 'tasters',
    'modal.login_tip': 'Please sign in first',
    
    // Curation
    'curation.title': 'Curation',
    'curation.subtitle': 'Every exhibition is a slice of collective memory',
    'curation.enter': 'Enter Exhibition',
    'curation.items_count': '{count} artifacts',
    'curation.curator_note': 'From the Curator',
    'curation.curator_letter_title': 'To you, the visitor:',
    
    // Traces
    'traces.title': 'Traces',
    'traces.subtitle': 'Every message is a coordinate on the timeline',
    'traces.empty': 'No messages for this era yet',
    'traces.be_first': 'Be the first to leave a memory',
    'traces.expand': 'Expand',
    'traces.collapse': 'Collapse',
    'traces.share': 'Share',
    'traces.post_placeholder': 'Write your flavor coordinate...',
    'traces.select_snack': 'Select a snack',
    'traces.publish': 'Publish',
    'traces.post': 'Leave a Memory',
    'traces.emotion.nostalgic': 'Nostalgic',
    'traces.emotion.happy': 'Happy',
    'traces.emotion.healing': 'Healing',
    'traces.emotion.addictive': 'Addictive',
    'traces.emotion.surprised': 'Surprised',
    
    // Archive
    'archive.title': 'Personal Archive',
    'archive.flavor_profile': 'Flavor Profile',
    'archive.my_collection': 'My Collection',
    'archive.my_tasted': 'My Tasted',
    'archive.empty_collection': 'No snacks collected yet',
    'archive.empty_tasted': 'No snacks tasted yet',
    'archive.explore': 'Explore more in the exhibition',
    'archive.contact_curator': 'Contact Curator',
    'archive.export_profile': 'Export to 𝕏',
    'archive.edit_nickname': 'Edit nickname',
    'archive.edit_bio': 'Edit bio',
    'archive.change_avatar': 'Change avatar',
    
    // Chat
    'chat.title': 'The Lounge',
    'chat.title_en': 'THE LOUNGE',
    'chat.online_count': '{count} online',
    'chat.placeholder': 'Say something...',
    'chat.enter_message': '{user} entered the lounge',
    'chat.leave_message': '{user} left the lounge',
    
    // Wishlist
    'wishlist.title': 'Request a Snack',
    'wishlist.placeholder': 'Write the snack name you are looking for...',
    'wishlist.description': 'Additional details (color, era, where you had it)',
    'wishlist.submit': 'Submit',
    'wishlist.success': 'Added to wishlist',
    'wishlist.my_wishes': 'My Wishlist',
    'wishlist.status_pending': 'Pending',
    'wishlist.status_found': 'Found',
    'wishlist.status_unavailable': 'Unavailable',
    
    // Common
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
  },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh');

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'zh' ? 'en' : 'zh'));
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: string) => {
      return translations[language][key] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{ language, toggleLanguage, setLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
