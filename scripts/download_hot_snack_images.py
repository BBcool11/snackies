#!/usr/bin/env python3
"""
下载热门零食图片脚本
- 从京东/天猫搜索并下载零食图片
- 保存到 public/snack-images-hot/ 目录
"""

import json
import os
import time
import random
import urllib.request
import ssl
from pathlib import Path
from typing import Optional

# 忽略SSL验证
ssl._create_default_https_context = ssl._create_unverified_context

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = PROJECT_ROOT / "public" / "snack-images-hot"
DATA_FILE = PROJECT_ROOT / "src" / "data" / "snacks_hot_100.json"

# 确保输出目录存在
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 用户代理列表
USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

# 图片下载超时
TIMEOUT = 30


def download_image(url: str, output_path: Path, referer: str = None) -> bool:
    """下载单张图片"""
    try:
        headers = {
            'User-Agent': random.choice(USER_AGENTS),
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Referer': referer or 'https://www.jd.com/',
        }
        
        req = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=TIMEOUT) as response:
            if response.status == 200:
                data = response.read()
                # 验证文件大小（至少1KB）
                if len(data) < 1024:
                    print(f"  ⚠️ 图片太小 ({len(data)} bytes)，可能无效")
                    return False
                
                with open(output_path, 'wb') as f:
                    f.write(data)
                return True
            else:
                print(f"  ⚠️ HTTP {response.status}")
                return False
    except Exception as e:
        print(f"  ⚠️ 下载失败: {e}")
        return False


def search_and_download(snack: dict, index: int, total: int) -> Optional[str]:
    """
    搜索并下载零食图片
    由于无法直接访问京东/天猫搜索结果，我们使用以下策略：
    1. 尝试使用品牌+产品名的方式构造搜索URL
    2. 下载图片到本地
    3. 返回相对路径
    """
    name = snack['name']
    brand = snack.get('brand', '')
    snack_id = snack['id']
    
    print(f"[{index}/{total}] 处理: {name}")
    
    # 输出文件路径
    output_filename = f"{snack_id}.jpg"
    output_path = OUTPUT_DIR / output_filename
    
    # 如果文件已存在且大于1KB，跳过
    if output_path.exists():
        size = output_path.stat().st_size
        if size > 1024:
            print(f"  ✅ 已存在 ({size} bytes)")
            return f"/snack-images-hot/{output_filename}"
        else:
            print(f"  ⚠️ 文件太小，重新下载")
    
    # 构造搜索关键词
    search_term = f"{brand} {name}".strip()
    print(f"  搜索词: {search_term}")
    
    # 由于无法直接抓取电商网站，我们使用以下占位图URL作为示例
    # 在实际部署时，应该：
    # 1. 使用 Selenium/Playwright 模拟浏览器访问京东
    # 2. 搜索关键词并获取第一张主图
    # 3. 下载图片
    
    # 临时方案：使用 picsum 或 placeholder 图片作为占位
    # 实际项目中应该替换为真实爬虫逻辑
    
    # 使用 Bing 图片搜索 API (需要申请API Key)
    # 或使用 Google Custom Search API
    
    # 这里我们使用一个公开的图片占位服务作为演示
    # 实际项目中应该替换为真实图片
    
    # 为了演示，我们使用不同的颜色生成不同的占位图
    # 实际应该使用真实爬虫获取图片
    
    print(f"  ⚠️ 暂无可用的图片源，保持占位图")
    return None


def update_json_with_images(image_map: dict):
    """更新JSON文件中的图片路径"""
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        snacks = json.load(f)
    
    updated = 0
    for snack in snacks:
        snack_id = snack['id']
        if snack_id in image_map and image_map[snack_id]:
            snack['image'] = image_map[snack_id]
            snack['missing_image'] = False
            snack['image_valid'] = True
            updated += 1
    
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(snacks, f, ensure_ascii=False, indent=2)
    
    return updated


def main():
    # 读取热门零食数据
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        snacks = json.load(f)
    
    print(f"共 {len(snacks)} 个热门零食需要处理")
    print(f"输出目录: {OUTPUT_DIR}")
    print()
    
    # 统计信息
    image_map = {}
    success_count = 0
    failed_count = 0
    
    for i, snack in enumerate(snacks, 1):
        result = search_and_download(snack, i, len(snacks))
        if result:
            image_map[snack['id']] = result
            success_count += 1
        else:
            failed_count += 1
        
        # 随机延迟，避免请求过快
        if i < len(snacks):
            delay = random.uniform(0.5, 1.5)
            time.sleep(delay)
    
    print()
    print("=" * 50)
    print(f"处理完成!")
    print(f"  成功: {success_count}")
    print(f"  失败: {failed_count}")
    
    # 更新JSON
    if image_map:
        updated = update_json_with_images(image_map)
        print(f"  已更新 {updated} 条数据到 JSON")
    
    print()
    print("注意：当前脚本使用占位图，实际部署时请：")
    print("1. 申请 Bing/Google 图片搜索 API")
    print("2. 或使用 Selenium 模拟浏览器抓取")
    print("3. 确保遵守目标网站的 robots.txt 和使用条款")


if __name__ == "__main__":
    main()
