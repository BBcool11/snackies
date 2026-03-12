/**
 * 图片ID到数据ID的正确映射
 * 基于图片实际内容
 */

// 图片文件名 -> 正确的零食数据ID
export const IMAGE_TO_DATA_MAP: Record<string, string> = {
  // 基于图片OCR结果建立映射
  '001': '091', // 洽洽香瓜子 -> 数据中的瓜子ID（假设）
  '002': '001', // 卫龙大面筋 -> 数据中的001
  // 需要继续核对其他图片...
};

// 特殊命名图片的映射
export const SPECIAL_IMAGE_MAP: Record<string, string> = {
  'arctic-ocean': '/snacks/arctic-ocean.png',
  'bazooka-roll': '/snacks/bazooka-roll.png',
  'bazooka': '/snacks/bazooka.png',
  'bibaboo': '/snacks/bibaboo.png',
  'fig-strips': '/snacks/fig-strips.png',
  'jianlibao': '/snacks/jianlibao.png',
  'little-master': '/snacks/little-master.png',
  'little-raccoon': '/snacks/little-raccoon.png',
  'lollipop': '/snacks/lollipop.png',
  'lonely-god': '/snacks/lonely-god.png',
  'mimi': '/snacks/mimi.png',
  'mylikes': '/snacks/mylikes.png',
  'pop-rocks': '/snacks/pop-rocks.png',
  'wahaha-ad': '/snacks/wahaha-ad.png',
  'want-want-senbei': '/snacks/want-want-senbei.png',
  'wei-long-latiao': '/snacks/wei-long-latiao.png',
  'white-rabbit': '/snacks/white-rabbit.png',
  'wowo': '/snacks/wowo.png',
};

/**
 * 获取零食的正确图片路径
 * @param dataId 数据中的零食ID
 * @returns 图片路径
 */
export function getSnackImageByDataId(dataId: string): string {
  // 返回标准路径格式
  return `/snacks/snack-${dataId}.png`;
}

/**
 * 根据图片ID获取数据ID
 */
export function getDataIdByImageId(imageId: string): string {
  return IMAGE_TO_DATA_MAP[imageId] || imageId;
}
