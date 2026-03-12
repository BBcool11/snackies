#!/usr/bin/env python3
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
