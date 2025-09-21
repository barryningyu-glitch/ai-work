from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from database import get_db
from models import User, Category, Folder
from schemas import Token, UserLogin

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT配置
SECRET_KEY = "cortex-ai-workspace-secret-key-2025"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24小时 = 1440分钟

# HTTP Bearer认证
security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """获取密码哈希"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """创建访问令牌"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """验证JWT令牌"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except JWTError:
        raise credentials_exception

def get_current_user(username: str = Depends(verify_token), db: Session = Depends(get_db)):
    """获取当前用户"""
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)):
    """获取当前活跃用户"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_super_user(current_user: User = Depends(get_current_active_user)):
    """获取当前超级用户"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

def authenticate_user(db: Session, username: str, password: str):
    """认证用户"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_super_user(db: Session):
    """创建超级用户"""
    # 检查是否已存在超级用户
    existing_user = db.query(User).filter(User.username == "宁宇").first()
    if existing_user:
        # 检查是否已有默认分类和文件夹，如果没有则创建
        create_default_categories_and_folders(db, existing_user)
        return existing_user
    
    # 创建超级用户
    hashed_password = get_password_hash("ny123456")
    super_user = User(
        username="宁宇",
        email="ningyu@cortex.ai",
        full_name="宁宇",
        hashed_password=hashed_password,
        is_active=True,
        is_superuser=True,
        created_at=datetime.utcnow()
    )
    db.add(super_user)
    db.commit()
    db.refresh(super_user)
    
    # 为新用户创建默认分类和文件夹
    create_default_categories_and_folders(db, super_user)
    
    return super_user

def create_default_categories_and_folders(db: Session, user: User):
    """为用户创建默认分类和文件夹"""
    # 检查是否已有分类
    existing_categories = db.query(Category).filter(Category.user_id == user.id).count()
    if existing_categories > 0:
        return
    
    # 创建默认分类
    default_categories = [
        {"name": "工作", "description": "工作相关的笔记和任务"},
        {"name": "学习", "description": "学习资料和笔记"},
        {"name": "生活", "description": "日常生活记录"},
        {"name": "项目", "description": "项目管理和文档"}
    ]
    
    created_categories = []
    for cat_data in default_categories:
        category = Category(
            name=cat_data["name"],
            description=cat_data["description"],
            user_id=user.id,
            created_at=datetime.utcnow()
        )
        db.add(category)
        created_categories.append(category)
    
    db.commit()
    
    # 刷新分类对象以获取ID
    for category in created_categories:
        db.refresh(category)
    
    # 为每个分类创建默认文件夹
    default_folders = [
        {"name": "待办事项", "category_name": "工作"},
        {"name": "会议记录", "category_name": "工作"},
        {"name": "学习笔记", "category_name": "学习"},
        {"name": "读书笔记", "category_name": "学习"},
        {"name": "日记", "category_name": "生活"},
        {"name": "想法", "category_name": "生活"},
        {"name": "项目计划", "category_name": "项目"},
        {"name": "技术文档", "category_name": "项目"}
    ]
    
    # 创建分类名称到ID的映射
    category_map = {cat.name: cat.id for cat in created_categories}
    
    for folder_data in default_folders:
        category_id = category_map.get(folder_data["category_name"])
        if category_id:
            folder = Folder(
                name=folder_data["name"],
                category_id=category_id,
                user_id=user.id,
                created_at=datetime.utcnow()
            )
            db.add(folder)
    
    db.commit()
    print(f"✅ 为用户 {user.username} 创建了默认分类和文件夹")

# 创建路由器
router = APIRouter()

@router.post("/login", response_model=Token)
async def login(user_login: UserLogin, db: Session = Depends(get_db)):
    """用户登录"""
    user = authenticate_user(db, user_login.username, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

