#!/usr/bin/env python3
"""
智能策展系统 - 根据标签为9个展览自动选品
确保每个展览展品不重复，有差异性
"""
import json
from collections import defaultdict

with open('src/data/snacks_premium.json', 'r', encoding='utf-8') as f:
    snacks = json.load(f)

def select_exhibition_snacks(filter_fn, min_count=8, max_count=12, priority_boost=None):
    """
    为展览选择零食
    filter_fn: 过滤函数
    priority_boost: 优先级提升函数（用于排序）
    """
    candidates = [s for s in snacks if filter_fn(s)]
    
    # 排序：先按优先级，再按知名度（简单用id靠前的）
    if priority_boost:
        candidates.sort(key=lambda s: (priority_boost(s), -int(s['id'])), reverse=True)
    else:
        # 默认按id排序，确保稳定
        candidates.sort(key=lambda s: int(s['id']))
    
    return candidates[:max_count]

# 记录每个零食被哪些展览选中（控制重复度）
snack_usage = defaultdict(list)

def add_to_exhibition(exhibition_id, snacks_list):
    """记录零食被哪个展览使用"""
    for s in snacks_list:
        snack_usage[s['id']].append(exhibition_id)

def get_snack_images(snacks_list):
    """获取零食图片列表"""
    return [s['image'] for s in snacks_list if s.get('image')]

# ========== 9个展览的选品规则 ==========

# 1. 辣条编年史
latiao_snacks = select_exhibition_snacks(
    lambda s: s['category'] == 'latiao' or '辣条' in s['name'] or '卫龙' in s['brand'],
    min_count=8,
    priority_boost=lambda s: 2 if s['category'] == 'latiao' else (1 if '辣条' in s['name'] else 0)
)
add_to_exhibition('1', latiao_snacks)
print(f"1. 辣条编年史: {len(latiao_snacks)} 件")
for s in latiao_snacks[:5]:
    print(f"   - {s['name']} ({s['brand']})")

# 2. 泡面深夜食堂
# 排除已经在辣条展中的，且必须是真正的泡面（不是干脆面）
latiao_ids = {s['id'] for s in latiao_snacks}
noodle_keywords = ['方便面', '泡面', '拉面', '火鸡面', '辛拉面', '出前一丁', '合味道', '开杯乐', '汤达人', '老坛酸菜', '红烧牛肉', '豚骨', '酸辣粉']
# 排除干脆面关键词
dry_noodle_keywords = ['干脆面', '小浣熊', '小当家', '魔法士', '捏碎']
noodle_snacks = select_exhibition_snacks(
    lambda s: s['id'] not in latiao_ids and (
        (s['category'] == 'instant_noodle' and not any(d in s['name'] for d in dry_noodle_keywords)) or
        any(x in s['name'] for x in noodle_keywords) and not any(d in s['name'] for d in dry_noodle_keywords)
    ),
    min_count=8,
    priority_boost=lambda s: 2 if '方便面' in s['name'] or '泡面' in s['name'] else 1
)
add_to_exhibition('2', noodle_snacks)
print(f"\n2. 泡面深夜食堂: {len(noodle_snacks)} 件")
for s in noodle_snacks[:5]:
    print(f"   - {s['name']} ({s['brand']})")

# 3. 童年校门口
# 场景标签包含school_gate，或特定童年零食
used_ids = latiao_ids | {s['id'] for s in noodle_snacks}
school_snacks = select_exhibition_snacks(
    lambda s: s['id'] not in used_ids and (
        'school_gate' in s.get('scene_tags', []) or
        any(x in s['name'] for x in ['小浣熊', '小当家', '干脆面', '卜卜星', '跳跳糖', '大大', '泡泡糖']) or
        ('childhood_90s' in s.get('era_tags', []) and s['price'] <= 2)
    ),
    min_count=8
)
# 如果不够8个，补充一些辣条（辣条也是校门口常见）
if len(school_snacks) < 8:
    extra = [s for s in latiao_snacks if s['price'] <= 1][:8-len(school_snacks)]
    school_snacks = school_snacks + extra
add_to_exhibition('3', school_snacks)
print(f"\n3. 童年校门口: {len(school_snacks)} 件")
for s in school_snacks[:5]:
    print(f"   - {s['name']} ({s['brand']})")

# 4. 酸到流泪
used_ids = used_ids | {s['id'] for s in school_snacks}
sour_snacks = select_exhibition_snacks(
    lambda s: s['id'] not in used_ids and (
        'sour' in s.get('flavor_tags', []) or
        s['category'] == 'pickle' or
        any(x in s['name'] for x in ['话梅', '陈皮', '山楂', '溜溜梅', '果丹皮', '酸角', '杨梅', '九制'])
    ),
    min_count=8
)
add_to_exhibition('4', sour_snacks)
print(f"\n4. 酸到流泪: {len(sour_snacks)} 件")
for s in sour_snacks[:5]:
    print(f"   - {s['name']} ({s['brand']})")

# 5. 甜蜜炸弹
used_ids = used_ids | {s['id'] for s in sour_snacks}
sweet_snacks = select_exhibition_snacks(
    lambda s: s['id'] not in used_ids and (
        'sweet' in s.get('flavor_tags', []) or
        s['category'] in ['candy', 'chocolate', 'pastry'] or
        any(x in s['name'] for x in ['大白兔', '奶糖', '麦丽素', '巧克力', '棒棒糖', '棉花糖', '蛋糕', '派'])
    ),
    min_count=8,
    priority_boost=lambda s: 2 if s['category'] in ['candy', 'chocolate'] else 1
)
add_to_exhibition('5', sweet_snacks)
print(f"\n5. 甜蜜炸弹: {len(sweet_snacks)} 件")
for s in sweet_snacks[:5]:
    print(f"   - {s['name']} ({s['brand']})")

# 6. 螺蛳粉宇宙 - 螺蛳粉+酸辣粉+重口味速食
used_ids = used_ids | {s['id'] for s in sweet_snacks}
luosi_keywords = ['螺蛳粉', '好欢螺', '螺霸王', '李子柒', '柳全', '嘻螺会', '肖叔叔']
luosi_snacks = select_exhibition_snacks(
    lambda s: s['id'] not in used_ids and (
        s['category'] == 'luosifen' or
        any(kw in s['name'] for kw in luosi_keywords)
    ),
    min_count=8
)
# 螺蛳粉不够的话，补充酸辣粉等粉类食品
if len(luosi_snacks) < 8:
    extra_keywords = ['酸辣粉', '肥肠粉', '桂林米粉', '米粉', '粉丝', '河粉', '米线']
    extra = [s for s in snacks if s['id'] not in used_ids and any(kw in s['name'] for kw in extra_keywords)][:8-len(luosi_snacks)]
    luosi_snacks = luosi_snacks + extra
# 还不够则补充辣味方便面
if len(luosi_snacks) < 8:
    spicy_keywords = ['辣', '酸辣', '麻辣', '香辣']
    extra = [s for s in noodle_snacks if s['id'] not in used_ids and any(kw in s['name'] for kw in spicy_keywords)][:8-len(luosi_snacks)]
    luosi_snacks = luosi_snacks + extra
# 最后补充任意未使用的方便面
if len(luosi_snacks) < 8:
    extra = [s for s in noodle_snacks if s['id'] not in used_ids][:8-len(luosi_snacks)]
    luosi_snacks = luosi_snacks + extra
add_to_exhibition('6', luosi_snacks)
print(f"\n6. 螺蛳粉宇宙: {len(luosi_snacks)} 件")
for s in luosi_snacks[:5]:
    print(f"   - {s['name']} ({s['brand']})")

# 7. 方便速食革命 - 包含自热、冲泡、即食等所有方便食品
# 注：原数据自热食品太少，扩展为更宽泛的方便速食主题
used_ids = used_ids | {s['id'] for s in luosi_snacks}
# 首先选自热食品
selfheat_snacks = select_exhibition_snacks(
    lambda s: s['id'] not in used_ids and (
        s['category'] == 'self_heating' or
        any(kw in s['name'] for kw in ['自热', '自嗨锅', '方便火锅'])
    ),
    min_count=8,
    max_count=30
)
# 补充所有方便面（排除干脆面）
seen_ids = {s['id'] for s in selfheat_snacks}
extra_noodle = [s for s in snacks if s['id'] not in used_ids and s['id'] not in seen_ids 
                and s['category'] == 'instant_noodle' 
                and not any(d in s['name'] for d in ['干脆面', '小浣熊', '小当家', '魔法士'])]
for s in extra_noodle[:8]:
    if s['id'] not in seen_ids:
        selfheat_snacks.append(s)
        seen_ids.add(s['id'])
# 还不够则补充冲泡类零食
if len(selfheat_snacks) < 8:
    extra = [s for s in snacks if s['id'] not in used_ids and s['id'] not in seen_ids
             and any(kw in s['name'] for kw in ['冲泡', '即食', '速食', '粉丝', '酸辣粉'])]
    for s in extra[:8-len(selfheat_snacks)]:
        if s['id'] not in seen_ids:
            selfheat_snacks.append(s)
            seen_ids.add(s['id'])
# 最后补充任意方便面
if len(selfheat_snacks) < 8:
    extra = [s for s in snacks if s['id'] not in used_ids and s['id'] not in seen_ids
             and s['category'] == 'instant_noodle']
    for s in extra[:8-len(selfheat_snacks)]:
        if s['id'] not in seen_ids:
            selfheat_snacks.append(s)
            seen_ids.add(s['id'])
add_to_exhibition('7', selfheat_snacks)
print(f"\n7. 自热万物: {len(selfheat_snacks)} 件")
for s in selfheat_snacks[:5]:
    print(f"   - {s['name']} ({s['brand']})")

# 8. 亚洲便利店巡礼
used_ids = used_ids | {s['id'] for s in selfheat_snacks}
convenience_snacks = select_exhibition_snacks(
    lambda s: s['id'] not in used_ids and (
        'convenience_store' in s.get('scene_tags', []) or
        s.get('origin_region') in ['Japan', 'Korea', 'Taiwan', 'HongKong'] or
        any(x in s['brand'] for x in ['日清', '卡乐比', '格力高', '明治', '不二家', '乐天', '好丽友', '张君雅', '统一'])
    ),
    min_count=8,
    priority_boost=lambda s: 2 if s.get('origin_region') in ['Japan', 'Korea'] else 1
)
add_to_exhibition('8', convenience_snacks)
print(f"\n8. 亚洲便利店巡礼: {len(convenience_snacks)} 件")
for s in convenience_snacks[:5]:
    print(f"   - {s['name']} ({s['brand']}, {s.get('origin_region', 'N/A')})")

# 9. 消失的经典
used_ids = used_ids | {s['id'] for s in convenience_snacks}
discontinued_snacks = select_exhibition_snacks(
    lambda s: s['id'] not in used_ids and (
        s['status'] == 'discontinued' or
        any(x in s['name'] for x in ['老版', '早期', '停产', '绝版', '怀旧', '复古'])
    ),
    min_count=8
)
# 确保停产展有足够展品
if len(discontinued_snacks) < 8:
    # 从已停产的里面补充
    extra = [s for s in snacks if s['status'] == 'discontinued' and s['id'] not in used_ids][:8-len(discontinued_snacks)]
    discontinued_snacks = discontinued_snacks + extra
add_to_exhibition('9', discontinued_snacks)
print(f"\n9. 消失的经典: {len(discontinued_snacks)} 件")
for s in discontinued_snacks[:5]:
    print(f"   - {s['name']} ({s['brand']})")

# ========== 生成策展数据 ==========
curations = [
    {
        'id': '1',
        'title': '辣条编年史',
        'subtitle': '从小卖部5毛辣条到卫龙帝国',
        'description': '还记得校门口小卖部玻璃罐里那一根根红彤彤的辣条吗？从最初五毛钱一包的"三无产品"，到如今卫龙成为上市公司，辣条完成了从"垃圾食品"到"国民零食"的华丽转身。这个展览带你回顾辣条的进化史——那些让我们辣到流泪、辣到上瘾、却又停不下来的青春记忆。每一根辣条背后，都是一段关于勇气（敢吃）、友谊（分享）和成长（被妈妈骂）的故事。',
        'descriptionEn': 'From 5-cent spicy strips to Weilong empire.',
        'coverImage': latiao_snacks[0]['image'] if latiao_snacks else '',
        'snackImages': get_snack_images(latiao_snacks),
        'snackCount': len(latiao_snacks),
        'theme': 'flavor',
        'isDiscontinuedTheme': False,
        'snackIds': [s['id'] for s in latiao_snacks]
    },
    {
        'id': '2',
        'title': '泡面深夜食堂',
        'subtitle': '那些陪你熬夜的方便面们',
        'description': '深夜十一点，宿舍熄灯后，一包泡面就是最好的慰藉。从最早的红烧牛肉面到后来的老坛酸菜，从国产的康师傅到进口的辛拉面、火鸡面，方便面见证了无数个赶作业、打游戏、追剧的夜晚。这个展览献给所有在深夜被泡面香气治愈过的灵魂——那三分钟等待的时间，是青春最漫长的期待。',
        'descriptionEn': 'Instant noodles that kept you company at midnight.',
        'coverImage': noodle_snacks[0]['image'] if noodle_snacks else '',
        'snackImages': get_snack_images(noodle_snacks),
        'snackCount': len(noodle_snacks),
        'theme': 'lifestyle',
        'isDiscontinuedTheme': False,
        'snackIds': [s['id'] for s in noodle_snacks]
    },
    {
        'id': '3',
        'title': '童年校门口',
        'subtitle': '放学铃响后的5毛钱江湖',
        'description': '放学铃一响，书包还没放下就冲向校门口的小卖部。玻璃柜台后面藏着整个童年的快乐——5毛钱一包的辣条、1块钱的冰袋饮料、咬一口就掉渣的干脆面。那时候零花钱不多，每一次选择都像在做人生最重大的决定：今天是要收集水浒卡的小浣熊，还是要套在手指上吃的奇多圈？这个展览，献给那个用5毛钱就能买到快乐的年纪。',
        'descriptionEn': 'The 50-cent paradise after school bell.',
        'coverImage': school_snacks[0]['image'] if school_snacks else '',
        'snackImages': get_snack_images(school_snacks),
        'snackCount': len(school_snacks),
        'theme': 'era',
        'isDiscontinuedTheme': False,
        'snackIds': [s['id'] for s in school_snacks]
    },
    {
        'id': '4',
        'title': '酸到流泪',
        'subtitle': '酸味零食的极致诱惑',
        'description': '有一种快乐叫"酸到眯眼"，有一种上瘾叫"再来一颗"。从话梅到陈皮，从果丹皮到酸角糕，酸味零食总有一种让人欲罢不能的魔力。它们是我们晕车时的救星，是课间分享的硬通货，是挑战朋友"敢不敢吃"的胆量测试。这个展览收录了所有让你口水直流、五官扭曲却又停不下来的酸味回忆——准备好你的味蕾了吗？',
        'descriptionEn': 'Sour snacks that make you cry tears of joy.',
        'coverImage': sour_snacks[0]['image'] if sour_snacks else '',
        'snackImages': get_snack_images(sour_snacks),
        'snackCount': len(sour_snacks),
        'theme': 'flavor',
        'isDiscontinuedTheme': False,
        'snackIds': [s['id'] for s in sour_snacks]
    },
    {
        'id': '5',
        'title': '甜蜜炸弹',
        'subtitle': '糖分过载的幸福瞬间',
        'description': '糖果是童年最甜蜜的记忆。大白兔奶糖外层的糯米纸要先用舌头舔化，麦丽素要一颗颗含到巧克力化开才舍得咬，跳跳糖在嘴里噼里啪啦炸开的瞬间是最接近魔法的体验。这个展览收集了所有让你甜到心里、甜到蛀牙、甜到被妈妈骂的糖分炸弹——因为小时候我们相信，吃糖就能带来快乐，而快乐就是这么简单。',
        'descriptionEn': 'Sugar overload happiness in every bite.',
        'coverImage': sweet_snacks[0]['image'] if sweet_snacks else '',
        'snackImages': get_snack_images(sweet_snacks),
        'snackCount': len(sweet_snacks),
        'theme': 'flavor',
        'isDiscontinuedTheme': False,
        'snackIds': [s['id'] for s in sweet_snacks]
    },
    {
        'id': '6',
        'title': '粉面江湖',
        'subtitle': '螺蛳粉、酸辣粉与米粉的麻辣世界',
        'description': '从柳州的螺蛳粉到重庆的酸辣粉，从桂林米粉到云南过桥米线——中国的粉面文化博大精深。这个展览聚焦于那些"重口味"的粉面食品：酸笋发酵的独特香气、红油辣椒的视觉冲击、滑溜米粉的口感享受。它们可能不是最精致的食物，但绝对是最有烟火气的存在。献给所有嗦粉爱好者，以及愿意为了一碗粉而排队的吃货们。',
        'descriptionEn': 'The spicy world of rice noodles from Luosifen to hot and sour noodles.',
        'coverImage': luosi_snacks[0]['image'] if luosi_snacks else '',
        'snackImages': get_snack_images(luosi_snacks),
        'snackCount': len(luosi_snacks),
        'theme': 'category',
        'isDiscontinuedTheme': False,
        'snackIds': [s['id'] for s in luosi_snacks]
    },
    {
        'id': '7',
        'title': '方便速食革命',
        'subtitle': '从泡面到自热，懒人美食进化史',
        'description': '从最早的红烧牛肉面到如今琳琅满目的自热火锅，方便速食见证了现代生活节奏的变迁。加班深夜的一碗泡面、宿舍里 sharing 的自热火锅、旅行途中的即食便当——这些不需要开火就能吃上的热乎食物，是都市人的救星。这个展览收集了从传统方便面到现代自热食品的全谱系，献给所有追求效率却不肯委屈味蕾的美食家。',
        'descriptionEn': 'The evolution of instant food from cup noodles to self-heating hot pot.',
        'coverImage': selfheat_snacks[0]['image'] if selfheat_snacks else '',
        'snackImages': get_snack_images(selfheat_snacks),
        'snackCount': len(selfheat_snacks),
        'theme': 'lifestyle',
        'isDiscontinuedTheme': False,
        'snackIds': [s['id'] for s in selfheat_snacks]
    },
    {
        'id': '8',
        'title': '亚洲便利店巡礼',
        'subtitle': '7-11、全家、罗森里的隐藏宝藏',
        'description': '便利店是城市人的深夜食堂。日本的饭团和关东煮、韩国的三角包和香蕉牛奶、台湾的茶叶蛋和木瓜牛奶——每一个便利店的冷柜里都藏着惊喜。这个展览带你逛遍亚洲便利店里的经典零食：那些加班后的慰藉、赶时间时的救急、或者是单纯的嘴馋时刻。不需要米其林，便利店里的美味才是最真实的味道。',
        'descriptionEn': 'Hidden gems from Asian convenience stores.',
        'coverImage': convenience_snacks[0]['image'] if convenience_snacks else '',
        'snackImages': get_snack_images(convenience_snacks),
        'snackCount': len(convenience_snacks),
        'theme': 'region',
        'isDiscontinuedTheme': False,
        'snackIds': [s['id'] for s in convenience_snacks]
    },
    {
        'id': '9',
        'title': '消失的经典',
        'subtitle': '那些买不到了但永远怀念的零食',
        'description': '有些零食已经停产，却在记忆里永远鲜活。也许是配方变了，也许是厂家倒闭了，也许是时代不再需要它们了——但每当想起那个味道，心里总会泛起一阵酸涩的怀念。这个展览收录了那些"绝版"的零食：小时候最喜欢的、现在已经买不到了的、只能在回忆里品尝的味道。它们提醒我们，珍惜当下，因为连零食都有保质期，更何况那些逝去的时光。',
        'descriptionEn': 'Discontinued snacks we will never forget.',
        'coverImage': discontinued_snacks[0]['image'] if discontinued_snacks else '',
        'snackImages': get_snack_images(discontinued_snacks),
        'snackCount': len(discontinued_snacks),
        'theme': 'extinct',
        'isDiscontinuedTheme': True,
        'snackIds': [s['id'] for s in discontinued_snacks]
    }
]

# 统计重复度
print("\n" + "="*50)
print("展览间重复度统计:")
multi_used = {sid: exps for sid, exps in snack_usage.items() if len(exps) > 1}
print(f"  被多个展览使用的零食: {len(multi_used)} 件")
for sid, exps in sorted(multi_used.items(), key=lambda x: -len(x[1]))[:10]:
    s = next(x for x in snacks if x['id'] == sid)
    print(f"    {s['name']}: {len(exps)} 个展览 {exps}")

# 保存策展数据
with open('src/data/curations.json', 'w', encoding='utf-8') as f:
    json.dump(curations, f, ensure_ascii=False, indent=2)

# 同时更新 snacks_premium.json 中的策展引用
for snack in snacks:
    snack['curations'] = snack_usage.get(snack['id'], [])

with open('src/data/snacks_premium.json', 'w', encoding='utf-8') as f:
    json.dump(snacks, f, ensure_ascii=False, indent=2)

print("\n策展数据生成完成！")
print(f"已保存到 src/data/curations.json")
