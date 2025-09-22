#!/bin/bash

# Railway 部署脚本
echo "🚀 开始 Railway 部署流程..."

# 检查必要文件
echo "📋 检查部署文件..."
if [ ! -f "railway.json" ]; then
    echo "❌ railway.json 文件不存在"
    exit 1
fi

if [ ! -f "Procfile" ]; then
    echo "❌ Procfile 文件不存在"
    exit 1
fi

if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt 文件不存在"
    exit 1
fi

echo "✅ 所有部署文件已准备就绪"

# 显示部署信息
echo ""
echo "📦 项目信息:"
echo "   - 框架: FastAPI"
echo "   - Python版本: $(python3 --version)"
echo "   - 依赖包数量: $(wc -l < requirements.txt)"

echo ""
echo "🔧 部署配置:"
echo "   - 启动命令: uvicorn main:app --host 0.0.0.0 --port \$PORT"
echo "   - 健康检查: /health"
echo "   - 环境: 生产环境"

echo ""
echo "📋 接下来的步骤:"
echo "1. 访问 https://railway.app"
echo "2. 使用 GitHub 登录"
echo "3. 创建新项目并选择 ai-work 仓库"
echo "4. 配置环境变量"
echo "5. 添加 PostgreSQL 数据库"
echo "6. 等待部署完成"

echo ""
echo "🎯 部署完成后，请将 API 域名告诉我，我会立即更新前端配置！"