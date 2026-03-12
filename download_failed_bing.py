#!/usr/bin/env python3
import json, requests, os, time, re
from urllib.parse import quote

json_path = "/Users/zoe/Downloads/app 2/src/data/snacks_premium.json"
save_dir = "/Users/zoe/Downloads/app 2/public/snack-images/"
failed_path = "/Users/zoe/Downloads/app 2/failed_images.json"

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}

with open(failed_path, "r", encoding="utf-8") as f:
    failed_snacks = json.load(f)

with open(json_path, "r", encoding="utf-8") as f:
    all_snacks = json.load(f)

success = 0

for snack in failed_snacks:
    search_term = f"{snack['name']} 零食 包装"
    search_url = f"https://www.bing.com/images/search?q={quote(search_term)}&form=HDRSC2&first=1"
    
    try:
        # 获取Bing图片搜索页面
        res = requests.get(search_url, headers=headers, timeout=15)
        if res.status_code != 200:
            print(f"❌ ID:{snack['id']} {snack['name'][:15]}... Bing搜索失败")
            continue
        
        # 提取图片URL (Bing图片搜索的正则模式)
        patterns = [
            r'murl":"(https?://[^"]+\.(?:jpg|jpeg|png|webp))',
            r'"ou":"(https?://[^"]+\.(?:jpg|jpeg|png|webp))"',
            r'src="(https?://[^"]+\.(?:jpg|jpeg|png|webp))"',
        ]
        
        img_url = None
        for pattern in patterns:
            matches = re.findall(pattern, res.text, re.IGNORECASE)
            for url in matches:
                if url.startswith('http') and len(url) > 20:
                    img_url = url
                    break
            if img_url:
                break
        
        if not img_url:
            print(f"❌ ID:{snack['id']} {snack['name'][:15]}... 未找到图片URL")
            continue
        
        # 下载图片
        img_res = requests.get(img_url, headers=headers, timeout=10)
        if img_res.status_code == 200 and len(img_res.content) > 3000:
            local_filename = f"{snack['id']}.jpg"
            local_path = os.path.join(save_dir, local_filename)
            local_web_path = f"/snack-images/{local_filename}"
            
            with open(local_path, "wb") as f:
                f.write(img_res.content)
            
            # 更新JSON
            for s in all_snacks:
                if s['id'] == snack['id']:
                    s['image'] = local_web_path
                    break
            
            success += 1
            print(f"✅ [{success}] ID:{snack['id']} {snack['name'][:15]}... Bing下载成功 ({len(img_res.content)//1024}KB)")
        else:
            print(f"❌ ID:{snack['id']} {snack['name'][:15]}... 图片下载失败 HTTP {img_res.status_code}")
            
    except Exception as e:
        print(f"❌ ID:{snack['id']} {snack['name'][:15]}... Error: {str(e)[:50]}")
    
    time.sleep(0.5)

# 保存更新后的JSON
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(all_snacks, f, ensure_ascii=False, indent=2)

print(f"\n📊 Bing换源完成！成功: {success} 张 / 仍失败: {len(failed_snacks) - success} 张")
