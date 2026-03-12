#!/usr/bin/env python3
"""
零食图片爬虫 V2 - 严格匹配版
核心改进：关键词验证 + 内容过滤 + 详细日志
"""

import os
import re
import json
import time
import random
import logging
import hashlib
from pathlib import Path
from urllib.parse import quote_plus, urlparse
from datetime import datetime
from typing import List, Dict, Tuple, Optional

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


# ============ 配置 ============
OUTPUT_DIR = Path("./output_v2")
LOGS_DIR = Path("./logs")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# 图片验证配置
MIN_WIDTH = 500
MIN_HEIGHT = 500
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp']

# 品牌词过滤（需要去除）
BRAND_WORDS = ['牌', '公司', '集团', '官方', '旗舰店', '专卖', '企业店', '天猫', '淘宝', '京东']

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOGS_DIR / f"crawl_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class StrictSnackCrawler:
    """严格匹配的零食图片爬虫"""
    
    def __init__(self, verbose: bool = False):
        self.driver = None
        self.verbose = verbose
        self.stats = {
            'total': 0, 
            'success': 0, 
            'failed': 0,
            'filtered_alt': 0,  # 因alt不匹配过滤
            'filtered_size': 0,  # 因尺寸过滤
            'filtered_content': 0,  # 因内容类型过滤
        }
        self.sources = {}  # 记录图片来源
        
    def init_driver(self):
        """初始化Chrome浏览器"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        
        # 随机User-Agent
        user_agents = [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        ]
        chrome_options.add_argument(f'--user-agent={random.choice(user_agents)}')
        
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
    
    def extract_keywords(self, snack_name: str) -> Tuple[str, List[str]]:
        """
        提取搜索关键词
        去除品牌词，保留核心品类词
        返回: (核心词, [完整关键词列表])
        """
        # 去除品牌相关词
        core_name = snack_name
        for brand in BRAND_WORDS:
            core_name = core_name.replace(brand, '')
        
        core_name = core_name.strip()
        
        # 构建搜索关键词列表（按优先级）
        keywords = [
            f"{snack_name} 零食 实拍",  # 最精确
            f"{core_name} 零食",         # 去除品牌
            f"{snack_name}",             # 原始名称
            core_name,                    # 仅核心词
        ]
        
        return core_name, keywords
    
    def validate_image_by_alt(self, alt_text: str, snack_name: str, core_keyword: str) -> bool:
        """
        验证图片alt文本是否匹配零食名称
        """
        if not alt_text:
            return False
        
        alt_lower = alt_text.lower()
        snack_lower = snack_name.lower()
        core_lower = core_keyword.lower()
        
        # 检查是否包含零食名或核心词
        matches = [
            snack_lower in alt_lower,
            core_lower in alt_lower,
            # 分词匹配（如"冻干草莓脆" -> "草莓"）
            any(word in alt_lower for word in [snack_lower[i:i+2] for i in range(0, len(snack_lower)-1, 2)] if len(word) >= 2)
        ]
        
        is_valid = any(matches)
        
        if self.verbose:
            logger.info(f"  [ALT验证] '{alt_text}' -> {'✅' if is_valid else '❌'}")
        
        if not is_valid:
            self.stats['filtered_alt'] += 1
            
        return is_valid
    
    def search_baidu_images(self, query: str, snack_name: str, core_keyword: str, num: int = 10) -> List[Dict]:
        """
        搜索百度图片并验证alt标签
        """
        try:
            search_url = f"https://image.baidu.com/search/index?tn=baiduimage&word={quote_plus(query)}"
            
            if self.verbose:
                logger.info(f"  🔍 搜索URL: {search_url}")
            
            self.driver.get(search_url)
            
            # 等待页面加载
            time.sleep(3)
            
            # 滚动加载更多
            for _ in range(3):
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1)
            
            # 获取所有图片元素
            img_elements = self.driver.find_elements(By.CSS_SELECTOR, 'img[class*="imgitem"]') or \
                          self.driver.find_elements(By.CSS_SELECTOR, '.imgitem img') or \
                          self.driver.find_elements(By.TAG_NAME, 'img')
            
            if self.verbose:
                logger.info(f"  📸 找到 {len(img_elements)} 个图片元素")
            
            valid_images = []
            
            for img in img_elements:
                try:
                    url = img.get_attribute('data-src') or img.get_attribute('src')
                    alt = img.get_attribute('alt') or ''
                    
                    # 跳过无效URL
                    if not url or not url.startswith('http') or url.startswith('data:'):
                        continue
                    
                    # 跳过百度logo和静态资源
                    if 'bdstatic' in url or 'baidu.com/img/' in url:
                        continue
                    
                    # 验证alt标签
                    if not self.validate_image_by_alt(alt, snack_name, core_keyword):
                        continue
                    
                    valid_images.append({
                        'url': url,
                        'alt': alt,
                        'source': 'baidu'
                    })
                    
                    if len(valid_images) >= num:
                        break
                        
                except Exception as e:
                    continue
            
            if self.verbose:
                logger.info(f"  ✅ 通过ALT验证: {len(valid_images)}/{len(img_elements)}")
            
            return valid_images
            
        except Exception as e:
            logger.error(f"  ❌ 搜索失败: {e}")
            return []
    
    def download_and_validate(self, img_url: str, snack_name: str, core_keyword: str, 
                               output_path: Path) -> Tuple[bool, str]:
        """
        下载图片并验证内容
        返回: (是否成功, 失败原因)
        """
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Referer': 'https://image.baidu.com/',
            'Accept-Language': 'zh-CN,zh;q=0.9'
        }
        
        try:
            # 下载
            response = requests.get(img_url, headers=headers, timeout=10)
            
            if response.status_code != 200:
                return False, f"HTTP {response.status_code}"
            
            content = response.content
            
            # 文件大小验证
            if len(content) > MAX_FILE_SIZE:
                return False, f"文件过大 ({len(content)/1024/1024:.1f}MB)"
            
            if len(content) < 5000:
                return False, f"文件过小 ({len(content)} bytes)"
            
            # 文件类型验证（检查文件头）
            header = content[:8]
            is_jpg = header.startswith(b'\xff\xd8')
            is_png = header.startswith(b'\x89PNG')
            is_webp = header.startswith(b'RIFF') and header[8:12] == b'WEBP'
            
            if not any([is_jpg, is_png, is_webp]):
                return False, "未知文件格式"
            
            # 使用PIL验证图片
            img = Image.open(BytesIO(content))
            width, height = img.size
            img_format = img.format
            
            # 尺寸验证
            if width < MIN_WIDTH or height < MIN_HEIGHT:
                self.stats['filtered_size'] += 1
                return False, f"尺寸过小 ({width}x{height})"
            
            # 长宽比验证（过滤掉异常比例）
            ratio = max(width, height) / min(width, height)
            if ratio > 4:  # 过于狭长的图片可能是banner
                return False, f"异常长宽比 ({ratio:.2f})"
            
            # 保存图片
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'wb') as f:
                f.write(content)
            
            # 记录来源
            self.sources[str(output_path)] = {
                'url': img_url,
                'alt': snack_name,
                'size': f"{width}x{height}",
                'format': img_format
            }
            
            return True, f"{width}x{height}"
            
        except Exception as e:
            return False, str(e)[:50]
    
    def process_snack(self, name: str, category: str = "default", 
                      manual_verify: bool = False) -> bool:
        """
        处理单个零食
        
        Args:
            name: 零食名称
            category: 分类
            manual_verify: 是否开启人工验证
        """
        print(f"\n{'='*60}")
        print(f"🍿 正在处理: {name}")
        print(f"{'='*60}")
        
        # 提取关键词
        core_keyword, search_queries = self.extract_keywords(name)
        print(f"🔤 核心词: {core_keyword}")
        print(f"🔍 搜索策略: {len(search_queries)} 种组合")
        
        # 构建输出路径
        safe_name = re.sub(r'[^\w\u4e00-\u9fff]', '_', name)[:20]
        output_dir = OUTPUT_DIR / category / safe_name
        
        downloaded = 0
        max_download = 3
        all_candidates = []  # 所有候选图片
        
        for query in search_queries:
            if downloaded >= max_download:
                break
            
            print(f"\n  📌 搜索: {query}")
            images = self.search_baidu_images(query, name, core_keyword, num=8)
            
            if not images:
                continue
            
            print(f"  ✅ 找到 {len(images)} 个候选")
            
            for i, img in enumerate(images, 1):
                if downloaded >= max_download:
                    break
                
                # 人工验证模式
                if manual_verify:
                    print(f"\n    [{i}] {img['url'][:60]}...")
                    confirm = input("    保存? (y/n/skip): ").strip().lower()
                    if confirm == 'n':
                        continue
                    elif confirm == 'skip':
                        break
                
                output_path = output_dir / f"{safe_name}_{downloaded+1:02d}.jpg"
                
                success, msg = self.download_and_validate(
                    img['url'], name, core_keyword, output_path
                )
                
                if success:
                    downloaded += 1
                    print(f"    ✅ 下载成功 [{downloaded}/{max_download}]: {msg}")
                else:
                    print(f"    ❌ 跳过: {msg}")
                
                time.sleep(random.uniform(1, 2))
            
            time.sleep(random.uniform(2, 4))
        
        print(f"\n📥 结果: 成功下载 {downloaded} 张")
        return downloaded > 0
    
    def crawl(self, snacks: List[Dict], test_mode: bool = False, 
              manual_verify: bool = False):
        """批量爬取"""
        print("\n" + "="*60)
        print("🚀 零食图片爬虫 V2 - 严格匹配版")
        print("="*60)
        print(f"配置: 最小尺寸 {MIN_WIDTH}x{MIN_HEIGHT}, 验证ALT标签")
        print("="*60)
        
        if not self.init_driver():
            print("❌ 浏览器初始化失败")
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
                    snack.get('category', 'default'),
                    manual_verify=manual_verify
                )
                
                if success:
                    self.stats['success'] += 1
                else:
                    self.stats['failed'] += 1
            
            # 保存来源记录
            sources_file = OUTPUT_DIR / 'sources.json'
            with open(sources_file, 'w', encoding='utf-8') as f:
                json.dump(self.sources, f, ensure_ascii=False, indent=2)
            
            # 统计输出
            print("\n" + "="*60)
            print("📊 最终统计")
            print("="*60)
            print(f"  总数:    {self.stats['total']}")
            print(f"  成功:    {self.stats['success']}")
            print(f"  失败:    {self.stats['failed']}")
            print(f"  成功率:  {self.stats['success']/self.stats['total']*100:.1f}%")
            print("-"*60)
            print(f"  ALT过滤: {self.stats['filtered_alt']}")
            print(f"  尺寸过滤: {self.stats['filtered_size']}")
            print("="*60)
            print(f"📁 输出目录: {OUTPUT_DIR.absolute()}")
            print(f"📋 来源记录: {sources_file}")
            
        finally:
            if self.driver:
                self.driver.quit()
                print("\n✅ 浏览器已关闭")


# ============ 测试数据 ============
TEST_SNACKS = [
    {"name": "冻干草莓脆", "category": "fruit"},
    {"name": "卫龙辣条", "category": "spicy"},
    {"name": "蛋黄酥", "category": "pastry"},
]


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='零食图片爬虫 V2')
    parser.add_argument('--test', '-t', action='store_true', help='测试模式（只处理3个）')
    parser.add_argument('--input', '-f', type=str, help='输入JSON文件')
    parser.add_argument('--verbose', '-v', action='store_true', help='详细日志')
    parser.add_argument('--manual', '-m', action='store_true', help='人工验证模式')
    args = parser.parse_args()
    
    # 加载数据
    if args.input:
        with open(args.input, 'r', encoding='utf-8') as f:
            snacks = json.load(f)
        print(f"📂 加载 {len(snacks)} 个零食")
    else:
        snacks = TEST_SNACKS
        print(f"📂 使用测试数据 ({len(snacks)} 个)")
    
    # 运行爬虫
    crawler = StrictSnackCrawler(verbose=args.verbose)
    crawler.crawl(snacks, test_mode=args.test, manual_verify=args.manual)


if __name__ == "__main__":
    main()
