#!/usr/bin/env python3
"""
为所有零食自动打标签 - 智能策展系统基础
"""
import json
import re

with open('src/data/snacks_premium.json', 'r', encoding='utf-8') as f:
    snacks = json.load(f)

# 分类映射规则
CATEGORY_KEYWORDS = {
    'latiao': ['辣条', '卫龙', '魔芋爽', '亲嘴烧', '麻辣', '霸王丝', '翻天娃'],
    'instant_noodle': ['方便面', '泡面', '拉面', '火鸡面', '辛拉面', '出前一丁', '合味道', '开杯乐', '老坛酸菜', '红烧牛肉', '三鲜伊面', '小浣熊', '小当家', '魔法士', '干脆面'],
    'luosifen': ['螺蛳粉', '好欢螺', '螺霸王', '李子柒', '柳全', '嘻螺会'],
    'self_heating': ['自热', '自嗨锅', '海底捞自热', '莫小仙', '食族人', '开小灶'],
    'candy': ['奶糖', '大白兔', '喔喔', '金丝猴', '棒棒糖', '棉花糖', 'QQ糖', '软糖', '硬糖', '瑞士糖', '口香糖', '泡泡糖'],
    'chocolate': ['巧克力', '德芙', '士力架', '费列罗', '麦丽素', '好时', 'M&M', '脆香米'],
    'biscuit': ['饼干', '奥利奥', '趣多多', '3+2', '苏打', '夹心饼', '威化', '曲奇'],
    'chip': ['薯片', '薯条', '乐事', '品客', '可比克', '浪味仙', '粟一烧'],
    'puffed': ['虾条', '上好佳', '乖乖', '洋葱圈', '芝士条', '棉花糖膨化'],
    'beverage': ['可乐', '雪碧', '奶茶', '牛奶', '酸奶', '饮料', '果汁', '茶', '咖啡', 'AD钙奶', '养乐多', '旺仔牛奶'],
    'pickle': ['话梅', '陈皮', '山楂', '溜溜梅', '果丹皮', '酸枣', '杨梅', '九制', '蜜饯'],
    'nut': ['坚果', '瓜子', '花生', '杏仁', '核桃', '每日坚果', '三只松鼠', '百草味', '洽洽'],
    'meat': ['凤爪', '鸭脖', '牛肉干', '猪肉脯', '小鱼干', '劲仔', '无穷', '双汇', '火腿肠'],
    'ice_cream': ['冰淇淋', '雪糕', '冰棍', '巧乐兹', '梦龙', '可爱多', '钟薛高', '东北大板'],
    'pastry': ['蛋黄派', '好丽友', 'Q蒂', '蛋糕', '面包', '沙琪玛', '凤梨酥'],
}

# 口味标签规则
FLAVOR_KEYWORDS = {
    'spicy': ['辣', '麻辣', '辣条', '火锅', '泡椒', '火鸡面', '老干妈', '辣椒', '辛', '辣白菜', '螺蛳粉', '酸辣'],
    'sour': ['酸', '话梅', '陈皮', '山楂', '溜溜梅', '果丹皮', '酸枣', '杨梅', '柠檬', '青梅', '酸奶'],
    'sweet': ['甜', '糖', '巧克力', '蜜', '蜂蜜', '奶茶', '棉花糖', '棒棒糖', '奶糖', '蛋糕', '派'],
    'savory': ['咸', '鲜', '香', '海鲜', '鸡肉', '牛肉', '排骨', '烧烤', '孜然'],
}

# 场景标签规则
SCENE_KEYWORDS = {
    'school_gate': ['辣条', '小浣熊', '干脆面', '5毛', '泡泡糖', '跳跳糖', '棉花糖', '冰袋', '小卖部', '校门口'],
    'midnight': ['泡面', '方便面', '自热', '火锅', '夜宵', ' dorm', '宿舍'],
    'dorm': ['泡面', '自热', '火锅', '辣条', '分享', '大包', '桶装'],
    'convenience_store': ['饭团', '关东煮', '三角饭团', '三明治', '沙拉', '便当', '7-11', '全家', '罗森'],
    'office': ['饼干', '巧克力', '糖果', '小包装', '独立包装', '便携'],
}

# 年代标签规则
ERA_KEYWORDS = {
    'childhood_80s': ['卜卜星', '跳跳糖', '麦丽素', '大大泡泡糖', '北冰洋', '健力宝'],
    'childhood_90s': ['小浣熊', '小当家', '魔法士', '卫龙', '浪味仙', '旺仔', 'AD钙奶', '爽歪歪'],
    'childhood_00s': ['魔法师', '魔法士', '魔法', '快乐男声', '超级女声'],
    'internet_famous': ['好欢螺', '李子柒', '拉面说', '空刻', '满小饱', '钟薛高', '元气森林', '自嗨锅'],
}

# 产地规则
BRAND_ORIGIN = {
    'Japan': ['日清', '出前一丁', '合味道', '开杯乐', 'UFO', '卡乐比', '薯条三兄弟', '格力高', '百奇', '百醇', '明治', '不二家', '三得利', '伊藤园', '森永'],
    'Korea': ['农心', '辛拉面', '三养', '火鸡面', '辣白菜', '好丽友', '乐天', '海太'],
    'Taiwan': ['旺旺', '统一', '康师傅', '张君雅', '乖乖', '浪味仙', '仙贝', '雪饼'],
    'HongKong': ['四洲', '嘉顿', '公仔面'],
    'Thailand': ['小老板', '大哥花生'],
    'Malaysia': ['妈咪', '咪咪'],
}

# 停产名单（已确认或常见的停产产品）
DISCONTINUED_LIST = [
    '小浣熊水浒卡版', '老版卜卜星', '魔法士老版干脆面', '奇多老版圈圈',
    '太阳锅巴老包装', '乖乖老版虾条', '浪味仙老版', '张君雅小妹妹早期版',
    '统一干脆面老版', '斯美特干脆面', '白象干脆面老版', '鬼脸嘟嘟',
    '好多鱼老版', '乐事原味老包装', '品客原味老包装', '上好佳鲜虾片老版',
    '旭日升冰茶', '非常可乐', '汾煌可乐', '健力宝老铝罐',
    '喔喔奶糖', '佳佳奶糖', '金丝猴奶糖', '比巴卜膨化',
    '香烟糖', '戒指糖', '口红糖', '石头糖',
    '卜卜星', '太阳锅巴', '乖乖',
]

def tag_snack(snack):
    """为单个零食打标签"""
    name = snack.get('name', '')
    brand = snack.get('brand', '')
    
    # 1. 分类标签
    category = 'other'
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in name or kw in brand for kw in keywords):
            category = cat
            break
    
    # 2. 口味标签
    flavor_tags = []
    for flavor, keywords in FLAVOR_KEYWORDS.items():
        if any(kw in name or kw in brand for kw in keywords):
            flavor_tags.append(flavor)
    if not flavor_tags:
        flavor_tags = ['savory']  # 默认
    
    # 3. 场景标签
    scene_tags = []
    for scene, keywords in SCENE_KEYWORDS.items():
        if any(kw in name or kw in brand for kw in keywords):
            scene_tags.append(scene)
    
    # 根据价格和包装推断场景
    price = snack.get('price', 0)
    if price <= 1.0:
        scene_tags.append('school_gate')
    if '方便' in name or '自热' in name or '泡面' in name:
        scene_tags.append('midnight')
        scene_tags.append('dorm')
    
    # 去重
    scene_tags = list(set(scene_tags))
    
    # 4. 年代标签
    era_tags = []
    for era, keywords in ERA_KEYWORDS.items():
        if any(kw in name or kw in brand for kw in keywords):
            era_tags.append(era)
    
    # 根据名称特征推断年代
    if '老版' in name or '早期' in name or '包装' in name:
        if any(x in name for x in ['小浣熊', '小当家', '魔法士']):
            era_tags.append('childhood_90s')
        else:
            era_tags.append('childhood_80s')
    
    # 5. 产地
    origin_region = 'Mainland'
    for region, brands in BRAND_ORIGIN.items():
        if any(b in brand or b in name for b in brands):
            origin_region = region
            break
    
    # 6. 状态
    status = snack.get('status', '在售')
    if status in ['绝版', '停产']:
        status = 'discontinued'
    elif any(d in name for d in DISCONTINUED_LIST):
        status = 'discontinued'
    else:
        status = 'on_sale'
    
    return {
        'category': category,
        'flavor_tags': list(set(flavor_tags)),
        'scene_tags': scene_tags,
        'origin_region': origin_region,
        'era_tags': era_tags,
        'status': status,
    }

# 为所有零食打标签
print("开始为零食打标签...")
for snack in snacks:
    tags = tag_snack(snack)
    snack.update(tags)

# 统计
from collections import Counter
cat_count = Counter(s['category'] for s in snacks)
print("\n分类统计:")
for cat, cnt in cat_count.most_common():
    print(f"  {cat}: {cnt}")

status_count = Counter(s['status'] for s in snacks)
print(f"\n状态统计:")
print(f"  在售: {status_count.get('on_sale', 0)}")
print(f"  停产: {status_count.get('discontinued', 0)}")

# 保存
with open('src/data/snacks_premium.json', 'w', encoding='utf-8') as f:
    json.dump(snacks, f, ensure_ascii=False, indent=2)

print("\n标签打标完成！")
