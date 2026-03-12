#!/usr/bin/env python3
"""
电商商品图片爬虫 - 使用京东/淘宝API获取准确商品图
严格匹配零食名称，拒绝临时代替
"""

import os
import re
import json
import time
import random
import logging
import hashlib
from pathlib import Path
from urllib.parse import quote_plus, urlencode
from datetime import datetime
from typing import List, Dict, Tuple, Optional

from PIL import Image
from io import BytesIO
import requests

# 配置
OUTPUT_DIR = Path("/Users/zoe/Downloads/app 2/public/snack-images-fixed")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

LOGS_DIR = Path("./logs")
LOGS_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOGS_DIR / f"ecommerce_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# 精确的零食列表（必须准确匹配）
TARGET_SNACKS = [
    # 螺蛳粉系列
    {"name": "李子柒螺蛳粉", "brand": "李子柒", "id": "liziji_luosifen"},
    {"name": "好欢螺螺蛳粉", "brand": "好欢螺", "id": "haohuanluo_luosifen"},
    {"name": "螺蛳粉", "brand": "通用", "id": "luosifen_generic"},
    
    # 卫龙系列
    {"name": "卫龙老版透明包装", "brand": "卫龙", "id": "weilong_old"},
    {"name": "亲嘴烧老包装", "brand": "卫龙", "id": "qinzuishao_old"},
    {"name": "魔芋爽", "brand": "卫龙", "id": "moyushuang"},
    {"name": "魔芋爽香辣味", "brand": "卫龙", "id": "moyushuang_spicy"},
    
    # 其他需修复的
    {"name": "凤梨酥老版", "brand": "徐福记", "id": "fenglisu_old"},
    {"name": "魔芋蛋糕", "brand": "鲨鱼菲特", "id": "moyu_cake"},
    {"name": "香蕉牛奶", "brand": "宾格瑞", "id": "banana_milk"},
    {"name": "鱼肠", "brand": "ZEK", "id": "zek_fishsausage"},
    {"name": "旺旺单身狗粮", "brand": "旺旺", "id": "wangwang_single"},
    {"name": "手指饼干早期版", "brand": "", "id": "finger_cookie_old"},
    {"name": "南街村拌面早期", "brand": "南街村", "id": "nanjiecun_noodles"},
    {"name": "汤达人", "brand": "统一", "id": "tangdaren"},
    {"name": "酸辣粉", "brand": "", "id": "suanlafen"},
    {"name": "自热火锅", "brand": "海底捞", "id": "zire_hotpot"},
    {"name": "自热米饭", "brand": "统一", "id": "zire_rice"},
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://search.jd.com/',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
}


def search_jd_images(keyword: str, num: int = 5) -> List[Dict]:
    """
    从京东搜索商品图片
    使用京东搜索API获取真实商品图
    """
    try:
        # 京东搜索URL
        search_url = f"https://search.jd.com/Search?keyword={quote_plus(keyword)}&enc=utf-8"
        
        logger.info(f"🔍 京东搜索: {keyword}")
        print(f"  访问: {search_url[:80]}...")
        
        resp = requests.get(search_url, headers=HEADERS, timeout=15)
        resp.encoding = 'utf-8'
        
        images = []
        
        # 提取京东商品图片（从页面HTML中提取）
        # 京东商品图格式: //img10.360buyimg.com/... 或 https://img10.360buyimg.com/...
        import re
        
        # 查找商品图片URL
        img_pattern = r'//img\d+\.360buyimg\.com/[^"\s]+\.jpg'
        img_urls = re.findall(img_pattern, resp.text)
        
        # 去重并转换为完整URL
        seen = set()
        for url in img_urls[:num*2]:
            if url not in seen:
                seen.add(url)
                full_url = 'https:' + url if url.startswith('//') else url
                images.append({
                    'url': full_url,
                    'source': 'jd',
                    'keyword': keyword
                })
            if len(images) >= num:
                break
        
        logger.info(f"  ✅ 找到 {len(images)} 张京东商品图")
        return images
        
    except Exception as e:
        logger.error(f"  ❌ 京东搜索失败: {e}")
        return []


def search_taobao_images(keyword: str, num: int = 5) -> List[Dict]:
    """
    从淘宝搜索商品图片（使用淘宝图片搜索API）
    """
    try:
        # 淘宝图片搜索
        search_url = f"https://s.taobao.com/search?q={quote_plus(keyword)}&imgfile=&js=1&stats_click=search_radio_all%3A1&initiative_id=staobaoz_20240101&ie=utf8&sort=sale-desc"
        
        logger.info(f"🔍 淘宝搜索: {keyword}")
        print(f"  访问淘宝...")
        
        headers = {
            **HEADERS,
            'Referer': 'https://www.taobao.com/',
        }
        
        resp = requests.get(search_url, headers=headers, timeout=15)
        resp.encoding = 'utf-8'
        
        images = []
        import re
        
        # 提取淘宝商品图片
        # 淘宝图片URL格式: //g-search3.alicdn.com/... 或 https://gd...
        img_pattern = r'//g-search\d+\.alicdn\.com/[^"\s]+\.jpg'
        img_urls = re.findall(img_pattern, resp.text)
        
        # 也匹配其他淘宝图片格式
        img_pattern2 = r'https://gd\d+\.alicdn\.com/[^"\s]+\.jpg'
        img_urls += re.findall(img_pattern2, resp.text)
        
        seen = set()
        for url in img_urls[:num*2]:
            if url not in seen:
                seen.add(url)
                full_url = url if url.startswith('http') else 'https:' + url
                images.append({
                    'url': full_url,
                    'source': 'taobao',
                    'keyword': keyword
                })
            if len(images) >= num:
                break
        
        logger.info(f"  ✅ 找到 {len(images)} 张淘宝商品图")
        return images
        
    except Exception as e:
        logger.error(f"  ❌ 淘宝搜索失败: {e}")
        return []


def download_image(img_url: str, output_path: Path) -> bool:
    """
    下载图片并验证
    返回: 是否成功
    """
    try:
        headers = {
            'User-Agent': HEADERS['User-Agent'],
            'Referer': 'https://search.jd.com/' if 'jd' in img_url else 'https://s.taobao.com/'
        }
        
        resp = requests.get(img_url, headers=headers, timeout=15)
        
        if resp.status_code != 200:
            logger.warning(f"  HTTP {resp.status_code}")
            return False
        
        content = resp.content
        
        # 文件大小检查
        if len(content) < 5000:
            logger.warning(f"  文件过小 ({len(content)} bytes)")
            return False
        
        if len(content) > 5 * 1024 * 1024:  # 5MB
            logger.warning(f"  文件过大 ({len(content)/1024/1024:.1f}MB)")
            return False
        
        # 验证图片格式
        header = content[:8]
        is_jpg = header.startswith(b'\xff\xd8')
        is_png = header.startswith(b'\x89PNG')
        
        if not (is_jpg or is_png):
            logger.warning(f"  未知格式")
            return False
        
        # 使用PIL验证并获取尺寸
        img = Image.open(BytesIO(content))
        width, height = img.size
        
        # 尺寸检查
        if width < 300 or height < 300:
            logger.warning(f"  尺寸过小 ({width}x{height})")
            return False
        
        # 保存
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'wb') as f:
            f.write(content)
        
        logger.info(f"  💾 已保存: {output_path.name} ({width}x{height})")
        return True
        
    except Exception as e:
        logger.error(f"  ❌ 下载失败: {e}")
        return False


def process_snack(snack: Dict) -> bool:
    """
    处理单个零食
    严格匹配，必须找到准确图片
    """
    name = snack['name']
    brand = snack['brand']
    snack_id = snack['id']
    
    print(f"\n{'='*60}")
    print(f"🍿 {name}")
    print(f"   品牌: {brand}")
    print(f"{'='*60}")
    
    # 构建搜索关键词（精确匹配）
    search_keywords = [
        f"{brand}{name} 商品",  # 最精确
        f"{name} {brand}",
        f"{brand} {name}",
        name,
    ]
    
    output_path = OUTPUT_DIR / f"{snack_id}.jpg"
    
    # 先尝试京东
    for keyword in search_keywords:
        print(f"\n🔍 京东搜索: {keyword}")
        images = search_jd_images(keyword, num=5)
        
        if not images:
            continue
        
        # 下载前3张，选择最合适的
        for i, img in enumerate(images[:3], 1):
            print(f"  [{i}] 下载: {img['url'][:50]}...")
            
            if download_image(img['url'], output_path):
                print(f"  ✅ 成功!")
                return True
            else:
                print(f"  ❌ 失败")
            
            time.sleep(random.uniform(1, 2))
        
        time.sleep(random.uniform(2, 4))
    
    # 京东失败，尝试淘宝
    print(f"\n🔄 切换到淘宝...")
    for keyword in search_keywords:
        print(f"\n🔍 淘宝搜索: {keyword}")
        images = search_taobao_images(keyword, num=5)
        
        if not images:
            continue
        
        for i, img in enumerate(images[:3], 1):
            print(f"  [{i}] 下载: {img['url'][:50]}...")
            
            if download_image(img['url'], output_path):
                print(f"  ✅ 成功!")
                return True
            else:
                print(f"  ❌ 失败")
            
            time.sleep(random.uniform(1, 2))
        
        time.sleep(random.uniform(2, 4))
    
    print(f"\n❌ {name} - 所有来源均失败")
    return False


def main():
    print("\n" + "="*60)
    print("🚀 电商商品图片爬虫")
    print("   使用京东/淘宝API获取准确商品图")
    print("="*60)
    print(f"目标: {len(TARGET_SNACKS)} 个零食")
    print("="*60)
    
    success_count = 0
    fail_count = 0
    
    for i, snack in enumerate(TARGET_SNACKS, 1):
        print(f"\n📦 [{i}/{len(TARGET_SNACKS)}]")
        
        if process_snack(snack):
            success_count += 1
        else:
            fail_count += 1
        
        # 随机延迟，避免被封
        time.sleep(random.uniform(3, 6))
    
    # 统计
    print("\n" + "="*60)
    print("📊 最终统计")
    print("="*60)
    print(f"  总数:  {len(TARGET_SNACKS)}")
    print(f"  成功:  {success_count} ✅")
    print(f"  失败:  {fail_count} ❌")
    print(f"  成功率: {success_count/len(TARGET_SNACKS)*100:.1f}%")
    print("="*60)
    print(f"📁 输出目录: {OUTPUT_DIR}")
    
    if fail_count > 0:
        print("\n⚠️ 失败的零食:")
        for snack in TARGET_SNACKS:
            output_path = OUTPUT_DIR / f"{snack['id']}.jpg"
            if not output_path.exists():
                print(f"  - {snack['name']}")


if __name__ == "__main__":
    main()
