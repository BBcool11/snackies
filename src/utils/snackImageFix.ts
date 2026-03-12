/**
 * 图片ID到正确零食名称的映射
 * 基于图片内容 OCR 结果
 */

export const IMAGE_ID_TO_SNACK: Record<string, { name: string; brand?: string; category?: string }> = {
  // 基于图片内容识别
  '001': { name: '洽洽香瓜子', brand: '洽洽', category: '瓜子' },
  '002': { name: '卫龙大面筋', brand: '卫龙', category: '辣条' },
  // 其他图片需要逐一核对...
};

/**
 * 获取图片对应的正确零食信息
 */
export function getSnackInfoByImageId(id: string) {
  return IMAGE_ID_TO_SNACK[id];
}
