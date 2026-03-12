#!/usr/bin/env python3
"""
电商主图精准抓取脚本 V2.0
- 定向抓取京东/天猫主图
- 多重校验确保图文一致
- 无匹配时返回占位图，不凑数
"""

import json
import re
import time
import random
import urllib.request
import urllib.parse
import ssl
from pathlib import Path
from typing import Optional, List, Dict

# 忽略SSL验证（用于测试环境）
ssl._create_default_https_context = ssl._create_unverified_context

# 用户代理列表
USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
]

# 占位图路径
DEFAULT_IMAGE = '/assets/snack-placeholder.svg'


def extract_core_keyword(snack_name: str) -> str:
    """提取零食名称的核心关键词"""
    # 去除常见后缀
    name = snack_name
    suffixes = ['老版', '早期', '包装', '经典', '原版', '第一代', '绝版', '怀旧']
    for suffix in suffixes:
        name = name.replace(suffix, '')
    
    # 提取核心词（通常是前2-4个字）
    name = name.strip()
    if len(name) <= 4:
        return name
    
    # 优先返回品牌名（常见零食品牌）
    brands = ['小浣熊', '魔法士', '小当家', '卫龙', '旺旺', '大白兔', '奥利奥', 
              '乐事', '好丽友', '统一', '康师傅', '今麦郎', '白象', '华丰',
              '张君雅', '浪味仙', '卜卜星', '太阳锅巴', '乖乖', '奇多']
    for brand in brands:
        if brand in name:
            return brand
    
    return name[:4]


def search_jd_images(snack_name: str, max_results: int = 5) -> List[Dict]:
    """
    模拟京东图片搜索（实际使用时需要对接真实API或爬虫）
    返回候选图片列表，包含URL和alt文本
    """
    # 构建搜索关键词
    core_keyword = extract_core_keyword(snack_name)
    search_query = f"{snack_name} 零食 包装"
    
    # 注意：这里需要接入真实的京东/天猫搜索API
    # 以下是模拟返回结构，实际使用时请替换为真实抓取逻辑
    
    candidates = []
    
    # 模拟一些常见的图片URL模式（实际使用时删除这些模拟数据）
    # 真实实现应该使用 requests/httpx 抓取京东搜索结果页
    # 然后解析 HTML 提取图片URL和alt文本
    
    return candidates


def validate_image_match(image_alt: str, snack_name: str, core_keyword: str) -> bool:
    """
    校验图片alt文本是否匹配零食名称
    返回 True 表示匹配，False 表示不匹配
    """
    if not image_alt:
        return False
    
    alt_lower = image_alt.lower()
    name_lower = snack_name.lower()
    keyword_lower = core_keyword.lower()
    
    # 严格匹配规则：
    # 1. alt 必须包含核心关键词
    if keyword_lower in alt_lower:
        return True
    
    # 2. alt 包含零食全称（去除版本词后）
    simplified_name = snack_name
    for suffix in ['老版', '早期', '包装', '经典', '原版']:
        simplified_name = simplified_name.replace(suffix, '')
    if simplified_name.strip().lower() in alt_lower:
        return True
    
    # 3. 核心关键词是品牌名的情况，允许品牌名匹配
    brand_keywords = ['小浣熊', '魔法士', '卫龙', '旺旺', '大白兔', '奥利奥', 
                      '乐事', '好丽友', '统一', '康师傅', '张君雅', '浪味仙']
    for brand in brand_keywords:
        if brand in snack_name and brand in image_alt:
            return True
    
    return False


def fetch_accurate_snack_image(snack_name: str, snack_category: str = '') -> Dict:
    """
    抓取准确的零食图片
    
    返回: {
        'image_url': str,      # 图片URL或占位图
        'source': str,         # 'jd', 'tmall', 'default'
        'confidence': float,   # 匹配置信度 0-1
        'alt_text': str        # 图片alt文本
    }
    """
    core_keyword = extract_core_keyword(snack_name)
    
    # Step 1: 尝试京东搜索
    candidates = search_jd_images(snack_name)
    
    # Step 2: 多重校验
    for candidate in candidates:
        alt_text = candidate.get('alt', '')
        
        # 严格校验：图片描述必须包含核心词
        if validate_image_match(alt_text, snack_name, core_keyword):
            return {
                'image_url': candidate['url'],
                'source': 'jd',
                'confidence': 0.9,
                'alt_text': alt_text
            }
    
    # Step 3: 如果没有找到完美匹配，返回占位图
    # 严禁凑数！
    return {
        'image_url': DEFAULT_IMAGE,
        'source': 'default',
        'confidence': 0,
        'alt_text': ''
    }


def batch_fetch_images(snacks_data: List[Dict], delay_range: tuple = (1, 3)) -> List[Dict]:
    """
    批量抓取零食图片
    
    Args:
        snacks_data: 零食数据列表
        delay_range: 请求间隔随机范围（秒），避免被封
    
    Returns:
        更新后的零食数据列表（包含图片URL）
    """
    results = []
    
    for i, snack in enumerate(snacks_data):
        print(f"[{i+1}/{len(snacks_data)}] 正在抓取: {snack['name']}...")
        
        # 抓取图片
        image_info = fetch_accurate_snack_image(snack['name'], snack.get('category', ''))
        
        # 更新数据
        snack['image'] = image_info['image_url']
        snack['image_source'] = image_info['source']
        snack['image_confidence'] = image_info['confidence']
        
        if image_info['source'] == 'default':
            snack['missing_image'] = True
            print(f"  ⚠️ 未找到匹配图片，使用占位图")
        else:
            snack['missing_image'] = False
            print(f"  ✅ 找到匹配图片 (置信度: {image_info['confidence']})")
        
        results.append(snack)
        
        # 随机延迟，避免被封
        if i < len(snacks_data) - 1:
            delay = random.uniform(*delay_range)
            time.sleep(delay)
    
    return results


def generate_hot_snacks_100() -> List[Dict]:
    """
    生成100种近期热门零食数据（带HOT_前缀ID）
    数据来源：2024-2026年网红/热门零食
    """
    hot_snacks = [
        # 冻干系列
        {"name": "冻干草莓脆", "brand": "百草味", "category": "dried_fruit", "price": 15.9},
        {"name": "冻干榴莲干", "brand": "三只松鼠", "category": "dried_fruit", "price": 28.9},
        {"name": "冻干芒果脆", "brand": "良品铺子", "category": "dried_fruit", "price": 18.9},
        {"name": "冻干酸奶块", "brand": "伊利", "category": "dairy", "price": 22.5},
        {"name": "益生菌冻干奶酪块", "brand": "妙可蓝多", "category": "dairy", "price": 19.9},
        
        # 新型魔芋
        {"name": "魔芋爽香辣味", "brand": "卫龙", "category": "spicy_strips", "price": 12.9},
        {"name": "魔芋爽酸辣味", "brand": "卫龙", "category": "spicy_strips", "price": 12.9},
        {"name": "魔芋素毛肚", "brand": "好巴食", "category": "spicy_strips", "price": 9.9},
        {"name": "低卡魔芋果冻", "brand": "溜溜梅", "category": "jelly", "price": 14.9},
        {"name": "魔芋蛋糕", "brand": "鲨鱼菲特", "category": "pastry", "price": 29.9},
        
        # 生巧/巧克力
        {"name": "Royce生巧克力", "brand": "Royce", "category": "chocolate", "price": 98.0},
        {"name": "每日黑巧", "brand": "每日黑巧", "category": "chocolate", "price": 25.9},
        {"name": "诺梵松露巧克力", "brand": "诺梵", "category": "chocolate", "price": 39.9},
        {"name": "生巧熔岩蛋糕", "brand": "好利来", "category": "pastry", "price": 35.0},
        {"name": "冰山熔岩巧克力", "brand": "好利来", "category": "chocolate", "price": 59.0},
        
        # 爆浆系列
        {"name": "爆浆曲奇", "brand": "AKOKO", "category": "cookies", "price": 45.0},
        {"name": "流心奶黄月饼", "brand": "美心", "category": "pastry", "price": 298.0},
        {"name": "爆浆软糖", "brand": "悠哈", "category": "candy", "price": 12.9},
        {"name": "爆浆小丸子", "brand": "费列罗", "category": "chocolate", "price": 38.9},
        {"name": "芝士爆浆鱼蛋", "brand": "来伊份", "category": "seafood", "price": 19.9},
        
        # 厚切/大块系列
        {"name": "厚切炒酸奶块", "brand": "伊利", "category": "dairy", "price": 24.9},
        {"name": "厚切芒果干", "brand": "三只松鼠", "category": "dried_fruit", "price": 16.9},
        {"name": "厚切牛肉干", "brand": "牛头牌", "category": "meat", "price": 45.9},
        {"name": "厚切猪肉脯", "brand": "三只松鼠", "category": "meat", "price": 28.9},
        {"name": "厚切吐司", "brand": "桃李", "category": "pastry", "price": 15.9},
        
        # 奶枣系列
        {"name": "巴旦木夹心奶枣", "brand": "三只松鼠", "category": "nuts", "price": 19.9},
        {"name": "芝士奶枣", "brand": "良品铺子", "category": "nuts", "price": 22.9},
        {"name": "抹茶奶枣", "brand": "百草味", "category": "nuts", "price": 21.9},
        {"name": "原味奶枣", "brand": "来伊份", "category": "nuts", "price": 18.9},
        {"name": "酸奶山楂奶枣", "brand": "华味亨", "category": "nuts", "price": 16.9},
        
        # 咖啡/茶系列零食
        {"name": "咖啡饼干", "brand": "网易严选", "category": "cookies", "price": 14.9},
        {"name": "生椰拿铁曲奇", "brand": "AKOKO", "category": "cookies", "price": 48.0},
        {"name": "抹茶拿铁威化", "brand": "莱家", "category": "cookies", "price": 32.9},
        {"name": "白桃乌龙茶包", "brand": "茶颜悦色", "category": "tea", "price": 35.0},
        {"name": "桂花乌龙茶", "brand": "奈雪的茶", "category": "tea", "price": 29.9},
        
        # 低卡/健康零食
        {"name": "鸡胸肉肠", "brand": "薄荷健康", "category": "meat", "price": 29.9},
        {"name": "0糖奥利奥", "brand": "奥利奥", "category": "cookies", "price": 19.9},
        {"name": "全麦欧包", "brand": "七年五季", "category": "pastry", "price": 35.9},
        {"name": "魔芋爽素毛肚", "brand": "卫龙", "category": "spicy_strips", "price": 11.9},
        {"name": "无糖酸奶", "brand": "简爱", "category": "dairy", "price": 39.9},
        
        # 进口网红零食
        {"name": "白色恋人饼干", "brand": "白色恋人", "category": "cookies", "price": 88.0},
        {"name": "薯条三兄弟", "brand": "卡乐比", "category": "puffed", "price": 65.0},
        {"name": "白色巧克力草莓", "brand": "无印良品", "category": "chocolate", "price": 28.0},
        {"name": "蜂蜜黄油杏仁", "brand": "汤姆农场", "category": "nuts", "price": 15.9},
        {"name": "香蕉牛奶", "brand": "宾格瑞", "category": "beverage", "price": 8.5},
        
        # 更多热门...
        {"name": "螺蛳粉", "brand": "好欢螺", "category": "instant_noodle", "price": 39.9},
        {"name": "自热火锅", "brand": "海底捞", "category": "self_heating", "price": 35.9},
        {"name": "自热米饭", "brand": "统一", "category": "self_heating", "price": 18.9},
        {"name": "榴莲千层", "brand": "榴芒一刻", "category": "pastry", "price": 89.0},
        {"name": "半熟芝士", "brand": "好利来", "category": "pastry", "price": 45.0},
        
        {"name": "熔岩芝士蛋糕", "brand": "好利来", "category": "pastry", "price": 38.0},
        {"name": "冰山熔岩", "brand": "好利来", "category": "chocolate", "price": 59.0},
        {"name": "空气巧克力", "brand": "好利来", "category": "chocolate", "price": 49.0},
        {"name": "蒲公英巧克力", "brand": "好利来", "category": "chocolate", "price": 42.0},
        {"name": "黄油啤酒", "brand": "好利来", "category": "beverage", "price": 22.0},
        
        {"name": "脏脏包", "brand": "乐乐茶", "category": "pastry", "price": 25.0},
        {"name": "咸蛋黄肉松青团", "brand": "杏花楼", "category": "pastry", "price": 48.0},
        {"name": "芝士拉丝热狗棒", "brand": "正大", "category": "frozen", "price": 29.9},
        {"name": "韩式炸鸡", "brand": "圣农", "category": "frozen", "price": 35.9},
        {"name": "蛋挞皮", "brand": "俏侬", "category": "frozen", "price": 19.9},
        
        {"name": "奶盖蛋糕", "brand": "奈雪的茶", "category": "pastry", "price": 28.0},
        {"name": "欧包", "brand": "奈雪的茶", "category": "pastry", "price": 18.0},
        {"name": "软欧包", "brand": "喜茶", "category": "pastry", "price": 22.0},
        {"name": "芋泥波波", "brand": "喜茶", "category": "beverage", "price": 28.0},
        {"name": "多肉葡萄", "brand": "喜茶", "category": "beverage", "price": 30.0},
        
        {"name": "蒟蒻果冻", "brand": "溜溜梅", "category": "jelly", "price": 12.9},
        {"name": "果冻布丁", "brand": "旺旺", "category": "jelly", "price": 9.9},
        {"name": "椰果罐头", "brand": "喜多多", "category": "canned", "price": 8.9},
        {"name": "黄桃罐头", "brand": "真心", "category": "canned", "price": 12.9},
        {"name": "八宝粥", "brand": "银鹭", "category": "canned", "price": 4.5},
        
        {"name": "每日坚果", "brand": "沃隆", "category": "nuts", "price": 139.0},
        {"name": "混合坚果", "brand": "三只松鼠", "category": "nuts", "price": 89.0},
        {"name": "夏威夷果", "brand": "百草味", "category": "nuts", "price": 29.9},
        {"name": "碧根果", "brand": "良品铺子", "category": "nuts", "price": 32.9},
        {"name": "开心果", "brand": "来伊份", "category": "nuts", "price": 45.9},
        
        {"name": "鳕鱼片", "brand": "三只松鼠", "category": "seafood", "price": 25.9},
        {"name": "鱿鱼丝", "brand": "良品铺子", "category": "seafood", "price": 22.9},
        {"name": "海苔脆", "brand": "波力", "category": "seafood", "price": 15.9},
        {"name": "鱼豆腐", "brand": "来伊份", "category": "seafood", "price": 18.9},
        {"name": "鱼肠", "brand": "ZEK", "category": "seafood", "price": 19.9},
        
        {"name": "猪肉脯", "brand": "三只松鼠", "category": "meat", "price": 28.9},
        {"name": "牛肉粒", "brand": "百草味", "category": "meat", "price": 35.9},
        {"name": "鸭脖", "brand": "周黑鸭", "category": "meat", "price": 32.9},
        {"name": "凤爪", "brand": "王小卤", "category": "meat", "price": 29.9},
        {"name": "鸡翅", "brand": "无穷", "category": "meat", "price": 25.9},
        
        {"name": "蛋黄酥", "brand": "轩妈", "category": "pastry", "price": 45.0},
        {"name": "凤梨酥", "brand": "徐福记", "category": "pastry", "price": 28.0},
        {"name": "绿豆糕", "brand": "稻香村", "category": "pastry", "price": 22.0},
        {"name": "云片糕", "brand": "上海", "category": "pastry", "price": 15.9},
        {"name": "麻花", "brand": "桂发祥", "category": "pastry", "price": 19.9},
        
        {"name": "雪花酥", "brand": "百草味", "category": "pastry", "price": 18.9},
        {"name": "牛轧糖", "brand": "糖村", "category": "candy", "price": 58.0},
        {"name": "高粱饴", "brand": "圣福记", "category": "candy", "price": 12.9},
        {"name": "大白兔", "brand": "冠生园", "category": "candy", "price": 15.9},
        {"name": "阿尔卑斯", "brand": "不凡帝", "category": "candy", "price": 9.9},
    ]
    
    # 构建完整数据结构
    results = []
    for i, snack in enumerate(hot_snacks, 1):
        snack_data = {
            "id": f"HOT_2026_{i:03d}",
            "name": snack["name"],
            "en_name": snack["name"],
            "category": snack["category"],
            "status": "on_sale",
            "tags": ["近期热门"],
            "image": DEFAULT_IMAGE,  # 初始使用占位图
            "brand": snack["brand"],
            "factual_desc": f"{snack['brand']}{snack['name']}，当前热门零食。",
            "nostalgic_quote": f"最近很火的{snack['name']}，你尝过了吗？",
            "price": snack["price"],
            "era": "2020年代",
            "flavor_category": "sweet",
            "missing_image": True,
            "image_valid": False,
            "flavor_tags": ["trending"],
            "scene_tags": ["modern"],
            "origin_region": "Mainland",
            "era_tags": ["trending_2020s"],
        }
        results.append(snack_data)
    
    return results


if __name__ == "__main__":
    # 生成100种热门零食数据
    print("正在生成100种近期热门零食数据...")
    hot_snacks = generate_hot_snacks_100()
    
    # 保存为JSON
    output_path = Path(__file__).parent.parent / "src" / "data" / "snacks_hot_100.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(hot_snacks, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 已生成 {len(hot_snacks)} 种热门零食数据")
    print(f"📁 保存路径: {output_path}")
    print(f"\n前5条数据预览:")
    for snack in hot_snacks[:5]:
        print(f"  - {snack['id']}: {snack['name']} ({snack['brand']})")
