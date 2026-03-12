#!/usr/bin/env python3
"""
使用 Bing Image Search API 的图文匹配爬虫
申请地址：https://www.microsoft.com/en-us/bing/apis/bing-image-search-api
免费额度：1000次/月
"""

import json
import os
import time
import random
import requests
from pathlib import Path
from typing import Optional

# 项目路径
PROJECT_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = PROJECT_ROOT / "public" / "snack-images-hot-real"
DATA_FILE = PROJECT_ROOT / "src" / "data" / "snacks_hot_100.json"

# 配置（需要用户自行申请API Key）
BING_API_KEY = os.environ.get("BING_API_KEY", "YOUR_API_KEY_HERE")
BING_SEARCH_URL = "https://api.bing.microsoft.com/v7.0/images/search"

# 确保输出目录存在
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def search_bing_images(query: str, count: int = 5) -> list:
    """
    使用 Bing Image Search API 搜索图片
    图文匹配策略：
    1. 搜索关键词 = 品牌 + 零食名称
    2. 取第一张结果（通常最相关）
    3. 验证图片内容（可选OCR）
    """
    if BING_API_KEY == "YOUR_API_KEY_HERE":
        print("⚠️ 请先设置 BING_API_KEY 环境变量")
        return []
    
    headers = {"Ocp-Apim-Subscription-Key": BING_API_KEY}
    params = {
        "q": query,
        "count": count,
        "mkt": "zh-CN",
        "safeSearch": "Moderate",
    }
    
    try:
        response = requests.get(BING_SEARCH_URL, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        images = []
        
        for item in data.get("value", []):
            images.append({
                "url": item.get("contentUrl"),
                "thumbnail": item.get("thumbnailUrl"),
                "title": item.get("name", ""),
                "width": item.get("width"),
                "height": item.get("height"),
            })
        
        return images
        
    except Exception as e:
        print(f"搜索失败: {e}")
        return []


def download_image(img_url: str, output_path: Path) -> bool:
    """下载图片并验证有效性"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        }
        
        response = requests.get(img_url, headers=headers, timeout=15, stream=True)
        response.raise_for_status()
        
        # 检查内容类型
        content_type = response.headers.get('content-type', '')
        if not content_type.startswith('image/'):
            print(f"  ⚠️ 非图片内容: {content_type}")
            return False
        
        # 下载内容
        content = response.content
        
        # 验证文件大小（至少2KB）
        if len(content) < 2048:
            print(f"  ⚠️ 图片太小: {len(content)} bytes")
            return False
        
        # 验证图片文件头
        header = content[:4]
        valid_headers = [
            b"\xff\xd8\xff\xe0",  # JPG
            b"\xff\xd8\xff\xe1",  # JPG (Exif)
            b"\x89\x50\x4e\x47",  # PNG
            b"\x47\x49\x46\x38",  # GIF
        ]
        
        if not any(header.startswith(h[:3]) for h in valid_headers):
            print(f"  ⚠️ 无效图片格式")
            return False
        
        # 保存文件
        with open(output_path, 'wb') as f:
            f.write(content)
        
        return True
        
    except Exception as e:
        print(f"  ⚠️ 下载失败: {e}")
        return False


def verify_image_match(snack_name: str, img_title: str) -> float:
    """
    验证图文匹配度
    通过比较搜索返回的标题与零食名称
    """
    snack_lower = snack_name.lower()
    title_lower = img_title.lower()
    
    # 完全匹配
    if snack_lower in title_lower or title_lower in snack_lower:
        return 1.0
    
    # 关键词匹配
    snack_keywords = set(snack_lower.replace(' ', ''))
    title_keywords = set(title_lower.replace(' ', ''))
    
    intersection = snack_keywords & title_keywords
    union = snack_keywords | title_keywords
    
    if union:
        return len(intersection) / len(union)
    
    return 0.0


def process_snack(snack: dict, index: int, total: int) -> Optional[str]:
    """处理单个零食"""
    snack_id = snack['id']
    name = snack['name']
    brand = snack.get('brand', '')
    
    output_path = OUTPUT_DIR / f"{snack_id}.jpg"
    
    print(f"[{index}/{total}] 处理: {name}")
    
    # 检查是否已存在
    if output_path.exists() and output_path.stat().st_size > 2048:
        print(f"  ✅ 已存在")
        return f"/snack-images-hot-real/{snack_id}.jpg"
    
    # 构建搜索词
    query = f"{brand} {name}".strip()
    print(f"  搜索: {query}")
    
    # 搜索图片
    images = search_bing_images(query, count=3)
    
    if not images:
        print(f"  ❌ 未找到图片")
        return None
    
    # 按匹配度排序并下载
    for img in images:
        img['match_score'] = verify_image_match(name, img.get('title', ''))
    
    images.sort(key=lambda x: x['match_score'], reverse=True)
    
    for img in images:
        img_url = img['url']
        match_score = img['match_score']
        
        print(f"  尝试下载 (匹配度: {match_score:.2f}): {img_url[:50]}...")
        
        if download_image(img_url, output_path):
            size = output_path.stat().st_size
            print(f"  ✅ 下载成功 ({size} bytes)")
            return f"/snack-images-hot-real/{snack_id}.jpg"
        else:
            print(f"  ❌ 下载失败")
    
    return None


def main():
    print("=" * 60)
    print("Bing Image Search API 爬虫")
    print("=" * 60)
    
    # 检查API Key
    if BING_API_KEY == "YOUR_API_KEY_HERE":
        print("\n⚠️ 请先申请 Bing Image Search API Key：")
        print("  1. 访问 https://www.microsoft.com/en-us/bing/apis/bing-image-search-api")
        print("  2. 注册并获取 API Key")
        print("  3. 设置环境变量: export BING_API_KEY='your_key'")
        print("\n或者修改本脚本中的 BING_API_KEY 变量")
        return
    
    # 读取数据
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        snacks = json.load(f)
    
    print(f"\n共 {len(snacks)} 个零食需要处理")
    print(f"输出目录: {OUTPUT_DIR}\n")
    
    success_count = 0
    fail_count = 0
    
    for i, snack in enumerate(snacks, 1):
        result = process_snack(snack, i, len(snacks))
        
        if result:
            success_count += 1
            snack['image'] = result
            snack['missing_image'] = False
        else:
            fail_count += 1
        
        # 延迟（避免超过API速率限制）
        if i < len(snacks):
            time.sleep(1)
    
    # 保存更新
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(snacks, f, ensure_ascii=False, indent=2)
    
    print()
    print("=" * 60)
    print(f"处理完成! 成功: {success_count}, 失败: {fail_count}")
    print("=" * 60)


if __name__ == "__main__":
    main()
