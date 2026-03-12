#!/usr/bin/env python3
"""
爬虫验证工具 - 验证关键词提取和ALT标签匹配逻辑
"""

import re

# 品牌词过滤
BRAND_WORDS = ['牌', '公司', '集团', '官方', '旗舰店', '专卖', '企业店', '天猫', '淘宝', '京东']

def extract_keywords(snack_name: str):
    """提取搜索关键词"""
    core_name = snack_name
    for brand in BRAND_WORDS:
        core_name = core_name.replace(brand, '')
    core_name = core_name.strip()
    
    keywords = [
        f"{snack_name} 零食 实拍",
        f"{core_name} 零食",
        f"{snack_name}",
        core_name,
    ]
    return core_name, keywords

def validate_alt(alt_text: str, snack_name: str, core_keyword: str) -> bool:
    """验证ALT标签"""
    if not alt_text:
        return False
    
    alt_lower = alt_text.lower()
    snack_lower = snack_name.lower()
    core_lower = core_keyword.lower()
    
    # 检查是否包含零食名或核心词
    matches = [
        snack_lower in alt_lower,
        core_lower in alt_lower,
        # 分词匹配
        any(word in alt_lower for word in [snack_lower[i:i+2] for i in range(0, len(snack_lower)-1, 2)] if len(word) >= 2)
    ]
    
    return any(matches)

# 测试数据
test_cases = [
    {"name": "冻干草莓脆", "alts": [
        "冻干草莓脆",
        "草莓脆零食",
        "百草味冻干草莓",
        "strawberry snack",
        "蓝天白云风景图",  # 应该被拒绝
        "美女自拍",        # 应该被拒绝
        "",
    ]},
    {"name": "卫龙辣条", "alts": [
        "卫龙辣条",
        "辣条零食",
        "大面筋",
        "卫龙大面筋",
        "山水风景",        # 应该被拒绝
    ]},
    {"name": "白色恋人饼干", "alts": [
        "白色恋人饼干",
        "白色恋人",
        "日本零食",
        "北海道的雪",      # 可能被接受（包含白色）
    ]},
]

print("="*60)
print("关键词提取与ALT验证测试")
print("="*60)

for case in test_cases:
    name = case["name"]
    core, keywords = extract_keywords(name)
    
    print(f"\n🍿 {name}")
    print(f"   核心词: {core}")
    print(f"   搜索策略:")
    for i, kw in enumerate(keywords, 1):
        print(f"      {i}. {kw}")
    
    print(f"   ALT验证:")
    for alt in case["alts"]:
        valid = validate_alt(alt, name, core)
        icon = "✅" if valid else "❌"
        print(f"      {icon} '{alt}' -> {'通过' if valid else '拒绝'}")

print("\n" + "="*60)
print("测试完成")
print("="*60)
