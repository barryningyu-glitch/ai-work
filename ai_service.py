import os
import requests
from typing import Dict, List, Optional
from fastapi import HTTPException

class AIService:
    def __init__(self):
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        self.openrouter_base_url = os.getenv("OPENROUTER_API_BASE", "https://openrouter.ai/api/v1")
        self.kimi_api_key = os.getenv("KIMI_API_KEY")
        self.kimi_base_url = os.getenv("KIMI_API_BASE", "https://api.moonshot.cn/v1")
        
        # 验证OpenRouter API密钥
        if not self.openrouter_api_key:
            print("警告: OPENROUTER_API_KEY环境变量未设置，AI功能将不可用")
            self.openrouter_api_key = "demo_key"  # 设置一个占位符
        
        # 默认模型配置 - 全面切换到Kimi K2
        self.default_ai_model = os.getenv("DEFAULT_AI_MODEL", "kimi-k2-latest")
        self.default_chat_model = os.getenv("DEFAULT_CHAT_MODEL", "kimi-k2-latest")

        # 支持的模型列表 - Kimi K2作为首选
        self.supported_models = {
            "kimi-k2-latest": "Kimi K2 (最新版 - 推荐)",
            "moonshot-v1-8k": "Kimi (Moonshot V1 8K)",
            "openai/gpt-5": "GPT-5",
            "openai/gpt-4o": "GPT-4o",
            "deepseek/deepseek-chat-v3.1": "DeepSeek Chat V3.1",
            "google/gemini-2.5-flash": "Gemini 2.5 Flash",
            "google/gemini-2.5-pro": "Gemini 2.5 Pro",
            "anthropic/claude-sonnet-4": "Claude Sonnet 4"
        }
        
        print(f"AI服务初始化完成 - 默认模型: {self.default_ai_model}")
        print(f"OpenRouter API密钥已配置: {self.openrouter_api_key[:20]}...")

    async def chat_completion(self, messages: List[Dict], model: str = None, stream: bool = False) -> Dict:
        """
        AI对话完成
        """
        # 如果没有指定模型，使用默认聊天模型
        if model is None:
            model = self.default_chat_model
        
        # 检查模型是否支持
        if model not in self.supported_models:
            raise Exception(f"不支持的模型: {model}")

        # Kimi模型统一处理
        if model.startswith("kimi-") or model == "moonshot-v1-8k":
            return await self._kimi_chat(messages, model)
        else:
            return await self._openrouter_chat(messages, model, stream)

    async def _openrouter_chat(self, messages: List[Dict], model: str, stream: bool = False) -> Dict:
        """
        使用OpenRouter API进行对话 - 优化GPT-5使用
        """
        headers = {
            "Authorization": f"Bearer {self.openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://cortex-ai-workspace.com",
            "X-Title": "Cortex AI Workspace"
        }
        
        # 针对不同模型优化参数
        if model == "openai/gpt-5":
            data = {
                "model": model,
                "messages": messages,
                "stream": stream,
                "temperature": 0.7,
                "max_tokens": 4000,  # GPT-5支持更长的输出
                "top_p": 0.9,
                "frequency_penalty": 0.1,
                "presence_penalty": 0.1
            }
        else:
            data = {
                "model": model,
                "messages": messages,
                "stream": stream,
                "temperature": 0.7,
                "max_tokens": 2000
            }
        
        try:
            response = requests.post(
                f"{self.openrouter_base_url}/chat/completions",
                headers=headers,
                json=data,
                timeout=60  # 增加超时时间以适应GPT-5
            )
            
            if response.status_code != 200:
                error_detail = f"OpenRouter API错误: {response.status_code}"
                try:
                    error_json = response.json()
                    if "error" in error_json:
                        error_detail += f" - {error_json['error'].get('message', response.text)}"
                except:
                    error_detail += f" - {response.text}"
                raise Exception(error_detail)
            
            result = response.json()
            
            if "choices" not in result or len(result["choices"]) == 0:
                raise Exception("AI响应格式错误")
            
            print(f"✅ 成功使用模型: {model}")
            
            return {
                "content": result["choices"][0]["message"]["content"],
                "model": model,
                "usage": result.get("usage", {}),
                "finish_reason": result["choices"][0].get("finish_reason", "stop")
            }
            
        except requests.exceptions.Timeout:
            raise Exception("AI服务请求超时，请稍后重试")
        except requests.exceptions.RequestException as e:
            raise Exception(f"网络请求错误: {str(e)}")
        except Exception as e:
            raise Exception(f"OpenRouter服务错误: {str(e)}")

    async def _kimi_chat(self, messages: List[Dict], model: str = "kimi-k2-latest") -> Dict:
        """
        使用Kimi API进行对话 - 支持K2模型
        """
        headers = {
            "Authorization": f"Bearer {self.kimi_api_key}",
            "Content-Type": "application/json"
        }

        # Kimi K2模型配置优化
        if model == "kimi-k2-latest":
            data = {
                "model": "kimi-latest",  # 使用最新的K2模型
                "messages": messages,
                "temperature": 0.8,     # K2模型适合更高的温度值
                "max_tokens": 8000,     # K2支持更长的输出
                "top_p": 0.95,
                "frequency_penalty": 0.1,
                "presence_penalty": 0.1
            }
        else:
            # 兼容旧版Kimi模型
            data = {
                "model": model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 2000
            }
        
        response = requests.post(
            f"{self.kimi_base_url}/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code != 200:
            raise Exception(f"Kimi API错误: {response.status_code} - {response.text}")
        
        result = response.json()

        return {
            "content": result["choices"][0]["message"]["content"],
            "model": model,
            "usage": result.get("usage", {}),
            "finish_reason": result["choices"][0].get("finish_reason", "stop")
        }

    async def enhance_text(self, text: str, style: str = "professional") -> str:
        """
        AI文本润色
        """
        # 根据不同风格设置不同的系统提示
        style_prompts = {
            "professional": "你是一个专业的文本润色助手。请将文本优化为正式、专业的风格，适合商务文档、学术论文等正式场合。使用准确的术语，保持严谨的语言风格。",
            "casual": "你是一个文本润色助手。请将文本优化为口语化、亲切自然的风格，适合日常交流。使用简单易懂的表达，让文本更加贴近生活。",
            "lively": "你是一个文本润色助手。请将文本优化为活泼生动的风格，增加趣味性和感染力，适合创意内容。可以适当使用生动的比喻和富有表现力的词汇。",
            "concise": "你是一个文本润色助手。请将文本精简提炼，去除冗余表达，突出核心要点。保持简洁明了，每句话都要有价值。",
            "detailed": "你是一个文本润色助手。请扩充丰富文本内容，增加细节描述和具体说明，使内容更加充实完整。适当补充背景信息和详细解释。"
        }
        
        system_prompt = style_prompts.get(style, style_prompts["professional"])
        
        messages = [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user", 
                "content": f"请按照指定风格润色以下文本，保持原意不变：\n\n{text}"
            }
        ]
        
        result = await self.chat_completion(messages, self.default_ai_model)
        return result["content"]

    async def categorize_note(self, title: str, content: str) -> Dict:
        """
        AI智能归档笔记
        """
        messages = [
            {
                "role": "system",
                "content": """你是一个智能笔记分类助手。根据笔记的标题和内容，推荐合适的分类、文件夹和标签。

分类指导：
- 工作：工作任务、会议记录、项目计划、业务相关内容
- 学习：学习笔记、课程内容、知识总结、技能提升
- 生活：日常生活、饮食、购物、娱乐、旅行、个人感受
- 健康：运动、健身、医疗、养生、心理健康
- 财务：理财、投资、预算、消费记录
- 灵感：创意想法、随想、计划、目标设定

示例：
- "我要吃烤鸭" → 分类：生活，文件夹：日常/用餐计划，标签：[今日伙食, 烤鸭, 用餐计划]
- "项目进度汇报" → 分类：工作，文件夹：项目管理，标签：[项目, 进度, 汇报]
- "学习Python" → 分类：学习，文件夹：编程学习，标签：[Python, 编程, 学习笔记]

请根据内容准确分类，返回JSON格式：{"category": "分类名", "folder": "文件夹名", "tags": ["标签1", "标签2"]}"""
            },
            {
                "role": "user",
                "content": f"标题：{title}\n内容：{content[:500]}..."
            }
        ]
        
        result = await self.chat_completion(messages, self.default_ai_model)
        
        try:
            import json
            return json.loads(result["content"])
        except:
            return {
                "category": "未分类",
                "folder": "默认",
                "tags": ["笔记"]
            }

    async def parse_task(self, task_input) -> Dict:
        """
        AI解析任务描述，支持智能任务拆分，如果AI不可用则使用基于规则的解析
        """
        try:
            # 处理输入参数
            if isinstance(task_input, str):
                description = task_input
                context = {}
                split_tasks = False
            else:
                description = task_input.get('text', '')
                context = task_input.get('context', {})
                split_tasks = context.get('split_tasks', False)
            
            # 构建系统提示词
            system_prompt = """你是一个智能任务解析助手。根据用户的自然语言描述，解析出任务的详细信息。

你需要智能判断用户描述是否包含多个独立的任务，如果包含多个任务，请拆分为独立的任务。

请严格按照以下JSON格式返回：

如果是单个任务：
{
  "title": "任务标题（简洁明了）",
  "description": "详细描述（包含任务的具体内容和要求）",
  "priority": "high/medium/low",
  "start_time": "YYYY-MM-DDTHH:MM:SS或null（开始时间）",
  "end_time": "YYYY-MM-DDTHH:MM:SS或null（结束时间）",
  "due_date": "YYYY-MM-DD或null（截止日期）",
  "category": "工作/学习/生活或其他分类",
  "tags": ["标签1", "标签2"],
  "subtasks": ["子任务1", "子任务2"],
  "time_range": "flexible/specific/deadline"
}

如果是多个任务：
{
  "tasks": [
    {
      "title": "任务1标题",
      "description": "任务1描述",
      "priority": "high/medium/low",
      "start_time": "YYYY-MM-DDTHH:MM:SS或null",
      "end_time": "YYYY-MM-DDTHH:MM:SS或null",
      "due_date": "YYYY-MM-DD或null",
      "category": "工作/学习/生活或其他分类",
      "tags": ["标签1", "标签2"],
      "subtasks": ["子任务1", "子任务2"],
      "time_range": "flexible/specific/deadline"
    },
    {
      "title": "任务2标题",
      ...
    }
  ]
}

解析规则：
1. 智能识别多任务：如果描述中包含多个动作或目标（如"看抖音，买材料，学习做烤鸭"），拆分为独立任务
2. title：提取核心任务名称，不超过30字
3. description：保留原始描述，补充必要的上下文信息
4. priority：根据"紧急"、"重要"、"优先级"等关键词判断
5. time_range：
   - "flexible"：灵活时间，只需要截止日期
   - "specific"：具体时间段，需要开始和结束时间
   - "deadline"：仅截止日期
6. start_time/end_time：解析具体时间点，如"明天下午3点"
7. due_date：解析截止日期，如"本周内"、"下周五"、"3天内"
8. category：根据内容判断分类
9. tags：提取关键词作为标签
10. subtasks：识别包含的子任务或步骤

示例：
输入："今天下班，看抖音，买材料，淘宝买设备，学习做烤鸭，和同事一起，3天内搞定"
应该拆分为：
- 看抖音（娱乐）
- 买材料（购物）
- 淘宝买设备（购物）
- 学习做烤鸭（学习）
每个任务都设置3天内的截止日期。"""

            # 如果有项目上下文，添加到提示词中
            if context.get('projects'):
                system_prompt += f"\n\n可用项目：{[p['name'] for p in context['projects']]}"
            
            if context.get('current_time'):
                system_prompt += f"\n当前时间：{context['current_time']}"
            
            # 尝试使用AI解析
            messages = [
                {
                    "role": "system", 
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": f"请解析这个任务描述：{description}"
                }
            ]
            
            result = await self.chat_completion(messages, self.default_ai_model)
            
            import json
            parsed_result = json.loads(result["content"])
            
            # 如果返回的是单个任务但没有tasks字段，包装成tasks格式
            if "tasks" not in parsed_result and "title" in parsed_result:
                parsed_result = {"tasks": [parsed_result]}
            
            return parsed_result
            
        except Exception as e:
            print(f"AI解析失败，使用基于规则的解析: {e}")
            # 降级到基于规则的解析
            return {"tasks": [self._rule_based_parse_task(description if isinstance(task_input, str) else task_input.get('text', ''))]}
    
    def _rule_based_parse_task(self, description: str) -> Dict:
        """
        基于规则的任务解析（AI不可用时的降级方案）
        """
        import re
        from datetime import datetime, timedelta
        
        # 提取标题（取前50个字符或第一句话）
        title = description.split('。')[0][:50] if '。' in description else description[:50]
        
        # 检测优先级关键词
        priority = "medium"
        if any(word in description for word in ["紧急", "重要", "高优先级", "urgent", "important"]):
            priority = "high"
        elif any(word in description for word in ["低优先级", "不急", "可选", "low"]):
            priority = "low"
        
        # 检测时间相关信息
        due_date = None
        time_patterns = [
            r"明天",
            r"后天", 
            r"下周",
            r"本周",
            r"(\d+)天后",
            r"(\d+)周后"
        ]
        
        for pattern in time_patterns:
            if re.search(pattern, description):
                if "明天" in description:
                    due_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
                elif "后天" in description:
                    due_date = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
                elif "下周" in description:
                    due_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
                break
        
        # 检测子任务（包含"包括"、"需要"等关键词）
        subtasks = []
        if "包括" in description:
            parts = description.split("包括")[1] if "包括" in description else ""
            if parts:
                subtasks = [task.strip() for task in re.split(r'[，,、和]', parts) if task.strip()]
        elif "需要" in description:
            parts = description.split("需要")[1] if "需要" in description else ""
            if parts:
                subtasks = [task.strip() for task in re.split(r'[，,、和]', parts) if task.strip()]
        
        # 检测开始和结束时间
        start_time = None
        end_time = None
        
        # 简单的时间解析
        if "明天" in description:
            from datetime import datetime, timedelta
            tomorrow = datetime.now() + timedelta(days=1)
            if "上午" in description:
                start_time = tomorrow.replace(hour=9, minute=0, second=0).isoformat()
            elif "下午" in description:
                start_time = tomorrow.replace(hour=14, minute=0, second=0).isoformat()
            elif "晚上" in description:
                start_time = tomorrow.replace(hour=19, minute=0, second=0).isoformat()
        
        # 确定时间范围类型
        time_range = "flexible"  # 默认灵活时间
        if start_time and end_time:
            time_range = "specific"
        elif due_date:
            time_range = "deadline"
        
        return {
            "title": title,
            "description": description,
            "priority": priority,
            "start_time": start_time,
            "end_time": end_time,
            "due_date": due_date,
            "category": "工作",  # 默认分类
            "tags": [],
            "subtasks": subtasks[:3],  # 最多3个子任务
            "time_range": time_range
        }

    def get_available_models(self) -> Dict[str, str]:
        """
        获取可用的AI模型列表
        """
        return self.supported_models

# 全局AI服务实例
ai_service = AIService()

