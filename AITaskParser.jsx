import { useState } from 'react'
import { 
  Brain, 
  Wand2, 
  X, 
  CheckCircle2,
  Calendar,
  Flag,
  FolderOpen,
  Tag,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { aiAPI } from '@/utils/api.js'

const AITaskParser = ({ projects, tags, onCreateTasks, onCancel }) => {
  const [inputText, setInputText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [parsedTasks, setParsedTasks] = useState([])
  const [showResults, setShowResults] = useState(false)

  // 智能选择项目
  const selectProject = (category, title, description) => {
    if (!projects || projects.length === 0) return ''
    
    // 根据分类和内容智能匹配项目
    const content = `${title} ${description} ${category}`.toLowerCase()
    
    // 查找最匹配的项目
    let bestMatch = projects[0] // 默认第一个项目
    let maxScore = 0
    
    projects.forEach(project => {
      const projectName = project.name.toLowerCase()
      let score = 0
      
      // 直接匹配项目名称
      if (content.includes(projectName)) {
        score += 10
      }
      
      // 关键词匹配
      if (projectName.includes('工作') || projectName.includes('开发')) {
        if (content.includes('工作') || content.includes('开发') || content.includes('项目') || content.includes('会议')) {
          score += 5
        }
      }
      
      if (projectName.includes('学习')) {
        if (content.includes('学习') || content.includes('教程') || content.includes('课程') || content.includes('阅读')) {
          score += 5
        }
      }
      
      if (projectName.includes('生活')) {
        if (content.includes('生活') || content.includes('购物') || content.includes('健康') || content.includes('家务')) {
          score += 5
        }
      }
      
      if (score > maxScore) {
        maxScore = score
        bestMatch = project
      }
    })
    
    return bestMatch.id
  }

  // 真正的AI解析任务函数
  const analyzeText = async (text) => {
    setIsAnalyzing(true)
    
    try {
      console.log('🤖 开始AI解析任务:', text)
      
      // 调用真正的AI API
      const response = await aiAPI.parseTask({
        text: text,
        context: {
          projects: projects.map(p => ({ id: p.id, name: p.name })),
          current_time: new Date().toISOString(),
          split_tasks: true // 启用任务拆分
        }
      })
      console.log('🤖 AI解析结果:', response)
      
      if (!response || typeof response !== 'object') {
        throw new Error('AI返回的数据格式不正确')
      }

      // 处理AI返回的任务列表（可能是单个任务或多个任务）
      const tasks = Array.isArray(response.tasks) ? response.tasks : [response]
      
      const parsedTasks = tasks.map((task, taskIndex) => {
        return {
          title: task.title || `任务 ${taskIndex + 1}`,
          description: task.description || '',
          status: 'todo',
          priority: task.priority || 'medium',
          project_id: selectProject(task.category, task.title, task.description),
          start_time: task.start_time ? new Date(task.start_time).toISOString() : null,
          end_time: task.end_time ? new Date(task.end_time).toISOString() : null,
          category: task.category || '',
          time_range: task.time_range || 'flexible', // 新增时间范围类型
          tags: task.tags ? task.tags.map((tag, index) => ({ 
            id: `tag_${taskIndex}_${index}`, 
            name: tag 
          })) : [],
          subtasks: task.subtasks ? task.subtasks.map((subtask, index) => ({
            id: `sub_${taskIndex}_${index}`,
            title: subtask,
            completed: false
          })) : []
        }
      })
      
      setParsedTasks(parsedTasks)
      setShowResults(true)
      
    } catch (error) {
      console.error('❌ AI解析失败:', error)
      alert('AI解析失败，请检查网络连接或稍后重试')
    }
    
    setIsAnalyzing(false)
  }

  const handleAnalyze = () => {
    if (!inputText.trim()) {
      alert('请输入要解析的文本')
      return
    }
    analyzeText(inputText)
  }

  const handleCreateTasks = () => {
    onCreateTasks(parsedTasks)
  }

  const handleEditTask = (index, field, value) => {
    const updatedTasks = [...parsedTasks]
    updatedTasks[index] = { ...updatedTasks[index], [field]: value }
    setParsedTasks(updatedTasks)
  }

  const handleRemoveTask = (index) => {
    setParsedTasks(parsedTasks.filter((_, i) => i !== index))
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getProjectInfo = (projectId) => {
    return projects.find(p => p.id === projectId)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="eva-panel w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold">AI智能任务解析</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {!showResults ? (
          /* 输入阶段 */
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                输入任务描述（支持自然语言）
              </label>
              <Textarea
                placeholder="例如：
明天下午3点开会讨论项目进度，需要准备PPT和数据报告
下周五之前完成用户手册的编写，包括功能介绍和使用指南
紧急：修复登录页面的bug，优先级高
学习React新特性，包括Hooks和Context API"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="eva-input h-40"
              />
              <p className="text-xs text-muted-foreground mt-2">
                AI将自动识别任务标题、描述、优先级、截止日期等信息
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button onClick={onCancel} variant="outline">
                取消
              </Button>
              <Button 
                onClick={handleAnalyze} 
                className="eva-button"
                disabled={isAnalyzing || !inputText.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI分析中...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    开始解析
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* 结果阶段 */
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AI解析结果
                </h4>
                <p className="text-sm text-muted-foreground">
                  {parsedTasks.length === 1 
                    ? "AI识别出 1 个任务" 
                    : `AI智能拆分为 ${parsedTasks.length} 个独立任务`}，您可以编辑后批量创建
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowResults(false)}
                  variant="outline"
                  size="sm"
                >
                  重新解析
                </Button>
                {parsedTasks.length > 1 && (
                  <Button 
                    onClick={() => {
                      // 批量设置所有任务的截止日期
                      const today = new Date()
                      const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
                      const dueDate = threeDaysLater.toISOString().split('T')[0]
                      
                      const updatedTasks = parsedTasks.map(task => ({
                        ...task,
                        due_date: task.due_date || dueDate,
                        time_range: task.time_range || 'deadline'
                      }))
                      setParsedTasks(updatedTasks)
                    }}
                    variant="outline"
                    size="sm"
                    className="text-primary"
                  >
                    批量设置截止日期
                  </Button>
                )}
              </div>
            </div>

            {/* 解析的任务列表 */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {parsedTasks.map((task, index) => {
                const project = getProjectInfo(task.project_id)
                
                return (
                  <div key={index} className="eva-panel p-4 border border-border relative">
                    {/* 任务编号标识 */}
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={task.title}
                            onChange={(e) => handleEditTask(index, 'title', e.target.value)}
                            className="eva-input font-medium text-lg flex-1"
                            placeholder={`任务 ${index + 1} 标题...`}
                          />
                          {parsedTasks.length > 1 && (
                            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                              子任务 {index + 1}
                            </div>
                          )}
                        </div>
                        <textarea
                          value={task.description}
                          onChange={(e) => handleEditTask(index, 'description', e.target.value)}
                          className="eva-input w-full h-16 text-sm"
                          placeholder="任务描述..."
                        />
                      </div>
                      <Button
                        onClick={() => handleRemoveTask(index)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive ml-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* 任务属性 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">优先级</label>
                        <select
                          value={task.priority || 'medium'}
                          onChange={(e) => handleEditTask(index, 'priority', e.target.value)}
                          className="eva-input text-sm w-full"
                        >
                          <option value="low">低优先级</option>
                          <option value="medium">中优先级</option>
                          <option value="high">高优先级</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">状态</label>
                        <select
                          value={task.status || 'todo'}
                          onChange={(e) => handleEditTask(index, 'status', e.target.value)}
                          className="eva-input text-sm w-full"
                        >
                          <option value="todo">待开始</option>
                          <option value="in_progress">进行中</option>
                          <option value="completed">已完成</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">项目</label>
                        <select
                          value={task.project_id || ''}
                          onChange={(e) => handleEditTask(index, 'project_id', e.target.value)}
                          className="eva-input text-sm w-full"
                        >
                          <option value="">选择项目</option>
                          {projects && projects.map(project => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 时间设置 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">时间范围</label>
                        <select
                          value={task.time_range || 'flexible'}
                          onChange={(e) => handleEditTask(index, 'time_range', e.target.value)}
                          className="eva-input text-sm w-full"
                        >
                          <option value="flexible">灵活时间</option>
                          <option value="specific">具体时间</option>
                          <option value="deadline">仅截止日期</option>
                        </select>
                      </div>

                      {task.time_range === 'specific' && (
                        <>
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">开始时间</label>
                            <input
                              type="datetime-local"
                              value={task.start_time ? task.start_time.slice(0, 16) : ''}
                              onChange={(e) => handleEditTask(index, 'start_time', e.target.value ? new Date(e.target.value).toISOString() : '')}
                              className="eva-input text-sm w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">结束时间</label>
                            <input
                              type="datetime-local"
                              value={task.end_time ? task.end_time.slice(0, 16) : ''}
                              onChange={(e) => handleEditTask(index, 'end_time', e.target.value ? new Date(e.target.value).toISOString() : '')}
                              className="eva-input text-sm w-full"
                            />
                          </div>
                        </>
                      )}

                      {(task.time_range === 'deadline' || task.time_range === 'flexible') && (
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">截止日期</label>
                          <input
                            type="date"
                            value={task.due_date || ''}
                            onChange={(e) => handleEditTask(index, 'due_date', e.target.value)}
                            className="eva-input text-sm w-full"
                          />
                        </div>
                      )}
                    </div>

                    {/* 任务信息展示 */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Flag className={`w-3 h-3 ${getPriorityColor(task.priority)}`} />
                        <span className={getPriorityColor(task.priority)}>
                          {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}优先级
                        </span>
                      </div>

                      {project && (
                        <div className="flex items-center gap-1">
                          <FolderOpen className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{project.name}</span>
                        </div>
                      )}

                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {new Date(task.due_date).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                      )}

                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {task.tags.map(tag => tag.name).join(', ')}
                          </span>
                        </div>
                      )}

                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {task.subtasks.length} 个子任务
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 底部操作 */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                {parsedTasks.length > 1 ? (
                  <div className="flex items-center gap-4">
                    <span>共 {parsedTasks.length} 个任务</span>
                    <span>•</span>
                    <span>{parsedTasks.filter(t => t.priority === 'high').length} 个高优先级</span>
                    <span>•</span>
                    <span>{parsedTasks.filter(t => t.due_date).length} 个有截止日期</span>
                  </div>
                ) : (
                  <span>1 个任务待创建</span>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button onClick={onCancel} variant="outline">
                  取消
                </Button>
                <Button 
                  onClick={handleCreateTasks} 
                  className="eva-button"
                  disabled={parsedTasks.length === 0}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {parsedTasks.length === 1 
                    ? "创建任务" 
                    : `批量创建 ${parsedTasks.length} 个任务`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AITaskParser

