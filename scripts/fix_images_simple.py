#!/usr/bin/env python3
"""
简化版图片修复 - 使用 requests 直接下载
"""

import os
import json
import time
import random
import requests
from pathlib import Path
from urllib.parse import quote_plus
from PIL import Image
from io import BytesIO

# 需要修复的零食列表
SNACKS_TO_FIX = [
    {
        "name": "亲嘴烧老包装",
        "target_path": "/Users/zoe/Downloads/app 2/public/snack-images/kinzuishao.jpg",
        "keyword": "卫龙亲嘴烧"
    },
    {
        "name": "魔芋爽（怀旧）", 
        "target_path": "/Users/zoe/Downloads/app 2/public/snack-images/moyushuang.jpg",
        "keyword": "卫龙魔芋爽"
    },
    {
        "name": "魔芋爽香辣味",
        "target_path": "/Users/zoe/Downloads/app 2/public/snack-images-v2/hot_006_yytqbh9e.jpg",
        "keyword": "卫龙魔芋爽香辣味"
    },
    {
        "name": "凤梨酥",
        "target_path": "/Users/zoe/Downloads/app 2/public/snack-images-v2/hot_087_rqx7qulx.jpg",
        "keyword": "徐福记凤梨酥"
    },
    {
        "name": "魔芋蛋糕",
        "target_path": "/Users/zoe/Downloads/app 2/public/snack-images-v2/hot_010_0tnufl61.jpg",
        "keyword": "魔芋蛋糕零食"
    },
    {
        "name": "香蕉牛奶",
        "target_path": "/Users/zoe/Downloads/app 2/public/snack-images-v2/hot_045_f80makml.jpg",
        "keyword": "宾格瑞香蕉牛奶"
    },
    {
        "name": "鱼肠",
        "target_path": "/Users/zoe/Downloads/app 2/public/snack-images-v2/hot_080_hm80hw94.jpg",
        "keyword": "ZEK鱼肠"
    },
    {
        "name": "旺旺单身狗粮",
        "target_path": "/Users/zoe/Downloads/app 2/public/snack-images/wangwang_single.jpg",
        "keyword": "旺旺单身狗粮薯片"
    },
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9',
}


def download_from_baidu(keyword, output_path, max_retries=3):
    """从百度图片下载"""
    print(f"\n🔍 搜索: {keyword}")
    
    search_url = f"https://image.baidu.com/search/acjson?tn=resultjson_com&ipn=rj&word={quote_plus(keyword)}&pn=0&rn=10"
    
    for attempt in range(max_retries):
        try:
            resp = requests.get(search_url, headers=HEADERS, timeout=10)
            data = resp.json()
            
            if 'data' not in data:
                print(f"  ⚠️ 无结果")
                return False
            
            for item in data['data'][:5]:
                if 'thumbURL' not in item and 'middleURL' not in item:
                    continue
                
                img_url = item.get('thumbURL') or item.get('middleURL')
                if not img_url:
                    continue
                
                print(f"  下载: {img_url[:60]}...")
                
                # 下载图片
                img_resp = requests.get(img_url, headers={**HEADERS, 'Referer': 'https://image.baidu.com/'}, timeout=15)
                if img_resp.status_code != 200:
                    continue
                
                content = img_resp.content
                if len(content) < 5000:
                    continue
                
                # 验证图片
                try:
                    img = Image.open(BytesIO(content))
                    width, height = img.size
                    if width < 300 or height < 300:
                        continue
                    
                    # 保存
                    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
                    with open(output_path, 'wb') as f:
                        f.write(content)
                    
                    print(f"  ✅ 成功: {width}x{height}")
                    return True
                    
                except Exception as e:
                    print(f"  ⚠️ 验证失败: {e}")
                    continue
            
            time.sleep(random.uniform(1, 2))
            
        except Exception as e:
            print(f"  ❌ 错误: {e}")
            time.sleep(2)
    
    return False


def main():
    print("="*60)
    print("🚀 简化版图片修复")
    print("="*60)
    
    success = 0
    fail = 0
    
    for i, snack in enumerate(SNACKS_TO_FIX, 1):
        print(f"\n[{i}/{len(SNACKS_TO_FIX)}] {snack['name']}")
        
        if download_from_baidu(snack['keyword'], snack['target_path']):
            success += 1
        else:
            fail += 1
            print(f"  ❌ 最终失败")
        
        time.sleep(random.uniform(2, 3))
    
    print("\n" + "="*60)
    print(f"📊 完成: 成功 {success}, 失败 {fail}")
    print("="*60)


if __name__ == "__main__":
    main()
