#!/usr/bin/env python3
"""
Render 部署启动脚本 - 最小版本
用于调试部署问题
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
        
        logger.info("🚀 启动最小化 API 服务器...")
        logger.info(f"📍 端口: {port}")
        logger.info(f"🌍 环境: {os.environ.get('ENVIRONMENT', 'development')}")
        
        # 导入最小化应用
        from app_minimal import app
        logger.info("✅ 最小化应用导入成功")
        
        # 启动服务器
        import uvicorn
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=port,
            reload=False,
            access_log=True,
            log_level="info"
        )
        
    except Exception as e:
        logger.error(f"❌ 启动失败: {str(e)}")
        import traceback
        logger.error(f"📋 错误详情: {traceback.format_exc()}")
        sys.exit(1)

if __name__ == "__main__":
    main()