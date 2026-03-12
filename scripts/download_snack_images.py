#!/usr/bin/env python3
"""
零食透明PNG图片下载脚本
从公开API和免版权资源下载
"""

import os
import json
import urllib.request
import urllib.parse
import ssl
from pathlib import Path

# 禁用SSL验证（某些网站需要）
ssl._create_default_https_context = ssl._create_unverified_context

# 输出目录
OUTPUT_DIR = Path("/Users/zoe/Downloads/app 2/public/snacks-transparent")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 热门零食列表（优先下载）
PRIORITY_SNACKS = [
    {"id": "001", "name": "旺旺雪饼", "en": "rice cracker", "keywords": "rice cracker snack"},
    {"id": "002", "name": "旺旺仙贝", "en": "senbei", "keywords": "senbei japanese cracker"},
    {"id": "004", "name": "旺旺浪味仙", "en": "vegetable puffs", "keywords": "vegetable puffs snack"},
    {"id": "007", "name": "上好佳鲜虾条", "en": "shrimp chips", "keywords": "shrimp chips prawn crackers"},
    {"id": "009", "name": "乐事原味薯片", "en": "potato chips", "keywords": "potato chips lay's"},
    {"id": "014", "name": "张君雅小妹妹", "en": "zhang junya", "keywords": "asian snack noodles"},
    {"id": "017", "name": "奥利奥", "en": "oreo", "keywords": "oreo cookies"},
    {"id": "028", "name": "大白兔奶糖", "en": "white rabbit", "keywords": "white rabbit candy"},
    {"id": "032", "name": "旺仔QQ糖", "en": "qq gummies", "keywords": "gummy candy fruit"},
    {"id": "042", "name": "麦丽素", "en": "maltesers", "keywords": "chocolate malt balls"},
    {"id": "046", "name": "卫龙大面筋", "en": "latiao", "keywords": "spicy strip chinese snack"},
    {"id": "097", "name": "小浣熊干脆面", "en": "crispy noodles", "keywords": "instant noodles crispy asian"},
]

def download_from_unsplash(keyword, output_path):
    """从Unsplash下载图片（免费API）"""
    try:
        # Unsplash Source API (免费)
        encoded_keyword = urllib.parse.quote(keyword)
        url = f"https://source.unsplash.com/400x400/?{encoded_keyword}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        
        req = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=30) as response:
            # 获取最终重定向的URL
            final_url = response.geturl()
            
            # 下载图片
            data = response.read()
            
            with open(output_path, 'wb') as f:
                f.write(data)
            
            print(f"✓ 下载成功: {output_path.name} ({len(data)} bytes)")
            return True
            
    except Exception as e:
        print(f"✗ 下载失败: {keyword} - {e}")
        return False

def download_from_pexels(keyword, output_path, api_key=None):
    """从Pexels下载（需要API key）"""
    if not api_key:
        return False
    
    try:
        encoded_keyword = urllib.parse.quote(keyword)
        url = f"https://api.pexels.com/v1/search?query={encoded_keyword}&per_page=1"
        
        headers = {
            'Authorization': api_key,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        
        req = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode())
            
            if data.get('photos'):
                img_url = data['photos'][0]['src']['medium']
                
                # 下载图片
                img_req = urllib.request.Request(img_url, headers={'User-Agent': headers['User-Agent']})
                with urllib.request.urlopen(img_req, timeout=30) as img_response:
                    img_data = img_response.read()
                    
                    with open(output_path, 'wb') as f:
                        f.write(img_data)
                    
                    print(f"✓ Pexels下载成功: {output_path.name}")
                    return True
        
        return False
        
    except Exception as e:
        print(f"✗ Pexels下载失败: {keyword} - {e}")
        return False

def download_sample_images():
    """下载示例图片"""
    print("开始下载零食图片...")
    print(f"输出目录: {OUTPUT_DIR}")
    print("-" * 50)
    
    success_count = 0
    
    for snack in PRIORITY_SNACKS[:8]:  # 先下载前8个热门零食
        output_path = OUTPUT_DIR / f"snack-{snack['id']}.png"
        
        # 如果已存在则跳过
        if output_path.exists():
            print(f"⏭  已存在: {snack['name']}")
            success_count += 1
            continue
        
        print(f"\n下载: {snack['name']} ({snack['keywords']})")
        
        # 尝试从Unsplash下载
        if download_from_unsplash(snack['keywords'], output_path):
            success_count += 1
        else:
            # 备用关键词
            backup_keywords = snack['en'] + " food"
            print(f"  尝试备用关键词: {backup_keywords}")
            if download_from_unsplash(backup_keywords, output_path):
                success_count += 1
        
    print("-" * 50)
    print(f"下载完成: {success_count}/{len(PRIORITY_SNACKS[:8])}")
    
    return success_count

if __name__ == "__main__":
    download_sample_images()
