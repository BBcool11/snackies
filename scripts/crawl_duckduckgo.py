#!/usr/bin/env python3
"""
DuckDuckGo 图片搜索爬虫（完全免费，无需API Key）
优点：
- 无需注册
- 无调用次数限制
- 无需API Key
"""

import json
import time
import random
import requests
import re
from pathlib import Path
from urllib.parse import quote
from typing import Optional, List

# 项目路径
PROJECT_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = PROJECT_ROOT / "public" / "snack-images-hot-real"
DATA_FILE = PROJECT_ROOT / "src" / "data" / "snacks_hot_100.json"

# 确保输出目录存在
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def search_duckduckgo(query: str, max_results: int = 5) -> List[dict]:
    """
    使用 DuckDuckGo 搜索图片
    无需API Key，完全免费
    """
    try:
        # DuckDuckGo 图片搜索URL
        search_url = f"https://duckduckgo.com/?q={quote(query)}&iax=images&ia=images"
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9",
        }
        
        # 第一步：获取 token
        session = requests.Session()
        response = session.get(search_url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            print(f"  ⚠️ 搜索失败: HTTP {response.status_code}")
            return []
        
        # 从页面中提取图片URL（DuckDuckGo的格式）
        # 注意：这是一个简化的实现，实际可能需要更复杂的解析
        content = response.text
        
        # 尝试提取图片URL（这个正则可能需要调整）
        img_pattern = r'https?://[^\s\"<>]+\.(?:jpg|jpeg|png|gif)'
        urls = re.findall(img_pattern, content, re.IGNORECASE)
        
        # 去重并限制数量
        unique_urls = list(set(urls))[:max_results]
        
        images = []
        for url in unique_urls:
            images.append({
                "url": url,
                "title": query,
                "source": "duckduckgo"
            })
        
        return images
        
    except Exception as e:
        print(f"  ⚠️ 搜索异常: {e}")
        return []


def download_image(img_url: str, output_path: Path) -> bool:
    """下载图片"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
        }
        
        response = requests.get(img_url, headers=headers, timeout=15)
        
        if response.status_code != 200:
            return False
        
        content = response.content
        
        # 验证文件大小
        if len(content) < 2048:
            return False
        
        # 验证图片头
        header = content[:4]
        valid = [
            header.startswith(b'\xff\xd8\xff'),  # JPEG
            header.startswith(b'\x89\x50\x4e\x47'),  # PNG
            header.startswith(b'\x47\x49\x46'),  # GIF
        ]
        
        if not any(valid):
            return False
        
        with open(output_path, 'wb') as f:
            f.write(content)
        
        return True
        
    except Exception as e:
        return False


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
    
    # 构建搜索词（添加"零食""包装"提高相关性）
    query = f"{brand} {name} 零食".strip()
    print(f"  搜索: {query}")
    
    # 搜索图片
    images = search_duckduckgo(query, max_results=3)
    
    if not images:
        print(f"  ❌ 未找到图片")
        return None
    
    # 尝试下载
    for img in images:
        img_url = img['url']
        print(f"  尝试下载: {img_url[:50]}...")
        
        if download_image(img_url, output_path):
            size = output_path.stat().st_size
            print(f"  ✅ 下载成功 ({size} bytes)")
            return f"/snack-images-hot-real/{snack_id}.jpg"
        else:
            print(f"  ❌ 下载失败")
    
    return None


def main():
    print("=" * 60)
    print("DuckDuckGo 图片爬虫（完全免费，无需API Key）")
    print("=" * 60)
    
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
        
        # 延迟（避免被封）
        if i < len(snacks):
            delay = random.uniform(2, 3)
            print(f"  等待 {delay:.1f}s...")
            time.sleep(delay)
    
    # 保存更新
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(snacks, f, ensure_ascii=False, indent=2)
    
    print()
    print("=" * 60)
    print(f"处理完成! 成功: {success_count}, 失败: {fail_count}")
    print("=" * 60)


if __name__ == "__main__":
    main()
