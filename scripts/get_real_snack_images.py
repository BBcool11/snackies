#!/usr/bin/env python3
"""
真实零食透明PNG图片批量获取方案
================================

由于用户要求"必须是真实抠图的透明PNG"，这里提供多个可行方案：

方案A: 使用AI服务批量抠图（推荐，最快）
- 使用 remove.bg API 或类似服务
- 优点：速度快、效果专业
- 需要：API Key 或付费额度

方案B: 开源工具本地批量处理
- 使用 rembg (Python库)
- 优点：免费、可批量
- 需要：本地计算资源

方案C: 手动处理 + 人工审核
- 外包或团队手动抠图
- 优点：效果最好
- 需要：时间和人力

方案D: 混合方案（推荐用于上线前）
- 优先处理热门零食（50-100个）
- 其余使用高质量占位图
- 逐步替换

================================
"""

import os
import sys
from pathlib import Path

# 配置
OUTPUT_DIR = Path("/Users/zoe/Downloads/app 2/public/snacks-transparent")
PRIORITY_SNACKS = [
    # 优先处理的50个热门零食
    "001", "002", "004", "007", "009", "014", "017", "028", "032", "042",
    "046", "097", "046", "101", "102", "103", "104", "028", "029", "030",
    "031", "076", "077", "078", "079", "088", "089", "092", "093", "120",
    "125", "130", "140", "150", "160", "170", "180", "190", "200", "201",
    "210", "220", "230", "240", "250", "260", "270", "280", "290", "300",
]

def check_existing_images():
    """检查现有图片状态"""
    png_files = list(OUTPUT_DIR.glob("*.png"))
    svg_files = list(OUTPUT_DIR.glob("*.svg"))
    
    print("=" * 70)
    print("零食图片状态检查")
    print("=" * 70)
    print(f"\n透明PNG: {len(png_files)} 个")
    print(f"SVG占位: {len(svg_files)} 个")
    print(f"总计: {len(png_files) + len(svg_files)} 个")
    
    if len(png_files) < 50:
        print(f"\n⚠️ 警告: 透明PNG数量不足 ({len(png_files)} < 50)")
        print("建议: 使用以下方案获取真实图片")
    else:
        print(f"\n✅ 透明PNG数量充足")
    
    return len(png_files)

def generate_rembg_script():
    """生成 rembg 批量处理脚本"""
    script = '''#!/bin/bash
# 使用 rembg 批量抠图脚本
# 安装: pip install rembg
# 或使用 Docker: docker run danielgatis/rembg

INPUT_DIR="./raw_snack_images"
OUTPUT_DIR="./public/snacks-transparent"

echo "开始批量抠图..."

# 遍历所有原图
for img in "$INPUT_DIR"/*.{jpg,jpeg,png}; do
    if [ -f "$img" ]; then
        filename=$(basename "$img")
        name="${filename%.*}"
        
        echo "处理: $filename"
        
        # 使用 rembg 抠图
        rembg i "$img" "$OUTPUT_DIR/${name}.png"
        
        # 或使用 Docker
        # docker run -v $(pwd):/images danielgatis/rembg i "/images/$img" "/images/$OUTPUT_DIR/${name}.png"
    fi
done

echo "完成！"
'''
    
    script_path = Path("/Users/zoe/Downloads/app 2/scripts/batch_remove_bg.sh")
    script_path.write_text(script, encoding='utf-8')
    script_path.chmod(0o755)
    print(f"\n✅ 已生成脚本: {script_path}")

def generate_api_script():
    """生成API批量抠图脚本模板"""
    script = '''#!/usr/bin/env python3
"""
使用 Remove.bg API 批量抠图
需要获取API Key: https://www.remove.bg/api
"""

import os
import requests
from pathlib import Path

API_KEY = "YOUR_API_KEY_HERE"  # 替换为你的API Key
INPUT_DIR = Path("./raw_snack_images")
OUTPUT_DIR = Path("./public/snacks-transparent")

def remove_bg(input_path, output_path):
    """调用Remove.bg API"""
    response = requests.post(
        'https://api.remove.bg/v1.0/removebg',
        files={'image_file': open(input_path, 'rb')},
        data={'size': 'auto'},
        headers={'X-Api-Key': API_KEY},
    )
    if response.status_code == requests.codes.ok:
        with open(output_path, 'wb') as out:
            out.write(response.content)
        return True
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return False

# 批量处理
for img_file in INPUT_DIR.glob("*"):
    if img_file.suffix.lower() in ['.jpg', '.jpeg', '.png']:
        output_file = OUTPUT_DIR / f"{img_file.stem}.png"
        print(f"处理: {img_file.name}")
        if remove_bg(img_file, output_file):
            print(f"  ✓ 成功: {output_file.name}")
        else:
            print(f"  ✗ 失败")
'''
    
    script_path = Path("/Users/zoe/Downloads/app 2/scripts/batch_api_remove_bg.py")
    script_path.write_text(script, encoding='utf-8')
    print(f"✅ 已生成脚本: {script_path}")

def print_image_sources():
    """打印图片来源建议"""
    print("\n" + "=" * 70)
    print("真实零食图片来源建议")
    print("=" * 70)
    
    sources = """
1. 自己拍摄/扫描
   - 购买零食实物
   - 使用白背景拍摄
   - 使用AI工具抠图
   - 优点: 100%真实、无版权问题

2. 电商平台截图
   - 淘宝、京东、拼多多
   - 搜索零食名称
   - 下载商品主图
   - 注意: 仅用于个人项目

3. 品牌官网
   - 旺旺、卫龙、大白兔等
   - 新闻稿/产品页面
   - 通常有高质量图片

4. 社交媒体
   - 小红书、抖音
   - 用户分享的实物图
   - 需要筛选和授权

5. 图片素材网站
   - 摄图网、千图网
   - 需要会员下载
   - 质量较高
"""
    print(sources)

def print_ai_tools():
    """打印AI抠图工具推荐"""
    print("=" * 70)
    print("AI抠图工具推荐（免费/低成本）")
    print("=" * 70)
    
    tools = """
1. Remove.bg (推荐)
   - 网址: https://www.remove.bg/
   - 免费额度: 1张高清/无限预览
   - API: $0.20/张 (批量更便宜)
   - 效果: ⭐⭐⭐⭐⭐

2. Adobe Express (免费)
   - 网址: https://www.adobe.com/express/
   - 完全免费
   - 需要注册
   - 效果: ⭐⭐⭐⭐

3. ClipDrop (Stability AI)
   - 网址: https://clipdrop.co/
   - 免费额度: 100张/天
   - 效果: ⭐⭐⭐⭐

4. 美图秀秀网页版
   - 网址: https://pc.meitu.com/
   - 智能抠图功能
   - 中文界面
   - 效果: ⭐⭐⭐

5. removebg.cn (国内)
   - 国内访问快
   - 有免费额度
   - 效果: ⭐⭐⭐
"""
    print(tools)

def print_emergency_plan():
    """打印应急方案（上线前）"""
    print("=" * 70)
    print("🚨 上线前应急方案（如果时间紧迫）")
    print("=" * 70)
    
    plan = """
方案: 50+300 分层策略

第一阶段（50个热门零食）:
  - 手动处理50个最常见的零食
  - 旺旺雪饼、仙贝、卫龙、大白兔、奥利奥等
  - 使用Remove.bg或Adobe Express
  - 预计时间: 2-3小时

第二阶段（其余330个）:
  - 保留现有精美SVG
  - 在图片角落添加小标签: "插图"
  - 逐步用真实图片替换
  - 每周更新10-20个

展示策略:
  - 首页优先显示有真实图片的零食
  - 详情页顶部展示真实图片
  - 列表页可以使用SVG

替换计划:
  - 每周处理20个
  - 17周完成全部替换
  - 用户不会感知到差异
"""
    print(plan)

def main():
    """主函数"""
    print("\n" + "=" * 70)
    print("真实零食透明PNG图片获取方案")
    print("=" * 70)
    
    # 检查现有图片
    png_count = check_existing_images()
    
    # 生成脚本
    generate_rembg_script()
    generate_api_script()
    
    # 打印建议
    print_image_sources()
    print_ai_tools()
    
    # 如果图片不足，打印应急方案
    if png_count < 50:
        print_emergency_plan()
    
    print("\n" + "=" * 70)
    print("下一步建议:")
    print("=" * 70)
    print("""
1. 立即行动（今天）:
   - 选取50个热门零食
   - 从电商平台下载原图
   - 使用Remove.bg批量抠图

2. 中期计划（本周）:
   - 完成50个真实图片
   - 更新首页展示逻辑
   - 测试上线流程

3. 长期计划（每月）:
   - 持续补充真实图片
   - 替换剩余SVG占位图
   - 优化图片质量

需要我协助:
   - 编写自动化下载脚本
   - 批量抠图处理
   - 图片质量检查
""")

if __name__ == "__main__":
    main()
