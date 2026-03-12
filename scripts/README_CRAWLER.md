# 零食图片爬虫使用指南

## 📦 项目结构

```
scripts/
├── snack_image_crawler.py    # 主爬虫脚本
├── snacks_input.json         # 示例输入文件
└── README_CRAWLER.md         # 本说明文档
```

## 🚀 快速开始

### 1. 安装依赖

```bash
pip install requests beautifulsoup4 pillow
```

### 2. 运行测试（推荐先测试）

```bash
cd "/Users/zoe/Downloads/app 2/scripts"
python3 snack_image_crawler.py --test --verbose
```

### 3. 批量爬取

```bash
python3 snack_image_crawler.py -f snacks_input.json -v
```

## 📋 命令行参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `--test` | 测试模式（只处理前3个） | `--test` |
| `--verbose`, `-v` | 详细输出模式 | `-v` |
| `--interactive`, `-i` | 交互确认模式 | `-i` |
| `--input`, `-f` | 输入JSON文件 | `-f snacks.json` |
| `--output`, `-o` | 输出目录 | `-o ./my_images` |

## 📝 输入文件格式

创建 `snacks_input.json`：

```json
[
  {"name": "卫龙辣条", "category": "辣条"},
  {"name": "大白兔奶糖", "category": "糖果"},
  {"name": "乐事薯片", "category": "膨化食品"}
]
```

字段说明：
- `name`: 零食名称（必填）
- `category`: 分类（用于创建目录，可选）

## 📁 输出结构

```
output/
├── 辣条/
│   └── 卫龙辣条/
│       ├── 卫龙辣条_01.jpg
│       ├── 卫龙辣条_02.jpg
│       └── ...
├── 糖果/
│   └── 大白兔奶糖/
│       └── ...
└── ...

logs/
├── crawl_2024-03-10_12-30-45.log   # 详细日志
├── error_2024-03-10_12-30-45.log   # 错误日志
├── sources_20240310_123045.json     # 图片来源记录
└── result_20240310_123045.json      # 爬取结果
```

## 🔍 核心功能

### 1. 智能关键词构建

- 原始名称 + "零食 实拍"
- 清洗后名称（去除"牌"、"公司"等）
- 多关键词组合搜索

### 2. 图片验证规则

- ✅ 尺寸 ≥ 500x500 像素
- ✅ 文件大小 1KB - 5MB
- ✅ 格式：JPG、PNG、GIF、WebP
- ✅ 关键词匹配（URL或标题包含零食名）
- ❌ 跳过 logo、banner、icon 等

### 3. 反爬措施

- 随机 User-Agent
- 请求间隔 1-3 秒
- 自动重试 3 次
- 10秒超时设置

## 🛠️ 高级配置

修改脚本中的 `CrawlerConfig`：

```python
config = CrawlerConfig(
    MIN_WIDTH=800,           # 最小宽度
    MIN_HEIGHT=800,          # 最小高度
    MAX_FILE_SIZE=10*1024*1024,  # 最大10MB
    REQUEST_DELAY=(2, 5),    # 间隔2-5秒
    MAX_DOWNLOADS=10,        # 每个零食下载10张
    VERBOSE=True,            # 详细输出
)
```

## 🐛 常见问题

### Q1: 搜索不到图片？

**可能原因**：
- 网络连接问题
- 百度图片反爬

**解决方法**：
```bash
# 增加延迟
# 修改脚本中的 REQUEST_DELAY = (3, 6)

# 使用代理（需自行准备代理池）
```

### Q2: 图片质量不高？

**可能原因**：
- 关键词不够精确
- 验证条件太宽松

**解决方法**：
```python
# 提高质量要求
config.MIN_WIDTH = 1000
config.MIN_HEIGHT = 1000
```

### Q3: 如何添加其他图片来源？

在 `search_baidu_images` 方法后添加新方法：

```python
def search_jd_images(self, query: str) -> List[Dict]:
    """京东图片搜索"""
    # 实现京东搜索逻辑
    pass
```

然后在 `process_snack` 中调用。

## 📝 日志说明

### 详细日志 (crawl_*.log)

```
2024-03-10 12:30:45 - INFO - [百度图片] 搜索: 卫龙辣条 零食 实拍
2024-03-10 12:30:46 - INFO - [百度图片] 找到 15 张候选
2024-03-10 12:30:47 - INFO - 下载成功: 卫龙辣条_01.jpg (800x600)
```

### 错误日志 (error_*.log)

```
2024-03-10 12:30:50 - ERROR - [百度图片] HTTP 403
2024-03-10 12:31:00 - ERROR - 下载失败: 超时
```

## 🎯 使用建议

1. **先测试**: 使用 `--test` 模式验证配置
2. **小批量**: 首次运行建议少于20个零食
3. **检查日志**: 定期查看 error 日志
4. **图片来源**: 保留 sources.json 用于版权核查

## ⚠️ 免责声明

本脚本仅供学习研究使用。下载的图片可能受版权保护，请：
- 遵守目标网站的 robots.txt
- 不要将图片用于商业用途
- 如需商用，请获得版权方授权

## 📞 技术支持

如遇问题：
1. 查看 `logs/error_*.log`
2. 使用 `--verbose` 查看详细输出
3. 检查网络连接和依赖安装
