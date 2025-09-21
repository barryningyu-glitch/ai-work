# 🚀 Render.com 部署指南

## 📋 部署步骤

### 1. 访问 Render.com
🌐 **网址**: https://render.com
🔐 **登录**: 使用 GitHub 账号

### 2. 创建 Web Service
1. 点击 **"New +"**
2. 选择 **"Web Service"**
3. 连接你的 GitHub 仓库 `ai-work`

### 3. 配置服务
- **Name**: `cortex-ai-workspace-api`
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 4. 添加环境变量
在 Environment 标签页添加：
```bash
ENVIRONMENT=production
SECRET_KEY=cortex-ai-workspace-jwt-secret-2024
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=你的OpenAI密钥
```

### 5. 创建数据库
1. 点击 **"New +"**
2. 选择 **"PostgreSQL"**
3. 名称: `cortex-ai-db`
4. 复制数据库连接字符串

### 6. 连接数据库
在 Web Service 的环境变量中添加：
```bash
DATABASE_URL=你的数据库连接字符串
```

### 7. 部署
点击 **"Create Web Service"** 开始部署

## ✅ 部署完成后
- 获取 API 域名（如：https://your-app.onrender.com）
- 测试 API 端点
- 更新前端配置

## 🔧 故障排除
- 查看部署日志
- 检查环境变量
- 验证数据库连接

## 💡 重要提示
- 免费版有使用限制
- 数据库连接字符串格式：postgresql://user:password@host:port/database
- OpenAI API 密钥必须有效