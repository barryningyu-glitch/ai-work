import { FileText, Folder, Calendar } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// 可拖拽的笔记项组件
const DraggableNote = ({ note, isSelected, onSelectNote, onPinNote, onDeleteNote, getFolderInfo, getPreviewText, formatDate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: note.id,
    data: {
      type: 'note',
      note,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const { folderName, categoryName } = getFolderInfo(note.folder_id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`notes-list-item group ${
        isSelected ? 'selected' : ''
      } ${isDragging ? 'shadow-lg' : ''}`}
      onClick={() => onSelectNote(note)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* 拖拽手柄 */}
          <div 
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="拖拽移动"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <circle cx="9" cy="12" r="1"></circle>
              <circle cx="9" cy="5" r="1"></circle>
              <circle cx="9" cy="19" r="1"></circle>
              <circle cx="15" cy="12" r="1"></circle>
              <circle cx="15" cy="5" r="1"></circle>
              <circle cx="15" cy="19" r="1"></circle>
            </svg>
          </div>
          {note.is_pinned && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400 flex-shrink-0">
              <path d="M9 9V5a3 3 0 0 1 6 0v4"></path>
              <path d="M9 9h6l1 7H8l1-7z"></path>
              <line x1="12" y1="16" x2="12" y2="21"></line>
            </svg>
          )}
          <h4 className="font-medium text-sm text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors">
            {note.title || '无标题'}
          </h4>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPinNote(note.id, !note.is_pinned)
            }}
            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-yellow-500 transition-colors"
            title={note.is_pinned ? "取消置顶" : "置顶"}
          >
            {note.is_pinned ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 9V5a3 3 0 0 1 6 0v4"></path>
                <path d="M9 9h6l1 7H8l1-7z"></path>
                <line x1="12" y1="16" x2="12" y2="21"></line>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 9V5a3 3 0 0 1 6 0v4"></path>
                <path d="M9 9h6l1 7H8l1-7z"></path>
                <line x1="12" y1="16" x2="12" y2="21"></line>
              </svg>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeleteNote(note.id)
            }}
            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500 transition-colors"
            title="删除笔记"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-2 line-clamp-2">
        {getPreviewText(note.content)}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Folder className="w-3 h-3" />
          <span>{folderName}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(note.updated_at)}</span>
        </div>
      </div>
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="note-tag">
              {tag.name}
            </span>
          ))}
          {note.tags.length > 2 && (
            <span className="note-date">
              +{note.tags.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// 可放置的文件夹组件
const DroppableFolder = ({ folder, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: folder.id,
    data: {
      type: 'folder',
      folder,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={`mb-4 ${isOver ? 'bg-sidebar-accent/20 rounded-lg p-2' : ''}`}
    >
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
        {folder.name}
      </h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  )
}

const NotesList = ({ notes, selectedNote, onSelectNote, folders, categories, onPinNote, onDeleteNote }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '未知时间'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '未知时间'
      
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return '今天'
      if (diffDays === 2) return '昨天'
      if (diffDays <= 7) return `${diffDays}天前`
      
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return '未知时间'
    }
  }

  const getFolderInfo = (folderId) => {
    const folder = folders.find(f => f.id === folderId)
    if (!folder) return { folderName: '未分类', categoryName: '其他' }
    
    const category = categories.find(c => c.id === folder.category_id)
    return {
      folderName: folder.name,
      categoryName: category?.name || '其他'
    }
  }

  const getPreviewText = (content) => {
    // 安全检查：如果content为空或undefined，返回默认文本
    if (!content || typeof content !== 'string') {
      return '暂无内容...'
    }
    
    // 移除Markdown标记并获取预览文本
    const plainText = content
      .replace(/#{1,6}\s+/g, '') // 移除标题标记
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
      .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
      .replace(/`(.*?)`/g, '$1') // 移除代码标记
      .replace(/\n+/g, ' ') // 替换换行为空格
      .trim()
    
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText
  }

  // 按日期分组笔记
  const groupedNotes = notes.reduce((groups, note) => {
    // 安全检查：确保笔记有有效的日期
    const dateString = note.updated_at || note.created_at
    if (!dateString) {
      // 如果没有日期，放到"更早"分组
      if (!groups['更早']) groups['更早'] = []
      groups['更早'].push(note)
      return groups
    }
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      // 如果日期无效，放到"更早"分组
      if (!groups['更早']) groups['更早'] = []
      groups['更早'].push(note)
      return groups
    }
    
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    let groupKey
    if (date.toDateString() === today.toDateString()) {
      groupKey = '今天'
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = '昨天'
    } else {
      const diffTime = Math.abs(today - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays <= 7) {
        groupKey = '本周'
      } else if (diffDays <= 30) {
        groupKey = '本月'
      } else {
        groupKey = '更早'
      }
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(note)
    return groups
  }, {})

  // 排序组
  const groupOrder = ['今天', '昨天', '本周', '本月', '更早']
  const sortedGroups = groupOrder.filter(group => groupedNotes[group])

  // 按文件夹分组笔记以支持拖拽
  const notesByFolder = notes.reduce((groups, note) => {
    const folderId = note.folder_id || 'uncategorized'
    if (!groups[folderId]) {
      groups[folderId] = []
    }
    groups[folderId].push(note)
    return groups
  }, {})

  return (
    <div className="p-2">
      {notes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>暂无笔记</p>
        </div>
      ) : (
        <>
          {/* 显示有文件夹的笔记 */}
          {folders.map(folder => {
            const folderNotes = notesByFolder[folder.id] || []
            if (folderNotes.length === 0) return null
            
            return (
              <DroppableFolder key={folder.id} folder={folder}>
                <SortableContext items={folderNotes.map(note => note.id)} strategy={verticalListSortingStrategy}>
                  {folderNotes.map((note) => {
                    const isSelected = selectedNote?.id === note.id
                    
                    return (
                      <DraggableNote
                        key={note.id}
                        note={note}
                        isSelected={isSelected}
                        onSelectNote={onSelectNote}
                        onPinNote={onPinNote}
                        onDeleteNote={onDeleteNote}
                        getFolderInfo={getFolderInfo}
                        getPreviewText={getPreviewText}
                        formatDate={formatDate}
                      />
                    )
                  })}
                </SortableContext>
              </DroppableFolder>
            )
          })}
          
          {/* 显示未分类的笔记 */}
          {notesByFolder['uncategorized'] && notesByFolder['uncategorized'].length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2 px-2">未分类</h3>
              <SortableContext items={notesByFolder['uncategorized'].map(note => note.id)} strategy={verticalListSortingStrategy}>
                {notesByFolder['uncategorized'].map((note) => {
                  const isSelected = selectedNote?.id === note.id
                  
                  return (
                    <DraggableNote
                      key={note.id}
                      note={note}
                      isSelected={isSelected}
                      onSelectNote={onSelectNote}
                      onPinNote={onPinNote}
                      onDeleteNote={onDeleteNote}
                      getFolderInfo={getFolderInfo}
                      getPreviewText={getPreviewText}
                      formatDate={formatDate}
                    />
                  )
                })}
              </SortableContext>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default NotesList

