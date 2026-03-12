#!/usr/bin/env python3
"""
批量抠图脚本 - 自动下载零食图片并去除背景
"""
import json
import requests
import os
from rembg import remove
from PIL import Image
from io import BytesIO
import time

# 配置
INPUT_JSON = "/Users/zoe/Downloads/app 2/fixed_snacks.json"
OUTPUT_DIR = "/Users/zoe/Downloads/app 2/public/images/transparent"
OUTPUT_JSON = "/Users/zoe/Downloads/app 2/snacks_cleared.json"

os.makedirs(OUTPUT_DIR, exist_ok=True)

def download_and_remove_bg(img_url, save_path):
    """下载图片并去除背景"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "image/webp,image/apng,image/*,*/*;q=0.8"
        }
        res = requests.get(img_url, headers=headers, timeout=15)
        
        if res.status_code == 200:
            # 使用 rembg 去除背景
            input_image = res.content
            output_image = remove(input_image)
            
            # 保存为透明 PNG
            img = Image.open(BytesIO(output_image)).convert("RGBA")
            
            # 调整大小，保持统一
            img.thumbnail((300, 300), Image.Resampling.LANCZOS)
            
            img.save(save_path, "PNG", optimize=True)
            return True
    except Exception as e:
        print(f"      错误: {str(e)[:50]}")
    return False

def main():
    # 读取数据
    print("📖 读取零食数据...")
    with open(INPUT_JSON, "r", encoding="utf-8") as f:
        snacks = json.load(f)
    
    total = len(snacks)
    print(f"🎯 共 {total} 张图片需要处理")
    print("=" * 60)
    
    success_count = 0
    skip_count = 0
    fail_count = 0
    
    for i, snack in enumerate(snacks):
        snack_id = snack["id"]
        name = snack["name"]
        img_url = snack.get("image", "")
        
        # 生成保存路径
        save_filename = f"{snack_id:03d}.png"
        save_path = os.path.join(OUTPUT_DIR, save_filename)
        
        # 检查是否已存在
        if os.path.exists(save_path):
            print(f"[{i+1:03d}/{total}] ⏭️  已存在: {name[:20]}")
            snack["image"] = f"/images/transparent/{save_filename}"
            skip_count += 1
            continue
        
        # 检查URL是否有效
        if not img_url or "placeholder" in img_url:
            print(f"[{i+1:03d}/{total}] ⚠️  无效URL: {name[:20]}")
            fail_count += 1
            continue
        
        print(f"[{i+1:03d}/{total}] 🎨 处理中: {name[:20]}...", end=" ", flush=True)
        
        # 下载并抠图
        if download_and_remove_bg(img_url, save_path):
            snack["image"] = f"/images/transparent/{save_filename}"
            success_count += 1
            print("✅")
        else:
            fail_count += 1
            print("❌")
        
        # 短暂休眠，避免请求过快
        time.sleep(0.2)
    
    # 保存更新后的 JSON
    print("=" * 60)
    print("💾 保存更新后的数据文件...")
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(snacks, f, ensure_ascii=False, indent=2)
    
    # 统计
    print("\n📊 处理结果:")
    print(f"   ✅ 成功: {success_count}")
    print(f"   ⏭️  跳过: {skip_count}")
    print(f"   ❌ 失败: {fail_count}")
    print(f"\n📁 透明图片目录: {OUTPUT_DIR}")
    print(f"📄 数据文件: {OUTPUT_JSON}")
    print("\n🎉 任务一完成！")

if __name__ == "__main__":
    main()
