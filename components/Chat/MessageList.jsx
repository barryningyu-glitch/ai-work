import { useState } from 'react'
import { 
  Bot, 
  User, 
  Copy, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown,
  MoreHorizontal,
  Code,
  Download,
  Share
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

const MessageList = ({ messages, isLoading, onCopyMessage, onRegenerateResponse, isMobile = false }) => {
  const [copiedMessageId, setCopiedMessageId] = useState(null)
  const [likedMessages, setLikedMessages] = useState(new Set())
  const [dislikedMessages, setDislikedMessages] = useState(new Set())
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareMessage, setShareMessage] = useState(null)

  // 复制消息内容
  const handleCopy = async (messageId, content) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  // 处理好评
  const handleLike = (messageId) => {
    const newLikedMessages = new Set(likedMessages)
    const newDislikedMessages = new Set(dislikedMessages)
    
    if (likedMessages.has(messageId)) {
      newLikedMessages.delete(messageId)
    } else {
      newLikedMessages.add(messageId)
      newDislikedMessages.delete(messageId) // 移除差评
    }
    
    setLikedMessages(newLikedMessages)
    setDislikedMessages(newDislikedMessages)
    
    // 这里可以添加API调用来保存评价
    console.log('好评消息:', messageId, !likedMessages.has(messageId))
  }

  // 处理差评
  const handleDislike = (messageId) => {
    const newLikedMessages = new Set(likedMessages)
    const newDislikedMessages = new Set(dislikedMessages)
    
    if (dislikedMessages.has(messageId)) {
      newDislikedMessages.delete(messageId)
    } else {
      newDislikedMessages.add(messageId)
      newLikedMessages.delete(messageId) // 移除好评
    }
    
    setLikedMessages(newLikedMessages)
    setDislikedMessages(newDislikedMessages)
    
    // 这里可以添加API调用来保存评价
    console.log('差评消息:', messageId, !dislikedMessages.has(messageId))
  }

  // 处理分享
  const handleShare = (message) => {
    setShareMessage(message)
    setShowShareModal(true)
  }

  // 分享到剪贴板
  const shareToClipboard = async () => {
    if (!shareMessage) return
    
    const shareText = `AI助手回复：\n\n${shareMessage.content}\n\n来自个人工作台`
    try {
      await navigator.clipboard.writeText(shareText)
      alert('已复制到剪贴板')
      setShowShareModal(false)
    } catch (error) {
      console.error('分享失败:', error)
    }
  }

  // 格式化时间
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 简单的Markdown渲染函数
  const renderMarkdown = (content) => {
    // 简单处理一些基本的Markdown语法
    let html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
    
    // 包装在段落中
    if (!html.includes('<h') && !html.includes('<li')) {
      html = `<p class="mb-4 leading-relaxed">${html}</p>`
    }
    
    return html
  }

  const MessageBubble = ({ message, isLast }) => {
    const isUser = message.role === 'user'
    const isAssistant = message.role === 'assistant'

    return (
      <div className={`flex gap-4 p-4 ${isUser ? 'bg-accent/30' : ''}`}>
        {/* 头像 */}
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
          ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}
        `}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* 消息内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">
              {isUser ? '你' : 'AI助手'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
          </div>

          <div className="prose prose-sm max-w-none dark:prose-invert">
            {isUser ? (
              <p className="whitespace-pre-wrap mb-4 leading-relaxed">{message.content}</p>
            ) : (
              <div 
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
              />
            )}
          </div>

          {/* 消息操作 */}
          <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(message.id, message.content)}
              className="h-7 px-2"
            >
              {copiedMessageId === message.id ? (
                <span className="text-xs text-green-400">已复制</span>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  <span className="text-xs">复制</span>
                </>
              )}
            </Button>

            {isAssistant && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRegenerateResponse(message.id)}
                  className="h-7 px-2"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  <span className="text-xs">重新生成</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(message.id)}
                  className={`h-7 px-2 ${likedMessages.has(message.id) ? 'text-green-500' : ''}`}
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  <span className="text-xs">好评</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDislike(message.id)}
                  className={`h-7 px-2 ${dislikedMessages.has(message.id) ? 'text-red-500' : ''}`}
                >
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  <span className="text-xs">差评</span>
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare(message)}
              className="h-7 px-2"
            >
              <Share className="w-3 h-3 mr-1" />
              <span className="text-xs">分享</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center p-4">
          <div>
            <Bot className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} mx-auto mb-4 text-muted-foreground opacity-50`} />
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium mb-2`}>开始新的对话</h3>
            <p className={`text-muted-foreground max-w-md ${isMobile ? 'text-sm' : ''}`}>
              我是你的AI助手，可以帮助你解答问题、分析问题、提供建议。
              有什么我可以帮助你的吗？
            </p>
            
            {/* 建议问题 */}
            <div className="mt-4 lg:mt-6 space-y-2">
              <p className="text-xs lg:text-sm text-muted-foreground">你可以尝试问我：</p>
              <div className={`flex flex-wrap gap-2 justify-center ${isMobile ? 'max-w-xs mx-auto' : ''}`}>
                {[
                  '如何提高工作效率？',
                  '解释一下React Hooks',
                  '帮我制定学习计划',
                  '分析这个项目架构'
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    className={`px-2 lg:px-3 py-1 bg-muted hover:bg-accent rounded-full text-xs transition-colors ${
                      isMobile ? 'text-xs' : ''
                    }`}
                    onClick={() => {
                      // 这里可以触发发送建议问题的逻辑
                      console.log('建议问题:', suggestion)
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`space-y-4 lg:space-y-6 ${isMobile ? 'p-3' : 'p-6'}`}>
          {messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex gap-3 lg:gap-4 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* AI头像 */}
              {message.role === 'assistant' && (
                <div className={`flex-shrink-0 ${isMobile ? 'w-7 h-7' : 'w-8 h-8'} rounded-full bg-primary/20 flex items-center justify-center`}>
                  <Bot className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary`} />
                </div>
              )}

              {/* 消息内容 */}
              <div className={`flex-1 ${message.role === 'user' ? 'max-w-[80%]' : 'max-w-[85%]'} ${isMobile ? 'max-w-[90%]' : ''}`}>
                <div
                  className={`
                    ${isMobile ? 'p-3 text-sm' : 'p-4'} rounded-lg
                    ${message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                    }
                  `}
                >
                  {/* 消息内容渲染 */}
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {renderMarkdown(message.content)}
                  </div>

                  {/* 时间戳 */}
                  <div className={`${isMobile ? 'text-xs mt-2' : 'text-xs mt-3'} opacity-70`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>

                {/* AI消息操作按钮 */}
                {message.role === 'assistant' && (
                  <div className={`flex items-center gap-1 lg:gap-2 ${isMobile ? 'mt-2' : 'mt-3'}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(message.id, message.content)}
                      className={`${isMobile ? 'h-7 px-2' : 'h-8 px-3'} text-xs`}
                    >
                      <Copy className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
                      {copiedMessageId === message.id ? '已复制' : '复制'}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRegenerateResponse(message.id)}
                      className={`${isMobile ? 'h-7 px-2' : 'h-8 px-3'} text-xs`}
                    >
                      <RefreshCw className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
                      重新生成
                    </Button>

                    {!isMobile && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(message.id)}
                          className={`h-8 px-3 text-xs ${
                            likedMessages.has(message.id) ? 'text-green-600' : ''
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          好评
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDislike(message.id)}
                          className={`h-8 px-3 text-xs ${
                            dislikedMessages.has(message.id) ? 'text-red-600' : ''
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4 mr-1" />
                          差评
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(message)}
                          className="h-8 px-3 text-xs"
                        >
                          <Share className="w-4 h-4 mr-1" />
                          分享
                        </Button>
                      </>
                    )}

                    {isMobile && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(message.id)}
                          className={`h-7 w-7 p-0 ${
                            likedMessages.has(message.id) ? 'text-green-600' : ''
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDislike(message.id)}
                          className={`h-7 w-7 p-0 ${
                            dislikedMessages.has(message.id) ? 'text-red-600' : ''
                          }`}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 用户头像 */}
              {message.role === 'user' && (
                <div className={`flex-shrink-0 ${isMobile ? 'w-7 h-7' : 'w-8 h-8'} rounded-full bg-primary flex items-center justify-center`}>
                  <User className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary-foreground`} />
                </div>
              )}
            </div>
          ))}

          {/* 加载状态 */}
          {isLoading && (
            <div className="flex gap-3 lg:gap-4 justify-start">
              <div className={`flex-shrink-0 ${isMobile ? 'w-7 h-7' : 'w-8 h-8'} rounded-full bg-primary/20 flex items-center justify-center`}>
                <Bot className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary`} />
              </div>
              <div className={`${isMobile ? 'p-3' : 'p-4'} bg-muted rounded-lg`}>
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>AI正在思考...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 分享模态框 */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`eva-panel ${isMobile ? 'p-4 max-w-sm' : 'p-6 max-w-md'} w-full`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>分享消息</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShareModal(false)}
              >
                ×
              </Button>
            </div>

            <div className={`${isMobile ? 'text-sm' : ''} mb-4`}>
              <p className="text-muted-foreground mb-2">选择分享方式：</p>
              <div className="space-y-2">
                <Button
                  onClick={shareToClipboard}
                  className="w-full justify-start"
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                >
                  <Copy className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
                  复制到剪贴板
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowShareModal(false)}
                size={isMobile ? "sm" : "default"}
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageList

