import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link,
  Eye,
  Edit3,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import AIPolishModal from './AIPolishModal.jsx'

const NoteEditor = ({ note, isEditing, onChange }) => {
  console.log('📝 NoteEditor 渲染:', { 
    note, 
    isEditing, 
    noteTitle: note?.title,
    noteContent: note?.content,
    contentLength: note?.content?.length || 0,
    contentPreview: note?.content?.substring(0, 50) || '无内容',
    noteType: typeof note,
    noteKeys: note ? Object.keys(note) : [],
    hasContent: !!note?.content,
    contentType: typeof note?.content
  })
  
  // 添加useEffect来监听note变化
  useEffect(() => {
    console.log('🔄 NoteEditor useEffect - note变化:', {
      note,
      hasNote: !!note,
      title: note?.title,
      content: note?.content,
      contentLength: note?.content?.length || 0
    })
  }, [note])
  
  const [showPreview, setShowPreview] = useState(false)
  const [showPolishModal, setShowPolishModal] = useState(false)
  const [selectedText, setSelectedText] = useState('')

  // 确保note对象存在
  if (!note) {
    console.warn('⚠️ NoteEditor: note 对象为空')
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p>请选择一篇笔记</p>
        </div>
      </div>
    )
  }

  const handleTitleChange = (e) => {
    onChange({
      ...note,
      title: e.target.value
    })
  }

  const handleContentChange = (e) => {
    onChange({
      ...note,
      content: e.target.value
    })
  }

  const insertMarkdown = (before, after = '') => {
    const textarea = document.getElementById('note-content')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = note.content.substring(start, end)
    
    const newContent = 
      note.content.substring(0, start) +
      before + selectedText + after +
      note.content.substring(end)
    
    onChange({
      ...note,
      content: newContent
    })

    // 重新设置光标位置
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      )
    }, 0)
  }

  const formatMarkdown = (content) => {
    // 简单的Markdown渲染
    return content
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 italic my-2">$1</blockquote>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\n/g, '<br>')
  }

  const handlePolishText = () => {
    const textarea = document.getElementById('note-content')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    let textToPolish = ''
    if (start !== end) {
      // 有选中文本，润色选中部分
      textToPolish = note.content.substring(start, end)
    } else {
      // 没有选中文本，润色全部内容
      textToPolish = note.content || ''
    }
    
    if (!textToPolish.trim()) {
      alert('请先输入或选择要润色的文本')
      return
    }
    
    setSelectedText(textToPolish)
    setShowPolishModal(true)
  }

  const handlePolishApply = (polishedText) => {
    const textarea = document.getElementById('note-content')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    let newContent = ''
    if (start !== end) {
      // 替换选中的文本
      newContent = 
        note.content.substring(0, start) +
        polishedText +
        note.content.substring(end)
    } else {
      // 替换全部内容
      newContent = polishedText
    }
    
    onChange({
      ...note,
      content: newContent
    })
    
    setShowPolishModal(false)
  }

  if (!isEditing) {
    // 只读模式
    console.log('📖 只读模式渲染:', { 
      noteContent: note.content, 
      contentLength: note.content?.length || 0,
      hasContent: !!note.content
    })
    
    return (
      <div className="h-full">
        {/* 标题显示 */}
        <div className="mb-4 p-4 eva-panel">
          <h1 className="text-2xl font-bold text-white">{note.title || '无标题'}</h1>
        </div>
        
        {/* 内容显示 */}
        <div className="eva-panel p-6 h-full overflow-y-auto">
          {note.content ? (
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: formatMarkdown(note.content) 
              }}
            />
          ) : (
            <div className="text-center text-gray-400 mt-8">
              <p>暂无内容</p>
              <p className="text-sm mt-2">点击编辑按钮开始编写笔记</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* 标题输入 */}
      <div className="mb-4">
        <Input
          placeholder="输入笔记标题..."
          value={note.title}
          onChange={handleTitleChange}
          className="eva-input text-lg font-semibold"
        />
      </div>

      {/* 工具栏 */}
      <div className="flex items-center gap-2 mb-4 p-2 eva-panel rounded-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('**', '**')}
          title="粗体"
        >
          <Bold className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('*', '*')}
          title="斜体"
        >
          <Italic className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('`', '`')}
          title="代码"
        >
          <Code className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-4 bg-border mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('# ', '')}
          title="标题"
          className="text-white"
        >
          H1
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('## ', '')}
          title="副标题"
          className="text-white"
        >
          H2
        </Button>
        
        <div className="w-px h-4 bg-border mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('* ', '')}
          title="无序列表"
        >
          <List className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('1. ', '')}
          title="有序列表"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('> ', '')}
          title="引用"
        >
          <Quote className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-4 bg-border mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePolishText}
          title="AI润色 - 选中文本润色选中部分，未选中则润色全文"
          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
        >
          <Sparkles className="w-4 h-4" />
          润色
        </Button>
        
        <div className="flex-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className={`${showPreview ? 'bg-primary/20' : ''} text-white`}
        >
          {showPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPreview ? '编辑' : '预览'}
        </Button>
      </div>

      {/* 编辑区域 */}
      <div className="flex-1 eva-panel p-4">
        {showPreview ? (
          <div 
            className="h-full overflow-y-auto prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: formatMarkdown(note.content || '<span class="text-gray-300">开始输入内容...</span>') 
            }}
          />
        ) : (
          <Textarea
            id="note-content"
            placeholder="开始输入笔记内容...

支持Markdown语法：
# 标题
## 副标题
**粗体** *斜体*
`代码`
> 引用
* 列表项
1. 有序列表"
            value={note.content}
            onChange={handleContentChange}
            className="eva-input h-full resize-none font-mono"
          />
        )}
      </div>

      {/* AI润色弹窗 */}
      <AIPolishModal
        isOpen={showPolishModal}
        onClose={() => setShowPolishModal(false)}
        originalText={selectedText}
        onApply={handlePolishApply}
      />
    </div>
  )
}

export default NoteEditor

