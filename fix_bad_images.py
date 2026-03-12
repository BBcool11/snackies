import json
import requests
import re
from urllib.parse import quote
import time

# ==========================================
# 图片错误的零食 ID 列表（已人工核查）
# ==========================================
bad_ids = [1, 6, 94, 95, 105, 147, 148, 149, 189, 253]

# 针对每个问题零食的优化搜索词映射
# 利用知识库为这些容易搜错的零食提供更精准的搜索词
keyword_enhance = {
    1: "小浣熊干脆面 水浒卡 包装袋 统一",
    6: "乖乖虾条 零食包装 90年代",
    94: "钻石戒指糖 童年零食 包装",
    95: "香烟糖 香烟造型糖 童年零食",
    105: "小浣熊 巧克力棒 零食包装",
    147: "北京烤鸭辣条 麻辣条 零食包装",
    148: "香菇肥牛辣条 豆制品 零食包装",
    149: "南京板鸭辣条 辣片 零食包装",
    189: "动物饼干 儿童饼干 零食包装",
    253: "小浣熊干脆面 方便面 统一"
}

def fetch_better_image(enhanced_keyword):
    """使用优化过的长尾关键词重新抓图"""
    print(f"正在精准狙击抓取: {enhanced_keyword}")
    search_query = quote(enhanced_keyword)
    url = f"https://cn.bing.com/images/async?q={search_query}&first=1&count=5&mmasync=1"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    }
    
    try:
        res = requests.get(url, headers=headers, timeout=8)
        # 获取所有图片URL
        img_urls = re.findall(r'murl&quot;:&quot;(.*?)&quot;', res.text)
        
        # 过滤掉明显不是零食包装的图片（包含某些关键词的URL）
        filtered_urls = []
        for url in img_urls:
            # 排除明显的动物、非零食类图片
            exclude_patterns = ['animal', 'zoo', 'wildlife', 'nature', 'real-food', 'dish', 'recipe', 'cooking']
            if not any(pat in url.lower() for pat in exclude_patterns):
                filtered_urls.append(url)
        
        if filtered_urls:
            return filtered_urls[0]
        elif img_urls:
            return img_urls[0]
    except Exception as e:
        print(f"  抓取失败: {e}")
    return None

def main():
    # 读取当前数据文件
    work_dir = "/Users/zoe/Downloads/app 2/"
    with open(f"{work_dir}final_real_img_snacks.json", "r", encoding="utf-8") as f:
        snacks = json.load(f)
        
    print(f"开始针对 {len(bad_ids)} 个错误图片进行靶向修复...")
    print("="*60)
    
    fixed_count = 0
    for snack in snacks:
        if snack["id"] in bad_ids:
            # 使用优化的搜索词
            super_keyword = keyword_enhance.get(snack["id"], f"{snack['name']} 怀旧零食 包装")
            
            print(f"\n修复 ID {snack['id']}: {snack['name']}")
            print(f"  搜索词: {super_keyword}")
            
            new_img = fetch_better_image(super_keyword)
            if new_img:
                old_img = snack["image"]
                snack["image"] = new_img
                fixed_count += 1
                print(f"  ✅ 修复成功！")
                print(f"     旧: {old_img[:60]}...")
                print(f"     新: {new_img[:60]}...")
            else:
                print(f"  ❌ 修复失败，保留原图")
            
            time.sleep(1.2)  # 控制请求频率
    
    print("\n" + "="*60)
    print(f"修复完成！成功修复 {fixed_count}/{len(bad_ids)} 个零食图片")
    
    # 另存为修复后的文件
    output_path = f"{work_dir}fixed_snacks.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(snacks, f, ensure_ascii=False, indent=2)
        
    print(f"\n修复后的文件已保存: {output_path}")
    print(f"总数据量: {len(snacks)} 条")

if __name__ == "__main__":
    main()
