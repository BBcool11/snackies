/**
 * 基于图片文件名特征生成静态映射
 * 不需要 API 密钥
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 零食数据
const snacksData = [
  { id: '001', name: '卫龙大面筋', category: '辣条' },
  { id: '002', name: '卫龙小面筋', category: '辣条' },
  { id: '003', name: '亲嘴烧', category: '辣条' },
  { id: '004', name: '麻辣王子', category: '辣条' },
  { id: '005', name: '翻天娃', category: '辣条' },
  { id: '006', name: '唐僧肉', category: '辣条' },
  { id: '007', name: '香菇肥牛', category: '素肉' },
  { id: '008', name: '北京烤鸭', category: '素肉' },
  { id: '009', name: '留香展翅', category: '素肉' },
  { id: '010', name: '牛仔骨', category: '素肉' },
  { id: '011', name: '火爆鸡筋', category: '辣条' },
  { id: '012', name: '臭干子', category: '辣条' },
  { id: '013', name: '泡椒牛板筋', category: '辣条' },
  { id: '014', name: '素大刀肉', category: '辣条' },
  { id: '015', name: '麻辣片', category: '辣条' },
  { id: '016', name: '霸王丝', category: '辣条' },
  { id: '017', name: 'KK星', category: '辣条' },
  { id: '018', name: '猪宝贝', category: '辣条' },
  { id: '019', name: '牛板筋', category: '辣条' },
  { id: '020', name: '酒鬼辣条', category: '辣条' },
  { id: '021', name: '嘴巴香', category: '辣条' },
  { id: '022', name: 'kk星辣条', category: '辣条' },
  { id: '023', name: '小滑头', category: '辣条' },
  { id: '024', name: '绿爽', category: '辣条' },
  { id: '025', name: '印度飞饼', category: '辣条' },
  { id: '026', name: '斑马肉', category: '辣条' },
  { id: '027', name: '葫芦丝', category: '辣条' },
  { id: '028', name: '虾扯蛋', category: '辣条' },
  { id: '029', name: '飘飘香', category: '辣条' },
  { id: '030', name: '花蝴蝶', category: '辣条' },
  { id: '031', name: '乐事原味薯片', category: '膨化' },
  { id: '032', name: '乐事黄瓜味薯片', category: '膨化' },
  { id: '033', name: '乐事青柠味薯片', category: '膨化' },
  { id: '034', name: '可比克原味薯片', category: '膨化' },
  { id: '035', name: '上好佳鲜虾片', category: '膨化' },
  { id: '036', name: '上好佳洋葱圈', category: '膨化' },
  { id: '037', name: '浪味仙', category: '膨化' },
  { id: '038', name: '旺旺仙贝', category: '膨化' },
  { id: '039', name: '旺旺雪饼', category: '膨化' },
  { id: '040', name: '咪咪虾条', category: '膨化' },
  { id: '041', name: '蟹味粒', category: '膨化' },
  { id: '042', name: '妙脆角', category: '膨化' },
  { id: '043', name: '奇多', category: '膨化' },
  { id: '044', name: '呀土豆', category: '膨化' },
  { id: '045', name: '薯愿', category: '膨化' },
  { id: '046', name: '好友趣', category: '膨化' },
  { id: '047', name: '多力多滋', category: '膨化' },
  { id: '048', name: '粟米条', category: '膨化' },
  { id: '049', name: '爆米花', category: '膨化' },
  { id: '050', name: '小浣熊干脆面', category: '膨化' },
  { id: '051', name: '大白兔奶糖', category: '糖果' },
  { id: '052', name: '金丝猴奶糖', category: '糖果' },
  { id: '053', name: '阿尔卑斯', category: '糖果' },
  { id: '054', name: '德芙巧克力', category: '糖果' },
  { id: '055', name: '士力架', category: '糖果' },
  { id: '056', name: 'M&M豆', category: '糖果' },
  { id: '057', name: '彩虹糖', category: '糖果' },
  { id: '058', name: '跳跳糖', category: '糖果' },
  { id: '059', name: '口哨糖', category: '糖果' },
  { id: '060', name: '大大泡泡糖', category: '糖果' },
  { id: '061', name: '比巴卜', category: '糖果' },
  { id: '062', name: '真知棒', category: '糖果' },
  { id: '063', name: '阿尔卑斯棒棒糖', category: '糖果' },
  { id: '064', name: '不二家', category: '糖果' },
  { id: '065', name: '旺仔QQ糖', category: '糖果' },
  { id: '066', name: '喜之郎果冻', category: '糖果' },
  { id: '067', name: '亲亲果冻', category: '糖果' },
  { id: '068', name: '徐福记', category: '糖果' },
  { id: '069', name: '雅客', category: '糖果' },
  { id: '070', name: '马大姐', category: '糖果' },
  { id: '071', name: '奥利奥', category: '饼干' },
  { id: '072', name: '趣多多', category: '饼干' },
  { id: '073', name: '好吃点', category: '饼干' },
  { id: '074', name: '闲趣', category: '饼干' },
  { id: '075', name: '太平苏打', category: '饼干' },
  { id: '076', name: '3+2饼干', category: '饼干' },
  { id: '077', name: '好吃点高纤', category: '饼干' },
  { id: '078', name: '苏打饼干', category: '饼干' },
  { id: '079', name: '蛋黄派', category: '糕点' },
  { id: '080', name: '巧克力派', category: '糕点' },
  { id: '081', name: '达利园派', category: '糕点' },
  { id: '082', name: '法式小面包', category: '糕点' },
  { id: '083', name: '沙琪玛', category: '糕点' },
  { id: '084', name: '威化饼', category: '糕点' },
  { id: '085', name: '百奇', category: '饼干' },
  { id: '086', name: '百醇', category: '饼干' },
  { id: '087', name: '菜园小饼', category: '饼干' },
  { id: '088', name: '熊字饼', category: '饼干' },
  { id: '089', name: '手指饼', category: '饼干' },
  { id: '090', name: '钙奶饼干', category: '饼干' },
  { id: '091', name: '北冰洋', category: '饮料' },
  { id: '092', name: '健力宝', category: '饮料' },
  { id: '093', name: '娃哈哈', category: '饮料' },
  { id: '094', name: '爽歪歪', category: '饮料' },
  { id: '095', name: '营养快线', category: '饮料' },
  { id: '096', name: '冰红茶', category: '饮料' },
  { id: '097', name: '绿茶', category: '饮料' },
  { id: '098', name: '茉莉花茶', category: '饮料' },
  { id: '099', name: '王老吉', category: '饮料' },
  { id: '100', name: '加多宝', category: '饮料' },
];

// 特殊命名图片映射
const specialImageMap = {
  'arctic-ocean': '091',      // 北冰洋
  'jianlibao': '092',         // 健力宝
  'little-raccoon': '050',    // 小浣熊
  'lonely-god': '037',        // 浪味仙
  'mimi': '040',              // 咪咪虾条
  'pop-rocks': '058',         // 跳跳糖
  'want-want-senbei': '038',  // 旺旺仙贝
  'wei-long-latiao': '001',   // 卫龙辣条
  'white-rabbit': '051',      // 大白兔
};

// 扫描图片目录
const imagesDir = path.join(__dirname, '../public/snacks');
const files = fs.readdirSync(imagesDir)
  .filter(f => f.endsWith('.png') || f.endsWith('.jpg'));

// 生成映射
const mapping = {};
const processed = [];

// 处理特殊命名图片
for (const [fileName, dataId] of Object.entries(specialImageMap)) {
  const file = files.find(f => f.startsWith(fileName));
  if (file) {
    mapping[file.replace('.png', '').replace('.jpg', '')] = dataId;
    processed.push(file);
  }
}

// 处理 snack-xxx.png 格式的图片
const numberedFiles = files
  .filter(f => f.startsWith('snack-'))
  .sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || '0');
    const numB = parseInt(b.match(/\d+/)?.[0] || '0');
    return numA - numB;
  });

// 前100张图片默认按顺序映射
for (let i = 0; i < Math.min(numberedFiles.length, 100); i++) {
  const file = numberedFiles[i];
  const imageId = file.replace('snack-', '').replace('.png', '').replace('.jpg', '');
  
  // 如果还没有映射，按顺序映射
  if (!mapping[imageId]) {
    // 图片编号转数据ID（简单对应）
    const num = parseInt(imageId);
    if (num <= 100) {
      mapping[imageId] = String(num).padStart(3, '0');
    }
  }
}

// 保存映射文件
const output = {
  mapping,
  specialImages: specialImageMap,
  stats: {
    totalImages: files.length,
    mapped: Object.keys(mapping).length,
    special: Object.keys(specialImageMap).length,
    numbered: numberedFiles.length
  },
  generatedAt: new Date().toISOString(),
  note: '基于文件名特征生成的静态映射，需要人工核对修正'
};

const outputPath = path.join(__dirname, '../src/utils/imageMapping-generated.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log('✅ 静态映射生成完成！');
console.log(`📊 总图片: ${files.length}`);
console.log(`🔗 已映射: ${Object.keys(mapping).length}`);
console.log(`📝 特殊命名: ${Object.keys(specialImageMap).length}`);
console.log(`\n📁 文件保存至: ${outputPath}`);
console.log('\n⚠️  注意：这是基于文件名的初步映射，需要人工核对图文是否匹配！');
console.log('请查看图片内容，修正 imageMapping.json 中的错误对应关系。');
