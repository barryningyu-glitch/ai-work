#!/bin/bash

echo "🚀 Render.com 部署准备检查"
echo "================================"

# 检查必要文件
echo "📋 检查部署文件..."
files=("requirements.txt" "main.py" "render.yaml" "Procfile")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - 存在"
    else
        echo "❌ $file - 缺失"
    fi
done

echo ""
echo "📊 项目信息:"
echo "- 框架: FastAPI"
echo "- Python版本: $(python3 --version 2>/dev/null || echo '需要安装Python')"
echo "- 依赖包数量: $(wc -l < requirements.txt) 个"

echo ""
echo "🔧 部署配置:"
echo "- 启动命令: uvicorn main:app --host 0.0.0.0 --port \$PORT"
echo "- 构建命令: pip install -r requirements.txt"
echo "- 环境: production"

echo ""
echo "🌐 下一步操作:"
echo "1. 访问: https://render.com"
echo "2. 使用GitHub登录"
echo "3. 创建Web Service"
echo "4. 连接ai-work仓库"
echo "5. 配置环境变量"
echo "6. 创建PostgreSQL数据库"
echo "7. 开始部署"

echo ""
echo "🔑 需要准备的信息:"
echo "- OpenAI API密钥 (https://platform.openai.com)"
echo "- GitHub仓库访问权限"

echo ""
echo "✅ 准备就绪！可以开始Render部署了"