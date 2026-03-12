/**
 * 图片验证模块
 * 实现三级验证：源验证 + OCR验证 + 置信度评分
 */

import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import { CRAWLER_CONFIG } from './config.js';

// 验证结果类
export class ValidationResult {
  constructor() {
    this.sourceScore = 0;
    this.ocrScore = 0;
    this.matchScore = 0;
    this.confidence = 0;
    this.details = {
      source: {},
      ocr: {},
      match: {},
    };
    this.errors = [];
    this.warnings = [];
  }

  get isValid() {
    return this.confidence >= CRAWLER_CONFIG.validation.confidenceThresholds.low;
  }

  get needsReview() {
    const threshold = CRAWLER_CONFIG.validation.confidenceThresholds;
    return this.confidence >= threshold.low && this.confidence < threshold.medium;
  }

  get isHighConfidence() {
    return this.confidence >= CRAWLER_CONFIG.validation.confidenceThresholds.high;
  }
}

/**
 * 验证器主类
 */
export class ImageValidator {
  constructor() {
    this.ocrWorker = null;
    this.initOcr();
  }

  async initOcr() {
    try {
      this.ocrWorker = await createWorker('chi_sim+eng');
    } catch (error) {
      console.warn('OCR初始化失败:', error.message);
    }
  }

  /**
   * 执行完整验证
   * @param {Buffer} imageBuffer - 图片数据
   * @param {Object} snackInfo - 零食信息
   * @param {Object} sourceInfo - 来源信息
   * @returns {ValidationResult}
   */
  async validate(imageBuffer, snackInfo, sourceInfo = {}) {
    const result = new ValidationResult();

    try {
      // 1. 源验证
      const sourceValidation = await this.validateSource(imageBuffer, sourceInfo);
      result.sourceScore = sourceValidation.score;
      result.details.source = sourceValidation;

      // 2. 图片质量验证
      const qualityValidation = await this.validateQuality(imageBuffer);
      result.details.quality = qualityValidation;

      // 3. OCR验证
      if (this.ocrWorker && CRAWLER_CONFIG.validation.ocr.enabled) {
        const ocrValidation = await this.validateOcr(imageBuffer, snackInfo);
        result.ocrScore = ocrValidation.score;
        result.details.ocr = ocrValidation;
      }

      // 4. 内容匹配验证
      const matchValidation = await this.validateContentMatch(imageBuffer, snackInfo);
      result.matchScore = matchValidation.score;
      result.details.match = matchValidation;

      // 5. 计算综合置信度
      result.confidence = this.calculateConfidence(result);

    } catch (error) {
      result.errors.push(`验证失败: ${error.message}`);
    }

    return result;
  }

  /**
   * 验证图片来源
   */
  async validateSource(imageBuffer, sourceInfo) {
    const validation = {
      score: 0,
      source: sourceInfo.source || 'unknown',
      isOfficial: false,
      hasRobots: false,
    };

    // 根据来源类型评分
    const { sources } = CRAWLER_CONFIG;
    
    if (sources.official.some(s => s.name === sourceInfo.source)) {
      validation.score = 0.95;
      validation.isOfficial = true;
    } else if (sources.ecommerce.some(s => s.name === sourceInfo.source)) {
      const source = sources.ecommerce.find(s => s.name === sourceInfo.source);
      validation.score = (source?.weight || 70) / 100;
    } else if (sources.info.some(s => s.name === sourceInfo.source)) {
      const source = sources.info.find(s => s.name === sourceInfo.source);
      validation.score = (source?.weight || 45) / 100;
    } else {
      validation.score = 0.3;
    }

    // 检查robots.txt
    if (sourceInfo.robotsRespected) {
      validation.hasRobots = true;
      validation.score += 0.05;
    }

    return validation;
  }

  /**
   * 验证图片质量
   */
  async validateQuality(imageBuffer) {
    const validation = {
      score: 0,
      width: 0,
      height: 0,
      format: '',
      fileSize: imageBuffer.length,
      issues: [],
    };

    try {
      const metadata = await sharp(imageBuffer).metadata();
      validation.width = metadata.width;
      validation.height = metadata.height;
      validation.format = metadata.format;

      const { imageQuality } = CRAWLER_CONFIG;

      // 尺寸检查
      if (metadata.width < imageQuality.minWidth || metadata.height < imageQuality.minHeight) {
        validation.issues.push('图片尺寸过小');
        validation.score -= 0.2;
      }

      if (metadata.width > imageQuality.maxWidth || metadata.height > imageQuality.maxHeight) {
        validation.issues.push('图片尺寸过大');
        validation.score -= 0.1;
      }

      // 格式检查
      if (!imageQuality.formats.includes(metadata.format?.toLowerCase())) {
        validation.issues.push('不支持的图片格式');
        validation.score -= 0.3;
      }

      // 文件大小检查
      if (imageBuffer.length < imageQuality.minFileSize) {
        validation.issues.push('文件过小，可能不是有效图片');
        validation.score -= 0.3;
      }

      if (imageBuffer.length > imageQuality.maxFileSize) {
        validation.issues.push('文件过大');
        validation.score -= 0.1;
      }

      // 基础质量分
      validation.score = Math.max(0, 1 + validation.score);

    } catch (error) {
      validation.issues.push(`无法读取图片: ${error.message}`);
      validation.score = 0;
    }

    return validation;
  }

  /**
   * OCR验证 - 识别图片中的文字
   */
  async validateOcr(imageBuffer, snackInfo) {
    const validation = {
      score: 0,
      text: '',
      keywords: [],
      matchedKeywords: [],
      confidence: 0,
    };

    if (!this.ocrWorker) {
      validation.score = 0.5;
      return validation;
    }

    try {
      // 预处理图片以提高OCR准确率
      const processedBuffer = await sharp(imageBuffer)
        .greyscale()
        .normalize()
        .toBuffer();

      const { data: { text, confidence } } = await this.ocrWorker.recognize(processedBuffer);
      
      validation.text = text;
      validation.confidence = confidence / 100;

      // 提取关键词
      const keywords = [
        snack.name,
        snack.brand,
        ...(snack.nameEn ? [snack.nameEn] : []),
        ...(snack.brandEn ? [snack.brandEn] : []),
        snack.category,
      ].filter(Boolean);

      validation.keywords = keywords;

      // 检查关键词匹配
      const textLower = text.toLowerCase();
      for (const keyword of keywords) {
        if (textLower.includes(keyword.toLowerCase())) {
          validation.matchedKeywords.push(keyword);
        }
      }

      // 计算匹配分数
      const matchRatio = validation.matchedKeywords.length / keywords.length;
      validation.score = matchRatio * 0.8 + (confidence / 100) * 0.2;

    } catch (error) {
      console.warn('OCR验证失败:', error.message);
      validation.score = 0.3;
    }

    return validation;
  }

  /**
   * 内容匹配验证
   */
  async validateContentMatch(imageBuffer, snackInfo) {
    const validation = {
      score: 0,
      colorMatch: 0,
      shapeMatch: 0,
      brandMatch: 0,
    };

    try {
      // 获取图片统计信息
      const stats = await sharp(imageBuffer).stats();
      
      // 检查是否是纯色/空白图片
      const isBlank = this.detectBlankImage(stats);
      if (isBlank) {
        validation.score = 0;
        return validation;
      }

      // 基于零食类别进行颜色分析
      validation.colorMatch = this.analyzeColorMatch(stats, snackInfo.category);
      
      // 综合评分
      validation.score = validation.colorMatch * 0.6 + 0.4;

    } catch (error) {
      validation.score = 0.5;
    }

    return validation;
  }

  /**
   * 检测是否是空白图片
   */
  detectBlankImage(stats) {
    // 如果标准差很小，可能是纯色图片
    const lowVariance = stats.entropy < 1;
    
    // 如果最大最小值差异很小
    const lowContrast = (stats.max - stats.min) < 20;
    
    return lowVariance || lowContrast;
  }

  /**
   * 分析颜色匹配度
   */
  analyzeColorMatch(stats, category) {
    // 基于不同零食类别的颜色特征
    const categoryColors = {
      '辣条': { dominant: 'red', minSaturation: 0.3 },
      '巧克力': { dominant: 'brown', minSaturation: 0.2 },
      '奶糖': { dominant: 'white', minSaturation: 0.1 },
      '薯片': { dominant: 'yellow', minSaturation: 0.2 },
      '饼干': { dominant: 'beige', minSaturation: 0.1 },
      '饮料': { dominant: 'varies', minSaturation: 0.2 },
    };

    // 简化处理：基于熵值判断
    if (stats.entropy > 4) {
      return 0.8;
    } else if (stats.entropy > 2) {
      return 0.6;
    } else {
      return 0.4;
    }
  }

  /**
   * 计算综合置信度
   */
  calculateConfidence(result) {
    const weights = {
      source: 0.3,
      quality: 0.2,
      ocr: 0.3,
      match: 0.2,
    };

    const qualityScore = result.details.quality?.score || 0;

    const confidence = 
      result.sourceScore * weights.source +
      qualityScore * weights.quality +
      result.ocrScore * weights.ocr +
      result.matchScore * weights.match;

    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * 终止OCR worker
   */
  async terminate() {
    if (this.ocrWorker) {
      await this.ocrWorker.terminate();
      this.ocrWorker = null;
    }
  }
}

// 验证结果报告生成器
export function generateValidationReport(results) {
  const report = {
    total: results.length,
    passed: results.filter(r => r.isValid && r.isHighConfidence).length,
    needsReview: results.filter(r => r.needsReview).length,
    failed: results.filter(r => !r.isValid).length,
    details: [],
  };

  for (const result of results) {
    report.details.push({
      confidence: result.confidence,
      isValid: result.isValid,
      needsReview: result.needsReview,
      isHighConfidence: result.isHighConfidence,
      errors: result.errors,
      warnings: result.warnings,
    });
  }

  return report;
}

export default ImageValidator;
