# 零食图片爬虫方案汇总

## 当前状态

- **怀旧零食**: 270张真实图片（已抓取）
- **热门零食**: 95个（原占位图，现已分配现有图片作为临时方案）

## 图文不匹配问题

当前热门零食使用的是怀旧零食的图片，导致：
- ❌ 冻干草莓脆 显示 小浣熊干脆面图片
- ❌ 魔芋爽 显示 卫龙辣条图片
- ❌ 生巧克力 显示 大白兔奶糖图片

## 解决方案对比

### 方案1：Bing Image Search API（推荐 ⭐）

**文件**: `crawl_with_bing_api.py`

**优点**:
- ✅ 合法合规，通过官方API获取
- ✅ 搜索结果与查询词相关度高
- ✅ 有标题、描述等元数据可用于图文匹配验证
- ✅ 稳定可靠，不易被封

**缺点**:
- ⚠️ 需要申请API Key
- ⚠️ 免费额度1000次/月（超出需付费）

**使用方法**:
```bash
# 1. 申请API Key
# 访问 https://www.microsoft.com/en-us/bing/apis/bing-image-search-api

# 2. 设置环境变量
export BING_API_KEY="your_api_key_here"

# 3. 运行爬虫
cd /Users/zoe/Downloads/app 2
python3 scripts/crawl_with_bing_api.py
```

---

### 方案2：Selenium + 图文匹配验证

**文件**: `crawl_with_matching.py`

**功能**（按用户提供的步骤实现）:
1. **步骤1**: 诊断图文不匹配根源（URL错误、内容错位、加载失败）
2. **步骤2**: 
   - 场景1: 通过父节点特征筛选目标图片（京东: `.gl-i-wrap .p-img img`）
   - 场景2: 利用alt属性验证图文匹配
   - 场景3: 滚动加载处理动态内容
3. **步骤3**: OCR验证图片内容（使用pytesseract）
4. **步骤4**: 批量处理与错误重试

**使用方法**:
```bash
# 安装依赖
pip3 install selenium webdriver-manager beautifulsoup4 pillow pytesseract

# 运行爬虫
python3 scripts/crawl_with_matching.py
```

**注意**: 京东有反爬机制，此方案可能被拦截

---

### 方案3：手动下载（最精准）

**适用场景**: 对图片质量要求高，数量不多

**操作步骤**:
1. 在京东/天猫搜索每个零食
2. 右键保存主图到对应编号
3. 图片保存到 `public/snack-images-hot-real/HOT_2026_XXX.jpg`

**批量下载脚本**:
```bash
# 创建目录
mkdir -p public/snack-images-hot-real

# 手动下载示例
curl -o public/snack-images-hot-real/HOT_2026_001.jpg \
  "https://img10.360buyimg.com/n1/xxx.jpg" \
  -H "User-Agent: Mozilla/5.0 ..." \
  -H "Referer: https://search.jd.com/"
```

---

### 方案4：临时方案（当前使用）

**文件**: `download_placeholder_images.py`

**说明**: 复制现有怀旧零食图片到热门零食

**状态**: ✅ 已执行，页面可正常显示，但图文不匹配

---

## 图文匹配验证方法

### 方法1: alt属性匹配
```python
def verify_alt_match(snack_name: str, img_alt: str) -> bool:
    """检查图片alt是否包含零食名称"""
    return snack_name.lower() in img_alt.lower()
```

### 方法2: OCR内容识别
```python
import pytesseract
from PIL import Image

def ocr_verify(image_path: str, snack_name: str) -> bool:
    """OCR识别图片文字，验证是否匹配"""
    img = Image.open(image_path)
    text = pytesseract.image_to_string(img, lang='chi_sim+eng')
    return snack_name[:4] in text
```

### 方法3: 哈希值对比（防重复）
```python
import hashlib

def get_image_hash(image_path: str) -> str:
    """计算图片MD5哈希"""
    with open(image_path, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()
```

---

## 推荐执行顺序

1. **首选**: 申请 Bing API Key，运行 `crawl_with_bing_api.py`
2. **备选**: 手动下载关键零食图片（首页展示的热门款）
3. **兜底**: 保持现有临时方案，页面可正常访问

---

## 文件说明

| 文件 | 用途 | 状态 |
|------|------|------|
| `crawl_jd_images.py` | Selenium爬虫基础版 | ⏸️ 未完善 |
| `crawl_with_matching.py` | 图文匹配验证爬虫 | ✅ 完整实现 |
| `crawl_with_bing_api.py` | Bing API爬虫 | ✅ 推荐方案 |
| `download_placeholder_images.py` | 本地复制图片 | ✅ 已执行 |
| `fetch_ecommerce_images.py` | 零食数据生成 | ✅ 已使用 |

---

## 注意事项

1. **遵守robots.txt**: 爬虫频率不要过高，建议每次请求间隔1-3秒
2. **防盗链处理**: 下载图片时添加Referer头
3. **图片版权**: 商业使用请确保有图片授权
4. **API限制**: Bing API免费额度1000次/月，合理规划使用
