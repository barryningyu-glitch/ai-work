from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
import os
from datetime import datetime, timedelta
import re
from typing import Optional

from database import get_db
from models import User, Category
from schemas import (
    AIPolishRequest, AIPolishResponse,
    AIAnalyzeNoteRequest, AIAnalyzeNoteResponse,
    AIParseTaskRequest, AIParseTaskResponse,
    PriorityEnum
)
from auth import get_current_user
from ai_service import ai_service

router = APIRouter()

@router.post("/polish-text", response_model=AIPolishResponse)
async def polish_text(request: AIPolishRequest, current_user: User = Depends(get_current_user)):
    """AI文本润色"""
    try:
        polished_text = await ai_service.enhance_text(request.text, request.style)
        return AIPolishResponse(polished_text=polished_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文本润色失败: {str(e)}")

@router.post("/analyze-note", response_model=AIAnalyzeNoteResponse)
async def analyze_note(request: AIAnalyzeNoteRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """AI分析笔记内容并推荐分类"""
    try:
        # 获取用户的分类
        categories = db.query(Category).filter(Category.user_id == current_user.id).all()
        category_names = [cat.name for cat in categories]
        
        result = await ai_service.categorize_note(request.title, request.content)
        
        # 验证分类是否存在
        if result["category"] not in category_names:
            result["category"] = category_names[0] if category_names else "工作"
        
        return AIAnalyzeNoteResponse(
            category=result["category"],
            folder=result["folder"],
            tags=result["tags"]
        )
    except Exception as e:
        # 如果出错，返回默认值
        categories = db.query(Category).filter(Category.user_id == current_user.id).all()
        category_names = [cat.name for cat in categories]
        return AIAnalyzeNoteResponse(
            category=category_names[0] if category_names else "工作",
            folder="未分类",
            tags=["笔记"]
        )

@router.post("/parse-task", response_model=AIParseTaskResponse)
async def parse_task(request: AIParseTaskRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """AI解析自然语言任务"""
    try:
        # 获取用户的分类
        categories = db.query(Category).filter(Category.user_id == current_user.id).all()
        category_names = [cat.name for cat in categories]
        
        # 构建请求参数，包含上下文信息
        task_input = {
            'text': request.text,
            'context': request.context or {}
        }
        
        result = await ai_service.parse_task(task_input)
        
        # 处理返回的任务列表
        tasks = result.get("tasks", [])
        processed_tasks = []
        
        for task in tasks:
            # 处理时间字段
            start_time = None
            end_time = None
            due_date = None
            
            if task.get("start_time"):
                try:
                    start_time = datetime.fromisoformat(task["start_time"].replace('Z', '+00:00'))
                except:
                    pass
                    
            if task.get("end_time"):
                try:
                    end_time = datetime.fromisoformat(task["end_time"].replace('Z', '+00:00'))
                except:
                    pass
                    
            if task.get("due_date"):
                try:
                    due_date = datetime.fromisoformat(task["due_date"].replace('Z', '+00:00'))
                except:
                    pass
            
            # 验证分类
            category = task.get("category")
            if category not in category_names:
                category = None
            
            # 验证优先级
            priority = task.get("priority", "medium")
            if priority not in ["low", "medium", "high"]:
                priority = "medium"
            
            processed_task = {
                "title": task.get("title", ""),
                "description": task.get("description", ""),
                "start_time": start_time.isoformat() if start_time else None,
                "end_time": end_time.isoformat() if end_time else None,
                "due_date": due_date.isoformat() if due_date else None,
                "category": category,
                "priority": priority,
                "time_range": task.get("time_range", "flexible"),
                "subtasks": task.get("subtasks", [])
            }
            processed_tasks.append(processed_task)
        
        return AIParseTaskResponse(tasks=processed_tasks)
        
    except Exception as e:
        # 如果解析失败，返回基于规则的解析结果
        title = request.text[:100] if len(request.text) > 100 else request.text
        fallback_task = {
            "title": title,
            "description": "",
            "start_time": None,
            "end_time": None,
            "due_date": None,
            "category": None,
            "priority": "medium",
            "time_range": "flexible",
            "subtasks": []
        }
        return AIParseTaskResponse(tasks=[fallback_task])

@router.get("/models")
def get_available_models():
    """获取可用的AI模型列表"""
    models = [
        {"id": "openai/gpt-5", "name": "GPT-5", "provider": "OpenAI"},
        {"id": "deepseek/deepseek-chat-v3.1", "name": "DeepSeek Chat v3.1", "provider": "DeepSeek"},
        {"id": "google/gemini-2.5-flash", "name": "Gemini 2.5 Flash", "provider": "Google"},
        {"id": "google/gemini-2.5-pro", "name": "Gemini 2.5 Pro", "provider": "Google"},
        {"id": "anthropic/claude-sonnet-4", "name": "Claude Sonnet 4", "provider": "Anthropic"},
        {"id": "moonshot-v1-8k", "name": "Kimi K2", "provider": "Moonshot"},
    ]
    return {"models": models, "default": ai_service.default_ai_model, "chat_default": ai_service.default_chat_model}

@router.post("/test-connection")
async def test_ai_connection():
    """测试AI服务连接"""
    try:
        response = await ai_service.chat_completion(
            messages=[{"role": "user", "content": "Hello, please respond with 'AI service is working correctly.'"}]
        )
        return {"status": "success", "response": response}
    except Exception as e:
        return {"status": "error", "error": str(e)}

