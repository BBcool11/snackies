#!/usr/bin/env python3
"""
使用AI生成零食透明PNG图片
支持多种免费AI生成服务
"""

import os
import json
import urllib.request
import urllib.parse
import base64
from pathlib import Path

OUTPUT_DIR = Path("/Users/zoe/Downloads/app 2/public/snacks-transparent")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 零食描述（用于AI生成）
SNACKS_TO_GENERATE = [
    {
        "id": "001",
        "name": "旺旺雪饼",
        "prompt": "A single round rice cracker snack, white color with sugar crystals, product photography, white background, transparent background style, isolated object, high quality, detailed texture",
        "color": "#F5F5DC"
    },
    {
        "id": "002", 
        "name": "旺旺仙贝",
        "prompt": "A single rectangular senbei Japanese rice cracker, golden brown color, soy sauce glaze, product photography, white background, isolated object",
        "color": "#D2691E"
    },
    {
        "id": "004",
        "name": "浪味仙",
        "prompt": "Colorful spiral shaped vegetable puff chips, light green color, crispy texture, product photography, white background, isolated object",
        "color": "#90EE90"
    },
    {
        "id": "007",
        "name": "虾条",
        "prompt": "Long stick-shaped shrimp flavored chips, orange pink color, crispy texture, product photography, white background, isolated object",
        "color": "#FFA07A"
    },
    {
        "id": "009",
        "name": "薯片",
        "prompt": "Crispy thin potato chips, golden yellow color, wavy shape, product photography, white background, isolated object",
        "color": "#FFD700"
    },
    {
        "id": "028",
        "name": "大白兔奶糖",
        "prompt": "White wrapped milk candy with blue red wrapper twist ends, cylindrical shape, product photography, white background, isolated object",
        "color": "#FFFFFF"
    },
    {
        "id": "042",
        "name": "麦丽素",
        "prompt": "Round chocolate covered malt balls, dark brown glossy chocolate, product photography, white background, isolated object",
        "color": "#8B4513"
    },
    {
        "id": "046",
        "name": "辣条",
        "prompt": "Spicy Chinese latiao strip, reddish brown color, oily glossy texture, twisted shape, product photography, white background, isolated object",
        "color": "#CD5C5C"
    },
]

def generate_with_pollinations(prompt, output_path, width=400, height=400):
    """
    使用Pollinations.AI生成图片（免费，无需API key）
    文档: https://pollinations.ai/
    """
    try:
        # URL encode the prompt
        encoded_prompt = urllib.parse.quote(prompt)
        
        # Pollinations 免费图片生成API
        url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&nologo=true&seed=42&enhance=true"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        
        print(f"  正在生成: {prompt[:50]}...")
        
        req = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=120) as response:
            data = response.read()
            
            with open(output_path, 'wb') as f:
                f.write(data)
            
            print(f"  ✓ 生成成功: {output_path.name} ({len(data)} bytes)")
            return True
            
    except Exception as e:
        print(f"  ✗ 生成失败: {e}")
        return False

def create_svg_placeholder(snack, output_path):
    """创建精美的SVG占位图"""
    
    # 根据零食类型选择图标
    icons = {
        "cracker": "🍘",
        "chips": "🥔",
        "candy": "🍬",
        "chocolate": "🍫",
        "noodles": "🍜",
        "default": "🍪"
    }
    
    # 判断类型
    icon = icons["default"]
    if any(x in snack["name"] for x in ["饼", "仙贝", "薯片", "虾条"]):
        icon = icons["chips"]
    elif any(x in snack["name"] for x in ["糖", "奶糖"]):
        icon = icons["candy"]
    elif any(x in snack["name"] for x in ["巧克力", "麦丽素"]):
        icon = icons["chocolate"]
    elif "面" in snack["name"]:
        icon = icons["noodles"]
    elif "饼" in snack["name"]:
        icon = icons["cracker"]
    
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{snack['color']};stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:{snack['color']};stop-opacity:0.1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="20" flood-opacity="0.15"/>
    </filter>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- 背景 -->
  <rect width="400" height="400" fill="url(#bg)" rx="40"/>
  
  <!-- 装饰圆 -->
  <circle cx="200" cy="180" r="120" fill="{snack['color']}" opacity="0.2" filter="url(#shadow)"/>
  <circle cx="200" cy="180" r="90" fill="{snack['color']}" opacity="0.1"/>
  
  <!-- 图标 -->
  <text x="200" y="200" font-size="120" text-anchor="middle" dominant-baseline="central" filter="url(#glow)">{icon}</text>
  
  <!-- 零食名称 -->
  <text x="200" y="340" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="24" font-weight="600" 
        text-anchor="middle" fill="#333333">{snack['name']}</text>
  
  <!-- 编号 -->
  <text x="200" y="370" font-family="monospace" font-size="14" 
        text-anchor="middle" fill="#999999">#{snack['id']}</text>
  
  <!-- 角落装饰 -->
  <circle cx="40" cy="40" r="20" fill="{snack['color']}" opacity="0.3"/>
  <circle cx="360" cy="360" r="20" fill="{snack['color']}" opacity="0.3"/>
</svg>'''
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        print(f"  ✓ SVG占位图: {output_path.name}")
        return True
    except Exception as e:
        print(f"  ✗ SVG生成失败: {e}")
        return False

def generate_all():
    """生成所有零食图片"""
    print("=" * 60)
    print("零食图片生成工具")
    print("=" * 60)
    print(f"\n输出目录: {OUTPUT_DIR}")
    print(f"计划生成: {len(SNACKS_TO_GENERATE)} 张图片\n")
    
    success_count = 0
    
    for i, snack in enumerate(SNACKS_TO_GENERATE, 1):
        print(f"\n[{i}/{len(SNACKS_TO_GENERATE)}] {snack['name']}")
        print("-" * 40)
        
        output_path = OUTPUT_DIR / f"snack-{snack['id']}.png"
        svg_path = OUTPUT_DIR / f"snack-{snack['id']}.svg"
        
        # 如果已存在则跳过
        if output_path.exists():
            print(f"  ⏭  PNG已存在，跳过")
            success_count += 1
            continue
        
        # 首先尝试AI生成
        if generate_with_pollinations(snack['prompt'], output_path):
            success_count += 1
        else:
            # AI生成失败，创建SVG占位图
            print(f"  创建SVG占位图...")
            if create_svg_placeholder(snack, svg_path):
                success_count += 1
    
    print("\n" + "=" * 60)
    print(f"生成完成: {success_count}/{len(SNACKS_TO_GENERATE)}")
    print("=" * 60)
    
    # 列出生成的文件
    print("\n生成的文件:")
    for f in sorted(OUTPUT_DIR.iterdir()):
        size = f.stat().st_size
        print(f"  - {f.name} ({size:,} bytes)")
    
    return success_count

if __name__ == "__main__":
    generate_all()
