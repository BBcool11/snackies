#!/usr/bin/env python3
"""
修复缺失/错误的零食图片
针对特定零食重新爬取正确图片
"""

import os
import re
import json
import time
import random
import logging
from pathlib import Path
from urllib.parse import quote_plus
from datetime import datetime
from typing import List, Dict, Tuple

from PIL import Image
from io import BytesIO
import requests

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

# 配置
OUTPUT_DIR = Path("/Users/zoe/Downloads/app 2/public/snack-images")
OUTPUT_HOT_DIR = Path("/Users/zoe/Downloads/app 2/public/snack-images-v2")
LOGS_DIR = Path("./logs")
LOGS_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOGS_DIR / f"fix_images_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class ImageFixer:
    def __init__(self):
        self.driver = None
        
    def init_driver(self):
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
        
        try:
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
                'source': 'Object.defineProperty(navigator, "webdriver", {get: () => undefined})'
            })
            return True
        except Exception as e:
            logger.error(f"浏览器初始化失败: {e}")
            return False
    
    def search_images(self, query: str, num: int = 5) -> List[Dict]:
        """搜索百度图片"""
        try:
            search_url = f"https://image.baidu.com/search/index?tn=baiduimage&word={quote_plus(query)}"
            logger.info(f"搜索: {query}")
            
            self.driver.get(search_url)
            time.sleep(3)
            
            # 滚动加载
            for _ in range(3):
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1)
            
            # 获取图片
            img_elements = self.driver.find_elements(By.CSS_SELECTOR, 'img[class*="imgitem"]') or \
                          self.driver.find_elements(By.CSS_SELECTOR, '.imgitem img') or \
                          self.driver.find_elements(By.TAG_NAME, 'img')
            
            images = []
            for img in img_elements[:num+5]:
                try:
                    url = img.get_attribute('data-src') or img.get_attribute('src')
                    alt = img.get_attribute('alt') or ''
                    
                    if url and url.startswith('http') and not url.startswith('data:'):
                        if 'bdstatic' in url or 'baidu.com/img/' in url:
                            continue
                        images.append({'url': url, 'alt': alt})
                except:
                    continue
                
                if len(images) >= num:
                    break
            
            return images
        except Exception as e:
            logger.error(f"搜索失败: {e}")
            return []
    
    def download_image(self, img_url: str, output_path: Path) -> bool:
        """下载并验证图片"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'Referer': 'https://image.baidu.com/'
            }
            
            response = requests.get(img_url, headers=headers, timeout=15)
            if response.status_code != 200:
                return False
            
            content = response.content
            if len(content) < 5000:
                return False
            
            # 验证图片格式
            header = content[:4]
            is_jpg = header.startswith(b'\xff\xd8')
            is_png = header.startswith(b'\x89PNG')
            
            if not (is_jpg or is_png):
                return False
            
            # 验证尺寸
            img = Image.open(BytesIO(content))
            width, height = img.size
            if width < 300 or height < 300:
                return False
            
            # 保存
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'wb') as f:
                f.write(content)
            
            return True
        except Exception as e:
            logger.warning(f"下载失败: {e}")
            return False
    
    def fix_snack(self, snack_info: Dict) -> bool:
        """修复单个零食图片"""
        name = snack_info['name']
        target_path = snack_info['target_path']
        queries = snack_info['search_queries']
        
        print(f"\n{'='*60}")
        print(f"🍿 修复: {name}")
        print(f"{'='*60}")
        
        downloaded = 0
        for query in queries:
            if downloaded >= 1:
                break
            
            print(f"搜索: {query}")
            images = self.search_images(query, num=5)
            
            if not images:
                continue
            
            for img in images:
                if downloaded >= 1:
                    break
                
                print(f"  尝试下载: {img['url'][:50]}...")
                if self.download_image(img['url'], Path(target_path)):
                    downloaded += 1
                    print(f"  ✅ 成功保存到: {target_path}")
                else:
                    print(f"  ❌ 失败")
                
                time.sleep(random.uniform(1, 2))
        
        return downloaded > 0
    
    def run(self, snacks_to_fix: List[Dict]):
        """批量修复"""
        print("\n" + "="*60)
        print("🚀 图片修复工具")
        print("="*60)
        
        if not self.init_driver():
            print("❌ 浏览器初始化失败")
            return
        
        success_count = 0
        fail_count = 0
        
        try:
            for i, snack in enumerate(snacks_to_fix, 1):
                print(f"\n📦 进度: [{i}/{len(snacks_to_fix)}]")
                
                if self.fix_snack(snack):
                    success_count += 1
                else:
                    fail_count += 1
                
                time.sleep(random.uniform(2, 4))
            
            print("\n" + "="*60)
            print("📊 修复统计")
            print("="*60)
            print(f"  总数: {len(snacks_to_fix)}")
            print(f"  成功: {success_count}")
            print(f"  失败: {fail_count}")
            
        finally:
            if self.driver:
                self.driver.quit()


# 需要修复的零食列表
SNACKS_TO_FIX = [
    {
        "name": "亲嘴烧老包装",
        "target_path": "/Users/zoe/Downloads/app 2/public/snack-images/kinzuishao.jpg",
        "search_queries": ["卫龙亲嘴烧 零食", "亲嘴烧 辣条 老包装"]
    },
    {
        "name": "魔芋爽（怀旧）",
        "target_path": "/Users/zoe/Downloads/app 2/public/snack-images/moyushuang.jpg",
        "search_queries": ["卫龙魔芋爽 零食", "魔芋爽 辣条 老包装"]
    },
    {
        "name": "魔芋爽香辣味（热门）",
        "target_path": "/Users/zoe/Downloads/app 2/public/snack-images-v2/hot_006_yytqbh9e.jpg",
        "search_queries": ["卫龙魔芋爽香辣味 零食 实拍", "魔芋爽 包装"]
    },
    {
        "name": "凤梨酥（热门）",
        "target_path": "/Users/zoe/Downloads/app 2/public/snack-images-v2/hot_087_rqx7qulx.jpg",
        "search_queries": ["徐福记凤梨酥 零食", "凤梨酥 包装"]
    },
    {
        "name": "魔芋蛋糕",
        "target_path": "/Users/zoe/Downloads/app 2/public/snack-images-v2/hot_010_0tnufl61.jpg",
        "search_queries": ["魔芋蛋糕 零食 低卡", "魔芋蛋糕 包装"]
    },
    {
        "name": "香蕉牛奶",
        "target_path": "/Users/zoe/Downloads/app 2/public/snack-images-v2/hot_045_f80makml.jpg",
        "search_queries": ["宾格瑞香蕉牛奶 零食", "香蕉牛奶 饮料"]
    },
    {
        "name": "鱼肠",
        "target_path": "/Users/zoe/Downloads/app 2/public/snack-images-v2/hot_080_hm80hw94.jpg",
        "search_queries": ["ZEK鱼肠 零食", "鱼肠 鳕鱼肠 包装"]
    },
    {
        "name": "旺旺单身狗粮",
        "target_path": "/Users/zoe/Downloads/app 2/public/snack-images/wangwang_single.jpg",
        "search_queries": ["旺旺单身狗粮 零食", "旺旺 单身狗粮 薯片"]
    },
]


def main():
    fixer = ImageFixer()
    fixer.run(SNACKS_TO_FIX)


if __name__ == "__main__":
    main()
