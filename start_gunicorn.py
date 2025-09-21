#!/usr/bin/env python3
"""
使用 Gunicorn 启动 FastAPI 应用
适用于 Render 部署
"""
import os
import sys
import logging

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 确保当前目录在 Python 路径中
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def main():
    try:
        port = int(os.environ.get("PORT", 8000))
        
        logger.info("🚀 使用 Gunicorn 启动 FastAPI 应用...")
        logger.info(f"📍 端口: {port}")
        logger.info(f"🌍 环境: {os.environ.get('ENVIRONMENT', 'development')}")
        
        # 测试导入应用
        logger.info("📦 测试应用导入...")
        from app_minimal import app
        logger.info("✅ 应用导入成功")
        
        # 使用 gunicorn 启动
        import subprocess
        cmd = [
            "gunicorn",
            "app_minimal:app",
            "-w", "1",  # 单个 worker（免费计划限制）
            "-k", "uvicorn.workers.UvicornWorker",
            "--bind", f"0.0.0.0:{port}",
            "--log-level", "info",
            "--access-logfile", "-",
            "--error-logfile", "-"
        ]
        
        logger.info(f"🌐 启动命令: {' '.join(cmd)}")
        subprocess.run(cmd)
        
    except Exception as e:
        logger.error(f"❌ 启动失败: {str(e)}")
        import traceback
        logger.error(f"📋 错误详情: {traceback.format_exc()}")
        sys.exit(1)

if __name__ == "__main__":
    main()