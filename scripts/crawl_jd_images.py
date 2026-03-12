#!/usr/bin/env python3
"""
京东零食图片爬虫 V3.0
按照用户提供的步骤实现：
1. 定位图片URL（处理懒加载 data-src）
2. 处理防盗链（User-Agent + Referer）
3. 验证图片有效性（文件头检查）
4. 批量处理与错误重试
5. 使用 Selenium 处理动态内容
"""

import json
import os
import time
import random
import logging
import hashlib
from pathlib import Path
from urllib.parse import urljoin, quote
from typing import Optional, List, Dict

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('image_crawl.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# 项目路径
PROJECT_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = PROJECT_ROOT / "public" / "snack-images-hot"
DATA_FILE = PROJECT_ROOT / "src" / "data" / "snacks_hot_100.json"

def setup_selenium():
    """配置 Selenium WebDriver"""
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from webdriver_manager.chrome import ChromeDriverManager
    
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # 无头模式
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    
    # 设置 User-Agent
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        return driver
    except Exception as e:
        logger.error(f"Selenium 初始化失败: {e}")
        return None


def search_jd_image(driver, snack_name: str, brand: str) -> Optional[str]:
    """
    使用 Selenium 搜索京东图片
    步骤5：处理动态内容与JavaScript渲染
    """
    if not driver:
        return None
    
    try:
        # 构造搜索URL（京东搜索）
        search_query = f"{brand} {snack_name} 零食".strip()
        search_url = f"https://search.jd.com/Search?keyword={quote(search_query)}&enc=utf-8"
        
        logger.info(f"搜索: {search_query}")
        driver.get(search_url)
        
        # 等待页面加载
        time.sleep(3)
        
        # 步骤1：定位图片URL（处理懒加载 data-src）
        from selenium.webdriver.common.by import By
        
        # 京东商品列表图片选择器
        img_selectors = [
            '//div[@class="gl-i-wrap"]//div[@class="p-img"]//img',
            '//li[@class="gl-item"]//div[@class="p-img"]//img',
            '//div[@class="p-img"]//img',
        ]
        
        img_url = None
        for selector in img_selectors:
            try:
                img_elements = driver.find_elements(By.XPATH, selector)
                if img_elements:
                    img = img_elements[0]
                    # 优先取 data-src（懒加载），其次 src
                    img_url = img.get_attribute('data-src') or img.get_attribute('src')
                    if img_url:
                        # 处理相对URL
                        if img_url.startswith('//'):
                            img_url = 'https:' + img_url
                        elif img_url.startswith('/'):
                            img_url = 'https://search.jd.com' + img_url
                        logger.info(f"找到图片: {img_url}")
                        break
            except Exception as e:
                continue
        
        return img_url
        
    except Exception as e:
        logger.error(f"搜索失败: {e}")
        return None


def download_image(img_url: str, output_path: Path, max_retries: int = 3) -> bool:
    """
    下载图片（含重试机制）
    步骤2：处理防盗链与请求头
    步骤3：验证图片有效性
    步骤4：批量处理与错误重试
    """
    import requests
    
    # 步骤2：模拟浏览器请求头，绕过防盗链
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://search.jd.com/",  # 模拟从京东跳转
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    }
    
    for attempt in range(max_retries):
        try:
            logger.info(f"  下载尝试 {attempt + 1}/{max_retries}: {img_url[:60]}...")
            
            response = requests.get(
                img_url, 
                headers=headers, 
                timeout=15,
                stream=True
            )
            
            # 检查响应状态
            if response.status_code != 200:
                logger.warning(f"  HTTP {response.status_code}")
                time.sleep(1)
                continue
            
            # 读取内容
            content = response.content
            
            # 步骤3：验证图片有效性 - 检查文件大小
            if len(content) < 1024:
                logger.warning(f"  图片太小 ({len(content)} bytes)")
                time.sleep(1)
                continue
            
            # 步骤3：验证图片有效性 - 检查文件头
            file_header = content[:4]
            valid_headers = {
                b"\xff\xd8\xff\xe0": "jpg",
                b"\xff\xd8\xff\xe1": "jpg",
                b"\x89\x50\x4e\x47": "png",
                b"\x47\x49\x46\x38": "gif",
                b"\x52\x49\x46\x46": "webp",
            }
            
            is_valid = False
            for header, ext in valid_headers.items():
                if file_header.startswith(header[:3]) or file_header.startswith(header):
                    is_valid = True
                    logger.info(f"  图片格式: {ext}")
                    break
            
            if not is_valid:
                logger.warning(f"  无效图片格式，文件头: {file_header.hex()}")
                time.sleep(1)
                continue
            
            # 保存图片
            with open(output_path, 'wb') as f:
                f.write(content)
            
            logger.info(f"  ✅ 下载成功 ({len(content)} bytes)")
            return True
            
        except Exception as e:
            logger.error(f"  下载失败: {e}")
            if attempt < max_retries - 1:
                time.sleep(2)
    
    return False


def process_snack(driver, snack: dict, index: int, total: int) -> Optional[str]:
    """处理单个零食"""
    snack_id = snack['id']
    name = snack['name']
    brand = snack.get('brand', '')
    
    # 输出路径
    output_path = OUTPUT_DIR / f"{snack_id}.jpg"
    
    logger.info(f"[{index}/{total}] 处理: {name} ({brand})")
    
    # 检查是否已存在
    if output_path.exists():
        size = output_path.stat().st_size
        if size > 1024:
            logger.info(f"  ✅ 已存在 ({size} bytes)")
            return f"/snack-images-hot/{snack_id}.jpg"
        else:
            logger.warning(f"  ⚠️ 文件太小，重新下载")
    
    # 搜索图片
    img_url = search_jd_image(driver, name, brand)
    
    if not img_url:
        logger.warning(f"  ⚠️ 未找到图片")
        return None
    
    # 下载图片
    if download_image(img_url, output_path):
        return f"/snack-images-hot/{snack_id}.jpg"
    
    return None


def update_json_with_images(image_map: dict):
    """更新JSON文件"""
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        snacks = json.load(f)
    
    updated = 0
    for snack in snacks:
        snack_id = snack['id']
        if snack_id in image_map and image_map[snack_id]:
            snack['image'] = image_map[snack_id]
            snack['missing_image'] = False
            snack['image_valid'] = True
            updated += 1
    
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(snacks, f, ensure_ascii=False, indent=2)
    
    return updated


def main():
    """主函数"""
    logger.info("=" * 60)
    logger.info("京东零食图片爬虫启动")
    logger.info("=" * 60)
    
    # 确保输出目录存在
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # 读取零食数据
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        snacks = json.load(f)
    
    logger.info(f"共 {len(snacks)} 个零食需要处理")
    logger.info(f"输出目录: {OUTPUT_DIR}")
    
    # 初始化 Selenium
    driver = setup_selenium()
    if not driver:
        logger.error("Selenium 初始化失败，退出")
        return
    
    try:
        # 批量处理
        image_map = {}
        success_count = 0
        failed_count = 0
        
        for i, snack in enumerate(snacks, 1):
            result = process_snack(driver, snack, i, len(snacks))
            
            if result:
                image_map[snack['id']] = result
                success_count += 1
            else:
                failed_count += 1
            
            # 随机延迟，避免被封
            if i < len(snacks):
                delay = random.uniform(2, 4)
                logger.info(f"  等待 {delay:.1f}s...")
                time.sleep(delay)
        
        # 更新JSON
        if image_map:
            updated = update_json_with_images(image_map)
            logger.info(f"已更新 {updated} 条数据到 JSON")
        
        # 统计
        logger.info("=" * 60)
        logger.info("处理完成!")
        logger.info(f"  成功: {success_count}")
        logger.info(f"  失败: {failed_count}")
        logger.info(f"  成功率: {success_count/len(snacks)*100:.1f}%")
        logger.info("=" * 60)
        
    finally:
        # 关闭浏览器
        if driver:
            driver.quit()
            logger.info("浏览器已关闭")


if __name__ == "__main__":
    main()
