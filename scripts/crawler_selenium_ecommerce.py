#!/usr/bin/env python3
"""
Selenium版电商图片爬虫 - 绕过反爬获取京东/淘宝商品图
"""

import os
import time
import random
import logging
from pathlib import Path
from datetime import datetime
from typing import List, Dict

from PIL import Image
from io import BytesIO
import requests

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# 配置
OUTPUT_DIR = Path("/Users/zoe/Downloads/app 2/public/snack-images-fixed")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 需要爬取的精确零食列表
SNACKS = [
    {"name": "李子柒螺蛳粉", "search": "李子柒螺蛳粉", "id": "liziji_luosifen"},
    {"name": "好欢螺螺蛳粉", "search": "好欢螺螺蛳粉", "id": "haohuanluo_luosifen"},
    {"name": "卫龙老版透明包装", "search": "卫龙大面筋", "id": "weilong_old"},
    {"name": "亲嘴烧老包装", "search": "卫龙亲嘴烧", "id": "qinzuishao_old"},
    {"name": "魔芋爽", "search": "卫龙魔芋爽", "id": "moyushuang"},
    {"name": "魔芋爽香辣味", "search": "卫龙魔芋爽香辣", "id": "moyushuang_spicy"},
    {"name": "凤梨酥老版", "search": "徐福记凤梨酥", "id": "fenglisu_old"},
    {"name": "魔芋蛋糕", "search": "魔芋蛋糕", "id": "moyu_cake"},
    {"name": "香蕉牛奶", "search": "宾格瑞香蕉牛奶", "id": "banana_milk"},
    {"name": "鱼肠", "search": "ZEK鱼肠", "id": "zek_fishsausage"},
    {"name": "旺旺单身狗粮", "search": "旺旺单身狗粮", "id": "wangwang_single"},
    {"name": "南街村拌面", "search": "南街村拌面", "id": "nanjiecun_noodles"},
    {"name": "汤达人", "search": "统一汤达人", "id": "tangdaren"},
    {"name": "酸辣粉", "search": "嗨吃家酸辣粉", "id": "suanlafen"},
    {"name": "海底捞自热火锅", "search": "海底捞自热火锅", "id": "zire_hotpot"},
    {"name": "统一自热米饭", "search": "统一自热米饭", "id": "zire_rice"},
]


class EcommerceCrawler:
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
            logger.info("✅ 浏览器初始化成功")
            return True
        except Exception as e:
            logger.error(f"❌ 浏览器初始化失败: {e}")
            return False
    
    def search_jd(self, keyword: str) -> List[str]:
        """搜索京东商品图"""
        from urllib.parse import quote_plus
        search_url = f"https://search.jd.com/Search?keyword={quote_plus(keyword)}&enc=utf-8"
        
        try:
            logger.info(f"🔍 京东搜索: {keyword}")
            self.driver.get(search_url)
            time.sleep(3)
            
            # 等待商品加载
            wait = WebDriverWait(self.driver, 10)
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.gl-item')))
            
            # 获取商品图片
            images = []
            items = self.driver.find_elements(By.CSS_SELECTOR, '.gl-item')[:5]
            
            for item in items:
                try:
                    # 京东图片通常在 .p-img img
                    img_elem = item.find_element(By.CSS_SELECTOR, '.p-img img')
                    img_url = img_elem.get_attribute('data-lazy-img') or img_elem.get_attribute('src')
                    
                    if img_url and not img_url.startswith('data:'):
                        # 处理京东图片URL
                        if img_url.startswith('//'):
                            img_url = 'https:' + img_url
                        if '360buyimg.com' in img_url:
                            images.append(img_url)
                except:
                    continue
            
            logger.info(f"  ✅ 找到 {len(images)} 张图片")
            return images
            
        except Exception as e:
            logger.error(f"  ❌ 搜索失败: {e}")
            return []
    
    def download_image(self, img_url: str, output_path: Path) -> bool:
        """下载图片"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'Referer': 'https://search.jd.com/'
            }
            
            resp = requests.get(img_url, headers=headers, timeout=15)
            if resp.status_code != 200:
                return False
            
            content = resp.content
            if len(content) < 5000:
                return False
            
            # 验证图片
            img = Image.open(BytesIO(content))
            width, height = img.size
            if width < 300 or height < 300:
                return False
            
            # 保存
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'wb') as f:
                f.write(content)
            
            logger.info(f"  💾 已保存: {output_path.name} ({width}x{height})")
            return True
            
        except Exception as e:
            logger.error(f"  ❌ 下载失败: {e}")
            return False
    
    def process_snack(self, snack: Dict) -> bool:
        """处理单个零食"""
        name = snack['name']
        search = snack['search']
        snack_id = snack['id']
        
        print(f"\n{'='*60}")
        print(f"🍿 {name}")
        print(f"{'='*60}")
        
        output_path = OUTPUT_DIR / f"{snack_id}.jpg"
        
        # 京东搜索
        images = self.search_jd(search)
        
        if not images:
            print(f"  ❌ 未找到图片")
            return False
        
        # 下载第一张
        for img_url in images[:3]:
            print(f"  下载: {img_url[:60]}...")
            if self.download_image(img_url, output_path):
                print(f"  ✅ 成功!")
                return True
            time.sleep(1)
        
        print(f"  ❌ 下载失败")
        return False
    
    def run(self):
        print("\n" + "="*60)
        print("🚀 Selenium电商图片爬虫")
        print("="*60)
        
        if not self.init_driver():
            return
        
        success = 0
        fail = 0
        
        try:
            for i, snack in enumerate(SNACKS, 1):
                print(f"\n📦 [{i}/{len(SNACKS)}]")
                
                if self.process_snack(snack):
                    success += 1
                else:
                    fail += 1
                
                time.sleep(random.uniform(3, 6))
            
        finally:
            if self.driver:
                self.driver.quit()
        
        print("\n" + "="*60)
        print(f"📊 完成: 成功 {success}, 失败 {fail}")
        print("="*60)


def main():
    crawler = EcommerceCrawler()
    crawler.run()


if __name__ == "__main__":
    main()
