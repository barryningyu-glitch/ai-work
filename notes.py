from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from database import get_db
from models import User, Note, Folder, Category, Tag
from schemas import Note as NoteSchema, NoteCreate, NoteUpdate, NoteTreeItem
from auth import get_current_user, create_default_categories_and_folders

router = APIRouter()

@router.get("/tree", response_model=List[NoteTreeItem])
def get_notes_tree(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取笔记的树状结构"""
    categories = db.query(Category).filter(Category.user_id == current_user.id).all()
    
    tree = []
    for category in categories:
        category_item = NoteTreeItem(
            id=category.id,
            name=category.name,
            type="category",
            children=[]
        )
        
        folders = db.query(Folder).filter(Folder.category_id == category.id).all()
        for folder in folders:
            folder_item = NoteTreeItem(
                id=folder.id,
                name=folder.name,
                type="folder",
                children=[]
            )
            
            notes = db.query(Note).filter(Note.folder_id == folder.id).all()
            for note in notes:
                note_item = NoteTreeItem(
                    id=note.id,
                    name=note.title,
                    type="note",
                    children=[]
                )
                folder_item.children.append(note_item)
            
            category_item.children.append(folder_item)
        
        tree.append(category_item)
    
    return tree

@router.get("/", response_model=List[NoteSchema])
def get_notes(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取用户的所有笔记"""
    notes = db.query(Note).options(joinedload(Note.tags)).filter(Note.user_id == current_user.id).offset(skip).limit(limit).all()
    return notes

@router.get("/tags", response_model=List[dict])
def get_tags(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取用户的所有标签"""
    tags = db.query(Tag).filter(Tag.user_id == current_user.id).all()
    return [{"id": tag.id, "name": tag.name} for tag in tags]

@router.get("/{note_id}", response_model=NoteSchema)
def get_note(note_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取特定笔记"""
    print(f"🔍 获取笔记请求 - 笔记ID: {note_id}, 当前用户: {current_user.username}, 用户ID: {current_user.id}")
    
    # 先查找笔记是否存在
    note_exists = db.query(Note).filter(Note.id == note_id).first()
    if not note_exists:
        print(f"❌ 笔记不存在 - ID: {note_id}")
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    print(f"📝 找到笔记 - 标题: {note_exists.title}, 所有者ID: {note_exists.user_id}")
    
    # 检查权限
    if note_exists.user_id != current_user.id:
        print(f"🚫 权限不足 - 笔记所有者: {note_exists.user_id}, 当前用户: {current_user.id}")
        raise HTTPException(status_code=403, detail="无权访问此笔记")
    
    # 获取完整笔记信息
    note = db.query(Note).options(joinedload(Note.tags)).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    print(f"✅ 成功获取笔记 - 标题: {note.title}")
    return note

@router.post("/", response_model=NoteSchema)
def create_note(note: NoteCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """创建笔记"""
    print(f"🔍 创建笔记请求 - 用户: {current_user.username}, 文件夹ID: {note.folder_id}")
    
    # 验证文件夹
    folder = db.query(Folder).filter(Folder.id == note.folder_id, Folder.user_id == current_user.id).first()
    if not folder:
        print(f"❌ 文件夹不存在 - 查找的文件夹ID: {note.folder_id}, 用户ID: {current_user.id}")
        # 查看数据库中实际存在的文件夹
        all_folders = db.query(Folder).filter(Folder.user_id == current_user.id).all()
        print(f"📁 用户的所有文件夹: {[(f.id, f.name) for f in all_folders]}")
        raise HTTPException(status_code=404, detail="文件夹不存在")
    
    # 创建笔记
    db_note = Note(
        title=note.title,
        content=note.content,
        folder_id=note.folder_id,
        user_id=current_user.id
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    # 添加标签
    if note.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(note.tag_ids), Tag.user_id == current_user.id).all()
        db_note.tags = tags
        db.commit()
    
    return db_note

@router.put("/{note_id}", response_model=NoteSchema)
def update_note(note_id: str, note_update: NoteUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """更新笔记"""
    print(f"🔍 更新笔记请求 - 笔记ID: {note_id}, 用户: {current_user.username}")
    print(f"📝 更新数据: folder_id={note_update.folder_id}, title={note_update.title is not None}")
    
    db_note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    print(f"📄 当前笔记的文件夹ID: {db_note.folder_id}")
    
    # 更新字段
    if note_update.title is not None:
        db_note.title = note_update.title
    if note_update.content is not None:
        db_note.content = note_update.content
    if note_update.folder_id is not None and note_update.folder_id != db_note.folder_id:
        # 只有当文件夹ID确实改变时才验证
        print(f"🔄 文件夹ID发生变化: {db_note.folder_id} -> {note_update.folder_id}")
        folder = db.query(Folder).filter(Folder.id == note_update.folder_id, Folder.user_id == current_user.id).first()
        if not folder:
            print(f"❌ 新文件夹不存在 - 查找的文件夹ID: {note_update.folder_id}, 用户ID: {current_user.id}")
            # 查看数据库中实际存在的文件夹
            all_folders = db.query(Folder).filter(Folder.user_id == current_user.id).all()
            print(f"📁 用户的所有文件夹: {[(f.id, f.name) for f in all_folders]}")
            raise HTTPException(status_code=404, detail="文件夹不存在")
        db_note.folder_id = note_update.folder_id
    
    # 更新标签
    if note_update.tag_ids is not None:
        tags = db.query(Tag).filter(Tag.id.in_(note_update.tag_ids), Tag.user_id == current_user.id).all()
        db_note.tags = tags
    
    db.commit()
    db.refresh(db_note)
    return db_note

@router.delete("/{note_id}")
def delete_note(note_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """删除笔记"""
    db_note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    db.delete(db_note)
    db.commit()
    return {"message": "笔记已删除"}

# 文件夹管理
@router.post("/folders", response_model=dict)
def create_folder(name: str, category_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """创建文件夹"""
    # 验证分类
    category = db.query(Category).filter(Category.id == category_id, Category.user_id == current_user.id).first()
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")
    
    # 检查文件夹名是否已存在
    existing_folder = db.query(Folder).filter(
        Folder.name == name, 
        Folder.category_id == category_id,
        Folder.user_id == current_user.id
    ).first()
    if existing_folder:
        raise HTTPException(status_code=400, detail="文件夹名已存在")
    
    folder = Folder(name=name, category_id=category_id, user_id=current_user.id)
    db.add(folder)
    db.commit()
    db.refresh(folder)
    
    return {"id": folder.id, "name": folder.name, "category_id": folder.category_id}

# 标签管理
@router.post("/tags", response_model=dict)
def create_tag(name: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """创建标签"""
    # 检查标签是否已存在
    existing_tag = db.query(Tag).filter(Tag.name == name, Tag.user_id == current_user.id).first()
    if existing_tag:
        return {"id": existing_tag.id, "name": existing_tag.name}
    
    tag = Tag(name=name, user_id=current_user.id)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    
    return {"id": tag.id, "name": tag.name}

@router.post("/init-default-data")
def init_default_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """初始化默认分类和文件夹"""
    try:
        create_default_categories_and_folders(db, current_user)
        return {"message": "默认数据初始化成功"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"初始化失败: {str(e)}")

