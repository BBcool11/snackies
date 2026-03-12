/**
 * 图片爬虫配置
 * 定义图片来源、验证规则和爬虫行为
 */

export const CRAWLER_CONFIG = {
  // 请求配置
  request: {
    timeout: 30000,
    retries: 3,
    delay: {
      min: 1000,
      max: 3000,
    },
    userAgents: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    ],
  },

  // 图片来源优先级（从高到低）
  sources: {
    // 官方渠道 - 最高优先级
    official: [
      { name: 'brand_website', weight: 100 },
      { name: 'jd_official', weight: 95 },
      { name: 'tmall_flagship', weight: 95 },
    ],
    // 电商平台
    ecommerce: [
      { name: 'jd', weight: 85 },
      { name: 'tmall', weight: 85 },
      { name: 'taobao', weight: 75 },
      { name: 'pdd', weight: 60 },
    ],
    // 资讯/评测网站
    info: [
      { name: 'xiaohongshu', weight: 50 },
      { name: 'douyin', weight: 45 },
    ],
  },

  // 图片质量要求
  imageQuality: {
    minWidth: 400,
    minHeight: 400,
    maxWidth: 2000,
    maxHeight: 2000,
    formats: ['jpg', 'jpeg', 'png', 'webp'],
    minFileSize: 10240, // 10KB
    maxFileSize: 5242880, // 5MB
  },

  // 验证配置
  validation: {
    // OCR验证
    ocr: {
      enabled: true,
      minConfidence: 0.6,
      keywords: ['brand', 'product', 'weight'],
    },
    // 置信度阈值
    confidenceThresholds: {
      high: 0.85,    // 高置信度 - 自动通过
      medium: 0.65,  // 中置信度 - 需要二次验证
      low: 0.45,     // 低置信度 - 需要人工审核
    },
  },

  // 输出配置
  output: {
    dir: '../../public/snacks',
    naming: 'snack-{id}.png',
    backupDir: './backups',
  },

  // 品牌官网映射
  brandWebsites: {
    '旺旺集团': 'https://www.want-want.com',
    '上好佳': 'https://www.oishi.com.cn',
    '百事食品': 'https://www.pepsico.com.cn',
    '达利食品集团': 'https://www.daligroup.com',
    '统一企业': 'https://www.uni-president.com.cn',
    '康师傅控股': 'https://www.masterkong.com.cn',
    '江崎格力高': 'https://www.glico.com.cn',
    '亿滋（卡夫）': 'https://www.mondelezinternational.com',
    '好丽友': 'https://www.orion.cn',
    '徐福记': 'https://www.hsu-fu-chi.com',
    '卫龙食品': 'https://www.weilongshipin.com',
    '上海冠生园': 'https://www.guanshengyuan.com',
    '金丝猴集团': 'https://www.jinsihou.com',
    '玛氏': 'https://www.mars.com',
    '费列罗': 'https://www.ferrero.com',
    '明治': 'https://www.meiji.co.jp',
    '雀巢': 'https://www.nestle.com.cn',
    '双汇集团': 'https://www.shuanghui.net',
    '三只松鼠': 'https://www.3songshu.com',
    '洽洽食品': 'https://www.qiaqiafood.com',
    '白象食品': 'https://www.baixiangfood.com',
    '今麦郎食品': 'https://www.jinmailang.com',
    '日清食品': 'https://www.nissin.com.cn',
    '农心': 'https://www.nongshim.com',
    '好欢螺': 'https://www.haohuanluo.com',
    '北冰洋': 'https://www.bingyang.com.cn',
    '健力宝': 'https://www.jianlibao.com.cn',
    '娃哈哈': 'https://www.wahaha.com',
    '喜之郎': 'https://www.xizhilang.com',
  },

  // 电商平台搜索模板
  searchTemplates: {
    jd: 'https://search.jd.com/Search?keyword={keyword}&enc=utf-8',
    tmall: 'https://list.tmall.com/search_product.htm?q={keyword}',
    taobao: 'https://s.taobao.com/search?q={keyword}',
  },
};

// 零食图片搜索关键词生成器
export function generateSearchKeywords(snack) {
  const keywords = [];
  
  // 主关键词
  keywords.push(`${snack.brand} ${snack.name}`);
  keywords.push(snack.name);
  
  // 品牌关键词
  if (snack.brandEn) {
    keywords.push(`${snack.brandEn} ${snack.nameEn}`);
  }
  
  // 类别关键词
  keywords.push(`${snack.category} ${snack.name}`);
  
  // 年代关键词（用于怀旧零食）
  if (['80s', '90s'].includes(snack.era)) {
    keywords.push(`怀旧零食 ${snack.name}`);
    keywords.push(`童年零食 ${snack.name}`);
  }
  
  return keywords;
}

// 图片URL验证规则
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  // 检查URL格式
  try {
    new URL(url);
  } catch {
    return false;
  }
  
  // 检查是否是图片URL
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
  const hasImageExtension = imageExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  );
  
  // 检查是否是CDN图片（可能没有扩展名）
  const isCdnImage = /\.(jd|tmall|taobao|alicdn|qpic|sinaimg)\./.test(url);
  
  // 排除无效URL
  const invalidPatterns = [
    'data:image',
    'javascript:',
    'about:',
    'blob:',
  ];
  const isInvalid = invalidPatterns.some(pattern => url.includes(pattern));
  
  return (hasImageExtension || isCdnImage) && !isInvalid;
}

// 获取robots.txt URL
export function getRobotsUrl(baseUrl) {
  try {
    const url = new URL(baseUrl);
    return `${url.protocol}//${url.hostname}/robots.txt`;
  } catch {
    return null;
  }
}
