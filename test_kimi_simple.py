#!/usr/bin/env python3
"""
简单的Kimi K2模型测试
"""

import asyncio
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

from ai_service import ai_service

async def simple_test():
    """简单测试Kimi K2"""
    print("🧪 简单测试 Kimi K2 模型")
    print("=" * 40)

    # 检查API密钥
    kimi_key = os.getenv("KIMI_API_KEY")
    if not kimi_key:
        print("❌ KIMI_API_KEY 未设置")
        return

    print(f"✅ API密钥已配置: {kimi_key[:20]}...")

    # 测试消息
    messages = [{
        "role": "user",
        "content": "请用一句话介绍Kimi K2模型的特点"
    }]

    try:
        print("🤖 正在请求Kimi K2...")
        result = await ai_service.chat_completion(messages, model="kimi-k2-latest")

        print(f"✅ 成功! 模型: {result['model']}")
        print(f"回复: {result['content']}")
        print(f"Token使用: {result.get('usage', {})}")

    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(simple_test())