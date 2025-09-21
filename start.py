#!/usr/bin/env python3
"""
Render 部署启动脚本
确保应用能在 Render 环境中正确启动
"""
import os
import sys
import uvicorn

# 确保当前目录在 Python 路径中
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # 从环境变量获取端口，默认为 8000
    port = int(os.environ.get("PORT", 8000))
    
    print(f"🚀 启动 Cortex AI Workspace API 服务器...")
    print(f"📍 端口: {port}")
    print(f"🌍 环境: {os.environ.get('ENVIRONMENT', 'development')}")
    
    # 启动 uvicorn 服务器
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # 生产环境不使用热重载
        access_log=True,
        log_level="info"
    )