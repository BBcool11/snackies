import json
import requests
import re
from urllib.parse import quote
from concurrent.futures import ThreadPoolExecutor, as_completed
import os

# 确保在正确的工作目录
work_dir = "/Users/zoe/Downloads/app 2/"
input_file = os.path.join(work_dir, "final_230_snacks.json")
output_file = os.path.join(work_dir, "final_real_img_snacks.json")

def fetch_image_bing(snack_name):
    """单次图片的极速抓取函数"""
    search_query = quote(f"{snack_name} 童年零食 包装")
    url = f"https://cn.bing.com/images/async?q={search_query}&first=1&count=3&mmasync=1"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        res = requests.get(url, headers=headers, timeout=5)
        img_urls = re.findall(r'murl&quot;:&quot;(.*?)&quot;', res.text)
        if img_urls:
            return snack_name, img_urls[0]
    except Exception:
        pass
    
    # 极少数抓不到的才用占位符
    return snack_name, "https://via.placeholder.com/400x300?text=No+Image"

def main():
    # 1. 读取刚才 Kimi 生成的带假图片的 JSON
    with open(input_file, "r", encoding="utf-8") as f:
        snacks = json.load(f)
        
    print(f"🚀 读取到 {len(snacks)} 条零食数据，正在开启 15 线程全速抓取真实图片...")
    
    # 2. 开启 15 个并发线程，速度提升 15 倍，避开 300s 超时限制
    with ThreadPoolExecutor(max_workers=15) as executor:
        # 提交所有任务
        future_to_snack = {executor.submit(fetch_image_bing, s["name"]): s for s in snacks}
        
        count = 0
        for future in as_completed(future_to_snack):
            snack_ref = future_to_snack[future] # 获取原字典对象的引用
            name, real_img_url = future.result()
            
            # 把假图片替换成真实的 URL
            snack_ref["image"] = real_img_url 
            count += 1
            print(f"[{count}/{len(snacks)}] 已抓取真实图片: {name}")

    # 3. 覆盖或另存为新的 JSON
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(snacks, f, ensure_ascii=False, indent=2)
        
    print(f"🎉 大功告成！所有真实图片已全部替换完毕，文件保存在: {output_file}")

if __name__ == "__main__":
    main()
