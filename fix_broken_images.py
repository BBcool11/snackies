#!/usr/bin/env python3
"""
图片巡检修复脚本 - 检测并修复失效的图片链接
"""
import json
import requests
import re
from urllib.parse import quote
import time

INPUT_FILE = "/Users/zoe/Downloads/app 2/snacks_cleared.json"
BROKEN_LOG = "/Users/zoe/Downloads/app 2/broken_images.json"

def check_image_url(url):
    """检测图片URL是否可访问"""
    if not url or url.startswith("/") or "placeholder" in url:
        return False
    
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "image/webp,image/apng,image/*,*/*;q=0.8"
        }
        # 使用head请求快速检测
        resp = requests.head(url, headers=headers, timeout=5, allow_redirects=True)
        if resp.status_code == 200:
            return True
        # 某些服务器不支持HEAD，尝试GET前几个字节
        resp = requests.get(url, headers=headers, timeout=5, stream=True)
        if resp.status_code == 200:
            # 读取前100字节确认是图片
            data = next(resp.iter_content(100))
            if data.startswith((b'\xff\xd8', b'\x89PNG', b'GIF', b'RIFF', b'\x00\x00')):
                return True
    except Exception as e:
        pass
    return False

def fetch_new_image(snack_name):
    """使用Bing搜索重新抓取图片"""
    search_query = quote(f"{snack_name} 零食 包装")
    url = f"https://cn.bing.com/images/async?q={search_query}&first=1&count=5&mmasync=1"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    try:
        res = requests.get(url, headers=headers, timeout=8)
        img_urls = re.findall(r'murl&quot;:&quot;(.*?)&quot;', res.text)
        if img_urls:
            # 验证第一个URL是否可用
            for img_url in img_urls[:3]:
                if check_image_url(img_url):
                    return img_url
    except Exception as e:
        print(f"      搜索失败: {e}")
    return None

def main():
    print("🔍 开始扫描零食图片...")
    
    # 读取数据
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        snacks = json.load(f)
    
    broken_list = []
    fixed_count = 0
    
    total = len(snacks)
    for i, snack in enumerate(snacks):
        img_url = snack.get("image", "")
        snack_name = snack["name"]
        
        print(f"[{i+1:03d}/{total}] 检测: {snack_name[:20]:<20} ... ", end="", flush=True)
        
        # 检查是否需要修复
        need_fix = False
        if not img_url or img_url.startswith("/") or "placeholder" in img_url.lower():
            need_fix = True
            print("⚠️  本地/占位图")
        elif not check_image_url(img_url):
            need_fix = True
            print("❌ 失效")
        else:
            print("✅ 正常")
            continue
        
        # 记录损坏
        broken_list.append({
            "id": snack["id"],
            "name": snack_name,
            "old_url": img_url
        })
        
        # 尝试修复
        print(f"      🔧 正在重新抓取图片...")
        new_url = fetch_new_image(snack_name)
        if new_url:
            snack["image"] = new_url
            fixed_count += 1
            print(f"      ✅ 修复成功: {new_url[:60]}...")
        else:
            print(f"      ❌ 修复失败，保留原链接")
        
        time.sleep(0.5)  # 避免请求过快
    
    # 保存损坏日志
    with open(BROKEN_LOG, "w", encoding="utf-8") as f:
        json.dump(broken_list, f, ensure_ascii=False, indent=2)
    
    # 保存修复后的数据
    with open(INPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(snacks, f, ensure_ascii=False, indent=2)
    
    print("\n" + "="*60)
    print(f"📊 扫描完成！")
    print(f"   总数量: {total}")
    print(f"   损坏/待修复: {len(broken_list)}")
    print(f"   成功修复: {fixed_count}")
    print(f"   修复率: {fixed_count/max(len(broken_list),1)*100:.1f}%")
    print(f"\n📁 损坏日志: {BROKEN_LOG}")
    print(f"📁 已更新: {INPUT_FILE}")

if __name__ == "__main__":
    main()
