#!/usr/bin/env python3
"""
Kimi K2 模型集成测试脚本
用于验证Kimi K2模型是否正常工作
"""

import asyncio
import os
import sys
from typing import List, Dict

# 添加当前目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ai_service import ai_service

async def test_kimi_k2_chat():
    """测试Kimi K2对话功能"""
    print("🧪 开始测试 Kimi K2 模型...")
    print("=" * 50)

    # 测试消息
    messages = [
        {
            "role": "user",
            "content": "你好！请介绍一下你自己，并说明你有什么特色功能？"
        }
    ]

    try:
        # 测试Kimi K2最新模型
        print("📡 测试模型: kimi-k2-latest")
        result = await ai_service.chat_completion(messages, model="kimi-k2-latest")

        print(f"✅ 模型响应成功!")
        print(f"使用的模型: {result['model']}")
        print(f"回复内容: {result['content'][:200]}...")
        print(f"Token使用情况: {result.get('usage', {})}")
        print()

    except Exception as e:
        print(f"❌ Kimi K2 测试失败: {e}")
        return False

    return True

async def test_kimi_task_parsing():
    """测试Kimi K2任务解析功能"""
    print("📝 测试任务解析功能...")
    print("=" * 50)

    test_task = "明天下午3点要开会，需要准备PPT，还要打印会议资料，联系参会人员"

    try:
        print(f"测试任务: {test_task}")
        result = await ai_service.parse_task(test_task)

        print("✅ 任务解析成功!")
        print(f"解析结果: {result}")
        print()

    except Exception as e:
        print(f"❌ 任务解析测试失败: {e}")
        return False

    return True

async def test_kimi_text_enhancement():
    """测试Kimi K2文本润色功能"""
    print("✨ 测试文本润色功能...")
    print("=" * 50)

    test_text = "我想学习做烤鸭，但是不知道从哪里开始。"

    try:
        print(f"原始文本: {test_text}")
        result = await ai_service.enhance_text(test_text, style="professional")

        print("✅ 文本润色成功!")
        print(f"润色结果: {result}")
        print()

    except Exception as e:
        print(f"❌ 文本润色测试失败: {e}")
        return False

    return True

async def test_kimi_note_categorization():
    """测试Kimi K2笔记分类功能"""
    print("📚 测试笔记分类功能...")
    print("=" * 50)

    title = "Python学习笔记"
    content = "今天学习了Python的装饰器，了解了@staticmethod和@classmethod的用法和区别。"

    try:
        print(f"笔记标题: {title}")
        print(f"笔记内容: {content}")
        result = await ai_service.categorize_note(title, content)

        print("✅ 笔记分类成功!")
        print(f"分类结果: {result}")
        print()

    except Exception as e:
        print(f"❌ 笔记分类测试失败: {e}")
        return False

    return True

async def test_all_kimi_functions():
    """测试所有Kimi K2功能"""
    print("🚀 开始全面测试 Kimi K2 模型集成...")
    print("=" * 60)
    print()

    # 检查环境变量
    kimi_key = os.getenv("KIMI_API_KEY")
    if not kimi_key:
        print("❌ 错误: KIMI_API_KEY 环境变量未设置")
        print("请先设置环境变量: export KIMI_API_KEY='your-api-key'")
        return False

    print(f"✅ KIMI_API_KEY 已配置: {kimi_key[:20]}...")
    print()

    # 测试各项功能
    tests = [
        ("对话功能", test_kimi_k2_chat),
        ("任务解析", test_kimi_task_parsing),
        ("文本润色", test_kimi_text_enhancement),
        ("笔记分类", test_kimi_note_categorization)
    ]

    passed = 0
    total = len(tests)

    for test_name, test_func in tests:
        print(f"🔍 正在测试: {test_name}")
        try:
            if await test_func():
                passed += 1
                print(f"✅ {test_name} 测试通过!")
            else:
                print(f"❌ {test_name} 测试失败!")
        except Exception as e:
            print(f"❌ {test_name} 测试异常: {e}")

        print("-" * 50)
        print()

    # 总结结果
    print("=" * 60)
    print(f"📊 测试结果总结:")
    print(f"通过测试: {passed}/{total}")
    print(f"成功率: {(passed/total)*100:.1f}%")

    if passed == total:
        print("🎉 所有测试通过! Kimi K2 模型集成成功!")
        return True
    else:
        print("⚠️  部分测试失败，请检查配置和API密钥")
        return False

async def main():
    """主函数"""
    print("🤖 Kimi K2 模型集成测试工具")
    print("=" * 60)
    print()

    # 运行全面测试
    success = await test_all_kimi_functions()

    if success:
        print("\n✨ Kimi K2 模型已准备就绪!")
        print("您现在可以在项目中使用最新的Kimi K2模型了!")
    else:
        print("\n🔧 需要解决一些问题才能正常使用Kimi K2模型")

    return success

if __name__ == "__main__":
    # 运行异步主函数
    result = asyncio.run(main())
    sys.exit(0 if result else 1)