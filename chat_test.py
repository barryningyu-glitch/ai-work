from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from database import get_db
from models import User, ChatSession, ChatMessage, Note, Task, Category
from schemas import (
    ChatSession as ChatSessionSchema, ChatSessionCreate,
    ChatMessage as ChatMessageSchema, ChatMessageCreate,
    AIChatRequest, AIChatResponse
)
from ai_service import ai_service

router = APIRouter()

# 获取默认用户（用于测试）
def get_default_user(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == "宁宇").first()
    if not user:
        # 如果没有用户，创建一个测试用户
        from auth import get_password_hash
        from datetime import datetime
        user = User(
            username="宁宇",
            email="ningyu@cortex.ai",
            full_name="宁宇",
            hashed_password=get_password_hash("ny123456"),
            is_active=True,
            is_superuser=True,
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.get("/sessions", response_model=List[ChatSessionSchema])
def get_chat_sessions(db: Session = Depends(get_db)):
    """获取用户的所有对话会话"""
    current_user = get_default_user(db)
    sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.created_at.desc()).all()
    return sessions

@router.post("/sessions", response_model=ChatSessionSchema)
def create_chat_session(session: ChatSessionCreate, db: Session = Depends(get_db)):
    """创建新的对话会话"""
    current_user = get_default_user(db)
    db_session = ChatSession(
        title=session.title,
        user_id=current_user.id
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageSchema])
def get_session_messages(session_id: str, db: Session = Depends(get_db)):
    """获取会话的所有消息"""
    current_user = get_default_user(db)
    # 验证会话属于当前用户
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at).all()
    return messages

@router.post("/command", response_model=AIChatResponse)
async def chat_command(request: AIChatRequest, db: Session = Depends(get_db)):
    """核心对话接口 - AI大脑"""
    current_user = get_default_user(db)
    
    # 验证会话
    session = db.query(ChatSession).filter(
        ChatSession.id == request.session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    try:
        # 保存用户消息
        user_message = ChatMessage(
            session_id=request.session_id,
            role="user",
            content=request.text
        )
        db.add(user_message)
        db.commit()
        
        # 调用AI服务
        ai_response = await ai_service.chat_completion(
            messages=[{"role": "user", "content": request.text}],
            model=request.model
        )
        
        # 提取AI响应内容
        ai_content = ai_response.get("content", str(ai_response)) if isinstance(ai_response, dict) else str(ai_response)
        
        # 保存AI响应
        ai_message = ChatMessage(
            session_id=request.session_id,
            role="assistant",
            content=ai_content
        )
        db.add(ai_message)
        db.commit()
        
        return AIChatResponse(
            response_type="message",
            content=ai_content
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI服务错误: {str(e)}")

@router.delete("/sessions/{session_id}")
def delete_chat_session(session_id: str, db: Session = Depends(get_db)):
    """删除对话会话"""
    current_user = get_default_user(db)
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    # 删除会话相关的消息
    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    # 删除会话
    db.delete(session)
    db.commit()
    return {"message": "会话已删除"}

@router.put("/sessions/{session_id}")
def update_chat_session(session_id: str, session_update: ChatSessionCreate, db: Session = Depends(get_db)):
    """更新会话标题"""
    current_user = get_default_user(db)
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    session.title = session_update.title
    db.commit()
    db.refresh(session)
    return session