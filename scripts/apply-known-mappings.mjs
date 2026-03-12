/**
 * 应用已知的正确映射
 * 基于之前 OCR 成功识别的结果
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 基于 OCR 结果确认的映射
const knownMappings = {
  // 从之前的 OCR 结果中提取的准确映射
  "001": "091",  // 洽洽瓜子（五香口味）
  "002": "001",  // 卫龙大面筋
  "003": "039",  // 旺旺雪饼
  "005": "093",  // 娃哈哈 AD 钙奶
  "006": "037",  // 浪味仙
  "008": "036",  // 上好佳洋葱圈
  "010": "032",  // 乐事黄瓜味薯片
  "011": "048",  // 粟米条（奇多）
  "013": "037",  // 浪味仙
  "015": "040",  // 咪咪虾条
  "016": "076",  // 3+2饼干
  "019": "082",  // 法式小面包
  "023": "093",  // 娃哈哈
  "024": "051",  // 大白兔奶糖
  "028": "066",  // 喜之郎果冻
  "029": "052",  // 金丝猴奶糖
  "031": "035",  // 上好佳鲜虾片
  "033": "053",  // 阿尔卑斯
  "037": "060",  // 大大泡泡糖
  "038": "091",  // 北冰洋（橙子味汽水）
  "039": "054",  // 德芙巧克力
  "040": "055",  // 士力架
  "046": "001",  // 卫龙大面筋
  "047": "002",  // 卫龙小面筋
  "050": "004",  // 麻辣王子
  "051": "006",  // 唐僧肉
  // 更多映射可以继续添加
};

const outputPath = path.join(__dirname, '../src/utils/imageMapping-cloud.json');

// 读取现有映射（如果有）
let existingMapping = {};
try {
  const existing = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  existingMapping = existing.mapping || {};
} catch (e) {
  // 文件不存在或解析失败
}

// 合并映射
const mergedMapping = { ...existingMapping, ...knownMappings };

// 保存
const output = {
  mapping: mergedMapping,
  stats: {
    total: 328,
    matched: Object.keys(mergedMapping).length,
    unmatched: 328 - Object.keys(mergedMapping).length,
    method: 'known-mappings-applied',
    date: new Date().toISOString()
  }
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log('✅ 已应用已知正确映射');
console.log(`   总共: ${output.stats.total}`);
console.log(`   已映射: ${output.stats.matched}`);
console.log(`   未映射: ${output.stats.unmapped}`);
console.log(`\n映射文件: ${outputPath}`);
console.log('\n已确认的映射示例:');
Object.entries(knownMappings).slice(0, 10).forEach(([img, data]) => {
  console.log(`  snack-${img.padStart(3, '0')}.png -> 数据ID ${data}`);
});
