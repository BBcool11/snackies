/**
 * robots.txt 解析器
 * 遵守爬虫规范，尊重网站的robots.txt规则
 */

import fetch from 'node-fetch';

export class RobotsParser {
  constructor() {
    this.cache = new Map();
    this.defaultDelay = 1000;
  }

  /**
   * 获取并解析robots.txt
   * @param {string} baseUrl - 网站基础URL
   * @returns {Object} 解析后的规则
   */
  async parse(baseUrl) {
    const domain = new URL(baseUrl).hostname;
    
    // 检查缓存
    if (this.cache.has(domain)) {
      return this.cache.get(domain);
    }

    const robotsUrl = `${baseUrl.replace(/\/$/, '')}/robots.txt`;
    
    try {
      const response = await fetch(robotsUrl, {
        timeout: 5000,
        headers: {
          'User-Agent': 'SnackiesBot/1.0 (Image Crawler for Educational Purpose)',
        },
      });

      if (!response.ok) {
        // 如果没有robots.txt，允许爬取
        const defaultRules = this.createDefaultRules();
        this.cache.set(domain, defaultRules);
        return defaultRules;
      }

      const content = await response.text();
      const rules = this.parseContent(content);
      
      this.cache.set(domain, rules);
      return rules;

    } catch (error) {
      console.warn(`无法获取robots.txt: ${robotsUrl}`, error.message);
      const defaultRules = this.createDefaultRules();
      this.cache.set(domain, defaultRules);
      return defaultRules;
    }
  }

  /**
   * 解析robots.txt内容
   */
  parseContent(content) {
    const rules = {
      userAgents: new Map(),
      sitemaps: [],
      crawlDelay: this.defaultDelay,
      host: null,
    };

    const lines = content.split('\n');
    let currentUserAgent = '*';

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 跳过空行和注释
      if (!trimmedLine || trimmedLine.startsWith('#')) continue;

      const [directive, ...valueParts] = trimmedLine.split(':');
      const value = valueParts.join(':').trim();

      switch (directive.toLowerCase()) {
        case 'user-agent':
          currentUserAgent = value || '*';
          if (!rules.userAgents.has(currentUserAgent)) {
            rules.userAgents.set(currentUserAgent, {
              allow: [],
              disallow: [],
              crawlDelay: null,
            });
          }
          break;

        case 'allow':
          if (value) {
            const uaRules = rules.userAgents.get(currentUserAgent) || 
              rules.userAgents.get('*') || { allow: [], disallow: [] };
            uaRules.allow.push(this.patternToRegex(value));
          }
          break;

        case 'disallow':
          if (value) {
            const uaRules = rules.userAgents.get(currentUserAgent) || 
              rules.userAgents.get('*') || { allow: [], disallow: [] };
            uaRules.disallow.push(this.patternToRegex(value));
          }
          break;

        case 'crawl-delay':
          const delay = parseInt(value, 10);
          if (!isNaN(delay) && delay > 0) {
            const uaRules = rules.userAgents.get(currentUserAgent) || 
              rules.userAgents.get('*');
            if (uaRules) {
              uaRules.crawlDelay = delay * 1000; // 转换为毫秒
            }
            rules.crawlDelay = Math.max(rules.crawlDelay, delay * 1000);
          }
          break;

        case 'sitemap':
          if (value) {
            rules.sitemaps.push(value);
          }
          break;

        case 'host':
          if (value) {
            rules.host = value;
          }
          break;
      }
    }

    return rules;
  }

  /**
   * 将robots.txt模式转换为正则表达式
   */
  patternToRegex(pattern) {
    // 转义特殊字符
    let regex = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');

    // 处理以$结尾的模式（表示精确匹配）
    if (regex.endsWith('\\$')) {
      regex = regex.slice(0, -2) + '$';
    }

    return new RegExp(regex, 'i');
  }

  /**
   * 检查URL是否允许爬取
   */
  canFetch(url, userAgent = '*') {
    try {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname + parsedUrl.search;
      
      const domain = parsedUrl.hostname;
      const rules = this.cache.get(domain);

      if (!rules) {
        // 如果没有缓存的规则，默认允许
        return true;
      }

      // 获取用户代理规则
      const uaRules = rules.userAgents.get(userAgent) || 
        rules.userAgents.get('*');

      if (!uaRules) {
        return true;
      }

      // 检查disallow规则
      for (const pattern of uaRules.disallow) {
        if (pattern.test(path)) {
          // 检查是否有更具体的allow规则
          for (const allowPattern of uaRules.allow) {
            if (allowPattern.test(path)) {
              return true;
            }
          }
          return false;
        }
      }

      return true;

    } catch (error) {
      console.warn('URL解析失败:', error.message);
      return false;
    }
  }

  /**
   * 获取爬取延迟
   */
  getCrawlDelay(baseUrl, userAgent = '*') {
    try {
      const domain = new URL(baseUrl).hostname;
      const rules = this.cache.get(domain);

      if (!rules) return this.defaultDelay;

      const uaRules = rules.userAgents.get(userAgent) || 
        rules.userAgents.get('*');

      return uaRules?.crawlDelay || rules.crawlDelay || this.defaultDelay;

    } catch {
      return this.defaultDelay;
    }
  }

  /**
   * 创建默认规则（允许所有）
   */
  createDefaultRules() {
    return {
      userAgents: new Map([['*', { allow: [], disallow: [], crawlDelay: null }]]),
      sitemaps: [],
      crawlDelay: this.defaultDelay,
      host: null,
    };
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear();
  }
}

// 请求频率控制器
export class RequestRateLimiter {
  constructor() {
    this.lastRequestTime = new Map();
    this.minDelay = 1000; // 最小延迟1秒
    this.domainDelays = new Map();
  }

  /**
   * 设置域名的延迟
   */
  setDomainDelay(domain, delay) {
    this.domainDelays.set(domain, Math.max(delay, this.minDelay));
  }

  /**
   * 等待直到可以发送下一个请求
   */
  async waitForNextRequest(url) {
    try {
      const domain = new URL(url).hostname;
      const delay = this.domainDelays.get(domain) || this.minDelay;
      const lastTime = this.lastRequestTime.get(domain) || 0;
      const now = Date.now();
      const waitTime = Math.max(0, lastTime + delay - now);

      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      this.lastRequestTime.set(domain, Date.now());

    } catch (error) {
      console.warn('频率控制错误:', error.message);
    }
  }

  /**
   * 获取当前延迟设置
   */
  getDelay(domain) {
    return this.domainDelays.get(domain) || this.minDelay;
  }
}

export default { RobotsParser, RequestRateLimiter };
