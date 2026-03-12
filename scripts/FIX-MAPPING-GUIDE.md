# 图片映射修正指南

## 问题
百度 OCR API 今日限额已用完，无法继续自动匹配。

## 解决方案

### 方案 1: 使用可视化修正工具（推荐）

1. **打开工具**
   ```bash
   open scripts/fix-mapping.html
   ```
   或用浏览器直接打开 `scripts/fix-mapping.html`

2. **使用方法**
   - 每张图片下方有一个下拉菜单
   - 选择正确的零食名称
   - 已映射的会显示绿色边框
   - 点击"批量智能映射"自动填充常见零食
   - 完成后点击"导出 JSON"

3. **导入项目**
   - 将导出的 `imageMapping-manual.json` 复制到 `src/utils/`
   - 在 `snackImageMap.ts` 中添加导入

### 方案 2: 直接编辑 JSON

编辑 `src/utils/imageMapping.json`：

```json
{
  "mapping": {
    "001": "091",
    "002": "001",
    "003": "039"
  }
}
```

含义：`"001": "091"` 表示图片 `snack-001.png` 对应数据 ID `091`（洽洽瓜子）

### 方案 3: 等待明天继续 OCR

明天 API 限额重置后，运行：
```bash
node scripts/match-batch.mjs
```

## 已知映射参考

根据之前的 OCR 结果，这些映射是准确的：

| 图片 | 零食 | 数据ID |
|-----|------|--------|
| snack-002.png | 卫龙大面筋 | 001 |
| snack-003.png | 旺旺雪饼 | 039 |
| snack-005.png | 德芙巧克力 | 054 |
| snack-006.png | 浪味仙 | 037 |
| snack-008.png | 上好佳洋葱圈 | 036 |
| snack-010.png | 乐事黄瓜味薯片 | 032 |
| snack-015.png | 咪咪虾条 | 040 |
| snack-019.png | 法式小面包 | 082 |
| snack-024.png | 大白兔奶糖 | 051 |
| snack-028.png | 喜之郎果冻 | 066 |
| snack-037.png | 旺旺仙贝 | 038 |
| snack-039.png | 德芙巧克力 | 054 |
| snack-040.png | 士力架 | 055 |
| snack-046.png | 卫龙大面筋 | 001 |
| snack-047.png | 卫龙小面筋 | 002 |
| snack-050.png | 麻辣王子 | 004 |

## 快速修复

运行以下命令应用已知正确映射：

```bash
node scripts/apply-known-mappings.mjs
```

## 数据结构

映射文件格式：
```json
{
  "mapping": {
    "图片编号": "数据ID",
    "002": "001"
  },
  "specialImages": {
    "特殊图片名": "数据ID"
  }
}
```

优先级（从高到低）：
1. `imageMapping.json` - 手动修正
2. `imageMapping-cloud.json` - OCR 自动匹配
3. `imageMapping-generated.json` - 基础 1:1 映射
