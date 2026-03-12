#!/usr/bin/env python3
"""
创建精美的零食SVG占位图
带包装样式，更加美观
"""

from pathlib import Path

OUTPUT_DIR = Path("/Users/zoe/Downloads/app 2/public/snacks-transparent")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 零食数据（带详细样式）
SNACKS = [
    {
        "id": "001",
        "name": "旺旺雪饼",
        "icon": "🍘",
        "primary": "#F5F5DC",
        "secondary": "#FFFFFF",
        "shape": "circle",
        "decoration": "sugar"
    },
    {
        "id": "002",
        "name": "旺旺仙贝",
        "icon": "🍘",
        "primary": "#D2691E",
        "secondary": "#8B4513",
        "shape": "oval",
        "decoration": "sauce"
    },
    {
        "id": "004",
        "name": "浪味仙",
        "icon": "🥨",
        "primary": "#90EE90",
        "secondary": "#98FB98",
        "shape": "spiral",
        "decoration": "vegetable"
    },
    {
        "id": "007",
        "name": "虾条",
        "icon": "🦐",
        "primary": "#FFA07A",
        "secondary": "#FF7F50",
        "shape": "sticks",
        "decoration": "shrimp"
    },
    {
        "id": "009",
        "name": "乐事薯片",
        "icon": "🥔",
        "primary": "#FFD700",
        "secondary": "#FFA500",
        "shape": "wave",
        "decoration": "crispy"
    },
    {
        "id": "014",
        "name": "张君雅",
        "icon": "🍜",
        "primary": "#FFE4B5",
        "secondary": "#DEB887",
        "shape": "round",
        "decoration": "noodles"
    },
    {
        "id": "017",
        "name": "奥利奥",
        "icon": "🍪",
        "primary": "#2F4F4F",
        "secondary": "#FFFFFF",
        "shape": "sandwich",
        "decoration": "cream"
    },
    {
        "id": "028",
        "name": "大白兔",
        "icon": "🍬",
        "primary": "#FFFFFF",
        "secondary": "#FF69B4",
        "shape": "cylinder",
        "decoration": "wrapper"
    },
    {
        "id": "032",
        "name": "QQ糖",
        "icon": "🧸",
        "primary": "#FF69B4",
        "secondary": "#FFB6C1",
        "shape": "bears",
        "decoration": "gummy"
    },
    {
        "id": "042",
        "name": "麦丽素",
        "icon": "🍫",
        "primary": "#8B4513",
        "secondary": "#654321",
        "shape": "balls",
        "decoration": "chocolate"
    },
    {
        "id": "046",
        "name": "卫龙辣条",
        "icon": "🌶️",
        "primary": "#DC143C",
        "secondary": "#8B0000",
        "shape": "strips",
        "decoration": "spicy"
    },
    {
        "id": "097",
        "name": "干脆面",
        "icon": "🍜",
        "primary": "#F4A460",
        "secondary": "#D2691E",
        "shape": "square",
        "decoration": "crunchy"
    },
]

def create_snack_svg(snack):
    """创建单个零食SVG"""
    
    # 创建不同的形状装饰
    shape_decorations = {
        "circle": f'''
  <ellipse cx="200" cy="180" rx="100" ry="90" fill="{snack['primary']}" filter="url(#shadow)"/>
  <ellipse cx="200" cy="175" rx="80" ry="70" fill="{snack['secondary']}" opacity="0.5"/>''',
        
        "oval": f'''
  <rect x="100" y="130" width="200" height="100" rx="50" fill="{snack['primary']}" filter="url(#shadow)"/>''',
        
        "wave": f'''
  <path d="M100 200 Q150 150, 200 200 T300 200" stroke="{snack['primary']}" stroke-width="40" fill="none" filter="url(#shadow)" stroke-linecap="round"/>''',
        
        "sticks": f'''
  <g filter="url(#shadow)">
    <rect x="120" y="140" width="20" height="120" rx="10" fill="{snack['primary']}"/>
    <rect x="160" y="140" width="20" height="120" rx="10" fill="{snack['secondary']}"/>
    <rect x="200" y="140" width="20" height="120" rx="10" fill="{snack['primary']}"/>
    <rect x="240" y="140" width="20" height="120" rx="10" fill="{snack['secondary']}"/>
  </g>''',
        
        "sandwich": f'''
  <g filter="url(#shadow)">
    <circle cx="200" cy="160" r="70" fill="{snack['primary']}"/>
    <circle cx="200" cy="180" r="70" fill="{snack['primary']}"/>
    <rect x="130" y="170" width="140" height="15" fill="white"/>
  </g>''',
        
        "balls": f'''
  <g filter="url(#shadow)">
    <circle cx="160" cy="160" r="35" fill="{snack['primary']}"/>
    <circle cx="240" cy="160" r="35" fill="{snack['secondary']}"/>
    <circle cx="200" cy="210" r="35" fill="{snack['primary']}"/>
  </g>''',
        
        "default": f'''
  <circle cx="200" cy="180" r="90" fill="{snack['primary']}" filter="url(#shadow)"/>
  <circle cx="200" cy="180" r="70" fill="{snack['secondary']}" opacity="0.3"/>'''
    }
    
    shape_svg = shape_decorations.get(snack['shape'], shape_decorations['default'])
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg{snack['id']}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{snack['primary']};stop-opacity:0.15" />
      <stop offset="100%" style="stop-color:{snack['secondary']};stop-opacity:0.05" />
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="10" stdDeviation="15" flood-opacity="0.2"/>
    </filter>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  
  <!-- 背景 -->
  <rect width="400" height="400" fill="url(#bg{snack['id']})" rx="30"/>
  
  <!-- 装饰形状 -->
  {shape_svg}
  
  <!-- 图标 -->
  <text x="200" y="195" font-size="100" text-anchor="middle" dominant-baseline="central">{snack['icon']}</text>
  
  <!-- 名称 -->
  <text x="200" y="330" font-family="system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif" 
        font-size="28" font-weight="bold" text-anchor="middle" fill="#2d3748">{snack['name']}</text>
  
  <!-- 编号 -->
  <text x="200" y="365" font-family="monospace" font-size="14" text-anchor="middle" fill="#a0aec0">NO.{snack['id']}</text>
  
  <!-- 装饰点 -->
  <circle cx="50" cy="50" r="15" fill="{snack['primary']}" opacity="0.4"/>
  <circle cx="350" cy="50" r="10" fill="{snack['secondary']}" opacity="0.3"/>
  <circle cx="50" cy="350" r="10" fill="{snack['secondary']}" opacity="0.3"/>
  <circle cx="350" cy="350" r="15" fill="{snack['primary']}" opacity="0.4"/>
</svg>'''
    
    return svg

def main():
    print("=" * 60)
    print("创建精美零食SVG占位图")
    print("=" * 60)
    print(f"\n输出目录: {OUTPUT_DIR}\n")
    
    success = 0
    for snack in SNACKS:
        svg_path = OUTPUT_DIR / f"snack-{snack['id']}.svg"
        
        # 如果已存在则更新
        print(f"创建: {snack['name']} ({snack['id']})")
        
        svg_content = create_snack_svg(snack)
        
        with open(svg_path, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        
        print(f"  ✓ {svg_path.name}")
        success += 1
    
    print("\n" + "=" * 60)
    print(f"创建完成: {success}/{len(SNACKS)} 个SVG文件")
    print("=" * 60)
    
    print("\n文件列表:")
    for f in sorted(OUTPUT_DIR.glob("*.svg")):
        size = f.stat().st_size
        print(f"  ✓ {f.name:20} ({size:>6,} bytes)")

if __name__ == "__main__":
    main()
