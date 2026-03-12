#!/usr/bin/env python3
"""
零食图片爬虫 - 专业版 V1.0
根据零食名称自动下载高质量匹配图片

作者: Assistant
日期: 2024
"""

import os
import re
import json
import time
import random
import hashlib
import logging
import requests
from pathlib import Path
from urllib.parse import quote, quote_plus, urlparse
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime

# 图像处理
from PIL import Image
from io import BytesIO

# 网页解析
from bs4 import BeautifulSoup

# ============================================================================
# 配置类
# ============================================================================

@dataclass
class CrawlerConfig:
    """爬虫配置"""
    # 图片质量要求
    MIN_WIDTH: int = 500
    MIN_HEIGHT: int = 500
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_FORMATS: tuple = ('jpg', 'jpeg', 'png', 'webp', 'gif')
    
    # 反爬设置
    REQUEST_DELAY: Tuple[float, float] = (1.0, 3.0)  # 请求间隔1-3秒
    MAX_RETRIES: int = 3
    TIMEOUT: int = 10
    
    # 输出设置
    OUTPUT_DIR: str = "./output"
    LOGS_DIR: str = "./logs"
    
    # 模式设置
    VERBOSE: bool = True  # 详细输出模式
    TEST_MODE: bool = False  # 测试模式（只处理前3个）
    INTERACTIVE: bool = False  # 交互确认模式
    
    # 下载数量
    CANDIDATES_PER_SOURCE: int = 5  # 每个数据源获取候选数
    MAX_DOWNLOADS: int = 5  # 每个零食最大下载数


# ============================================================================
# 日志配置
# ============================================================================

def setup_logging(logs_dir: str = "./logs"):
    """配置日志系统"""
    Path(logs_dir).mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    
    # 文件处理器 - 详细日志
    file_handler = logging.FileHandler(
        f"{logs_dir}/crawl_{timestamp}.log",
        encoding='utf-8'
    )
    file_handler.setLevel(logging.DEBUG)
    
    # 错误日志
    error_handler = logging.FileHandler(
        f"{logs_dir}/error_{timestamp}.log",
        encoding='utf-8'
    )
    error_handler.setLevel(logging.ERROR)
    
    # 控制台处理器
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    # 格式化
    formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    for handler in [file_handler, error_handler, console_handler]:
        handler.setFormatter(formatter)
    
    # 根日志配置
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.DEBUG)
    logger.addHandler(file_handler)
    logger.addHandler(error_handler)
    logger.addHandler(console_handler)
    
    return logger


# ============================================================================
# User-Agent 池
# ============================================================================

USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
]


# ============================================================================
# 主爬虫类
# ============================================================================

class SnackImageCrawler:
    """零食图片爬虫"""
    
    def __init__(self, config: CrawlerConfig = None):
        self.config = config or CrawlerConfig()
        self.logger = setup_logging(self.config.LOGS_DIR)
        self.session = requests.Session()
        self.sources = {}  # 记录图片来源
        
        # 统计信息
        self.stats = {
            'total': 0,
            'success': 0,
            'failed': 0,
            'downloaded': 0
        }
    
    # ========================================================================
    # 关键词处理
    # ========================================================================
    
    def clean_snack_name(self, name: str) -> str:
        """
        清洗零食名称
        去除品牌词、非产品词
        """
        # 去除常见品牌后缀
        brand_words = ['牌', '公司', '集团', '食品', '实业', '有限公司']
        cleaned = name
        for word in brand_words:
            cleaned = cleaned.replace(word, '')
        
        # 去除特殊字符
        cleaned = re.sub(r'[【】\[\]()（）]', '', cleaned)
        
        return cleaned.strip()
    
    def build_search_queries(self, snack_name: str) -> List[str]:
        """
        构建搜索关键词列表（按优先级）
        """
        cleaned = self.clean_snack_name(snack_name)
        
        queries = [
            f"{snack_name} 零食 实拍",  # 原始名称 + 实拍
            f"{cleaned} 零食 实拍图",    # 清洗后 + 实拍图
            f"{cleaned} 零食",           # 清洗后 + 零食
            f"{cleaned}",                # 仅清洗后名称
        ]
        
        return queries
    
    # ========================================================================
    # 图片源 - 百度图片
    # ========================================================================
    
    def search_baidu_images(self, query: str, num: int = 5) -> List[Dict]:
        """
        搜索百度图片
        """
        self.logger.debug(f"[百度图片] 搜索: {query}")
        
        headers = {
            'User-Agent': random.choice(USER_AGENTS),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Referer': 'https://image.baidu.com/',
        }
        
        try:
            # 百度图片搜索URL
            search_url = f"https://image.baidu.com/search/index?tn=baiduimage&word={quote_plus(query)}"
            
            if self.config.VERBOSE:
                print(f"  🔍 搜索URL: {search_url[:80]}...")
            
            response = self.session.get(
                search_url, 
                headers=headers, 
                timeout=self.config.TIMEOUT
            )
            
            if response.status_code != 200:
                self.logger.warning(f"[百度图片] HTTP {response.status_code}")
                return []
            
            if self.config.VERBOSE:
                print(f"  ✓ 响应成功: {response.status_code}")
            
            # 解析图片URL（百度图片使用JSONP格式）
            # 尝试从页面中提取图片数据
            img_urls = []
            
            # 方法1: 从HTML中提取
            soup = BeautifulSoup(response.text, 'html.parser')
            img_tags = soup.find_all('img')
            
            for img in img_tags:
                # 百度图片使用 data-imgurl 或 src
                url = img.get('data-imgurl') or img.get('src')
                if url and url.startswith('http'):
                    img_urls.append({
                        'url': url,
                        'source': 'baidu',
                        'title': img.get('alt', '')
                    })
            
            # 方法2: 从JS数据中提取（百度图片数据通常在页面JS中）
            pattern = r'"objURL":"(https?://[^"]+)"'
            matches = re.findall(pattern, response.text)
            for url in matches:
                if url not in [i['url'] for i in img_urls]:
                    img_urls.append({
                        'url': url,
                        'source': 'baidu',
                        'title': ''
                    })
            
            # 去重并限制数量
            seen = set()
            unique_urls = []
            for img in img_urls:
                if img['url'] not in seen and len(unique_urls) < num:
                    seen.add(img['url'])
                    unique_urls.append(img)
            
            if self.config.VERBOSE:
                print(f"  ✓ 解析到图片: {len(img_urls)}张")
                print(f"  ✓ 去重后剩余: {len(unique_urls)}张")
            
            return unique_urls
            
        except Exception as e:
            self.logger.error(f"[百度图片] 搜索失败: {e}")
            return []
    
    # ========================================================================
    # 图片验证
    # ========================================================================
    
    def validate_image(self, img_info: Dict, snack_name: str) -> Tuple[bool, str]:
        """
        验证图片是否符合要求
        返回: (是否通过, 原因)
        """
        url = img_info.get('url', '')
        title = img_info.get('title', '')
        
        # 1. URL有效性检查
        if not url or not url.startswith('http'):
            return False, "无效URL"
        
        # 2. 关键词匹配检查（URL或标题中包含零食名称）
        keywords = [snack_name, self.clean_snack_name(snack_name)]
        keyword_match = any(kw in url or kw in title for kw in keywords)
        
        # 3. 文件扩展名检查
        parsed = urlparse(url)
        path = parsed.path.lower()
        ext = path.split('.')[-1] if '.' in path else ''
        
        if ext and ext not in self.config.ALLOWED_FORMATS:
            return False, f"不支持的格式: {ext}"
        
        # 4. 跳过明显的非产品图
        skip_patterns = ['logo', 'banner', 'icon', 'button', 'avatar', 'qrcode']
        if any(p in url.lower() or p in title.lower() for p in skip_patterns):
            return False, "疑似非产品图"
        
        return True, "通过"
    
    def download_image(self, img_info: Dict, output_path: Path) -> Tuple[bool, Dict]:
        """
        下载并验证图片
        返回: (是否成功, 图片信息)
        """
        url = img_info['url']
        
        headers = {
            'User-Agent': random.choice(USER_AGENTS),
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Referer': 'https://image.baidu.com/',
        }
        
        for attempt in range(self.config.MAX_RETRIES):
            try:
                # 下载图片
                response = self.session.get(
                    url, 
                    headers=headers, 
                    timeout=self.config.TIMEOUT,
                    stream=True
                )
                
                if response.status_code != 200:
                    if self.config.VERBOSE:
                        print(f"    ⚠️ HTTP {response.status_code}")
                    time.sleep(1)
                    continue
                
                # 读取内容
                content = response.content
                
                # 检查文件大小
                if len(content) > self.config.MAX_FILE_SIZE:
                    return False, {'error': '文件过大'}
                
                if len(content) < 1024:
                    return False, {'error': '文件过小'}
                
                # 验证图片格式（通过文件头）
                header = content[:4]
                is_jpg = header.startswith(b'\xff\xd8')
                is_png = header == b'\x89PNG'
                is_gif = header.startswith(b'GIF')
                is_webp = header.startswith(b'RIFF')
                
                if not any([is_jpg, is_png, is_gif, is_webp]):
                    return False, {'error': '无效图片格式'}
                
                # 使用PIL验证图片尺寸
                try:
                    img = Image.open(BytesIO(content))
                    width, height = img.size
                    format_type = img.format
                    
                    if width < self.config.MIN_WIDTH or height < self.config.MIN_HEIGHT:
                        return False, {'error': f'尺寸过小: {width}x{height}'}
                    
                    # 保存图片
                    output_path.parent.mkdir(parents=True, exist_ok=True)
                    with open(output_path, 'wb') as f:
                        f.write(content)
                    
                    return True, {
                        'width': width,
                        'height': height,
                        'format': format_type,
                        'size': len(content),
                        'path': str(output_path)
                    }
                    
                except Exception as e:
                    return False, {'error': f'PIL验证失败: {e}'}
                    
            except Exception as e:
                self.logger.warning(f"下载失败 (尝试 {attempt+1}): {e}")
                if attempt < self.config.MAX_RETRIES - 1:
                    time.sleep(2)
        
        return False, {'error': '重试次数用尽'}
    
    # ========================================================================
    # 主处理流程
    # ========================================================================
    
    def process_snack(self, snack_name: str, category: str = "默认") -> Dict:
        """
        处理单个零食
        """
        result = {
            'name': snack_name,
            'category': category,
            'queries': [],
            'candidates': [],
            'downloaded': [],
            'success': False
        }
        
        print(f"\n{'='*60}")
        print(f"🍿 正在处理: {snack_name}")
        print(f"{'='*60}")
        
        # 1. 构建搜索关键词
        queries = self.build_search_queries(snack_name)
        result['queries'] = queries
        
        print(f"\n📋 搜索关键词:")
        for i, q in enumerate(queries, 1):
            print(f"  {i}. {q}")
        
        # 2. 搜索图片（从多个源）
        all_candidates = []
        
        for query in queries[:2]:  # 使用前2个关键词
            print(f"\n🔍 搜索: {query}")
            
            # 百度图片
            candidates = self.search_baidu_images(query, self.config.CANDIDATES_PER_SOURCE)
            
            for img in candidates:
                is_valid, reason = self.validate_image(img, snack_name)
                if is_valid:
                    all_candidates.append(img)
                    if self.config.VERBOSE:
                        print(f"  ✓ 候选: {img['url'][:50]}...")
                else:
                    if self.config.VERBOSE:
                        print(f"  ✗ 跳过: {reason}")
            
            # 请求间隔
            delay = random.uniform(*self.config.REQUEST_DELAY)
            time.sleep(delay)
        
        result['candidates'] = all_candidates
        print(f"\n📊 找到候选图片: {len(all_candidates)}张")
        
        # 3. 下载图片
        if not all_candidates:
            print("❌ 未找到候选图片")
            return result
        
        # 构建输出目录
        safe_name = re.sub(r'[^\w\u4e00-\u9fff]', '_', snack_name)[:20]
        output_dir = Path(self.config.OUTPUT_DIR) / category / safe_name
        
        downloaded = []
        for i, img_info in enumerate(all_candidates[:self.config.MAX_DOWNLOADS], 1):
            output_path = output_dir / f"{safe_name}_{i:02d}.jpg"
            
            print(f"\n  [{i}/{min(len(all_candidates), self.config.MAX_DOWNLOADS)}] 下载: {img_info['url'][:40]}...")
            
            success, info = self.download_image(img_info, output_path)
            
            if success:
                print(f"    ✅ 成功 ({info['width']}x{info['height']}, {info['size']} bytes)")
                downloaded.append({
                    'path': str(output_path),
                    'url': img_info['url'],
                    'info': info
                })
                
                # 记录来源
                self.sources[str(output_path)] = img_info['url']
                
                # 交互模式下确认
                if self.config.INTERACTIVE and i == 1:
                    confirm = input(f"    保存此图片? (y/n): ").strip().lower()
                    if confirm != 'y':
                        output_path.unlink()
                        downloaded.pop()
                        print("    已跳过")
            else:
                print(f"    ❌ 失败: {info.get('error', '未知错误')}")
        
        result['downloaded'] = downloaded
        result['success'] = len(downloaded) > 0
        
        print(f"\n📥 下载完成: {len(downloaded)}张")
        print(f"💾 保存路径: {output_dir}")
        
        return result
    
    def crawl(self, snacks: List[Dict]) -> List[Dict]:
        """
        批量爬取
        snacks: [{"name": "卫龙辣条", "category": "辣条"}, ...]
        """
        print("\n" + "="*70)
        print("🚀 零食图片爬虫启动")
        print("="*70)
        print(f"\n配置信息:")
        print(f"  - 输出目录: {self.config.OUTPUT_DIR}")
        print(f"  - 日志目录: {self.config.LOGS_DIR}")
        print(f"  - 最小尺寸: {self.config.MIN_WIDTH}x{self.config.MIN_HEIGHT}")
        print(f"  - 请求间隔: {self.config.REQUEST_DELAY[0]}-{self.config.REQUEST_DELAY[1]}秒")
        print(f"  - 详细模式: {'开启' if self.config.VERBOSE else '关闭'}")
        print(f"  - 测试模式: {'开启' if self.config.TEST_MODE else '关闭'}")
        
        # 测试模式只处理前3个
        if self.config.TEST_MODE:
            snacks = snacks[:3]
            print(f"\n⚠️ 测试模式: 仅处理前{len(snacks)}个零食")
        
        self.stats['total'] = len(snacks)
        results = []
        
        for i, snack in enumerate(snacks, 1):
            print(f"\n{'='*70}")
            print(f"📦 进度: [{i}/{len(snacks)}]")
            
            result = self.process_snack(
                snack['name'],
                snack.get('category', '默认')
            )
            
            results.append(result)
            
            if result['success']:
                self.stats['success'] += 1
                self.stats['downloaded'] += len(result['downloaded'])
            else:
                self.stats['failed'] += 1
        
        # 保存来源记录
        sources_file = Path(self.config.LOGS_DIR) / f"sources_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(sources_file, 'w', encoding='utf-8') as f:
            json.dump(self.sources, f, ensure_ascii=False, indent=2)
        
        # 输出统计
        print("\n" + "="*70)
        print("📊 爬取统计")
        print("="*70)
        print(f"  总零食数: {self.stats['total']}")
        print(f"  成功: {self.stats['success']}")
        print(f"  失败: {self.stats['failed']}")
        print(f"  下载图片: {self.stats['downloaded']}张")
        print(f"  成功率: {self.stats['success']/self.stats['total']*100:.1f}%")
        print(f"\n  来源记录: {sources_file}")
        print("="*70)
        
        return results


# ============================================================================
# 测试数据
# ============================================================================

TEST_SNACKS = [
    {"name": "卫龙辣条", "category": "辣条"},
    {"name": "大白兔奶糖", "category": "糖果"},
    {"name": "乐事薯片", "category": "膨化食品"},
]


# ============================================================================
# 主函数
# ============================================================================

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='零食图片爬虫')
    parser.add_argument('--test', action='store_true', help='测试模式')
    parser.add_argument('--verbose', '-v', action='store_true', help='详细输出')
    parser.add_argument('--interactive', '-i', action='store_true', help='交互模式')
    parser.add_argument('--input', '-f', type=str, help='零食列表JSON文件')
    parser.add_argument('--output', '-o', type=str, default='./output', help='输出目录')
    
    args = parser.parse_args()
    
    # 配置
    config = CrawlerConfig(
        TEST_MODE=args.test,
        VERBOSE=args.verbose or args.test,
        INTERACTIVE=args.interactive,
        OUTPUT_DIR=args.output
    )
    
    # 创建爬虫
    crawler = SnackImageCrawler(config)
    
    # 加载零食列表
    if args.input:
        with open(args.input, 'r', encoding='utf-8') as f:
            snacks = json.load(f)
    else:
        snacks = TEST_SNACKS
        print("\n⚠️ 未指定输入文件，使用测试数据")
    
    # 开始爬取
    results = crawler.crawl(snacks)
    
    # 保存结果
    result_file = Path(config.LOGS_DIR) / f"result_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(result_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n📄 详细结果已保存: {result_file}")


if __name__ == "__main__":
    main()
