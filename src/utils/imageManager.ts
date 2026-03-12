/**
 * 零食图片管理工具
 * 透明PNG优先级系统 + AI抠图集成
 */

// 透明PNG图片路径前缀
const TRANSPARENT_PATH = '/snacks-transparent';

// 缓存已检测的图片状态
const imageStatusCache: Map<string, boolean> = new Map();

/**
 * 检查透明PNG是否存在
 */
export async function checkTransparentPngExists(snackId: string): Promise<boolean> {
  // 检查缓存
  if (imageStatusCache.has(snackId)) {
    return imageStatusCache.get(snackId)!;
  }

  try {
    const response = await fetch(`${TRANSPARENT_PATH}/snack-${snackId}.png`, {
      method: 'HEAD',
      cache: 'no-cache'
    });
    const exists = response.ok;
    imageStatusCache.set(snackId, exists);
    return exists;
  } catch {
    imageStatusCache.set(snackId, false);
    return false;
  }
}

/**
 * 获取零食图片路径（优先透明PNG）
 */
export async function getSnackImagePath(
  snackId: string,
  fallbackImage: string
): Promise<string> {
  const hasTransparent = await checkTransparentPngExists(snackId);
  if (hasTransparent) {
    return `${TRANSPARENT_PATH}/snack-${snackId}.png`;
  }
  return fallbackImage;
}

/**
 * 同步获取图片路径（使用缓存，不等待检测）
 */
export function getSnackImagePathSync(
  snackId: string,
  fallbackImage: string
): string {
  // 如果已缓存且存在，返回透明PNG路径
  if (imageStatusCache.get(snackId)) {
    return `${TRANSPARENT_PATH}/snack-${snackId}.png`;
  }
  
  // 启动后台检测
  checkTransparentPngExists(snackId);
  
  return fallbackImage;
}

/**
 * 批量预检测透明PNG
 */
export async function prefetchTransparentStatus(snackIds: string[]): Promise<void> {
  const promises = snackIds.map(id => checkTransparentPngExists(id));
  await Promise.all(promises);
}

/**
 * 获取AI抠图工具链接（带预填参数）
 */
export function getAIRemovalTools(_snackName?: string): {
  name: string;
  url: string;
  description: string;
}[] {
  return [
    {
      name: 'Remove.bg',
      url: 'https://www.remove.bg/',
      description: '最专业的AI抠图工具，效果最佳',
    },
    {
      name: 'ClipDrop',
      url: 'https://clipdrop.co/remove-background',
      description: 'Stability AI出品，免费额度更多',
    },
    {
      name: 'Adobe Express',
      url: 'https://www.adobe.com/express/feature/image/remove-background',
      description: 'Adobe出品，完全免费',
    },
    {
      name: 'Photoroom',
      url: 'https://www.photoroom.com/tools/background-remover',
      description: '效果优秀，支持批量处理',
    },
    {
      name: 'RemoveBG.cn',
      url: 'https://www.removebg.cn/',
      description: '国内访问更快的替代方案',
    },
  ];
}

/**
 * 获取透明PNG素材网站
 */
export function getPngResourceSites(snackName?: string): {
  name: string;
  url: string;
  searchUrl?: string;
}[] {
  const searchTerm = snackName ? encodeURIComponent(snackName + ' transparent') : '';
  
  return [
    {
      name: 'CleanPNG',
      url: 'https://cleanpng.com/',
      searchUrl: `https://cleanpng.com/free/${searchTerm}.html`,
    },
    {
      name: 'PNGTree',
      url: 'https://pngtree.com/',
      searchUrl: `https://pngtree.com/so/${searchTerm}`,
    },
    {
      name: 'StickPNG',
      url: 'https://www.stickpng.com/',
      searchUrl: `https://www.stickpng.com/search.html?q=${searchTerm}`,
    },
    {
      name: 'PurePNG',
      url: 'https://purepng.com/',
      searchUrl: `https://purepng.com/search?q=${searchTerm}`,
    },
    {
      name: 'PNGWing',
      url: 'https://www.pngwing.com/',
      searchUrl: `https://www.pngwing.com/en/search?q=${searchTerm}`,
    },
    {
      name: 'Vippng',
      url: 'https://www.vippng.com/',
      searchUrl: `https://www.vippng.com/tag/${searchTerm}/`,
    },
  ];
}

/**
 * 生成批量处理脚本（Python）
 */
export function generateBatchScript(snackList: { id: string; name: string }[]): string {
  return `# 零食透明PNG批量处理脚本
# 需要安装: pip install rembg Pillow requests

import os
from rembg import remove
from PIL import Image

# 零食列表
snacks = ${JSON.stringify(snackList.slice(0, 20), null, 2)}

# 输入/输出目录
INPUT_DIR = "./raw_images"
OUTPUT_DIR = "./public/snacks-transparent"

os.makedirs(OUTPUT_DIR, exist_ok=True)

for snack in snacks:
    input_path = os.path.join(INPUT_DIR, f"snack-{snack['id']}.jpg")
    output_path = os.path.join(OUTPUT_DIR, f"snack-{snack['id']}.png")
    
    if not os.path.exists(input_path):
        print(f"跳过: {snack['name']} (未找到原图)")
        continue
    
    if os.path.exists(output_path):
        print(f"跳过: {snack['name']} (已处理)")
        continue
    
    try:
        # 打开图片
        with Image.open(input_path) as img:
            # 移除背景
            output = remove(img)
            # 保存为PNG
            output.save(output_path, "PNG")
            print(f"✓ 已处理: {snack['name']}")
    except Exception as e:
        print(f"✗ 失败: {snack['name']} - {e}")

print("\\n批量处理完成!")
`;
}

/**
 * 生成图片上传表单数据
 */
export function createImageUploadForm(
  snackId: string,
  file: File
): FormData {
  const formData = new FormData();
  formData.append('snackId', snackId);
  formData.append('file', file);
  formData.append('filename', `snack-${snackId}.png`);
  return formData;
}

/**
 * 验证透明PNG文件
 */
export function validateTransparentPng(file: File): {
  valid: boolean;
  error?: string;
} {
  // 检查文件类型
  if (file.type !== 'image/png') {
    return { valid: false, error: '必须是PNG格式' };
  }
  
  // 检查文件大小（最大5MB）
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: '文件大小不能超过5MB' };
  }
  
  return { valid: true };
}

/**
 * 读取文件为Data URL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 清空图片缓存
 */
export function clearImageCache(): void {
  imageStatusCache.clear();
}

// 开发模式：模拟透明PNG存在（用于测试）
export function mockTransparentPng(snackIds: string[]): void {
  snackIds.forEach(id => imageStatusCache.set(id, true));
}
