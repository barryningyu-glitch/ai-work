import { useState, useEffect } from 'react'
import { 
  Plus, 
  Calendar, 
  LayoutGrid, 
  List, 
  Search,
  Filter,
  Brain,
  Clock,
  Flag,
  User,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import KanbanView from '@/KanbanView.jsx'
import CalendarView from '@/CalendarView.jsx'
import ListView from '@/ListView.jsx'
import TaskModal from './TaskModal.jsx'
import AITaskParser from '@/AITaskParser.jsx'
import { tasksAPI } from '@/utils/api.js'

const TodoPage = () => {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [tags, setTags] = useState([])
  const [currentView, setCurrentView] = useState('kanban')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showAIParser, setShowAIParser] = useState(false)

  // 统一使用后端状态定义，不再需要映射
  // 后端状态：todo, doing, done
  // 前端直接使用相同的状态值

  // 直接使用后端数据格式，无需转换

  // 加载数据
  useEffect(() => {
    loadTasks()
    loadProjects()
    loadTags()
  }, [])

  const loadTasks = async () => {
    try {
      const tasksData = await tasksAPI.getTasks()
      // 直接使用后端数据
      setTasks(tasksData)
    } catch (error) {
      console.error('加载任务失败:', error)
      // 如果API调用失败，使用模拟数据作为后备（使用后端状态格式）
      setTasks([
        {
          id: '1',
          title: '完成AI笔记模块开发',
          description: '实现笔记的CRUD功能，集成AI智能归档和文本润色',
          status: 'done',
          priority: 'high',
          category_id: '1',
          start_time: '2024-01-10T10:00:00Z',
          end_time: '2024-01-15T16:30:00Z',
          created_at: '2024-01-10T10:00:00Z',
          updated_at: '2024-01-15T16:30:00Z'
        }
      ])
    }
  }

  const loadProjects = () => {
    // 模拟项目数据 - 后续可以从API获取
    setProjects([
      { id: '1', name: 'AI工作台开发', color: '#10b981' },
      { id: '2', name: '学习计划', color: '#3b82f6' },
      { id: '3', name: '生活事务', color: '#f59e0b' }
    ])
  }

  const loadTags = () => {
    // 模拟标签数据 - 后续可以从API获取
    setTags([
      { id: '1', name: '紧急', color: '#ef4444' },
      { id: '2', name: '重要', color: '#f97316' },
      { id: '3', name: '学习', color: '#8b5cf6' },
      { id: '4', name: '工作', color: '#06b6d4' }
    ])
  }

  const handleNewTask = () => {
    setSelectedTask(null)
    setShowTaskModal(true)
  }

  const handleEditTask = (task) => {
    setSelectedTask(task)
    setShowTaskModal(true)
  }

  const handleSaveTask = async (taskData) => {
    try {
      if (selectedTask) {
        // 更新现有任务
        const updatedTask = await tasksAPI.updateTask(selectedTask.id, taskData)
        setTasks(tasks.map(task => 
          task.id === selectedTask.id ? updatedTask : task
        ))
      } else {
        // 创建新任务
        const newTask = await tasksAPI.createTask(taskData)
        setTasks([newTask, ...tasks])
      }
      setShowTaskModal(false)
    } catch (error) {
      console.error('保存任务失败:', error)
      alert('保存任务失败，请检查网络连接或稍后重试')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (confirm('确定要删除这个任务吗？')) {
      try {
        await tasksAPI.deleteTask(taskId)
        setTasks(tasks.filter(task => task.id !== taskId))
      } catch (error) {
        console.error('删除任务失败:', error)
        alert('删除任务失败，请检查网络连接或稍后重试')
      }
    }
  }

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const updatedTask = await tasksAPI.updateTask(taskId, { status: newStatus })
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ))
    } catch (error) {
      console.error('更新任务状态失败:', error)
      alert('更新任务状态失败，请检查网络连接或稍后重试')
    }
  }

  const handleAITaskCreate = async (parsedTasks) => {
    try {
      const createdTasks = []
      for (const taskData of parsedTasks) {
        try {
          const newTask = await tasksAPI.createTask(taskData)
          createdTasks.push(newTask)
        } catch (error) {
          console.error('创建任务失败:', taskData.title, error)
          // 如果单个任务创建失败，继续创建其他任务
        }
      }
      
      if (createdTasks.length > 0) {
        setTasks([...createdTasks, ...tasks])
        alert(`成功创建 ${createdTasks.length} 个任务`)
      } else {
        alert('所有任务创建失败，请检查网络连接或稍后重试')
      }
      
      setShowAIParser(false)
    } catch (error) {
      console.error('AI任务创建失败:', error)
      alert('AI任务创建失败，请检查网络连接或稍后重试')
    }
  }

  // 过滤任务
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  // 统计数据
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'doing').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    overdue: tasks.filter(t => 
      t.status !== 'done' && 
      t.end_time && new Date(t.end_time) < new Date()
    ).length
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* 顶部工具栏 */}
      <div className="eva-panel p-4 m-4 mb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-primary">智能待办事项</h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                总计: {stats.total}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                已完成: {stats.completed}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                进行中: {stats.inProgress}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                待开始: {stats.todo}
              </span>
              {stats.overdue > 0 && (
                <span className="flex items-center gap-1 text-destructive">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  逾期: {stats.overdue}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAIParser(true)} className="eva-button">
              <Brain className="w-4 h-4 mr-2" />
              AI创建任务
            </button>
            <button onClick={handleNewTask} className="eva-button">
              <Plus className="w-4 h-4 mr-2" />
              新建任务
            </button>
          </div>
        </div>

        {/* 搜索和过滤 */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索任务..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="eva-input pl-10"
            />
          </div>
          
          <select
            value={filterStatus || 'all'}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="eva-input px-3 py-2 rounded-lg"
          >
            <option value="all">所有状态</option>
            <option value="todo">待开始</option>
            <option value="doing">进行中</option>
            <option value="done">已完成</option>
          </select>
          
          <select
            value={filterPriority || 'all'}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="eva-input px-3 py-2 rounded-lg"
          >
            <option value="all">所有优先级</option>
            <option value="high">高优先级</option>
            <option value="medium">中优先级</option>
            <option value="low">低优先级</option>
          </select>
        </div>
      </div>

      {/* 视图切换和内容 */}
      <div className="flex-1 p-4 pt-0">
        <Tabs value={currentView} onValueChange={setCurrentView} className="h-full">
          <TabsList className="eva-panel mb-4">
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              看板视图
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              日历视图
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              列表视图
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="h-[calc(100%-3rem)]">
            <KanbanView
              tasks={filteredTasks}
              projects={projects}
              tags={tags}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onUpdateStatus={handleUpdateTaskStatus}
            />
          </TabsContent>

          <TabsContent value="calendar" className="h-[calc(100%-3rem)]">
            <CalendarView
              tasks={filteredTasks}
              projects={projects}
              onEditTask={handleEditTask}
              onNewTask={handleNewTask}
            />
          </TabsContent>

          <TabsContent value="list" className="h-[calc(100%-3rem)]">
            <ListView
              tasks={filteredTasks}
              projects={projects}
              tags={tags}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onUpdateStatus={handleUpdateTaskStatus}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* 任务编辑弹窗 */}
      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          projects={projects}
          tags={tags}
          onSave={handleSaveTask}
          onCancel={() => setShowTaskModal(false)}
        />
      )}

      {/* AI任务解析弹窗 */}
      {showAIParser && (
        <AITaskParser
          projects={projects}
          tags={tags}
          onCreateTasks={handleAITaskCreate}
          onCancel={() => setShowAIParser(false)}
        />
      )}
    </div>
  )
}

export default TodoPage

