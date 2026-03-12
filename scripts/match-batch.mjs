/**
 * 批量 OCR 匹配脚本 - 使用扩展零食数据库
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import querystring from 'querystring';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 加载配置
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'ocr-config.json'), 'utf8'));

// 扩展的零食数据库
const snacksData = [
  { id: '001', name: '卫龙大面筋', keywords: ['卫龙', '大面筋', '辣条', '麻辣零食'] },
  { id: '002', name: '卫龙小面筋', keywords: ['卫龙', '小面筋', '辣条'] },
  { id: '003', name: '亲嘴烧', keywords: ['亲嘴烧', '卫龙'] },
  { id: '004', name: '麻辣王子', keywords: ['麻辣王子', '王子'] },
  { id: '005', name: '翻天娃', keywords: ['翻天娃'] },
  { id: '006', name: '唐僧肉', keywords: ['唐僧肉', '唐僧'] },
  { id: '007', name: '香菇肥牛', keywords: ['香菇', '肥牛', '祯香'] },
  { id: '008', name: '北京烤鸭', keywords: ['北京烤鸭', '烤鸭'] },
  { id: '009', name: '留香展翅', keywords: ['留香展翅', '展翅'] },
  { id: '010', name: '牛仔骨', keywords: ['牛仔骨'] },
  { id: '011', name: '火爆鸡筋', keywords: ['火爆鸡筋', '鸡筋'] },
  { id: '012', name: '臭干子', keywords: ['臭干子'] },
  { id: '013', name: '泡椒牛板筋', keywords: ['泡椒', '牛板筋', '凤爪'] },
  { id: '014', name: '素大刀肉', keywords: ['大刀肉'] },
  { id: '015', name: '麻辣片', keywords: ['麻辣片'] },
  { id: '016', name: '霸王丝', keywords: ['霸王丝'] },
  { id: '017', name: 'KK星', keywords: ['KK星'] },
  { id: '018', name: '猪宝贝', keywords: ['猪宝贝'] },
  { id: '019', name: '牛板筋', keywords: ['牛板筋'] },
  { id: '020', name: '酒鬼辣条', keywords: ['酒鬼'] },
  { id: '021', name: '嘴巴香', keywords: ['嘴巴香'] },
  { id: '022', name: '小滑头', keywords: ['小滑头'] },
  { id: '023', name: '绿爽', keywords: ['绿爽'] },
  { id: '024', name: '神厨', keywords: ['神厨'] },
  { id: '025', name: '卫龙亲嘴豆皮', keywords: ['亲嘴豆皮', '豆皮'] },
  // 薯片膨化
  { id: '031', name: '乐事原味薯片', keywords: ['乐事', '原味', '薯片'] },
  { id: '032', name: '乐事黄瓜味薯片', keywords: ['乐事', '黄瓜', '薯片'] },
  { id: '033', name: '乐事小龙虾味薯片', keywords: ['乐事', '龙虾', '薯片'] },
  { id: '034', name: '可比克原味薯片', keywords: ['可比克', 'copico', '薯片'] },
  { id: '035', name: '上好佳鲜虾片', keywords: ['上好佳', '虾片', 'Oishi'] },
  { id: '036', name: '上好佳洋葱圈', keywords: ['上好佳', '洋葱圈'] },
  { id: '037', name: '浪味仙', keywords: ['浪味仙', '栗一烧'] },
  { id: '038', name: '旺旺仙贝', keywords: ['旺旺', '仙贝'] },
  { id: '039', name: '旺旺雪饼', keywords: ['旺旺', '雪饼'] },
  { id: '040', name: '咪咪虾条', keywords: ['咪咪', '虾条', 'Mamee', 'MIMI'] },
  { id: '041', name: '上好佳玉米泡', keywords: ['上好佳', '玉米泡'] },
  { id: '042', name: '妙脆角', keywords: ['妙脆角'] },
  { id: '043', name: '奇多', keywords: ['奇多', 'Cheetos'] },
  { id: '044', name: '呀土豆', keywords: ['呀土豆', '好丽友'] },
  { id: '045', name: '薯愿', keywords: ['薯愿'] },
  { id: '046', name: '好友趣', keywords: ['好友趣'] },
  { id: '047', name: '多力多滋', keywords: ['多力多滋', 'Doritos'] },
  { id: '048', name: '粟米条', keywords: ['粟米条', '奇多'] },
  { id: '049', name: '爆米花', keywords: ['爆米花'] },
  { id: '200', name: '品客薯片', keywords: ['品客', 'Pringles'] },
  { id: '201', name: '盼盼薯片', keywords: ['盼盼', '薯片'] },
  { id: '202', name: '良品铺子薯片', keywords: ['良品铺子', '薯片'] },
  { id: '203', name: '海太蜂蜜黄油薯片', keywords: ['海太', '蜂蜜黄油'] },
  { id: '204', name: '卡乐比薯条', keywords: ['卡乐比', '薯条'] },
  // 干脆面
  { id: '050', name: '小浣熊干脆面', keywords: ['小浣熊', '干脆面', '浣熊', '洗熊'] },
  { id: '205', name: '小当家干脆面', keywords: ['小当家', '干脆面'] },
  { id: '206', name: '魔法士干脆面', keywords: ['魔法士', '干脆面'] },
  { id: '207', name: '华丰三鲜伊面', keywords: ['华丰', '三鲜伊面'] },
  { id: '208', name: '今麦郎弹面', keywords: ['今麦郎', '弹面'] },
  { id: '209', name: '统一老坛酸菜面', keywords: ['统一', '老坛', '酸菜'] },
  { id: '210', name: '康师傅红烧牛肉面', keywords: ['康师傅', '红烧牛肉'] },
  { id: '211', name: '汤达人', keywords: ['汤达人'] },
  { id: '212', name: '出前一丁', keywords: ['出前一丁'] },
  { id: '213', name: '辛拉面', keywords: ['辛拉面', '农心'] },
  { id: '214', name: '好欢螺螺蛳粉', keywords: ['好欢螺', '螺蛳粉'] },
  { id: '215', name: '阿宽红油面皮', keywords: ['阿宽', '红油面皮'] },
  // 糖果巧克力
  { id: '051', name: '大白兔奶糖', keywords: ['大白兔', '奶糖', 'White Rabbit', '冠生园'] },
  { id: '052', name: '金丝猴奶糖', keywords: ['金丝猴', '奶糖'] },
  { id: '053', name: '阿尔卑斯', keywords: ['阿尔卑斯', 'Alpenliebe'] },
  { id: '054', name: '德芙巧克力', keywords: ['德芙', '巧克力', 'Dove', '麦丽素', 'M&M'] },
  { id: '055', name: '士力架', keywords: ['士力架', 'Snickers'] },
  { id: '056', name: 'M&M豆', keywords: ['M&M', '巧克力豆'] },
  { id: '057', name: '彩虹糖', keywords: ['彩虹糖', 'Skittles'] },
  { id: '058', name: '跳跳糖', keywords: ['跳跳糖', '爆炸糖'] },
  { id: '059', name: '口哨糖', keywords: ['口哨糖'] },
  { id: '060', name: '大大泡泡糖', keywords: ['大大', '泡泡糖', 'DADA', '大大卷'] },
  { id: '061', name: '比巴卜', keywords: ['比巴卜', '泡泡糖', 'Bazooka', 'BIBABOO'] },
  { id: '062', name: '真知棒', keywords: ['真知棒', '棒棒糖'] },
  { id: '063', name: '阿尔卑斯棒棒糖', keywords: ['阿尔卑斯', '棒棒糖'] },
  { id: '064', name: '不二家', keywords: ['不二家'] },
  { id: '065', name: '旺仔QQ糖', keywords: ['旺仔', 'QQ糖'] },
  { id: '216', name: '费列罗', keywords: ['费列罗', 'FERRERO', 'Rocher'] },
  { id: '217', name: '好时巧克力', keywords: ['好时', 'Hershey'] },
  { id: '218', name: '金帝巧克力', keywords: ['金帝'] },
  { id: '219', name: '明治巧克力', keywords: ['明治', 'meiji'] },
  { id: '220', name: '吉百利', keywords: ['吉百利', 'Cadbury'] },
  { id: '221', name: '珍宝珠', keywords: ['珍宝珠', 'Chupa Chups'] },
  { id: '222', name: '曼妥思', keywords: ['曼妥思', 'Mentos'] },
  { id: '223', name: '益达', keywords: ['益达', 'Extra'] },
  { id: '224', name: '炫迈', keywords: ['炫迈', 'Stride'] },
  { id: '225', name: '绿箭', keywords: ['绿箭', 'Doublemint'] },
  { id: '226', name: '黄箭', keywords: ['黄箭', 'Juicy Fruit'] },
  { id: '227', name: '白箭', keywords: ['白箭', 'Spearmint'] },
  { id: '228', name: '喔喔奶糖', keywords: ['喔喔', '奶糖'] },
  { id: '229', name: '徐福记酥心糖', keywords: ['徐福记', '酥心糖'] },
  { id: '230', name: '马大姐', keywords: ['马大姐'] },
  { id: '231', name: '高粱饴', keywords: ['高粱饴', '高粱', '软糖'] },
  { id: '232', name: '山楂片', keywords: ['山楂片', '山楂'] },
  { id: '233', name: '陈皮糖', keywords: ['陈皮糖'] },
  { id: '234', name: '话梅糖', keywords: ['话梅糖', '话梅'] },
  { id: '235', name: '椰子糖', keywords: ['椰子糖', '椰子'] },
  { id: '236', name: '玉米软糖', keywords: ['玉米软糖', '玉米糖'] },
  { id: '237', name: '牛皮糖', keywords: ['牛皮糖'] },
  { id: '238', name: '棉花糖', keywords: ['棉花糖'] },
  { id: '239', name: '魔鬼糖', keywords: ['魔鬼糖'] },
  { id: '240', name: '石头糖', keywords: ['石头糖'] },
  // 果冻
  { id: '066', name: '喜之郎果冻', keywords: ['喜之郎', '果冻'] },
  { id: '067', name: '亲亲果冻', keywords: ['亲亲', '果冻'] },
  { id: '068', name: '蜡笔小新果冻', keywords: ['蜡笔小新', '果冻'] },
  { id: '241', name: '旺旺蒟蒻果冻', keywords: ['蒟蒻', '果冻'] },
  // 饼干糕点
  { id: '071', name: '奥利奥', keywords: ['奥利奥', 'Oreo', '亿滋'] },
  { id: '072', name: '趣多多', keywords: ['趣多多', 'Chips Ahoy'] },
  { id: '073', name: '好吃点', keywords: ['好吃点'] },
  { id: '074', name: '闲趣', keywords: ['闲趣'] },
  { id: '075', name: '太平苏打', keywords: ['太平', '苏打', '饼干'] },
  { id: '076', name: '3+2饼干', keywords: ['3+2', '饼干', '康师傅'] },
  { id: '077', name: '好吃点高纤', keywords: ['好吃点', '高纤'] },
  { id: '078', name: '苏打饼干', keywords: ['苏打', '饼干'] },
  { id: '079', name: '蛋黄派', keywords: ['蛋黄派', '好丽友'] },
  { id: '080', name: '巧克力派', keywords: ['巧克力派', '好丽友'] },
  { id: '081', name: '达利园派', keywords: ['达利园', '派'] },
  { id: '082', name: '法式小面包', keywords: ['法式小面包', '达利园'] },
  { id: '083', name: '沙琪玛', keywords: ['沙琪玛', '徐福记'] },
  { id: '084', name: '威化饼', keywords: ['威化饼', '丽芝士', 'nabati'] },
  { id: '085', name: '百奇', keywords: ['百奇', 'Pocky'] },
  { id: '086', name: '百醇', keywords: ['百醇', '格力高'] },
  { id: '087', name: '菜园小饼', keywords: ['菜园小饼'] },
  { id: '088', name: '熊字饼', keywords: ['熊字饼'] },
  { id: '089', name: '手指饼', keywords: ['手指饼'] },
  { id: '090', name: '钙奶饼干', keywords: ['钙奶饼干'] },
  { id: '242', name: '好吃点杏仁饼', keywords: ['杏仁饼'] },
  { id: '243', name: '嘉士利果乐果香', keywords: ['嘉士利', '果乐果香'] },
  { id: '244', name: '青食钙奶饼干', keywords: ['青食'] },
  { id: '245', name: '格力高', keywords: ['格力高', 'glico'] },
  { id: '246', name: '优冠饼干', keywords: ['优冠'] },
  { id: '247', name: '乐之饼干', keywords: ['乐之', 'Ritz'] },
  { id: '248', name: '嘉顿饼干', keywords: ['嘉顿'] },
  { id: '249', name: '港荣蒸蛋糕', keywords: ['港荣', '蒸蛋糕'] },
  { id: '250', name: '友臣肉松饼', keywords: ['友臣', '肉松饼'] },
  { id: '251', name: '老婆饼', keywords: ['老婆饼'] },
  { id: '252', name: '蛋黄酥', keywords: ['蛋黄酥'] },
  { id: '253', name: '凤梨酥', keywords: ['凤梨酥'] },
  // 饮料
  { id: '091', name: '北冰洋', keywords: ['北冰洋', '汽水'] },
  { id: '092', name: '健力宝', keywords: ['健力宝', '魔水'] },
  { id: '093', name: '娃哈哈AD钙奶', keywords: ['娃哈哈', 'AD钙奶'] },
  { id: '094', name: '爽歪歪', keywords: ['爽歪歪'] },
  { id: '095', name: '营养快线', keywords: ['营养快线', '娃哈哈'] },
  { id: '096', name: '冰红茶', keywords: ['冰红茶', '康师傅'] },
  { id: '097', name: '绿茶', keywords: ['绿茶', '康师傅'] },
  { id: '098', name: '茉莉花茶', keywords: ['茉莉花茶', '康师傅'] },
  { id: '099', name: '王老吉', keywords: ['王老吉', '凉茶'] },
  { id: '100', name: '加多宝', keywords: ['加多宝', '凉茶'] },
  { id: '254', name: '可口可乐', keywords: ['可口可乐', 'Coca', 'Coke'] },
  { id: '255', name: '百事可乐', keywords: ['百事', 'Pepsi'] },
  { id: '256', name: '雪碧', keywords: ['雪碧', 'Sprite'] },
  { id: '257', name: '芬达', keywords: ['芬达', 'Fanta'] },
  { id: '258', name: '美年达', keywords: ['美年达', 'Mirinda'] },
  { id: '259', name: '七喜', keywords: ['七喜', '7-Up'] },
  { id: '260', name: '醒目', keywords: ['醒目'] },
  { id: '261', name: '非常可乐', keywords: ['非常可乐'] },
  { id: '262', name: '旭日升冰茶', keywords: ['旭日升'] },
  { id: '263', name: '统一冰红茶', keywords: ['统一', '冰红茶'] },
  { id: '264', name: '统一绿茶', keywords: ['统一', '绿茶'] },
  { id: '265', name: '阿萨姆奶茶', keywords: ['阿萨姆', '奶茶'] },
  { id: '266', name: '小洋人', keywords: ['小洋人'] },
  { id: '267', name: '太子奶', keywords: ['太子奶'] },
  { id: '268', name: '乐百氏', keywords: ['乐百氏'] },
  { id: '269', name: '农夫山泉', keywords: ['农夫山泉', 'Nongfu'] },
  { id: '270', name: '脉动', keywords: ['脉动', 'Mizone'] },
  { id: '271', name: '激活', keywords: ['激活'] },
  { id: '272', name: '尖叫', keywords: ['尖叫'] },
  { id: '273', name: '佳得乐', keywords: ['佳得乐', 'Gatorade'] },
  { id: '274', name: '宝矿力水特', keywords: ['宝矿力', 'Pocari'] },
  { id: '275', name: '椰树椰汁', keywords: ['椰树', '椰汁'] },
  { id: '276', name: '露露杏仁露', keywords: ['露露', '杏仁露'] },
  { id: '277', name: '银鹭花生牛奶', keywords: ['银鹭', '花生牛奶'] },
  { id: '278', name: '旺仔牛奶', keywords: ['旺仔', '牛奶'] },
  { id: '279', name: '大白梨汽水', keywords: ['大白梨'] },
  { id: '280', name: '冰峰', keywords: ['冰峰'] },
  { id: '281', name: '大窑', keywords: ['大窑'] },
  { id: '282', name: '宏宝莱', keywords: ['宏宝莱'] },
  { id: '283', name: '蒙牛', keywords: ['蒙牛'] },
  { id: '284', name: '伊利', keywords: ['伊利'] },
  // 肉类零食
  { id: '300', name: '双汇火腿肠', keywords: ['双汇', '火腿肠'] },
  { id: '301', name: '双汇王中王', keywords: ['王中王'] },
  { id: '302', name: '玉米肠', keywords: ['玉米肠'] },
  { id: '303', name: '热狗肠', keywords: ['热狗肠'] },
  { id: '304', name: '猪肉脯', keywords: ['猪肉脯'] },
  { id: '305', name: '牛肉干', keywords: ['牛肉干'] },
  { id: '306', name: '科尔沁牛肉干', keywords: ['科尔沁', '风干牛肉'] },
  { id: '307', name: '肉松', keywords: ['肉松'] },
  { id: '308', name: '鱼松', keywords: ['鱼松'] },
  { id: '309', name: '蟹柳', keywords: ['蟹柳', '蟹棒'] },
  { id: '310', name: '鱼豆腐', keywords: ['鱼豆腐'] },
  { id: '311', name: '鱼蛋', keywords: ['鱼蛋'] },
  { id: '312', name: '劲仔小鱼', keywords: ['劲仔', '小鱼'] },
  { id: '313', name: '无穷盐焗鸡翅', keywords: ['无穷', '盐焗'] },
  { id: '314', name: '周黑鸭', keywords: ['周黑鸭'] },
  { id: '315', name: '煌上煌', keywords: ['煌上煌'] },
  // 其他零食
  { id: '320', name: '话梅', keywords: ['话梅'] },
  { id: '321', name: '乌梅', keywords: ['乌梅'] },
  { id: '322', name: '陈皮梅', keywords: ['陈皮梅'] },
  { id: '323', name: '嘉应子', keywords: ['嘉应子'] },
  { id: '324', name: '情人梅', keywords: ['情人梅'] },
  { id: '325', name: '杨梅', keywords: ['杨梅'] },
  { id: '326', name: '橄榄', keywords: ['橄榄'] },
  { id: '327', name: '无花果丝', keywords: ['无花果'] },
  { id: '328', name: '萝卜丝', keywords: ['萝卜丝'] },
  { id: '329', name: '酸梅粉', keywords: ['酸梅粉'] },
  { id: '330', name: '华华丹', keywords: ['华华丹', '仙丹', '猴王丹'] },
  { id: '331', name: '济公丹', keywords: ['济公丹'] },
  { id: '332', name: 'cc乐', keywords: ['cc乐', '吸管糖'] },
  { id: '333', name: '口红糖', keywords: ['口红糖'] },
  { id: '334', name: '戒指糖', keywords: ['戒指糖'] },
  { id: '335', name: '钻石糖', keywords: ['钻石糖'] },
  { id: '336', name: '拉丝糖', keywords: ['拉丝糖'] },
  { id: '337', name: '粘牙糖', keywords: ['粘牙糖'] },
  { id: '338', name: '麦芽糖', keywords: ['麦芽糖'] },
  { id: '339', name: '搅搅糖', keywords: ['搅搅糖'] },
  { id: '340', name: '果丹皮', keywords: ['果丹皮'] },
  { id: '341', name: '山楂糕', keywords: ['山楂糕'] },
  { id: '342', name: '山楂条', keywords: ['山楂条'] },
  { id: '343', name: '鱼干', keywords: ['鱼干'] },
  { id: '344', name: '鱼片', keywords: ['鱼片'] },
  { id: '345', name: '鱿鱼丝', keywords: ['鱿鱼丝'] },
  { id: '346', name: '海苔', keywords: ['海苔', '紫菜'] },
  { id: '347', name: '波力海苔', keywords: ['波力', '海苔'] },
  { id: '348', name: '美好时光海苔', keywords: ['美好时光', '海苔'] },
  { id: '349', name: '四洲紫菜', keywords: ['四洲', '紫菜'] },
  { id: '350', name: '来伊份', keywords: ['来伊份'] },
  { id: '351', name: '三只松鼠', keywords: ['三只松鼠'] },
  { id: '352', name: '良品铺子', keywords: ['良品铺子'] },
  { id: '353', name: '盐津铺子', keywords: ['盐津铺子'] },
  { id: '354', name: '洽洽瓜子', keywords: ['洽洽', '瓜子'] },
  { id: '355', name: '粒上皇', keywords: ['粒上皇'] },
  // 进口零食
  { id: '400', name: '白色恋人', keywords: ['白色恋人'] },
  { id: '401', name: 'Royce生巧', keywords: ['Royce', '生巧克力'] },
  { id: '402', name: 'KitKat', keywords: ['KitKat', 'Kitstte'] },
  { id: '403', name: '雀巢', keywords: ['雀巢', 'Nestle'] },
  { id: '404', name: '乐天', keywords: ['乐天'] },
  { id: '405', name: '好丽友', keywords: ['好丽友'] },
  { id: '406', name: '农心', keywords: ['农心'] },
  { id: '407', name: '汤姆农场', keywords: ['汤姆农场'] },
  { id: '408', name: '白色巧克力', keywords: ['白巧克力'] },
];

async function getToken() {
  const { apiKey, secretKey } = config.baidu;
  const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`;
  
  return new Promise((resolve, reject) => {
    https.get(tokenUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data).access_token));
    }).on('error', reject);
  });
}

async function ocr(imagePath, accessToken) {
  const imageBase64 = fs.readFileSync(imagePath).toString('base64');
  const ocrUrl = `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${accessToken}`;
  const postData = querystring.stringify({ image: imageBase64 });
  
  return new Promise((resolve, reject) => {
    const req = https.request(ocrUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const result = JSON.parse(data);
        if (result.words_result) {
          resolve(result.words_result.map(w => w.words).join(' '));
        } else {
          resolve('');
        }
      });
    }).on('error', reject);
    req.write(postData);
    req.end();
  });
}

function findBestMatch(text) {
  const textLower = text.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  
  for (const snack of snacksData) {
    let score = 0;
    for (const keyword of snack.keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        score += keyword.length * 2;
      }
    }
    if (textLower.includes(snack.name.toLowerCase())) {
      score += 15;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = snack;
    }
  }
  
  return bestMatch && bestScore >= 3 ? bestMatch : null;
}

async function main() {
  const accessToken = await getToken();
  const imagesDir = path.join(__dirname, '../public/snacks');
  
  const files = fs.readdirSync(imagesDir)
    .filter(f => f.endsWith('.png') && f.startsWith('snack-'))
    .sort((a, b) => parseInt(a.match(/\d+/)?.[0] || '0') - parseInt(b.match(/\d+/)?.[0] || '0'));
  
  console.log(`🚀 开始处理 ${files.length} 张图片...\n`);
  
  const mapping = {};
  const unmatched = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imageId = file.replace('snack-', '').replace('.png', '');
    const imagePath = path.join(imagesDir, file);
    
    process.stdout.write(`[${i + 1}/${files.length}] ${file} `);
    
    try {
      const text = await ocr(imagePath, accessToken);
      const match = findBestMatch(text);
      
      if (match) {
        mapping[imageId.padStart(3, '0')] = match.id;
        console.log(`✓ ${match.name}`);
      } else {
        unmatched.push({ imageId, text });
        const shortText = text.substring(0, 30);
        console.log(`✗ ${shortText || '[无文字]'}`);
      }
    } catch (error) {
      console.log(`✗ ERROR: ${error.message}`);
      unmatched.push({ imageId, error: error.message });
    }
    
    if (i < files.length - 1) await new Promise(r => setTimeout(r, 500));
  }
  
  // 保存结果
  const outputPath = path.join(__dirname, '../src/utils/imageMapping-cloud.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    mapping,
    unmatched: unmatched.slice(0, 50),
    stats: { 
      total: files.length, 
      matched: Object.keys(mapping).length, 
      unmatched: unmatched.length 
    }
  }, null, 2));
  
  console.log(`\n✅ 完成! 成功: ${Object.keys(mapping).length}, 未匹配: ${unmatched.length}`);
}

main().catch(console.error);
