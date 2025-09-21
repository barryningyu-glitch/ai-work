from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 创建FastAPI应用
app = FastAPI(
    title="Cortex AI Workspace API",
    description="AI智能工作台后端API - 最小版本",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/health")
async def health_check():
    return {"status": "healthy", "environment": os.getenv("ENVIRONMENT", "development")}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)