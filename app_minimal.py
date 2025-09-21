from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# 新增导入：数据库与路由模块
from database import get_db, engine, Base
import notes, tasks, chat, chat_test, pomodoro, auth, ai, users
from auth import create_super_user

# 加载环境变量
load_dotenv()

# 创建FastAPI应用
app = FastAPI(
    title="Cortex AI Workspace API",
    description="AI智能工作台后端API - 最小版本（已挂载完整路由）",
    version="1.0.0"
)

# 配置CORS（保持最宽松，确保通过 Vercel 代理访问不受限）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 在应用启动时初始化数据库和超级用户
@app.on_event("startup")
async def startup_event():
    # 创建数据库表（若不存在）
    Base.metadata.create_all(bind=engine)
    # 创建默认超级用户
    db = next(get_db())
    try:
        create_super_user(db)
    finally:
        db.close()

# 根路由
@app.get("/")
async def root():
    return {"message": "Cortex AI Workspace API - Minimal Version", "status": "running"}

# 兼容 /api 与 /api/ 两个路径，避免代理对结尾斜杠重定向
@app.get("/api")
async def api_root_no_slash():
    return {"message": "Cortex AI Workspace API", "version": "1.0.0"}

@app.get("/api/")
async def api_root():
    return {"message": "Cortex AI Workspace API", "version": "1.0.0"}

# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "healthy", "environment": os.getenv("ENVIRONMENT", "development")}

# 关键变更：挂载完整业务路由，与 main.py 保持一致
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])  # /api/auth/login
app.include_router(users.router, tags=["用户管理"])                 # /api/users/login 等
app.include_router(notes.router, prefix="/api/notes", tags=["笔记"]) 
app.include_router(tasks.router, prefix="/api/tasks", tags=["任务"]) 
app.include_router(chat_test.router, prefix="/api/chat", tags=["对话"]) 
app.include_router(pomodoro.router, prefix="/api/pomodoro", tags=["番茄钟"]) 
app.include_router(ai.router, prefix="/api/ai", tags=["AI服务"]) 

# 本地直接运行（Render 会忽略此分支，由 uvicorn/gunicorn 启动）
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)