from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import time
from ai_service import ai_service

router = APIRouter(prefix="/api/kimi-test", tags=["Kimi测试"])

class ChatRequest(BaseModel):
    message: str
    model: str = "kimi-k2-latest"
    api_key: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    model: str
    response_time: Optional[int] = None
    tokens: Optional[int] = None

@router.post("/chat", response_model=ChatResponse)
async def test_kimi_chat(request: ChatRequest):
    """
    测试Kimi K2模型对话功能
    """
    start_time = time.time()

    try:
        # 准备消息
        messages = [
            {
                "role": "user",
                "content": request.message
            }
        ]

        # 调用AI服务
        result = await ai_service.chat_completion(messages, model=request.model)

        response_time = int((time.time() - start_time) * 1000)

        return ChatResponse(
            response=result["content"],
            model=result["model"],
            response_time=response_time,
            tokens=result.get("usage", {}).get("total_tokens")
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Kimi K2 测试失败: {str(e)}")

@router.get("/status")
async def get_kimi_status():
    """
    获取Kimi K2模型状态
    """
    try:
        # 测试简单对话
        messages = [{"role": "user", "content": "你好"}]
        result = await ai_service.chat_completion(messages, model="kimi-k2-latest")

        return {
            "status": "online",
            "model": result["model"],
            "message": "Kimi K2 模型运行正常"
        }

    except Exception as e:
        return {
            "status": "offline",
            "error": str(e),
            "message": "Kimi K2 模型连接失败"
        }