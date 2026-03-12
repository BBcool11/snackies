#!/bin/bash
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
