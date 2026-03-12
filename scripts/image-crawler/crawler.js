/**
 * 图片爬虫主模块
 * 从多个来源获取零食图片，并进行验证
 */

import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { CRAWLER_CONFIG, generateSearchKeywords, isValidImageUrl } from './config.js';
import { ImageValidator, generateValidationReport } from './validator.js';
import { RobotsParser, RequestRateLimiter } from './robots-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 图片爬虫类
 */
export class SnackImageCrawler {
  constructor() {
    this.browser = null;
    this.validator = new ImageValidator();
    this.robotsParser = new RobotsParser();
    this.rateLimiter = new RequestRateLimiter();
    this.results = [];
    this.failedSnacks = [];
  }

  /**
   * 初始化浏览器
   */
  async init() {
    console.log('🚀 初始化爬虫...');
    
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });

    console.log('✅ 浏览器初始化完成');
  }

  /**
   * 关闭爬虫
   */
  async close() {
    console.log('🛑 关闭爬虫...');
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    await this.validator.terminate();
    
    console.log('✅ 爬虫已关闭');
  }

  /**
   * 爬取单个零食的图片
   */
  async crawlSnack(snack, options = {}) {
    const { source = 'all', maxImages = 5 } = options;
    
    console.log(`\n📦 开始爬取: ${snack.brand} ${snack.name}`);
    
    const keywords = generateSearchKeywords(snack);
    const images = [];

    // 1. 尝试官方渠道
    if (source === 'all' || source === 'official') {
      const officialImages = await this.crawlFromOfficial(snack);
      images.push(...officialImages);
    }

    // 2. 尝试电商平台
    if (images.length < maxImages && (source === 'all' || source === 'ecommerce')) {
      const ecommerceImages = await this.crawlFromEcommerce(snack, keywords);
      images.push(...ecommerceImages);
    }

    // 3. 去重并限制数量
    const uniqueImages = this.deduplicateImages(images).slice(0, maxImages);

    if (uniqueImages.length === 0) {
      console.log(`⚠️ 未找到图片: ${snack.name}`);
      this.failedSnacks.push(snack);
      return null;
    }

    console.log(`✅ 找到 ${uniqueImages.length} 张图片`);
    
    // 4. 验证图片
    const validatedImages = await this.validateImages(uniqueImages, snack);
    
    return {
      snack,
      images: validatedImages,
    };
  }

  /**
   * 从官方渠道爬取
   */
  async crawlFromOfficial(snack) {
    const images = [];
    const brandWebsite = CRAWLER_CONFIG.brandWebsites[snack.brand];

    if (!brandWebsite) {
      return images;
    }

    console.log(`  🏢 尝试官方渠道: ${brandWebsite}`);

    try {
      // 检查robots.txt
      const robotsRules = await this.robotsParser.parse(brandWebsite);
      const crawlDelay = this.robotsParser.getCrawlDelay(brandWebsite);
      this.rateLimiter.setDomainDelay(new URL(brandWebsite).hostname, crawlDelay);

      // 等待频率限制
      await this.rateLimiter.waitForNextRequest(brandWebsite);

      const page = await this.browser.newPage();
      
      await page.setUserAgent(this.getRandomUserAgent());
      await page.setViewport({ width: 1920, height: 1080 });

      await page.goto(brandWebsite, {
        waitUntil: 'networkidle2',
        timeout: CRAWLER_CONFIG.request.timeout,
      });

      // 搜索产品
      const searchSelectors = [
        'input[type="search"]',
        'input[name="search"]',
        '.search-input',
        '#search',
      ];

      for (const selector of searchSelectors) {
        const searchInput = await page.$(selector);
        if (searchInput) {
          await searchInput.type(snack.name, { delay: 100 });
          await searchInput.press('Enter');
          await page.waitForTimeout(2000);
          break;
        }
      }

      // 提取图片
      const pageImages = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs
          .map(img => ({
            url: img.src,
            alt: img.alt || '',
            width: img.naturalWidth,
            height: img.naturalHeight,
          }))
          .filter(img => img.url && img.width > 200 && img.height > 200);
      });

      for (const img of pageImages) {
        if (isValidImageUrl(img.url)) {
          images.push({
            url: img.url,
            source: 'brand_website',
            alt: img.alt,
            width: img.width,
            height: img.height,
          });
        }
      }

      await page.close();

    } catch (error) {
      console.warn(`  ⚠️ 官方渠道失败: ${error.message}`);
    }

    return images;
  }

  /**
   * 从电商平台爬取
   */
  async crawlFromEcommerce(snack, keywords) {
    const images = [];
    const sources = [
      { name: 'jd', searchUrl: `https://search.jd.com/Search?keyword=${encodeURIComponent(keywords[0])}&enc=utf-8` },
      { name: 'tmall', searchUrl: `https://list.tmall.com/search_product.htm?q=${encodeURIComponent(keywords[0])}` },
    ];

    for (const source of sources) {
      if (images.length >= 5) break;

      console.log(`  🛒 尝试电商平台: ${source.name}`);

      try {
        // 检查robots.txt
        const robotsRules = await this.robotsParser.parse(source.searchUrl);
        
        if (!this.robotsParser.canFetch(source.searchUrl)) {
          console.log(`  🚫 被robots.txt禁止: ${source.name}`);
          continue;
        }

        await this.rateLimiter.waitForNextRequest(source.searchUrl);

        const page = await this.browser.newPage();
        
        await page.setUserAgent(this.getRandomUserAgent());
        await page.setViewport({ width: 1920, height: 1080 });

        // 设置额外的HTTP头
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        });

        await page.goto(source.searchUrl, {
          waitUntil: 'networkidle2',
          timeout: CRAWLER_CONFIG.request.timeout,
        });

        // 等待图片加载
        await page.waitForTimeout(2000);

        // 提取图片
        const pageImages = await page.evaluate(() => {
          const imgs = Array.from(document.querySelectorAll('img'));
          return imgs
            .map(img => ({
              url: img.src,
              alt: img.alt || '',
              width: img.naturalWidth,
              height: img.naturalHeight,
            }))
            .filter(img => {
              // 过滤掉太小的图片和占位图
              return img.url && 
                img.width > 200 && 
                img.height > 200 &&
                !img.url.includes('blank') &&
                !img.url.includes('placeholder');
            });
        });

        for (const img of pageImages.slice(0, 10)) {
          if (isValidImageUrl(img.url)) {
            images.push({
              url: img.url,
              source: source.name,
              alt: img.alt,
              width: img.width,
              height: img.height,
            });
          }
        }

        await page.close();

      } catch (error) {
        console.warn(`  ⚠️ ${source.name}失败: ${error.message}`);
      }
    }

    return images;
  }

  /**
   * 验证图片
   */
  async validateImages(images, snack) {
    const validatedImages = [];

    for (const image of images) {
      try {
        // 下载图片
        const imageBuffer = await this.downloadImage(image.url);
        
        if (!imageBuffer) {
          continue;
        }

        // 验证图片
        const validation = await this.validator.validate(
          imageBuffer,
          snack,
          { source: image.source, robotsRespected: true }
        );

        validatedImages.push({
          ...image,
          buffer: imageBuffer,
          validation,
          confidence: validation.confidence,
        });

        console.log(`  ✅ 验证通过 (置信度: ${(validation.confidence * 100).toFixed(1)}%)`);

        // 如果置信度足够高，停止验证更多图片
        if (validation.isHighConfidence) {
          break;
        }

      } catch (error) {
        console.warn(`  ⚠️ 验证失败: ${error.message}`);
      }
    }

    // 按置信度排序
    return validatedImages.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 下载图片
   */
  async downloadImage(url) {
    try {
      await this.rateLimiter.waitForNextRequest(url);

      const response = await fetch(url, {
        timeout: CRAWLER_CONFIG.request.timeout,
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
          'Referer': new URL(url).origin,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      
      // 检查文件大小
      if (buffer.length < CRAWLER_CONFIG.imageQuality.minFileSize) {
        throw new Error('文件过小');
      }

      return buffer;

    } catch (error) {
      console.warn(`  ⚠️ 下载失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 保存图片
   */
  async saveImage(image, snackId) {
    const outputDir = path.resolve(__dirname, CRAWLER_CONFIG.output.dir);
    
    try {
      await fs.mkdir(outputDir, { recursive: true });

      const filename = CRAWLER_CONFIG.output.naming.replace('{id}', snackId);
      const filepath = path.join(outputDir, filename);

      await fs.writeFile(filepath, image.buffer);

      console.log(`  💾 已保存: ${filename}`);
      
      return filepath;

    } catch (error) {
      console.error(`  ❌ 保存失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 图片去重
   */
  deduplicateImages(images) {
    const seen = new Set();
    return images.filter(img => {
      // 基于URL去重
      const key = img.url.split('?')[0];
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * 获取随机User-Agent
   */
  getRandomUserAgent() {
    const agents = CRAWLER_CONFIG.request.userAgents;
    return agents[Math.floor(Math.random() * agents.length)];
  }

  /**
   * 批量爬取
   */
  async crawlBatch(snacks, options = {}) {
    console.log(`\n🎯 开始批量爬取 ${snacks.length} 个零食...\n`);

    const results = [];

    for (let i = 0; i < snacks.length; i++) {
      const snack = snacks[i];
      console.log(`\n[${i + 1}/${snacks.length}]`);

      try {
        const result = await this.crawlSnack(snack, options);
        
        if (result && result.images.length > 0) {
          // 保存最佳图片
          const bestImage = result.images[0];
          const savedPath = await this.saveImage(bestImage, snack.id);
          
          if (savedPath) {
            results.push({
              snack,
              imagePath: savedPath,
              confidence: bestImage.confidence,
              validation: bestImage.validation,
            });
          }
        }

        // 添加延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ 爬取失败: ${snack.name}`, error.message);
        this.failedSnacks.push(snack);
      }
    }

    // 生成报告
    const report = this.generateReport(results);
    
    return {
      results,
      report,
      failedSnacks: this.failedSnacks,
    };
  }

  /**
   * 生成爬取报告
   */
  generateReport(results) {
    const total = results.length + this.failedSnacks.length;
    const success = results.length;
    const failed = this.failedSnacks.length;

    const avgConfidence = results.length > 0
      ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length
      : 0;

    const report = {
      total,
      success,
      failed,
      successRate: ((success / total) * 100).toFixed(1),
      avgConfidence: (avgConfidence * 100).toFixed(1),
      highConfidence: results.filter(r => r.confidence >= 0.85).length,
      needsReview: results.filter(r => r.confidence >= 0.45 && r.confidence < 0.65).length,
      failedList: this.failedSnacks.map(s => s.name),
    };

    console.log('\n📊 爬取报告:');
    console.log(`  总计: ${total}`);
    console.log(`  成功: ${success} (${report.successRate}%)`);
    console.log(`  失败: ${failed}`);
    console.log(`  平均置信度: ${report.avgConfidence}%`);
    console.log(`  高置信度: ${report.highConfidence}`);
    console.log(`  需要审核: ${report.needsReview}`);

    return report;
  }
}

// CLI入口
async function main() {
  const crawler = new SnackImageCrawler();

  try {
    await crawler.init();

    // 读取零食数据
    const snacksDataPath = path.resolve(__dirname, '../../src/data/snacks.ts');
    console.log('请手动提供要爬取的零食列表');
    
    // 示例：爬取前5个零食
    const testSnacks = [
      { id: '001', name: '旺旺雪饼', brand: '旺旺集团', brandEn: 'Want Want', era: '90s', category: '膨化米果', flavor: ['sweet', 'salty'], productionLoc: '大陆多省工厂', description: '雪白色的米饼' },
      { id: '028', name: '大白兔奶糖', brand: '上海冠生园', brandEn: 'Guanshengyuan', era: '80s', category: '奶糖', flavor: ['sweet'], productionLoc: '上海', description: '经典奶糖' },
      { id: '046', name: '卫龙大面筋', brand: '卫龙食品', brandEn: 'Wei Long', era: '00s', category: '辣条', flavor: ['spicy'], productionLoc: '河南漯河', description: '经典辣条' },
    ];

    const { results, report } = await crawler.crawlBatch(testSnacks, {
      source: 'ecommerce',
      maxImages: 3,
    });

    // 保存报告
    const reportPath = path.resolve(__dirname, './crawl-report.json');
    await fs.writeFile(reportPath, JSON.stringify({ results, report }, null, 2));
    console.log(`\n📄 报告已保存: ${reportPath}`);

  } catch (error) {
    console.error('❌ 爬虫执行失败:', error);
  } finally {
    await crawler.close();
  }
}

// 如果直接运行此文件
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export default SnackImageCrawler;
