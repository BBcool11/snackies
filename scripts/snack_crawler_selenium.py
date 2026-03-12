#!/usr/bin/env python3
"""
零食图片爬虫 - Selenium版（更可靠）
使用浏览器模拟，绕过反爬限制
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

# Selenium
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


# 配置
OUTPUT_DIR = Path("./output")
LOGS_DIR = Path("./logs")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# 日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOGS_DIR / f"crawl_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class SeleniumSnackCrawler:
    """使用Selenium的零食图片爬虫"""
    
    def __init__(self):
        self.driver = None
        self.stats = {'total': 0, 'success': 0, 'failed': 0}
        
    def init_driver(self):
        """初始化Chrome浏览器"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')  # 无头模式
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        
        # User-Agent
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        try:
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
                'source': 'Object.defineProperty(navigator, "webdriver", {get: () => undefined})'
            })
            logger.info("✅ Chrome浏览器初始化成功")
            return True
        except Exception as e:
            logger.error(f"❌ 浏览器初始化失败: {e}")
            return False
    
    def search_baidu_images(self, query: str, num: int = 5) -> List[Dict]:
        """
        使用Selenium搜索百度图片
        """
        try:
            search_url = f"https://image.baidu.com/search/index?tn=baiduimage&word={quote_plus(query)}"
            logger.info(f"🔍 访问: {search_url[:80]}...")
            
            self.driver.get(search_url)
            
            # 等待图片加载
            time.sleep(3)
            
            # 滚动页面加载更多图片
            for _ in range(2):
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1)
            
            # 查找图片元素
            img_elements = self.driver.find_elements(By.CSS_SELECTOR, 'img[class*="imgitem"]') or \
                          self.driver.find_elements(By.CSS_SELECTOR, '.imgitem img') or \
                          self.driver.find_elements(By.TAG_NAME, 'img')
            
            logger.info(f"📸 找到 {len(img_elements)} 个图片元素")
            
            images = []
            for img in img_elements[:num+5]:  # 多取几个用于过滤
                try:
                    # 获取图片URL（优先data-src，其次src）
                    url = img.get_attribute('data-src') or img.get_attribute('src')
                    alt = img.get_attribute('alt') or ''
                    
                    if url and url.startswith('http') and not url.startswith('data:'):
                        # 跳过百度logo和base64图片
                        if 'bdstatic' in url or url.startswith('data:'):
                            continue
                            
                        images.append({
                            'url': url,
                            'alt': alt,
                            'source': 'baidu'
                        })
                except:
                    continue
                
                if len(images) >= num:
                    break
            
            logger.info(f"✅ 提取到 {len(images)} 个有效图片URL")
            return images
            
        except Exception as e:
            logger.error(f"❌ 搜索失败: {e}")
            return []
    
    def download_image(self, img_url: str, output_path: Path) -> bool:
        """下载图片"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Referer': 'https://image.baidu.com/'
            }
            
            response = requests.get(img_url, headers=headers, timeout=15)
            
            if response.status_code != 200:
                return False
            
            content = response.content
            
            # 验证文件大小
            if len(content) < 5000:  # 至少5KB
                return False
            
            # 验证图片格式
            header = content[:4]
            is_jpg = header.startswith(b'\xff\xd8')
            is_png = header == b'\x89PNG'
            is_gif = header.startswith(b'GIF')
            
            if not any([is_jpg, is_png, is_gif]):
                return False
            
            # 使用PIL验证
            img = Image.open(BytesIO(content))
            width, height = img.size
            
            if width < 300 or height < 300:  # 最小300x300
                return False
            
            # 保存
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'wb') as f:
                f.write(content)
            
            logger.info(f"💾 已保存: {output_path} ({width}x{height})")
            return True
            
        except Exception as e:
            logger.warning(f"⚠️ 下载失败: {e}")
            return False
    
    def process_snack(self, name: str, category: str = "默认") -> bool:
        """处理单个零食"""
        print(f"\n{'='*60}")
        print(f"🍿 {name}")
        print(f"{'='*60}")
        
        # 构建关键词
        queries = [
            f"{name} 零食",
            f"{name}",
        ]
        
        safe_name = re.sub(r'[^\w\u4e00-\u9fff]', '_', name)[:20]
        output_dir = OUTPUT_DIR / category / safe_name
        
        downloaded = 0
        max_download = 3
        
        for query in queries:
            if downloaded >= max_download:
                break
                
            print(f"\n🔍 搜索: {query}")
            images = self.search_baidu_images(query, num=5)
            
            if not images:
                continue
            
            for i, img in enumerate(images, 1):
                if downloaded >= max_download:
                    break
                    
                output_path = output_dir / f"{safe_name}_{downloaded+1:02d}.jpg"
                
                print(f"  [{i}] 下载: {img['url'][:50]}...")
                
                if self.download_image(img['url'], output_path):
                    downloaded += 1
                    print(f"      ✅ 成功")
                else:
                    print(f"      ❌ 失败")
            
            time.sleep(random.uniform(2, 4))
        
        print(f"\n📥 共下载: {downloaded} 张")
        return downloaded > 0
    
    def crawl(self, snacks: List[Dict], test_mode: bool = False):
        """批量爬取"""
        print("\n" + "="*60)
        print("🚀 零食图片爬虫 (Selenium版)")
        print("="*60)
        
        # 初始化浏览器
        if not self.init_driver():
            print("❌ 浏览器初始化失败，退出")
            return
        
        try:
            if test_mode:
                snacks = snacks[:3]
                print(f"\n⚠️ 测试模式: 仅处理前{len(snacks)}个\n")
            
            self.stats['total'] = len(snacks)
            
            for i, snack in enumerate(snacks, 1):
                print(f"\n📦 进度: [{i}/{len(snacks)}]")
                
                success = self.process_snack(
                    snack['name'],
                    snack.get('category', '默认')
                )
                
                if success:
                    self.stats['success'] += 1
                else:
                    self.stats['failed'] += 1
            
            # 统计
            print("\n" + "="*60)
            print("📊 统计")
            print("="*60)
            print(f"  总数: {self.stats['total']}")
            print(f"  成功: {self.stats['success']}")
            print(f"  失败: {self.stats['failed']}")
            print(f"  成功率: {self.stats['success']/self.stats['total']*100:.1f}%")
            print("="*60)
            
        finally:
            if self.driver:
                self.driver.quit()
                print("\n✅ 浏览器已关闭")


# 测试数据
TEST_SNACKS = [
    {"name": "卫龙辣条", "category": "辣条"},
    {"name": "大白兔奶糖", "category": "糖果"},
    {"name": "乐事薯片", "category": "膨化食品"},
]


def main():
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--test', action='store_true', help='测试模式')
    parser.add_argument('--input', '-f', type=str, help='输入文件')
    args = parser.parse_args()
    
    # 加载数据
    if args.input:
        with open(args.input, 'r', encoding='utf-8') as f:
            snacks = json.load(f)
    else:
        snacks = TEST_SNACKS
    
    # 爬取
    crawler = SeleniumSnackCrawler()
    crawler.crawl(snacks, test_mode=args.test)


if __name__ == "__main__":
    main()
