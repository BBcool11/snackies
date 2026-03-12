# 云端 OCR 配置指南

## 推荐：百度智能云 OCR（免费额度充足）

### 1. 注册账号
访问 [百度智能云](https://cloud.baidu.com/) 注册账号

### 2. 开通 OCR 服务
1. 进入 [文字识别控制台](https://console.bce.baidu.com/ai/?_=166313 gravitation#!/ai/ocr/overview/index)
2. 点击「创建应用」
3. 应用名称：snackies-ocr
4. 接口选择：勾选「通用文字识别（标准版）」
5. 点击「立即创建」

### 3. 获取 API 密钥
创建完成后，在应用列表中查看：
- AppID
- API Key
- Secret Key

### 4. 配置脚本
将 `ocr-config.example.json` 复制为 `ocr-config.json`：

```bash
cd scripts
cp ocr-config.example.json ocr-config.json
```

编辑 `ocr-config.json`，填入你的密钥：

```json
{
  "provider": "baidu",
  "baidu": {
    "appId": "YOUR_APP_ID",
    "apiKey": "YOUR_API_KEY",
    "secretKey": "YOUR_SECRET_KEY"
  }
}
```

### 5. 运行匹配

```bash
# 测试前 30 张图片
node scripts/matchImages-cloud-ocr.mjs

# 匹配全部图片
node scripts/matchImages-cloud-ocr.mjs --all
```

### 免费额度
- 通用文字识别（标准版）：50,000 次/天免费
- 足够处理所有零食图片

---

## 备选：腾讯云 OCR

### 开通流程
1. 访问 [腾讯云控制台](https://console.cloud.tencent.com/ocr)
2. 开通「通用印刷体识别」服务
3. 创建密钥获取 SecretId 和 SecretKey

### 配置
```json
{
  "provider": "tencent",
  "tencent": {
    "secretId": "YOUR_SECRET_ID",
    "secretKey": "YOUR_SECRET_KEY"
  }
}
```

---

## 结果说明

匹配完成后会生成 `imageMapping-cloud.json`：

```json
{
  "mapping": {
    "002": "001",  // 图片002.png 对应 数据ID 001（卫龙大面筋）
    "010": "032"   // 图片010.png 对应 数据ID 032（乐事黄瓜薯片）
  },
  "unmatched": [...],
  "stats": {
    "total": 328,
    "matched": 280,
    "unmatched": 48
  }
}
```

未匹配的图片可以人工核对后手动添加到映射中。
