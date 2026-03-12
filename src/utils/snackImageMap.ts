/**
 * 零食图片映射
 * 支持本地映射和云端 OCR 生成的映射
 */

import localMapping from './imageMapping.json';
import generatedMapping from './imageMapping-generated.json';
import type { MappingData } from './mappingTypes';

const SNACKS_PATH = '/snacks';
const IMAGES_SNACKS_PATH = '/images/snacks';

// 云端映射数据（运行时加载）
let cloudMapping: MappingData = { mapping: {} };

// 合并所有映射（优先级：云端 > 本地 > 生成）
let combinedMapping: Record<string, string> = {
  ...generatedMapping.mapping,
  ...localMapping.mapping
};

// 初始化函数，在应用启动时调用
export async function initMappings() {
  try {
    const response = await fetch('/src/utils/imageMapping-cloud.json');
    if (response.ok) {
      cloudMapping = await response.json();
      combinedMapping = {
        ...localMapping.mapping,
        ...(cloudMapping.mapping || {})
      };
      console.log('✅ 已加载云端 OCR 映射:', getMappingStats());
    }
  } catch {
    // 云端映射文件不存在，使用本地映射
    console.log('ℹ️ 使用本地图片映射');
  }
}

/**
 * 获取零食的正确图片路径
 */
export function getSnackImagePath(dataId: string): string {
  const imageId = Object.entries(combinedMapping).find(
    ([_, data]) => data === dataId
  )?.[0];
  
  if (imageId) {
    return `${SNACKS_PATH}/snack-${imageId}.png`;
  }
  
  return `${SNACKS_PATH}/snack-${dataId}.png`;
}

/**
 * 获取备用图片路径
 */
export function getFallbackImagePath(dataId: string): string {
  return `${IMAGES_SNACKS_PATH}/${dataId}.jpg`;
}

/**
 * 获取图片对应的数据ID（反向查找）
 */
export function getDataIdByImageId(imageId: string): string {
  return combinedMapping[imageId] || imageId;
}

/**
 * 获取映射统计信息
 */
export function getMappingStats() {
  return {
    local: Object.keys(localMapping.mapping).length,
    cloud: Object.keys(cloudMapping.mapping || {}).length,
    total: Object.keys(combinedMapping).length
  };
}

/**
 * 检查是否使用了云端映射
 */
export function hasCloudMapping(): boolean {
  return !!cloudMapping.mapping && Object.keys(cloudMapping.mapping).length > 0;
}
