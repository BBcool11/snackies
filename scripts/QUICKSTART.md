# 🚀 零食图片爬虫 - 快速启动指南

## 1️⃣ 安装依赖（一次性）

```bash
pip3 install requests beautifulsoup4 pillow
```

## 2️⃣ 测试运行（推荐）

```bash
cd "/Users/zoe/Downloads/app 2/scripts"
python3 snack_image_crawler.py --test --verbose
```

这会处理3个测试零食，验证一切正常。

## 3️⃣ 准备你的零食列表

编辑 `snacks_input.json`：

```json
[
  {"name": "你的零食1", "category": "分类1"},
  {"name": "你的零食2", "category": "分类2"}
]
```

## 4️⃣ 批量爬取

```bash
python3 snack_image_crawler.py -f snacks_input.json -v
```

## 📊 预期输出

```
======================================================================
🚀 零食图片爬虫启动
======================================================================

配置信息:
  - 输出目录: ./output
  - 日志目录: ./logs
  - 最小尺寸: 500x500
  - 请求间隔: 1.0-3.0秒
  - 详细模式: 开启

======================================================================
📦 进度: [1/3]
======================================================================
🍿 正在处理: 卫龙辣条
======================================================================

📋 搜索关键词:
  1. 卫龙辣条 零食 实拍
  2. 卫龙辣条 零食 实拍图

🔍 搜索: 卫龙辣条 零食 实拍
  🔍 搜索URL: https://image.baidu.com/search/index?tn=baiduimage...
  ✓ 响应成功: 200
  ✓ 解析到图片: 15张
  ✓ 去重后剩余: 8张

📊 找到候选图片: 8张

  [1/5] 下载: http://example.com/image1.jpg...
    ✅ 成功 (800x600, 45032 bytes)
  [2/5] 下载: http://example.com/image2.jpg...
    ✅ 成功 (1024x768, 67231 bytes)
...

📥 下载完成: 5张
💾 保存路径: output/辣条/卫龙辣条

======================================================================
📊 爬取统计
======================================================================
  总零食数: 3
  成功: 3
  失败: 0
  下载图片: 15张
  成功率: 100.0%

  来源记录: logs/sources_20240310_123045.json
======================================================================
```

## 📁 输出文件

```
output/                    # 下载的图片
├── 辣条/
│   └── 卫龙辣条/
│       ├── 卫龙辣条_01.jpg
│       └── 卫龙辣条_02.jpg
└── ...

logs/                      # 日志和记录
├── crawl_*.log           # 详细日志
├── error_*.log           # 错误日志
├── sources_*.json        # 图片来源
└── result_*.json         # 结果汇总
```

## 💡 高级用法

### 交互模式（人工确认）
```bash
python3 snack_image_crawler.py -f snacks.json -i -v
```

### 自定义输出目录
```bash
python3 snack_image_crawler.py -f snacks.json -o ./my_snack_images
```

### 修改配置（编辑脚本）

```python
config = CrawlerConfig(
    MIN_WIDTH=1000,              # 最小宽度1000px
    MIN_HEIGHT=1000,             # 最小高度1000px
    REQUEST_DELAY=(2, 4),        # 间隔2-4秒
    MAX_DOWNLOADS=10,            # 下载10张/零食
    VERBOSE=True
)
```

## ⚠️ 注意事项

1. **网络要求**: 需要能访问百度图片
2. **时间预估**: 100个零食约需 30-60 分钟
3. **反爬限制**: 如遇403错误，增加 REQUEST_DELAY
4. **图片质量**: 默认筛选 ≥500x500 的图片

## 🆘 故障排查

### 导入错误
```bash
pip3 install --upgrade requests beautifulsoup4 pillow
```

### 下载失败
- 检查网络连接
- 查看 `logs/error_*.log`
- 增加延迟: `REQUEST_DELAY=(3, 6)`

### 图片质量差
- 提高尺寸要求: `MIN_WIDTH=1000`
- 检查关键词是否准确

## 📚 详细文档

- 完整说明: `README_CRAWLER.md`
- 示例输入: `snacks_input.json`
- 主脚本: `snack_image_crawler.py`

---

**准备好开始了吗？运行测试命令试试看！** 🎉
