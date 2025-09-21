# AI智能工作台系统架构设计

## 项目概述

**项目名称：** Cortex AI 工作区 (Cortex AI Workspace)
**版本：** V1.0
**核心目标：** 构建一个集成AI能力的智能工作台，包含笔记管理、待办事项、AI对话和专注番茄钟四大核心模块

## 核心模块分析

### 1. AI智能笔记模块 (AI Smart Notes)
**核心功能：**
- 分层级笔记组织：分类 > 文件夹 > 笔记
- AI智能归档：自动推荐分类、文件夹和标签
- AI辅助润色：全文润色功能
- 动态标题：支持自动和手动标题设置
- 基础笔记管理：CRUD操作

### 2. 智能待办事项模块 (Smart Todo)
**核心功能：**
- AI驱动的快速创建：自然语言解析任务
- 双视图管理：看板视图 + 日历视图
- 丰富任务属性：时间、优先级、状态、分类
- 拖拽操作：看板状态切换
- 智能分类：AI自动建议分类

### 3. AI对话模块 (AI Chat)
**核心功能：**
- 私人工作区助理：访问笔记和待办数据
- 指令式操作：自然语言创建/修改数据
- 多主题对话管理：独立会话上下文
- 全局浮动侧边栏：不打断主工作流
- 上下文关联互动：一键存为笔记/待办

### 4. 专注番茄钟模块 (Focus Pomodoro)
**核心功能：**
- 可定制时间周期：灵活设置工作/休息时间
- 双模界面：全局小部件 + 专注模式
- 情绪化主题选择：多种背景和配色
- 待办任务关联：可选择关联特定任务
- 专注数据统计：记录完成的番茄钟数量
- 多渠道提醒：声音 + 桌面通知

## 技术栈选择

### 前端技术栈
- **框架：** Vue.js 3
- **状态管理：** Pinia
- **构建工具：** Vite
- **UI组件：**
  - TipTap (富文本编辑器)
  - vuedraggable (拖拽功能)
  - FullCalendar.io (日历组件)
- **样式：** CSS3 + 响应式设计

### 后端技术栈
- **框架：** Python + FastAPI
- **数据库：** SQLite (初期) / PostgreSQL (扩展)
- **ORM：** SQLAlchemy
- **AI服务：** OpenAI API (支持多模型切换)
- **API文档：** 自动生成的OpenAPI文档

### AI集成
- **主要模型：** 
  - openai/gpt-5
  - deepseek/deepseek-chat-v3.1
  - google/gemini-2.5-flash
  - anthropic/claude-sonnet-4
- **API提供商：** OpenRouter + 备用Kimi
- **功能应用：**
  - 文本润色和优化
  - 内容分析和分类
  - 自然语言任务解析
  - 智能对话和指令执行

## 数据库设计

### 核心数据模型

#### 用户和分类
```sql
-- 用户表
User {
  id: UUID (主键)
  username: String
  email: String
  pomodoro_settings: JSON
  created_at: DateTime
}

-- 分类表 (共享)
Category {
  id: UUID (主键)
  name: String ("工作", "学习", "生活")
  user_id: UUID (外键)
}
```

#### 笔记模块
```sql
-- 文件夹表
Folder {
  id: UUID (主键)
  name: String
  category_id: UUID (外键)
  user_id: UUID (外键)
}

-- 笔记表
Note {
  id: UUID (主键)
  title: String
  content: Text
  folder_id: UUID (外键)
  user_id: UUID (外键)
  created_at: DateTime
  updated_at: DateTime
}

-- 标签表
Tag {
  id: UUID (主键)
  name: String
  user_id: UUID (外键)
}

-- 笔记标签关联表
Note_Tags {
  note_id: UUID (外键)
  tag_id: UUID (外键)
}
```

#### 待办事项模块
```sql
-- 任务表
Task {
  id: UUID (主键)
  title: String
  description: Text
  start_time: DateTime
  end_time: DateTime
  priority: Enum ('low', 'medium', 'high')
  status: Enum ('todo', 'doing', 'done')
  category_id: UUID (外键)
  user_id: UUID (外键)
  reminder_minutes_before: Integer
  created_at: DateTime
  updated_at: DateTime
}
```

#### AI对话模块
```sql
-- 对话会话表
ChatSession {
  id: UUID (主键)
  title: String
  user_id: UUID (外键)
  created_at: DateTime
}

-- 对话消息表
ChatMessage {
  id: UUID (主键)
  session_id: UUID (外键)
  role: Enum ('user', 'ai')
  content: Text
  created_at: DateTime
}
```

#### 番茄钟模块
```sql
-- 番茄钟记录表
PomodoroLog {
  id: UUID (主键)
  user_id: UUID (外键)
  task_id: UUID (外键, 可选)
  duration: Integer (分钟)
  completed_at: DateTime
}
```

## API接口设计

### 笔记模块API
```
GET    /api/notes-tree          # 获取笔记树状结构
POST   /api/notes              # 创建笔记
PUT    /api/notes/{id}          # 更新笔记
DELETE /api/notes/{id}          # 删除笔记
POST   /api/ai/polish-text      # AI文本润色
POST   /api/ai/analyze-note     # AI分析笔记内容
```

### 待办事项API
```
GET    /api/tasks              # 获取任务列表
POST   /api/tasks              # 创建任务
PUT    /api/tasks/{id}          # 更新任务
DELETE /api/tasks/{id}          # 删除任务
POST   /api/ai/parse-task       # AI解析自然语言任务
```

### AI对话API
```
GET    /api/chat/sessions       # 获取会话列表
POST   /api/chat/sessions       # 创建新会话
GET    /api/chat/sessions/{id}/messages  # 获取会话消息
POST   /api/chat/command        # 核心对话接口
```

### 番茄钟API
```
PUT    /api/users/me/settings/pomodoro  # 更新番茄钟设置
POST   /api/pomodoro_logs       # 记录番茄钟完成
GET    /api/pomodoro_logs       # 获取番茄钟统计
```

## 前端组件架构

### 页面组件
```
App.vue
├── Layout/
│   ├── Header.vue              # 顶部导航
│   ├── Sidebar.vue             # 侧边栏导航
│   └── Footer.vue              # 底部信息
├── Pages/
│   ├── NotesPage.vue           # 笔记主页
│   ├── TodoPage.vue            # 待办事项主页
│   ├── ChatPage.vue            # 对话页面
│   └── SettingsPage.vue        # 设置页面
└── Components/
    ├── Notes/
    │   ├── NoteEditor.vue      # 笔记编辑器
    │   ├── NotesList.vue       # 笔记列表
    │   └── AISuggestionModal.vue # AI建议弹窗
    ├── Todo/
    │   ├── KanbanBoard.vue     # 看板视图
    │   ├── CalendarView.vue    # 日历视图
    │   ├── TaskCard.vue        # 任务卡片
    │   └── AITaskInput.vue     # AI任务输入
    ├── Chat/
    │   ├── AIChatSidebar.vue   # AI聊天侧边栏
    │   ├── ChatWindow.vue      # 聊天窗口
    │   ├── MessageBubble.vue   # 消息气泡
    │   └── SessionList.vue     # 会话列表
    └── Pomodoro/
        ├── PomodoroWidget.vue  # 番茄钟小部件
        ├── FocusView.vue       # 专注模式页面
        └── PomodoroSettings.vue # 番茄钟设置
```

## 开发优先级

### 第一优先级 (MVP核心功能)
1. 基础笔记CRUD功能
2. 基础待办事项管理
3. 简单AI对话功能
4. 基础番茄钟计时

### 第二优先级 (AI增强功能)
1. AI智能归档和润色
2. AI自然语言任务解析
3. AI指令式操作
4. 上下文关联互动

### 第三优先级 (体验优化功能)
1. 主题和个性化设置
2. 数据统计和报告
3. 提醒和通知功能
4. 性能优化和缓存

## 部署架构

### 开发环境
- 前端：Vite开发服务器 (端口3000)
- 后端：FastAPI开发服务器 (端口8000)
- 数据库：本地SQLite文件

### 生产环境
- 前端：静态文件部署
- 后端：FastAPI + Uvicorn
- 数据库：PostgreSQL
- 反向代理：Nginx
- 容器化：Docker + Docker Compose

## 安全考虑

1. **API安全：** JWT认证 + CORS配置
2. **数据安全：** 输入验证 + SQL注入防护
3. **AI安全：** API密钥管理 + 请求限制
4. **隐私保护：** 本地数据存储 + 用户数据隔离

## 性能优化

1. **前端优化：** 组件懒加载 + 虚拟滚动
2. **后端优化：** 数据库索引 + 查询优化
3. **AI优化：** 请求缓存 + 批量处理
4. **网络优化：** 资源压缩 + CDN加速

