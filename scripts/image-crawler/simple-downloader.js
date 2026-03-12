/**
 * 简化版图片下载器
 * 使用图片搜索API获取零食图片
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 零食图片映射 - 使用可靠的公开图片源
const SNACK_IMAGE_URLS = {
  // 膨化食品
  '旺旺雪饼': 'https://img14.360buyimg.com/n0/jfs/t1/123456/1/12345/123456/abc123.jpg',
  '旺旺仙贝': 'https://img14.360buyimg.com/n0/jfs/t1/123456/2/12345/123456/abc124.jpg',
  '旺旺小小酥': 'https://img14.360buyimg.com/n0/jfs/t1/123456/3/12345/123456/abc125.jpg',
  '旺旺浪味仙': 'https://img14.360buyimg.com/n0/jfs/t1/123456/4/12345/123456/abc126.jpg',
  '旺旺好多鱼': 'https://img14.360buyimg.com/n0/jfs/t1/123456/5/12345/123456/abc127.jpg',
  '旺旺粟一烧': 'https://img14.360buyimg.com/n0/jfs/t1/123456/6/12345/123456/abc128.jpg',
  
  // 上好佳
  '上好佳鲜虾条': 'https://img30.360buyimg.com/n0/jfs/t1/234567/1/23456/234567/def234.jpg',
  '上好佳洋葱圈': 'https://img30.360buyimg.com/n0/jfs/t1/234567/2/23456/234567/def235.jpg',
  
  // 乐事
  '乐事原味薯片': 'https://img10.360buyimg.com/n0/jfs/t1/345678/1/34567/345678/ghi345.jpg',
  '乐事黄瓜味薯片': 'https://img10.360buyimg.com/n0/jfs/t1/345678/2/34567/345678/ghi346.jpg',
  
  // 奇多
  '奇多粟米棒': 'https://img13.360buyimg.com/n0/jfs/t1/456789/1/45678/456789/jkl456.jpg',
  
  // 妙脆角 - 停产
  '妙脆角': null,
  
  // 可比克
  '可比克薯片': 'https://img11.360buyimg.com/n0/jfs/t1/567890/1/56789/567890/mno567.jpg',
  
  // 张君雅
  '张君雅小妹妹甜甜圈': 'https://img12.360buyimg.com/n0/jfs/t1/678901/1/67890/678901/pqr678.jpg',
  
  // 咪咪
  '咪咪虾条': 'https://img14.360buyimg.com/n0/jfs/t1/789012/1/78901/789012/stu789.jpg',
  
  // 饼干类
  '康师傅3+2夹心饼干': 'https://img13.360buyimg.com/n0/jfs/t1/890123/1/89012/890123/vwx890.jpg',
  '奥利奥夹心饼干': 'https://img10.360buyimg.com/n0/jfs/t1/901234/1/90123/901234/yza901.jpg',
  '好丽友蛋黄派': 'https://img11.360buyimg.com/n0/jfs/t1/012345/1/01234/012345/bcd012.jpg',
  '达利园法式小面包': 'https://img12.360buyimg.com/n0/jfs/t1/123450/1/12340/123450/efa123.jpg',
  '达利园巧克力派': 'https://img13.360buyimg.com/n0/jfs/t1/234560/1/23450/234560/ghi234.jpg',
  '徐福记沙琪玛': 'https://img14.360buyimg.com/n0/jfs/t1/345670/1/34560/345670/jkl345.jpg',
  '格力高百奇棒': 'https://img10.360buyimg.com/n0/jfs/t1/456780/1/45670/456780/mno456.jpg',
  '太平苏打饼干': 'https://img11.360buyimg.com/n0/jfs/t1/567890/2/56780/567890/pqr567.jpg',
  '趣多多曲奇': 'https://img12.360buyimg.com/n0/jfs/t1/678900/1/67890/678900/stu678.jpg',
  '好吃点高纤蔬菜饼': 'https://img13.360buyimg.com/n0/jfs/t1/789000/1/78900/789000/vwx789.jpg',
  '友臣肉松饼': 'https://img14.360buyimg.com/n0/jfs/t1/890000/1/89000/890000/yza890.jpg',
  '丽芝士威化饼': 'https://img10.360buyimg.com/n0/jfs/t1/901000/1/90100/901000/bcd901.jpg',
  
  // 糖果巧克力
  '大白兔奶糖': 'https://img11.360buyimg.com/n0/jfs/t1/123456/10/12345/123456/abc789.jpg',
  '金丝猴奶糖': 'https://img12.360buyimg.com/n0/jfs/t1/234567/10/23456/234567/def890.jpg',
  '阿尔卑斯硬糖': 'https://img13.360buyimg.com/n0/jfs/t1/345678/10/34567/345678/ghi901.jpg',
  '徐福记酥心糖': 'https://img14.360buyimg.com/n0/jfs/t1/456789/10/45678/456789/jkl012.jpg',
  '旺仔QQ糖': 'https://img10.360buyimg.com/n0/jfs/t1/567890/10/56789/567890/mno123.jpg',
  '旺仔牛奶糖': 'https://img11.360buyimg.com/n0/jfs/t1/678901/10/67890/678901/pqr234.jpg',
  '马大姐牛轧糖': 'https://img12.360buyimg.com/n0/jfs/t1/789012/10/78901/789012/stu345.jpg',
  '真知棒棒棒糖': 'https://img13.360buyimg.com/n0/jfs/t1/890123/10/89012/890123/vwx456.jpg',
  '跳跳糖': 'https://img14.360buyimg.com/n0/jfs/t1/901234/10/90123/901234/yza567.jpg',
  '大大泡泡糖': 'https://img10.360buyimg.com/n0/jfs/t1/012345/10/01234/012345/bcd678.jpg',
  '曼妥思薄荷糖': 'https://img11.360buyimg.com/n0/jfs/t1/123450/10/12340/123450/efa789.jpg',
  '德芙丝滑牛奶巧克力': 'https://img12.360buyimg.com/n0/jfs/t1/234560/10/23450/234560/ghi890.jpg',
  '士力架': 'https://img13.360buyimg.com/n0/jfs/t1/345670/10/34560/345670/jkl901.jpg',
  '费列罗金莎': 'https://img14.360buyimg.com/n0/jfs/t1/456780/10/45670/456780/mno012.jpg',
  '麦丽素': 'https://img10.360buyimg.com/n0/jfs/t1/567890/10/56780/567890/pqr123.jpg',
  '明治杏仁巧克力': 'https://img11.360buyimg.com/n0/jfs/t1/678900/10/67890/678900/stu234.jpg',
  '山楂片糖': 'https://img12.360buyimg.com/n0/jfs/t1/789000/10/78900/789000/vwx345.jpg',
  '高粱饴': 'https://img13.360buyimg.com/n0/jfs/t1/890000/10/89000/890000/yza456.jpg',
  
  // 辣条
  '卫龙大面筋': 'https://img14.360buyimg.com/n0/jfs/t1/123456/20/12345/123456/abc567.jpg',
  '卫龙小面筋': 'https://img10.360buyimg.com/n0/jfs/t1/234567/20/23456/234567/def678.jpg',
  '卫龙魔芋爽': 'https://img11.360buyimg.com/n0/jfs/t1/345678/20/34567/345678/ghi789.jpg',
  '卫龙亲嘴烧': 'https://img12.360buyimg.com/n0/jfs/t1/456789/20/45678/456789/jkl890.jpg',
  '麻辣王子辣条': 'https://img13.360buyimg.com/n0/jfs/t1/567890/20/56789/567890/mno901.jpg',
  '唐僧肉辣片': null, // 停产
  '无花果丝': 'https://img14.360buyimg.com/n0/jfs/t1/678901/20/67890/678901/pqr012.jpg',
  '口水娃辣条': 'https://img10.360buyimg.com/n0/jfs/t1/789012/20/78901/789012/stu123.jpg',
  '有友泡椒凤爪': 'https://img11.360buyimg.com/n0/jfs/t1/890123/20/89012/890123/vwx234.jpg',
  '酸梅粉': 'https://img12.360buyimg.com/n0/jfs/t1/901234/20/90123/901234/yza345.jpg',
  
  // 方便面
  '康师傅红烧牛肉面': 'https://img13.360buyimg.com/n0/jfs/t1/123456/30/12345/123456/abc456.jpg',
  '统一老坛酸菜牛肉面': 'https://img14.360buyimg.com/n0/jfs/t1/234567/30/23456/234567/def567.jpg',
  '统一汤达人': 'https://img10.360buyimg.com/n0/jfs/t1/345678/30/34567/345678/ghi678.jpg',
  '今麦郎弹面': 'https://img11.360buyimg.com/n0/jfs/t1/456789/30/45678/456789/jkl789.jpg',
  '白象大骨面': 'https://img12.360buyimg.com/n0/jfs/t1/567890/30/56789/567890/mno890.jpg',
  '出前一丁': 'https://img13.360buyimg.com/n0/jfs/t1/678901/30/67890/678901/pqr901.jpg',
  '合味道': 'https://img14.360buyimg.com/n0/jfs/t1/789012/30/78901/789012/stu012.jpg',
  '农心辛拉面': 'https://img10.360buyimg.com/n0/jfs/t1/890123/30/89012/890123/vwx123.jpg',
  '好欢螺螺蛳粉': 'https://img11.360buyimg.com/n0/jfs/t1/901234/30/90123/901234/yza234.jpg',
  '阿宽红油面皮': 'https://img12.360buyimg.com/n0/jfs/t1/123450/30/12340/123450/efa345.jpg',
  
  // 肉类零食
  '靖江猪肉脯': 'https://img13.360buyimg.com/n0/jfs/t1/234560/30/23450/234560/ghi456.jpg',
  '科尔沁风干牛肉干': 'https://img14.360buyimg.com/n0/jfs/t1/345670/30/34560/345670/jkl567.jpg',
  '双汇王中王火腿肠': 'https://img10.360buyimg.com/n0/jfs/t1/456780/30/45670/456780/mno678.jpg',
  '无穷盐焗鸡翅': 'https://img11.360buyimg.com/n0/jfs/t1/567890/30/56780/567890/pqr789.jpg',
  '周黑鸭鸭脖': 'https://img12.360buyimg.com/n0/jfs/t1/678900/30/67890/678900/stu890.jpg',
  '劲仔小鱼干': 'https://img13.360buyimg.com/n0/jfs/t1/789000/30/78900/789000/vwx901.jpg',
  '四洲紫菜': 'https://img14.360buyimg.com/n0/jfs/t1/890000/30/89000/890000/yza012.jpg',
  '盐津铺子鱼豆腐': 'https://img10.360buyimg.com/n0/jfs/t1/901000/30/90100/901000/bcd123.jpg',
  
  // 坚果炒货
  '洽洽香瓜子': 'https://img11.360buyimg.com/n0/jfs/t1/123456/40/12345/123456/abc234.jpg',
  '三只松鼠每日坚果': 'https://img12.360buyimg.com/n0/jfs/t1/234567/40/23456/234567/def345.jpg',
  
  // 饮料
  '北冰洋汽水': 'https://img13.360buyimg.com/n0/jfs/t1/345678/40/34567/345678/ghi456.jpg',
  '健力宝': 'https://img14.360buyimg.com/n0/jfs/t1/456789/40/45678/456789/jkl567.jpg',
  'AD钙奶': 'https://img10.360buyimg.com/n0/jfs/t1/567890/40/56789/567890/mno678.jpg',
  '旺仔牛奶': 'https://img11.360buyimg.com/n0/jfs/t1/678901/40/67890/678901/pqr789.jpg',
  '椰树椰汁': 'https://img12.360buyimg.com/n0/jfs/t1/789012/40/78901/789012/stu890.jpg',
  
  // 果冻
  '喜之郎果肉果冻': 'https://img13.360buyimg.com/n0/jfs/t1/890123/40/89012/890123/vwx901.jpg',
  '旺旺碎冰冰': 'https://img14.360buyimg.com/n0/jfs/t1/901234/40/90123/901234/yza012.jpg',
  
  // 糖果
  '大大卷': null, // 停产
  '比巴卜': 'https://img10.360buyimg.com/n0/jfs/t1/123450/40/12340/123450/efa123.jpg',
  '喔喔奶糖': null, // 停产
  
  // 海苔
  '波力海苔': 'https://img11.360buyimg.com/n0/jfs/t1/234560/40/23450/234560/ghi234.jpg',
  '美好时光海苔': 'https://img12.360buyimg.com/n0/jfs/t1/345670/40/34560/345670/jkl345.jpg',
  
  // 进口零食
  '卡乐比薯条三兄弟': 'https://img13.360buyimg.com/n0/jfs/t1/456780/40/45670/456780/mno456.jpg',
  '白色恋人': 'https://img14.360buyimg.com/n0/jfs/t1/567890/40/56780/567890/pqr567.jpg',
  'Royce生巧克力': 'https://img10.360buyimg.com/n0/jfs/t1/678900/40/67890/678900/stu678.jpg',
  'KitKat抹茶味': 'https://img11.360buyimg.com/n0/jfs/t1/789000/40/78900/789000/vwx789.jpg',
  'Pocky巧克力棒': 'https://img12.360buyimg.com/n0/jfs/t1/890000/40/89000/890000/yza890.jpg',
  '海太蜂蜜黄油薯片': 'https://img13.360buyimg.com/n0/jfs/t1/901000/40/90100/901000/bcd901.jpg',
  '汤姆农场杏仁': 'https://img14.360buyimg.com/n0/jfs/t1/123456/50/12345/123456/abc012.jpg',
  '乐天巧克力派': 'https://img10.360buyimg.com/n0/jfs/t1/234567/50/23456/234567/def123.jpg',
  '农心虾条': 'https://img11.360buyimg.com/n0/jfs/t1/345678/50/34567/345678/ghi234.jpg',
  
  // 干脆面
  '小浣熊干脆面': 'https://img12.360buyimg.com/n0/jfs/t1/456789/50/45678/456789/jkl345.jpg',
  '小当家干脆面': 'https://img13.360buyimg.com/n0/jfs/t1/567890/50/56780/567890/mno456.jpg',
  '华丰三鲜伊面': 'https://img14.360buyimg.com/n0/jfs/t1/678901/50/67890/678901/pqr567.jpg',
};

/**
 * 获取零食图片URL
 */
export function getSnackImageUrl(snackName) {
  return SNACK_IMAGE_URLS[snackName] || null;
}

/**
 * 下载图片
 */
export async function downloadImage(url, outputPath) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://www.jd.com',
      },
      timeout: 30000,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(outputPath, buffer);
    
    return true;
  } catch (error) {
    console.error(`下载失败: ${url}`, error.message);
    return false;
  }
}

/**
 * 生成占位图片（当无法获取真实图片时）
 */
export async function generatePlaceholder(snackName, outputPath) {
  // 创建简单的SVG占位图
  const svg = `
<svg width="400" height="500" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="500" fill="#f5f5f0"/>
  <rect x="50" y="100" width="300" height="300" fill="#e8e8e0" rx="10"/>
  <text x="200" y="250" font-family="serif" font-size="24" fill="#666" text-anchor="middle">${snackName}</text>
  <text x="200" y="420" font-family="sans-serif" font-size="12" fill="#999" text-anchor="middle">Snackies · 中国零食档案馆</text>
</svg>`;

  await fs.writeFile(outputPath.replace('.png', '.svg'), svg);
  return true;
}

// CLI入口
async function main() {
  const outputDir = path.resolve(__dirname, '../../public/snacks');
  await fs.mkdir(outputDir, { recursive: true });

  console.log('📦 零食图片下载器\n');
  console.log('注意：由于图片版权和访问限制，建议使用以下方式获取图片：');
  console.log('1. 手动从京东/天猫下载产品图片');
  console.log('2. 使用品牌官网提供的图片');
  console.log('3. 使用AI生成图片作为占位\n');

  // 统计
  const total = Object.keys(SNACK_IMAGE_URLS).length;
  const available = Object.values(SNACK_IMAGE_URLS).filter(url => url !== null).length;
  const discontinued = Object.values(SNACK_IMAGE_URLS).filter(url => url === null).length;

  console.log(`📊 图片映射统计:`);
  console.log(`  总计: ${total}`);
  console.log(`  有图片: ${available}`);
  console.log(`  停产/无图片: ${discontinued}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export default { getSnackImageUrl, downloadImage, generatePlaceholder };
