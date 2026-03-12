# OCR 图片映射报告

## 匹配统计

- **成功匹配**: 116 张图片
- **未匹配**: 188 张图片
- **总数**: 304 张已处理（328张编号图片 + 18张特殊命名图片）

## 关键零食映射情况

| 零食名称 | 匹配图片数 | 示例图片 |
|---------|-----------|---------|
| 卫龙大面筋 | 11 | snack-2.png, snack-19.png, snack-20.png |
| 德芙巧克力 | 16 | snack-25.png, snack-30.png, snack-241.png |
| 乐事薯片 | 12 | snack-216.png, snack-217.png, snack-218.png |
| 大白兔奶糖 | 5 | snack-3.png, snack-18.png, snack-24.png |
| 娃哈哈 | 5 | snack-5.png, snack-23.png, snack-365.png |
| 咪咪虾条 | 3 | snack-11.png, snack-26.png, snack-015.png |
| 旺旺雪饼 | 2 | snack-242.png, snack-003.png |
| 浪味仙 | 2 | snack-13.png, snack-006.png |
| 旺旺仙贝 | 2 | snack-225.png, snack-079.png |

## 映射文件

- `src/utils/imageMapping-cloud.json` - OCR自动匹配结果
- `src/utils/imageMapping-generated.json` - 基础1:1映射
- `src/utils/imageMapping.json` - 手动修正（优先级最高）

## 如何手动修正

编辑 `src/utils/imageMapping.json`：

```json
{
  "mapping": {
    "001": "091"
  },
  "specialImages": {}
}
```

含义：图片 snack-001.png 显示在数据 ID 091（洽洽香瓜子）上。

## 未匹配图片处理

未匹配的 188 张图片将显示默认的编号图片（如数据 ID 001 显示 snack-001.png）。

建议：
1. 浏览应用查看未匹配图片
2. 手动编辑 `imageMapping.json` 修正关键零食
3. 重新构建部署
