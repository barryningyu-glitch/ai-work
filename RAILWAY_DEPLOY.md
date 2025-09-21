# 🚀 Railway 后端部署指南

## 📋 部署步骤

### 1. 准备工作
- [x] 已创建 `railway.json` 配置文件
- [x] 已创建 `Procfile` 启动文件
- [x] 已更新 `main.py` 支持生产环境
- [x] 已配置 CORS 允许 Vercel 域名

### 2. Railway 账号设置

1. **注册 Railway 账号**
   - 访问 https://railway.app
   - 使用 GitHub 账号登录

2. **连接 GitHub 仓库**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的项目仓库

### 3. 环境变量配置

在 Railway 项目设置中添加以下环境变量：

```bash
# 必需的环境变量
ENVIRONMENT=production
OPENAI_API_KEY=your_openai_api_key_here
SECRET_KEY=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 4. 数据库配置

Railway 会自动提供 PostgreSQL 数据库：

1. **添加 PostgreSQL 服务**
   - 在项目中点击 "Add Service"
   - 选择 "PostgreSQL"
   - Railway 会自动设置 `DATABASE_URL`

2. **数据库连接**
   - `DATABASE_URL` 会自动注入到环境变量
   - 格式：`postgresql://user:password@host:port/database`

### 5. 部署流程

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Add Railway deployment configuration"
   git push origin main
   ```

2. **Railway 自动部署**
   - Railway 检测到代码变更后自动部署
   - 查看部署日志确认成功

3. **获取 API 域名**
   - 部署成功后，Railway 会提供一个域名
   - 格式：`https://your-app-name.up.railway.app`

### 6. 验证部署

访问以下端点验证部署：

- **健康检查**: `https://your-app-name.up.railway.app/health`
- **API 根路径**: `https://your-app-name.up.railway.app/api/`
- **API 文档**: `https://your-app-name.up.railway.app/docs`

## 🔧 故障排除

### 常见问题

1. **部署失败**
   - 检查 Railway 部署日志
   - 确认 `requirements.txt` 包含所有依赖
   - 验证 Python 版本兼容性

2. **数据库连接错误**
   - 确认 PostgreSQL 服务已添加
   - 检查 `DATABASE_URL` 环境变量
   - 验证数据库表是否正确创建

3. **CORS 错误**
   - 确认 Vercel 域名已添加到 CORS 配置
   - 检查环境变量 `ENVIRONMENT=production`

### 调试命令

```bash
# 查看环境变量
echo $DATABASE_URL

# 测试数据库连接
python -c "from database import engine; print(engine.url)"

# 检查应用启动
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 📝 下一步

部署成功后：

1. **更新前端 API 配置**
   - 修改 `utils/api.js` 中的 `API_BASE_URL`
   - 指向 Railway 提供的域名

2. **测试完整功能**
   - 用户注册/登录
   - 笔记管理
   - 任务管理
   - AI 对话功能

3. **监控和维护**
   - 查看 Railway 仪表板监控应用状态
   - 设置日志记录和错误追踪