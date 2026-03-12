#!/usr/bin/env python3
"""
图文匹配爬虫 V4.0
按照用户提供的方案实现：
1. 定位图文不匹配根源
2. URL提取（处理懒加载、父节点筛选）
3. 内容关联验证（alt属性 + OCR）
4. 动态加载处理（Selenium滚动）
5. 不匹配检测与重试
"""

import json
import os
import time
import random
import logging
import hashlib
from pathlib import Path
from urllib.parse import urljoin, quote
from typing import Optional, List, Dict, Tuple
from io import BytesIO

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('crawl_matching.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# 项目路径
PROJECT_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = PROJECT_ROOT / "public" / "snack-images-hot-real"
DATA_FILE = PROJECT_ROOT / "src" / "data" / "snacks_hot_100.json"

# 确保输出目录存在
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


class SnackImageCrawler:
    """零食图片爬虫（带图文匹配验证）"""
    
    def __init__(self):
        self.driver = None
        self.session = None
        self.setup_requests()
        
    def setup_requests(self):
        """配置requests会话"""
        import requests
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        })
    
    def setup_selenium(self):
        """配置 Selenium WebDriver"""
        from selenium import webdriver
        from selenium.webdriver.chrome.service import Service
        from selenium.webdriver.chrome.options import Options
        from webdriver_manager.chrome import ChromeDriverManager
        
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_experimental_option('excludeSwitches', ['enable-automation'])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        try:
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
                'source': 'Object.defineProperty(navigator, "webdriver", {get: () => undefined})'
            })
            logger.info("Selenium 初始化成功")
            return True
        except Exception as e:
            logger.error(f"Selenium 初始化失败: {e}")
            return False
    
    # ========== 步骤1：定位图文不匹配根源 ==========
    
    def diagnose_mismatch(self, snack_name: str, img_url: str, img_path: Path) -> str:
        """
        诊断图文不匹配的原因
        返回: 'url_error', 'content_mismatch', 'load_failure', 'valid'
        """
        # 检查1：URL是否可访问
        if not img_url or not img_url.startswith('http'):
            return 'url_error'
        
        # 检查2：文件是否存在且有效
        if not img_path.exists() or img_path.stat().st_size < 1024:
            return 'load_failure'
        
        # 检查3：OCR内容匹配
        try:
            from PIL import Image
            import pytesseract
            
            img = Image.open(img_path)
            text = pytesseract.image_to_string(img, lang='chi_sim+eng')
            
            # 提取零食名称关键词
            keywords = snack_name.replace(' ', '')[:4]
            if keywords not in text:
                logger.warning(f"OCR不匹配: {snack_name} 不在识别文本中")
                return 'content_mismatch'
        except Exception as e:
            logger.warning(f"OCR检查失败: {e}")
        
        return 'valid'
    
    # ========== 步骤2：针对性修改爬取逻辑 ==========
    
    def extract_images_from_jd(self, snack_name: str, brand: str) -> List[Dict]:
        """
        场景1：URL提取错误 - 通过父节点特征筛选目标图片
        京东商品列表中，主图通常在 class="gl-i-wrap" 或 "p-img" 的div中
        """
        if not self.driver:
            logger.error("Selenium 未初始化")
            return []
        
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        
        search_query = f"{brand} {snack_name}".strip()
        search_url = f"https://search.jd.com/Search?keyword={quote(search_query)}&enc=utf-8"
        
        logger.info(f"搜索京东: {search_query}")
        
        try:
            self.driver.get(search_url)
            
            # 等待页面加载
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # 场景3：动态加载 - 滚动页面触发懒加载
            for _ in range(3):
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1.5)
            
            # 场景1：通过父节点筛选正文图
            # 京东商品主图选择器优先级
            selectors = [
                '//div[@class="gl-i-wrap"]//div[@class="p-img"]//img',  # 标准列表
                '//li[@class="gl-item"]//div[@class="p-img"]//img',     # 列表项
                '//div[@class="p-img"]//img',                           # 图片容器
                '//img[@data-lazy-img]',                                # 懒加载图
            ]
            
            images = []
            for selector in selectors:
                try:
                    img_elements = self.driver.find_elements(By.XPATH, selector)
                    for img in img_elements[:5]:  # 只取前5张
                        # 处理懒加载：优先取 data-src, 其次 src
                        img_url = img.get_attribute('data-src') or img.get_attribute('src')
                        img_alt = img.get_attribute('alt') or ''
                        
                        if img_url:
                            # 补全URL
                            if img_url.startswith('//'):
                                img_url = 'https:' + img_url
                            elif img_url.startswith('/'):
                                img_url = 'https://search.jd.com' + img_url
                            
                            images.append({
                                'url': img_url,
                                'alt': img_alt,
                                'selector': selector
                            })
                except Exception as e:
                    continue
            
            logger.info(f"找到 {len(images)} 张候选图片")
            return images
            
        except Exception as e:
            logger.error(f"提取图片失败: {e}")
            return []
    
    def verify_content_match(self, snack_name: str, img_info: Dict) -> float:
        """
        场景2：图片与文本描述不符 - 利用alt属性验证
        返回匹配分数 0-1
        """
        img_alt = img_info.get('alt', '').lower()
        snack_lower = snack_name.lower()
        brand = img_info.get('brand', '').lower()
        
        # 方法1：alt属性匹配
        if snack_lower in img_alt or img_alt in snack_lower:
            return 1.0
        
        # 方法2：关键词匹配
        keywords = set(snack_lower.replace(' ', '')[:6])
        alt_chars = set(img_alt)
        
        if keywords & alt_chars:  # 有交集
            return 0.8
        
        # 方法3：品牌名匹配
        if brand and brand in img_alt:
            return 0.6
        
        return 0.0
    
    # ========== 步骤3：验证图文匹配性 ==========
    
    def download_and_verify(self, img_url: str, output_path: Path, 
                           snack_name: str, max_retries: int = 3) -> Tuple[bool, str]:
        """
        下载图片并验证图文匹配
        返回: (是否成功, 不匹配原因)
        """
        for attempt in range(max_retries):
            try:
                # 下载图片
                headers = {
                    "Referer": "https://search.jd.com/",
                    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
                }
                
                response = self.session.get(img_url, headers=headers, timeout=15)
                
                if response.status_code != 200:
                    logger.warning(f"HTTP {response.status_code}")
                    time.sleep(1)
                    continue
                
                content = response.content
                
                # 验证文件大小
                if len(content) < 2048:
                    logger.warning(f"图片太小 ({len(content)} bytes)")
                    time.sleep(1)
                    continue
                
                # 保存图片
                with open(output_path, 'wb') as f:
                    f.write(content)
                
                # 步骤3：诊断图文匹配
                mismatch_type = self.diagnose_mismatch(snack_name, img_url, output_path)
                
                if mismatch_type == 'valid':
                    logger.info(f"✅ 图文匹配验证通过")
                    return True, ''
                else:
                    logger.warning(f"❌ 图文不匹配: {mismatch_type}")
                    return False, mismatch_type
                    
            except Exception as e:
                logger.error(f"下载失败 (尝试 {attempt+1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2)
        
        return False, 'download_failed'
    
    # ========== 步骤4：优化爬取逻辑 ==========
    
    def crawl_snack(self, snack: dict, index: int, total: int) -> Optional[str]:
        """
        爬取单个零食图片（带完整验证流程）
        """
        snack_id = snack['id']
        name = snack['name']
        brand = snack.get('brand', '')
        
        output_path = OUTPUT_DIR / f"{snack_id}.jpg"
        
        logger.info(f"[{index}/{total}] 开始处理: {name}")
        
        # 检查是否已存在有效图片
        if output_path.exists():
            mismatch_type = self.diagnose_mismatch(name, '', output_path)
            if mismatch_type == 'valid':
                logger.info(f"  ✅ 已存在有效图片")
                return f"/snack-images-hot-real/{snack_id}.jpg"
            else:
                logger.warning(f"  ⚠️ 现有图片无效: {mismatch_type}")
        
        # 步骤2：提取候选图片
        candidates = self.extract_images_from_jd(name, brand)
        
        if not candidates:
            logger.error(f"  ❌ 未找到候选图片")
            return None
        
        # 按匹配度排序
        for img_info in candidates:
            img_info['match_score'] = self.verify_content_match(name, img_info)
        
        candidates.sort(key=lambda x: x['match_score'], reverse=True)
        
        # 尝试下载匹配度最高的图片
        for img_info in candidates[:3]:  # 只尝试前3个
            img_url = img_info['url']
            match_score = img_info['match_score']
            
            logger.info(f"  尝试下载 (匹配度: {match_score:.2f}): {img_url[:60]}...")
            
            success, error = self.download_and_verify(img_url, output_path, name)
            
            if success:
                return f"/snack-images-hot-real/{snack_id}.jpg"
            else:
                logger.warning(f"  下载/验证失败: {error}")
                if output_path.exists():
                    output_path.unlink()  # 删除无效文件
        
        return None
    
    def run(self):
        """主运行函数"""
        logger.info("=" * 60)
        logger.info("图文匹配爬虫启动")
        logger.info("=" * 60)
        
        # 读取数据
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            snacks = json.load(f)
        
        logger.info(f"共 {len(snacks)} 个零食需要处理")
        
        # 初始化 Selenium
        if not self.setup_selenium():
            logger.error("爬虫初始化失败")
            return
        
        try:
            success_count = 0
            fail_count = 0
            
            for i, snack in enumerate(snacks, 1):
                result = self.crawl_snack(snack, i, len(snacks))
                
                if result:
                    success_count += 1
                    # 更新JSON
                    snack['image'] = result
                    snack['missing_image'] = False
                else:
                    fail_count += 1
                
                # 随机延迟
                if i < len(snacks):
                    delay = random.uniform(2, 4)
                    time.sleep(delay)
            
            # 保存更新后的数据
            with open(DATA_FILE, 'w', encoding='utf-8') as f:
                json.dump(snacks, f, ensure_ascii=False, indent=2)
            
            logger.info("=" * 60)
            logger.info(f"处理完成! 成功: {success_count}, 失败: {fail_count}")
            logger.info("=" * 60)
            
        finally:
            if self.driver:
                self.driver.quit()
                logger.info("浏览器已关闭")


def main():
    crawler = SnackImageCrawler()
    crawler.run()


if __name__ == "__main__":
    main()
