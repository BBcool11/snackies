#!/usr/bin/env python3
"""
为所有380个零食创建SVG占位图
每个零食都有独特的设计
"""

import sys
sys.path.insert(0, '/Users/zoe/Downloads/app 2')

from pathlib import Path
from src.data.snacks import snacks

OUTPUT_DIR = Path("/Users/zoe/Downloads/app 2/public/snacks-transparent")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 零食图标映射
CATEGORY_ICONS = {
    '辣条': '🌶️',
    '薯片': '🥔',
    '饼干': '🍪',
    '糖果': '🍬',
    '巧克力': '🍫',
    '饮料': '🥤',
    '方便面': '🍜',
    '坚果': '🥜',
    '肉干': '🥓',
    '海苔': '🌿',
    '果冻': '🍮',
    '蜜饯': '🍒',
    '豆制品': '🧈',
    '派类': '🥧',
    '膨化': '🍿',
    '威化': '🧇',
    '软糖': '🍬',
    '奶糖': '🍬',
    '蛋糕': '🧁',
    '面包': '🍞',
    '瓜子': '🌻',
    '海苔': '🌊',
    '饮料': '🧃',
    '糖果': '🍭',
}

# 颜色调色板
COLOR_PALETTE = [
    ("#FF6B6B", "#FFE66D"),  # 红色+黄色
    ("#4ECDC4", "#96CEB4"),  # 青色+绿色
    ("#45B7D1", "#74B9FF"),  # 蓝色
    ("#DDA0DD", "#DDA0DD"),  # 紫色
    ("#FFEAA7", "#FDCB6E"),  # 黄色
    ("#FF8B94", "#FFAAA6"),  # 粉色
    ("#C7CEEA", "#B8B8D1"),  # 淡紫
    ("#A8E6CF", "#DCEDC1"),  # 薄荷绿
    ("#FFD3B6", "#FFAAA6"),  # 橙色
    ("#FD8A8A", "#B4E4FF"),  # 珊瑚色
]

def get_icon_for_snack(snack):
    """根据零食类别获取图标"""
    for category, icon in CATEGORY_ICONS.items():
        if category in snack['category']:
            return icon
    return '🍪'

def get_colors_for_snack(snack_id):
    """根据ID获取颜色组合（保持一致性）"""
    hash_val = sum(ord(c) for c in snack_id)
    return COLOR_PALETTE[hash_val % len(COLOR_PALETTE)]

def create_svg(snack):
    """创建单个零食SVG"""
    snack_id = snack['id']
    name = snack['name']
    icon = get_icon_for_snack(snack)
    primary, secondary = get_colors_for_snack(snack_id)
    
    # 创建不同形状
    id_hash = sum(ord(c) for c in snack_id)
    shape_type = id_hash % 5
    
    if shape_type == 0:
        # 圆形包装
        shape = f'<circle cx="200" cy="180" r="90" fill="{primary}" opacity="0.3" filter="url(#shadow)"/>'
    elif shape_type == 1:
        # 方形包装
        shape = f'<rect x="110" y="90" width="180" height="180" rx="20" fill="{primary}" opacity="0.3" filter="url(#shadow)"/>'
    elif shape_type == 2:
        # 椭圆形
        shape = f'<ellipse cx="200" cy="180" rx="100" ry="80" fill="{primary}" opacity="0.3" filter="url(#shadow)"/>'
    elif shape_type == 3:
        # 圆角矩形
        shape = f'<rect x="100" y="100" width="200" height="160" rx="40" fill="{primary}" opacity="0.3" filter="url(#shadow)"/>'
    else:
        # 六边形
        shape = f'<polygon points="200,100 280,150 280,210 200,260 120,210 120,150" fill="{primary}" opacity="0.3" filter="url(#shadow)"/>'
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg{snack_id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{primary};stop-opacity:0.12" />
      <stop offset="100%" style="stop-color:{secondary};stop-opacity:0.05" />
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-opacity="0.15"/>
    </filter>
  </defs>
  
  <!-- 背景 -->
  <rect width="400" height="400" fill="url(#bg{snack_id})" rx="30"/>
  
  <!-- 装饰形状 -->
  {shape}
  
  <!-- 图标 -->
  <text x="200" y="195" font-size="100" text-anchor="middle" dominant-baseline="central">{icon}</text>
  
  <!-- 名称 -->
  <text x="200" y="330" font-family="system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif" 
        font-size="26" font-weight="600" text-anchor="middle" fill="#2d3748">{name[:8]}</text>
  
  <!-- 编号 -->
  <text x="200" y="365" font-family="monospace" font-size="14" text-anchor="middle" fill="#a0aec0">#{snack_id}</text>
  
  <!-- 角落装饰 -->
  <circle cx="45" cy="45" r="12" fill="{primary}" opacity="0.4"/>
  <circle cx="355" cy="355" r="12" fill="{primary}" opacity="0.4"/>
</svg>'''
    
    return svg

def main():
    print("=" * 70)
    print("批量创建零食SVG占位图")
    print("=" * 70)
    print(f"\n输出目录: {OUTPUT_DIR}")
    print(f"零食总数: {len(snacks)}\n")
    
    success = 0
    skipped = 0
    
    for i, snack in enumerate(snacks, 1):
        svg_path = OUTPUT_DIR / f"snack-{snack['id']}.svg"
        
        # 如果已存在且非强制更新则跳过
        if svg_path.exists():
            skipped += 1
            if i % 50 == 0:
                print(f"  ... 已跳过 {skipped} 个")
            continue
        
        try:
            svg_content = create_svg(snack)
            with open(svg_path, 'w', encoding='utf-8') as f:
                f.write(svg_content)
            success += 1
            
            if i % 50 == 0 or i <= 5:
                print(f"[{i:3d}/{len(snacks)}] ✓ {snack['name']:15} ({snack['id']})")
                
        except Exception as e:
            print(f"[{i:3d}/{len(snacks)}] ✗ {snack['name']}: {e}")
    
    print("\n" + "=" * 70)
    print(f"创建完成: 新增 {success} 个, 跳过 {skipped} 个")
    print("=" * 70)
    
    # 统计
    all_svgs = list(OUTPUT_DIR.glob("*.svg"))
    total_size = sum(f.stat().st_size for f in all_svgs)
    
    print(f"\n总计: {len(all_svgs)} 个SVG文件")
    print(f"总大小: {total_size / 1024:.1f} KB")
    print(f"平均大小: {total_size / len(all_svgs) / 1024:.1f} KB")

if __name__ == "__main__":
    main()
