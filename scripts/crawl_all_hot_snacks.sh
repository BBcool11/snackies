#!/bin/bash
# 批量爬取所有热门零食图片

cd "/Users/zoe/Downloads/app 2/scripts"

echo "=========================================="
echo "开始批量爬取热门零食图片"
echo "=========================================="
echo ""

# 使用Selenium爬虫处理所有热门零食
python3 snack_crawler_selenium.py -f snacks_input.json

echo ""
echo "=========================================="
echo "爬取完成！"
echo "=========================================="
