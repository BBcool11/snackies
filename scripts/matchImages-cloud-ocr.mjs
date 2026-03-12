/**
 * 云端 OCR 图片自动匹配脚本
 * 支持：百度智能云、腾讯云、阿里云
 * 使用前请配置 ocr-config.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import https from 'https';
import querystring from 'querystring';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 加载配置
let config = {};
try {
  config = JSON.parse(fs.readFileSync(path.join(__dirname, 'ocr-config.json'), 'utf8'));
} catch (error) {
  console.error('❌ 请创建 ocr-config.json 配置文件，参考 ocr-config.example.json');
  process.exit(1);
}

// 零食数据
const snacksData = [
  { id: '001', name: '卫龙大面筋', keywords: ['卫龙', '大面筋', '辣条'] },
  { id: '002', name: '卫龙小面筋', keywords: ['卫龙', '小面筋', '辣条'] },
  { id: '003', name: '亲嘴烧', keywords: ['亲嘴烧', '卫龙'] },
  { id: '004', name: '麻辣王子', keywords: ['麻辣王子', '辣条'] },
  { id: '005', name: '翻天娃', keywords: ['翻天娃', '辣条'] },
  { id: '006', name: '唐僧肉', keywords: ['唐僧肉', '辣条'] },
  { id: '007', name: '香菇肥牛', keywords: ['香菇', '肥牛', '素肉'] },
  { id: '008', name: '北京烤鸭', keywords: ['北京烤鸭', '素肉'] },
  { id: '009', name: '留香展翅', keywords: ['留香展翅', '素肉'] },
  { id: '010', name: '牛仔骨', keywords: ['牛仔骨', '素肉'] },
  { id: '011', name: '火爆鸡筋', keywords: ['火爆鸡筋', '辣条'] },
  { id: '012', name: '臭干子', keywords: ['臭干子', '辣条'] },
  { id: '013', name: '泡椒牛板筋', keywords: ['泡椒', '牛板筋'] },
  { id: '014', name: '素大刀肉', keywords: ['大刀肉', '辣条'] },
  { id: '015', name: '麻辣片', keywords: ['麻辣片', '辣条'] },
  { id: '016', name: '霸王丝', keywords: ['霸王丝', '辣条'] },
  { id: '017', name: 'KK星', keywords: ['KK星', '辣条'] },
  { id: '018', name: '猪宝贝', keywords: ['猪宝贝', '辣条'] },
  { id: '019', name: '牛板筋', keywords: ['牛板筋', '辣条'] },
  { id: '020', name: '酒鬼辣条', keywords: ['酒鬼', '辣条'] },
  { id: '021', name: '嘴巴香', keywords: ['嘴巴香', '辣条'] },
  { id: '022', name: 'kk星辣条', keywords: ['kk星', '辣条'] },
  { id: '023', name: '小滑头', keywords: ['小滑头', '辣条'] },
  { id: '024', name: '绿爽', keywords: ['绿爽', '辣条'] },
  { id: '025', name: '印度飞饼', keywords: ['印度飞饼', '辣条'] },
  { id: '026', name: '斑马肉', keywords: ['斑马肉', '辣条'] },
  { id: '027', name: '葫芦丝', keywords: ['葫芦丝', '辣条'] },
  { id: '028', name: '虾扯蛋', keywords: ['虾扯蛋', '辣条'] },
  { id: '029', name: '飘飘香', keywords: ['飘飘香', '辣条'] },
  { id: '030', name: '花蝴蝶', keywords: ['花蝴蝶', '辣条'] },
  // 膨化食品
  { id: '031', name: '乐事原味薯片', keywords: ['乐事', '原味', '薯片'] },
  { id: '032', name: '乐事黄瓜味薯片', keywords: ['乐事', '黄瓜', '薯片'] },
  { id: '033', name: '乐事青柠味薯片', keywords: ['乐事', '青柠', '薯片'] },
  { id: '034', name: '可比克原味薯片', keywords: ['可比克', '原味', '薯片'] },
  { id: '035', name: '上好佳鲜虾片', keywords: ['上好佳', '虾片'] },
  { id: '036', name: '上好佳洋葱圈', keywords: ['上好佳', '洋葱圈'] },
  { id: '037', name: '浪味仙', keywords: ['浪味仙', '旺旺'] },
  { id: '038', name: '旺旺仙贝', keywords: ['旺旺', '仙贝'] },
  { id: '039', name: '旺旺雪饼', keywords: ['旺旺', '雪饼'] },
  { id: '040', name: '咪咪虾条', keywords: ['咪咪', '虾条'] },
  { id: '041', name: '蟹味粒', keywords: ['蟹味粒', '咪咪'] },
  { id: '042', name: '妙脆角', keywords: ['妙脆角'] },
  { id: '043', name: '奇多', keywords: ['奇多', 'Cheetos'] },
  { id: '044', name: '呀土豆', keywords: ['呀土豆', '好丽友'] },
  { id: '045', name: '薯愿', keywords: ['薯愿', '好丽友'] },
  { id: '046', name: '好友趣', keywords: ['好友趣', '好丽友'] },
  { id: '047', name: '多力多滋', keywords: ['多力多滋', 'Doritos'] },
  { id: '048', name: '粟米条', keywords: ['粟米条', '上好佳'] },
  { id: '049', name: '爆米花', keywords: ['爆米花'] },
  { id: '050', name: '小浣熊干脆面', keywords: ['小浣熊', '干脆面'] },
  // 糖果
  { id: '051', name: '大白兔奶糖', keywords: ['大白兔', '奶糖'] },
  { id: '052', name: '金丝猴奶糖', keywords: ['金丝猴', '奶糖'] },
  { id: '053', name: '阿尔卑斯', keywords: ['阿尔卑斯', '糖果'] },
  { id: '054', name: '德芙巧克力', keywords: ['德芙', '巧克力', 'Dove'] },
  { id: '055', name: '士力架', keywords: ['士力架', 'Snickers'] },
  { id: '056', name: 'M&M豆', keywords: ['M&M', '巧克力豆'] },
  { id: '057', name: '彩虹糖', keywords: ['彩虹糖', 'Skittles'] },
  { id: '058', name: '跳跳糖', keywords: ['跳跳糖'] },
  { id: '059', name: '口哨糖', keywords: ['口哨糖'] },
  { id: '060', name: '大大泡泡糖', keywords: ['大大', '泡泡糖'] },
  { id: '061', name: '比巴卜', keywords: ['比巴卜', '泡泡糖'] },
  { id: '062', name: '真知棒', keywords: ['真知棒', '棒棒糖'] },
  { id: '063', name: '阿尔卑斯棒棒糖', keywords: ['阿尔卑斯', '棒棒糖'] },
  { id: '064', name: '不二家', keywords: ['不二家', '棒棒糖'] },
  { id: '065', name: '旺仔QQ糖', keywords: ['旺仔', 'QQ糖'] },
  { id: '066', name: '喜之郎果冻', keywords: ['喜之郎', '果冻'] },
  { id: '067', name: '亲亲果冻', keywords: ['亲亲', '果冻'] },
  { id: '068', name: '徐福记', keywords: ['徐福记', '糖果'] },
  { id: '069', name: '雅客', keywords: ['雅客', '糖果'] },
  { id: '070', name: '马大姐', keywords: ['马大姐', '糖果'] },
  // 饼干糕点
  { id: '071', name: '奥利奥', keywords: ['奥利奥', 'Oreo'] },
  { id: '072', name: '趣多多', keywords: ['趣多多', '饼干'] },
  { id: '073', name: '好吃点', keywords: ['好吃点', '饼干'] },
  { id: '074', name: '闲趣', keywords: ['闲趣', '饼干'] },
  { id: '075', name: '太平苏打', keywords: ['太平', '苏打', '饼干'] },
  { id: '076', name: '3+2饼干', keywords: ['3+2', '饼干', '康师傅'] },
  { id: '077', name: '好吃点高纤', keywords: ['好吃点', '高纤'] },
  { id: '078', name: '苏打饼干', keywords: ['苏打', '饼干'] },
  { id: '079', name: '蛋黄派', keywords: ['蛋黄派', '好丽友'] },
  { id: '080', name: '巧克力派', keywords: ['巧克力派', '好丽友'] },
  { id: '081', name: '达利园派', keywords: ['达利园', '派'] },
  { id: '082', name: '法式小面包', keywords: ['法式小面包', '达利园'] },
  { id: '083', name: '沙琪玛', keywords: ['沙琪玛', '徐福记'] },
  { id: '084', name: '威化饼', keywords: ['威化饼', '丽芝士'] },
  { id: '085', name: '百奇', keywords: ['百奇', 'Pocky'] },
  { id: '086', name: '百醇', keywords: ['百醇', '格力高'] },
  { id: '087', name: '菜园小饼', keywords: ['菜园小饼'] },
  { id: '088', name: '熊字饼', keywords: ['熊字饼'] },
  { id: '089', name: '手指饼', keywords: ['手指饼'] },
  { id: '090', name: '钙奶饼干', keywords: ['钙奶饼干'] },
  // 饮料
  { id: '091', name: '北冰洋', keywords: ['北冰洋', '汽水'] },
  { id: '092', name: '健力宝', keywords: ['健力宝'] },
  { id: '093', name: '娃哈哈', keywords: ['娃哈哈', 'AD钙奶'] },
  { id: '094', name: '爽歪歪', keywords: ['爽歪歪'] },
  { id: '095', name: '营养快线', keywords: ['营养快线', '娃哈哈'] },
  { id: '096', name: '冰红茶', keywords: ['冰红茶', '康师傅'] },
  { id: '097', name: '绿茶', keywords: ['绿茶', '康师傅'] },
  { id: '098', name: '茉莉花茶', keywords: ['茉莉花茶', '康师傅'] },
  { id: '099', name: '王老吉', keywords: ['王老吉', '凉茶'] },
  { id: '100', name: '加多宝', keywords: ['加多宝', '凉茶'] },
];

// ============ 百度 OCR ============
async function baiduOCR(imagePath) {
  const { apiKey, secretKey } = config.baidu;
  
  // 1. 获取 access_token
  const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`;
  
  const tokenRes = await new Promise((resolve, reject) => {
    https.get(tokenUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
  
  if (!tokenRes.access_token) {
    throw new Error('获取百度 access_token 失败');
  }
  
  // 2. 调用 OCR 接口
  const imageBase64 = fs.readFileSync(imagePath).toString('base64');
  const ocrUrl = `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${tokenRes.access_token}`;
  
  const postData = querystring.stringify({ image: imageBase64 });
  
  const ocrRes = await new Promise((resolve, reject) => {
    const req = https.request(ocrUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
    
    req.write(postData);
    req.end();
  });
  
  if (ocrRes.words_result) {
    return ocrRes.words_result.map(w => w.words).join(' ');
  }
  return '';
}

// ============ 匹配逻辑 ============
function findBestMatch(text) {
  const textLower = text.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  
  for (const snack of snacksData) {
    let score = 0;
    for (const keyword of snack.keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        score += keyword.length * 3;
      }
    }
    if (textLower.includes(snack.name.toLowerCase())) {
      score += 20;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = snack;
    }
  }
  
  return bestMatch && bestScore >= 6 ? bestMatch : null;
}

// ============ 主程序 ============
async function main() {
  const imagesDir = path.join(__dirname, '../public/snacks');
  const files = fs.readdirSync(imagesDir)
    .filter(f => f.endsWith('.png') || f.endsWith('.jpg'))
    .filter(f => f.startsWith('snack-'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });
  
  console.log(`🚀 使用 ${config.provider} OCR 开始匹配...`);
  console.log(`📁 找到 ${files.length} 张图片\n`);
  
  const imageToDataMap = {};
  const unmatchedImages = [];
  
  // 限制处理数量
  const maxImages = process.argv.includes('--all') ? files.length : 30;
  const processFiles = files.slice(0, maxImages);
  
  for (let i = 0; i < processFiles.length; i++) {
    const file = processFiles[i];
    const imageId = file.replace('snack-', '').replace('.png', '').replace('.jpg', '');
    const imagePath = path.join(imagesDir, file);
    
    console.log(`[${i + 1}/${processFiles.length}] ${file}`);
    
    try {
      let text = '';
      
      if (config.provider === 'baidu') {
        text = await baiduOCR(imagePath);
      } else {
        console.log('❌ 暂不支持的 OCR 提供商');
        break;
      }
      
      console.log(`  OCR: "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`);
      
      const match = findBestMatch(text);
      
      if (match) {
        imageToDataMap[imageId] = match.id;
        console.log(`  ✅ 匹配 → ${match.name} (数据ID: ${match.id})\n`);
      } else {
        unmatchedImages.push({ imageId, text });
        console.log(`  ❌ 未匹配\n`);
      }
      
      // 延时避免限流（百度免费版 QPS=2，延时 600ms 以上）
      if (i < processFiles.length - 1) {
        await new Promise(r => setTimeout(r, 600));
      }
    } catch (error) {
      console.error(`  ❌ 错误: ${error.message}\n`);
      unmatchedImages.push({ imageId, error: error.message });
    }
  }
  
  // 保存结果
  const outputPath = path.join(__dirname, '../src/utils/imageMapping-cloud.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    mapping: imageToDataMap,
    unmatched: unmatchedImages,
    stats: {
      total: processFiles.length,
      matched: Object.keys(imageToDataMap).length,
      unmatched: unmatchedImages.length
    },
    provider: config.provider,
    date: new Date().toISOString()
  }, null, 2));
  
  console.log('\n========== 匹配结果 ==========');
  console.log(`处理总数: ${processFiles.length}`);
  console.log(`成功匹配: ${Object.keys(imageToDataMap).length}`);
  console.log(`未匹配: ${unmatchedImages.length}`);
  console.log(`\n结果保存至: ${outputPath}`);
}

main().catch(console.error);
