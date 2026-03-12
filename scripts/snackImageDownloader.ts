/**
 * 零食透明PNG图片批量下载器
 * 结合方案A：AI抠图 + 方案B：现有透明素材网站
 */

import * as fs from 'fs';
import * as path from 'path';

// 零食图片源配置
interface ImageSource {
  keyword: string;
  // 多个备选源
  sources: {
    type: 'cleanpng' | 'pngtree' | 'google' | 'local';
    url?: string;
    searchQuery?: string;
  }[];
}

// 热门零食的预设图片源
export const PRESET_IMAGE_SOURCES: Record<string, ImageSource> = {
  '旺旺雪饼': {
    keyword: 'want want rice crackers',
    sources: [
      { type: 'cleanpng', searchQuery: 'want want senbei' },
      { type: 'google', searchQuery: '旺旺雪饼 透明背景' },
    ]
  },
  '旺旺仙贝': {
    keyword: 'want want xianbei',
    sources: [
      { type: 'cleanpng', searchQuery: 'want want crackers' },
    ]
  },
  '卫龙大面筋': {
    keyword: 'weilong latiao',
    sources: [
      { type: 'cleanpng', searchQuery: 'spicy strip latiao' },
    ]
  },
  '大白兔奶糖': {
    keyword: 'white rabbit candy',
    sources: [
      { type: 'cleanpng', searchQuery: 'white rabbit candy' },
    ]
  },
  '奥利奥': {
    keyword: 'oreo cookies',
    sources: [
      { type: 'cleanpng', searchQuery: 'oreo cookie' },
    ]
  },
  '乐事薯片': {
    keyword: 'lays potato chips',
    sources: [
      { type: 'cleanpng', searchQuery: 'lays chips' },
    ]
  },
  '康师傅方便面': {
    keyword: 'master kong instant noodles',
    sources: [
      { type: 'cleanpng', searchQuery: 'instant noodles' },
    ]
  },
  '小浣熊干脆面': {
    keyword: 'little raccoon noodles',
    sources: [
      { type: 'cleanpng', searchQuery: 'crispy noodles' },
    ]
  },
  'AD钙奶': {
    keyword: 'wahaha ad钙奶',
    sources: [
      { type: 'cleanpng', searchQuery: 'milk drink bottle' },
    ]
  },
  '旺仔牛奶': {
    keyword: 'want want milk',
    sources: [
      { type: 'cleanpng', searchQuery: 'want want milk' },
    ]
  },
  'QQ糖': {
    keyword: 'qq gummy candy',
    sources: [
      { type: 'cleanpng', searchQuery: 'gummy candy' },
    ]
  },
  '彩虹糖': {
    keyword: 'skittles candy',
    sources: [
      { type: 'cleanpng', searchQuery: 'skittles' },
    ]
  },
  '妙脆角': {
    keyword: 'bugles chips',
    sources: [
      { type: 'cleanpng', searchQuery: 'bugles snack' },
    ]
  },
  '跳跳糖': {
    keyword: 'popping candy',
    sources: [
      { type: 'cleanpng', searchQuery: 'popping candy' },
    ]
  },
  '麦丽素': {
    keyword: 'maltesers',
    sources: [
      { type: 'cleanpng', searchQuery: 'maltesers' },
    ]
  },
  '果冻': {
    keyword: 'jelly cup',
    sources: [
      { type: 'cleanpng', searchQuery: 'jelly cup' },
    ]
  },
  '火腿肠': {
    keyword: 'ham sausage',
    sources: [
      { type: 'cleanpng', searchQuery: 'sausage snack' },
    ]
  },
  '薯片': {
    keyword: 'potato chips',
    sources: [
      { type: 'cleanpng', searchQuery: 'potato chips bag' },
    ]
  },
};

// 本地图片存储路径
const LOCAL_IMAGE_DIR = './public/snacks-transparent';

/**
 * 使用 Remove.bg API 进行AI抠图
 * 需要 API Key: https://www.remove.bg/api
 */
export async function removeBackgroundWithAI(
  imagePath: string,
  apiKey: string
): Promise<Buffer | null> {
  try {
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    
    // 读取图片文件
    const imageBuffer = fs.readFileSync(imagePath);
    formData.append('image_file', imageBuffer, {
      filename: path.basename(imagePath),
      contentType: 'image/jpeg',
    });
    formData.append('size', 'auto');
    formData.append('format', 'png');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        ...formData.getHeaders(),
      },
      body: formData as unknown as BodyInit,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Remove.bg API error:', error);
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('AI抠图失败:', error);
    return null;
  }
}

/**
 * 使用 ClipDrop API (Stability AI) 进行AI抠图
 * 免费额度更多
 */
export async function removeBackgroundWithClipDrop(
  imagePath: string,
  apiKey: string
): Promise<Buffer | null> {
  try {
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    
    const imageBuffer = fs.readFileSync(imagePath);
    formData.append('image_file', imageBuffer, {
      filename: path.basename(imagePath),
    });

    const response = await fetch('https://clipdrop-api.co/remove-background/v1', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        ...formData.getHeaders(),
      },
      body: formData as unknown as BodyInit,
    });

    if (!response.ok) {
      console.error('ClipDrop API error:', await response.text());
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('ClipDrop抠图失败:', error);
    return null;
  }
}

/**
 * 生成透明PNG的HTML Canvas方案（前端使用）
 * 使用 rembg.js 或类似库
 */
export function generateTransparentPngInstructions(): string {
  return `
# 透明PNG图片制作指南

## 方案A：使用在线AI抠图工具（推荐）

### 1. Remove.bg
- 网址: https://www.remove.bg/
- 免费额度: 1张高清/无限张预览
- API Key: 需要注册获取

### 2. ClipDrop (Stability AI)
- 网址: https://clipdrop.co/remove-background
- 免费额度: 100张/天
- API Key: 需要注册获取

### 3. Adobe Express
- 网址: https://www.adobe.com/express/feature/image/remove-background
- 免费使用

### 4. Photoroom
- 网址: https://www.photoroom.com/tools/background-remover
- 免费使用

## 方案B：透明PNG素材网站

### 1. CleanPNG
- 网址: https://cleanpng.com/
- 搜索关键词: "snack name + transparent"

### 2. PNGTree
- 网址: https://pngtree.com/
- 需要注册，部分免费

### 3. StickPNG
- 网址: https://www.stickpng.com/
- 完全免费

### 4. PurePNG
- 网址: https://purepng.com/
- 开源透明PNG

## 批量处理方案

使用 Python + rembg 库进行本地批量抠图:

\`\`\`bash
pip install rembg
rembg i input.jpg output.png
\`\`\`

或使用 Docker:
\`\`\`bash
docker run -v $(pwd):/images danielgatis/rembg i /images/input.jpg /images/output.png
\`\`\`

## 文件命名规范

将处理好的透明PNG放入 "/public/snacks-transparent/" 目录
命名格式: "snack-{id}.png"

例如:
- snack-001.png (旺旺雪饼)
- snack-046.png (卫龙大面筋)
`;
}

/**
 * 检查本地是否已有透明PNG
 */
export function checkTransparentPngExists(snackId: string): boolean {
  const pngPath = path.join(LOCAL_IMAGE_DIR, `snack-${snackId}.png`);
  return fs.existsSync(pngPath);
}

/**
 * 获取零食图片路径（优先透明PNG，其次回退到原图）
 */
export function getSnackImagePath(snackId: string, fallbackImage: string): string {
  const transparentPath = `/snacks-transparent/snack-${snackId}.png`;
  const fullPath = path.join(process.cwd(), 'public', 'snacks-transparent', `snack-${snackId}.png`);
  
  if (fs.existsSync(fullPath)) {
    return transparentPath;
  }
  return fallbackImage;
}

// 创建目录
if (!fs.existsSync(LOCAL_IMAGE_DIR)) {
  fs.mkdirSync(LOCAL_IMAGE_DIR, { recursive: true });
}

console.log(generateTransparentPngInstructions());
