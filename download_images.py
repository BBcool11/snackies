#!/usr/bin/env python3
import json, requests, os, time

json_path = "/Users/zoe/Downloads/app 2/src/data/snacks_premium.json"
save_dir = "/Users/zoe/Downloads/app 2/public/snack-images/"
os.makedirs(save_dir, exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.google.com",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8"
}

with open(json_path, "r", encoding="utf-8") as f:
    snacks = json.load(f)

success, failed = 0, []

for snack in snacks:
    img_url = snack.get("image", "")
    local_filename = f"{snack['id']}.jpg"
    local_path = os.path.join(save_dir, local_filename)
    local_web_path = f"/snack-images/{local_filename}"

    if not img_url.startswith("http"):
        continue

    try:
        res = requests.get(img_url, headers=headers, timeout=10)
        if res.status_code == 200 and len(res.content) > 3000:
            with open(local_path, "wb") as f:
                f.write(res.content)
            snack["image"] = local_web_path
            success += 1
            print(f"✅ [{success}] ID:{snack['id']} {snack['name'][:15]}... ({len(res.content)//1024}KB)")
        else:
            failed.append(snack)
            print(f"❌ ID:{snack['id']} {snack['name'][:15]}... HTTP {res.status_code} / {len(res.content)}B")
    except Exception as e:
        failed.append(snack)
        print(f"❌ ID:{snack['id']} {snack['name'][:15]}... Error: {str(e)[:50]}")

    time.sleep(0.2)

# 保存更新了本地路径的 JSON
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(snacks, f, ensure_ascii=False, indent=2)

print(f"\n📊 第一轮下载完成！成功: {success} 张 / 失败: {len(failed)} 张")

# 保存失败的
if failed:
    with open("/Users/zoe/Downloads/app 2/failed_images.json", "w", encoding="utf-8") as f:
        json.dump(failed, f, ensure_ascii=False, indent=2)
    print(f"💾 失败列表已保存到 failed_images.json")
