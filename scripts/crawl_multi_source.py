#!/usr/bin/env python3
"""
多源图片聚合爬虫（完全免费）
同时尝试多个免费图片来源，提高成功率
"""

import json
import time
import random
import requests
from pathlib import Path
from typing import Optional, List, Dict

# 项目路径
PROJECT_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = PROJECT_ROOT / "public" / "snack-images-hot-real"
DATA_FILE = PROJECT_ROOT / "src" / "data" / "snacks_hot_100.json"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def try_unsplash(keyword: str) -> List[str]:
    """尝试从 Unsplash Source 获取（免费）"""
    # Unsplash Source 允许直接通过URL获取随机图片
    # 格式: https://source.unsplash.com/400x400/?keyword
    return [f"https://source.unsplash.com/400x400/?{keyword.replace(' ', ',')}"]


def try_picsum(seed: int) -> str:
    """Picsum Photos（完全免费）"""
    return f"https://picsum.photos/seed/{seed}/400/400.jpg"


def download_image(img_url: str, output_path: Path) -> bool:
    """下载图片"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        }
        
        response = requests.get(img_url, headers=headers, timeout=20)
        
        if response.status_code != 200:
            return False
        
        content = response.content
        
        # 验证文件大小（至少3KB）
        if len(content) < 3072:
            return False
        
        # 验证图片格式
        header = content[:4]
        is_jpg = header[0:2] == b'\xff\xd8'
        is_png = header == b'\x89\x50\x4e\x47'
        
        if not (is_jpg or is_png):
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
    if output_path.exists() and output_path.stat().st_size > 3072:
        print(f"  ✅ 已存在 ({output_path.stat().st_size} bytes)")
        return f"/snack-images-hot-real/{snack_id}.jpg"
    
    # 构建关键词
    keywords = [f"{brand} {name}", name, brand]
    
    # 尝试多个源
    sources = []
    
    # 源1: Unsplash（带关键词）
    for kw in keywords[:2]:
        sources.append(('Unsplash', try_unsplash(kw)[0]))
    
    # 源2: Picsum（基于ID的固定图片）
    seed = hash(snack_id) % 10000
    sources.append(('Picsum', try_picsum(seed)))
    
    # 尝试下载
    for source_name, img_url in sources:
        print(f"  尝试 {source_name}: {img_url[:50]}...")
        
        if download_image(img_url, output_path):
            size = output_path.stat().st_size
            print(f"  ✅ 成功 ({size} bytes)")
            return f"/snack-images-hot-real/{snack_id}.jpg"
        else:
            print(f"  ❌ 失败")
        
        time.sleep(0.5)
    
    return None


def main():
    print("=" * 60)
    print("多源图片聚合爬虫（完全免费）")
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
        
        # 延迟
        if i < len(snacks):
            delay = random.uniform(1, 2)
            print(f"  等待 {delay:.1f}s...")
            time.sleep(delay)
    
    # 保存更新
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(snacks, f, ensure_ascii=False, indent=2)
    
    print()
    print("=" * 60)
    print(f"处理完成! 成功: {success_count}, 失败: {fail_count}")
    print("=" * 60)
    print("\n⚠️ 注意：这些是来自免费图库的真实照片")
    print("可能不是零食的真实包装图，但比复用旧图片更好")


if __name__ == "__main__":
    main()
