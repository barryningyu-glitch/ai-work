import { useState, useEffect, useRef } from 'react'
import { 
  Plus, 
  Send, 
  Bot, 
  User, 
  MoreHorizontal,
  Trash2,
  Edit3,
  MessageSquare,
  Zap,
  Settings,
  Copy,
  RefreshCw,
  Download,
  Search,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import ChatSidebar from './ChatSidebar.jsx'
import MessageList from './MessageList.jsx'
import QuickCommands from '@/QuickCommands.jsx'

const ChatPage = () => {
  const [sessions, setSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showQuickCommands, setShowQuickCommands] = useState(false)
  const [aiModel, setAiModel] = useState('')
  const [availableModels, setAvailableModels] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef(null)

  // 获取可用模型
  const fetchAvailableModels = async () => {
    try {
      const response = await fetch('/api/ai/models')
      if (response.ok) {
        const data = await response.json()
        setAvailableModels(data.models || [])
        if (data.default_chat_model && !aiModel) {
          setAiModel(data.default_chat_model)
        }
      }
    } catch (error) {
      console.error('获取模型列表失败:', error)
    }
  }

  // 获取会话列表
  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/chat/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
        if (data.length > 0 && !currentSession) {
          setCurrentSession(data[0])
          fetchMessages(data[0].id)
        }
      }
    } catch (error) {
      console.error('获取会话列表失败:', error)
    }
  }

  // 获取会话消息
  const fetchMessages = async (sessionId) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('获取消息失败:', error)
    }
  }

  // 初始化数据
  useEffect(() => {
    fetchAvailableModels()
    fetchSessions()
  }, [])

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 创建新会话
  const handleNewSession = async () => {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '新对话'
        })
      })
      
      if (response.ok) {
        const newSession = await response.json()
        setSessions(prev => [newSession, ...prev])
        setCurrentSession(newSession)
        setMessages([])
      }
    } catch (error) {
      console.error('创建新会话失败:', error)
    }
  }

  // 切换会话
  const handleSessionChange = (session) => {
    setCurrentSession(session)
    fetchMessages(session.id)
  }

  // 删除会话
  const handleDeleteSession = async (sessionId) => {
    if (confirm('确定要删除这个对话吗？')) {
      try {
        const response = await fetch(`/api/chat/sessions/${sessionId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          const updatedSessions = sessions.filter(s => s.id !== sessionId)
          setSessions(updatedSessions)
          
          if (currentSession?.id === sessionId) {
            if (updatedSessions.length > 0) {
              setCurrentSession(updatedSessions[0])
              fetchMessages(updatedSessions[0].id)
            } else {
              setCurrentSession(null)
              setMessages([])
            }
          }
        }
      } catch (error) {
        console.error('删除会话失败:', error)
      }
    }
  }

  // 重命名会话
  const handleRenameSession = async (sessionId, newTitle) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTitle
        })
      })
      
      if (response.ok) {
        setSessions(sessions.map(s => 
          s.id === sessionId 
            ? { ...s, title: newTitle, updated_at: new Date().toISOString() }
            : s
        ))
        if (currentSession?.id === sessionId) {
          setCurrentSession({ ...currentSession, title: newTitle })
        }
      }
    } catch (error) {
      console.error('重命名会话失败:', error)
    }
  }

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // 如果没有当前会话，先创建一个
      let sessionId = currentSession?.id
      if (!sessionId) {
        const newSessionResponse = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: generateSessionTitle(userMessage.content)
          })
        })
        
        if (newSessionResponse.ok) {
          const newSession = await newSessionResponse.json()
          sessionId = newSession.id
          setCurrentSession(newSession)
          setSessions(prev => [newSession, ...prev])
        }
      }

      // 发送消息到AI
      const response = await fetch('/api/chat/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: userMessage.content,
          session_id: sessionId,
          model: aiModel
        })
      })

      if (response.ok) {
        const data = await response.json()
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, aiResponse])
        
        // 更新会话信息
        setSessions(prev => prev.map(s => 
          s.id === sessionId 
            ? { 
                ...s, 
                updated_at: new Date().toISOString(),
                message_count: (s.message_count || 0) + 2,
                title: s.title === '新对话' ? generateSessionTitle(userMessage.content) : s.title
              }
            : s
        ))
      } else {
        throw new Error('发送消息失败')
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      // 显示错误消息
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，发送消息时出现错误，请稍后重试。',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }



  // 生成会话标题
  const generateSessionTitle = (firstMessage) => {
    if (firstMessage.length > 20) {
      return firstMessage.substring(0, 20) + '...'
    }
    return firstMessage
  }

  // 处理快捷指令
  const handleQuickCommand = (command) => {
    setInputMessage(command)
    setShowQuickCommands(false)
  }

  // 复制消息
  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content)
    // 这里可以添加提示
  }

  // 重新生成响应
  const handleRegenerateResponse = (messageId) => {
    // 实现重新生成逻辑
    console.log('重新生成响应:', messageId)
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* 侧边栏 */}
      {showSidebar && (
        <ChatSidebar
          sessions={sessions}
          currentSession={currentSession}
          onSessionChange={handleSessionChange}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      )}

      {/* 主对话区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="eva-panel p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
              
              <div>
                <h2 className="font-semibold text-lg">
                  {currentSession?.title || 'AI对话助手'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentSession?.message_count || 0} 条消息 · 模型: {currentSession?.model || aiModel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={aiModel} onValueChange={setAiModel}>
                <SelectTrigger className="w-40">
                  <SelectValue 
                    placeholder="选择模型"
                    selectedValue={availableModels.find(m => m.id === aiModel)?.name || aiModel}
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuickCommands(!showQuickCommands)}
              >
                <Zap className="w-4 h-4 mr-2" />
                快捷指令
              </Button>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-hidden relative">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onCopyMessage={handleCopyMessage}
            onRegenerateResponse={handleRegenerateResponse}
          />
          <div ref={messagesEndRef} />

          {/* 快捷指令面板 */}
          {showQuickCommands && (
            <QuickCommands
              onCommandSelect={handleQuickCommand}
              onClose={() => setShowQuickCommands(false)}
            />
          )}
        </div>

        {/* 输入区域 */}
        <div className="eva-panel p-4 border-t border-border">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Textarea
                placeholder="输入你的问题... (Shift+Enter 换行，Enter 发送)"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                className="eva-input resize-none min-h-[60px] max-h-[200px] pr-12"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-2 bottom-2 eva-button"
                size="sm"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>AI助手会尽力帮助你，但请注意验证重要信息</span>
            <span>{inputMessage.length}/2000</span>
          </div>
        </div>
      </div>

      {/* 设置模态框 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="eva-panel p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">聊天设置</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">默认AI模型</label>
                <Select value={aiModel} onValueChange={setAiModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择默认模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">消息显示设置</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    显示时间戳
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    显示消息操作按钮
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    自动滚动到最新消息
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">快捷键设置</label>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Enter: 发送消息</div>
                  <div>Shift + Enter: 换行</div>
                  <div>Ctrl + /: 显示快捷指令</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                取消
              </Button>
              <Button onClick={() => setShowSettings(false)}>
                保存设置
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatPage

