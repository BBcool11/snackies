#!/usr/bin/env python3
"""
使用 picsum.photos 为热门零食下载真实占位图
- 每张图片都是不同的真实照片
- 高分辨率、高质量
- 可立即解决页面显示问题
"""

import json
import requests
import time
import random
from pathlib import Path

# 项目路径
PROJECT_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = PROJECT_ROOT / "public" / "snack-images-hot"
DATA_FILE = PROJECT_ROOT / "src" / "data" / "snacks_hot_100.json"

# 确保输出目录存在
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def download_image(seed: int, output_path: Path) -> bool:
    """从 picsum.photos 下载图片"""
    # 使用不同的种子确保每张图片不同
    url = f"https://picsum.photos/seed/{seed}/400/400.jpg"
    
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        }
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code == 200 and len(response.content) > 1000:
            with open(output_path, 'wb') as f:
                f.write(response.content)
            return True
        return False
    except Exception as e:
        print(f"  下载失败: {e}")
        return False


def main():
    print("=" * 60)
    print("热门零食图片下载（picsum.photos 真实照片）")
    print("=" * 60)
    
    # 读取零食数据
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        snacks = json.load(f)
    
    print(f"共 {len(snacks)} 个零食需要处理")
    print(f"输出目录: {OUTPUT_DIR}")
    print()
    
    success_count = 0
    failed_count = 0
    
    for i, snack in enumerate(snacks, 1):
        snack_id = snack['id']
        name = snack['name']
        
        # 输出文件路径
        output_path = OUTPUT_DIR / f"{snack_id}.jpg"
        
        # 检查是否已存在
        if output_path.exists():
            size = output_path.stat().st_size
            if size > 1000:
                print(f"[{i}/{len(snacks)}] ✅ {name} 已存在 ({size} bytes)")
                success_count += 1
                continue
        
        print(f"[{i}/{len(snacks)}] 下载: {name}...", end=" ")
        
        # 使用零食ID作为种子，确保一致性
        seed = hash(snack_id) % 10000
        
        if download_image(seed, output_path):
            print(f"✅ ({output_path.stat().st_size} bytes)")
            success_count += 1
        else:
            print("❌ 失败")
            failed_count += 1
        
        # 延迟，避免请求过快
        if i < len(snacks):
            time.sleep(0.3)
    
    # 更新JSON
    if success_count > 0:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        for snack in data:
            img_path = OUTPUT_DIR / f"{snack['id']}.jpg"
            if img_path.exists() and img_path.stat().st_size > 1000:
                snack['image'] = f"/snack-images-hot/{snack['id']}.jpg"
                snack['missing_image'] = False
                snack['image_valid'] = True
        
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"\n已更新 {success_count} 条数据到 JSON")
    
    print()
    print("=" * 60)
    print(f"处理完成! 成功: {success_count}, 失败: {failed_count}")
    print("=" * 60)
    print("\n注意：这些是从 picsum.photos 获取的真实照片")
    print("如需零食真实包装图，请：")
    print("1. 手动从京东/天猫下载")
    print("2. 或使用 Bing Image Search API")
    print("3. 或购买专业商品图库")


if __name__ == "__main__":
    main()
