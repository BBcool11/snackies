#!/usr/bin/env python3
import json, requests, os

json_path = "/Users/zoe/Downloads/app 2/src/data/snacks_premium.json"
save_dir = "/Users/zoe/Downloads/app 2/public/snack-images/"

# 用 picsum 或 placeholder 服务生成占位图
def generate_placeholder(snack_id, name):
    # 使用一个固定的种子确保同一ID总是生成相同图片
    placeholder_url = f"https://picsum.photos/seed/snack{snack_id}/400/400"
    
    try:
        res = requests.get(placeholder_url, timeout=10)
        if res.status_code == 200:
            local_path = os.path.join(save_dir, f"{snack_id}.jpg")
            with open(local_path, "wb") as f:
                f.write(res.content)
            return True
    except:
        pass
    return False

with open(json_path, "r", encoding="utf-8") as f:
    snacks = json.load(f)

# 检查哪些ID的图片不存在
existing = set(int(f.split('.')[0]) for f in os.listdir(save_dir) if f.endswith('.jpg'))
missing = [s for s in snacks if s['id'] not in existing]

print(f"发现 {len(missing)} 张缺失图片")

for snack in missing:
    # 尝试用备用API获取
    backup_urls = [
        f"https://placehold.co/400x400/F5F5F7/968571?text={snack['name'][:4]}",
    ]
    
    success = False
    for url in backup_urls:
        try:
            res = requests.get(url, timeout=10)
            if res.status_code == 200:
                local_path = os.path.join(save_dir, f"{snack['id']}.jpg")
                with open(local_path, "wb") as f:
                    f.write(res.content)
                snack['image'] = f"/snack-images/{snack['id']}.jpg"
                print(f"✅ ID:{snack['id']} {snack['name'][:15]}... 占位图生成成功")
                success = True
                break
        except:
            continue
    
    if not success:
        # 如果都失败，创建一个纯色的本地图片
        local_path = os.path.join(save_dir, f"{snack['id']}.jpg")
        # 复制一个已有的图片作为占位
        import shutil
        shutil.copy(os.path.join(save_dir, "1.jpg"), local_path)
        snack['image'] = f"/snack-images/{snack['id']}.jpg"
        print(f"⚠️ ID:{snack['id']} {snack['name'][:15]}... 使用默认图")

# 保存JSON
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(snacks, f, ensure_ascii=False, indent=2)

print(f"\n📊 补全完成！总共: {len(snacks)} 张")
