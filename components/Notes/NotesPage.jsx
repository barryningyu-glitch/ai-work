import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  FileText, 
  Plus, 
  Search, 
  FolderPlus, 
  Folder,
  Tag,
  Brain,
  Sparkles,
  Save,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  Edit,
  Pin,
  PinOff
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import NotesList from './NotesList.jsx'
import NoteEditor from './NoteEditor.jsx'
import AISuggestionModal from '@/AISuggestionModal.jsx'
import AIPolishModal from './AIPolishModal.jsx'
import { notesAPI, aiAPI } from '../../utils/api.js'

// 可拖拽的文件夹组件
const DraggableFolder = ({ folder, isSelected, onSelectFolder, notes, editingFolderId, setEditingFolderId, editingFolderName, setEditingFolderName, handleSaveFolder, handleDeleteFolder }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: folder.id,
    data: {
      type: 'folder',
      folder,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const folderNoteCount = notes.filter(note => note.folder_id === folder.id).length
  const isEditing = editingFolderId === folder.id

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center justify-between p-2 rounded-lg hover:bg-sidebar-accent cursor-pointer group transition-all duration-200 ${
        isSelected ? 'bg-sidebar-accent border border-primary' : ''
      } ${isDragging ? 'shadow-lg bg-sidebar-accent' : ''}`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div {...listeners}>
          <Folder className="w-3 h-3 lg:w-4 lg:h-4 text-primary flex-shrink-0" />
        </div>
        {isEditing ? (
          <Input
            value={editingFolderName}
            onChange={(e) => setEditingFolderName(e.target.value)}
            onBlur={() => handleSaveFolder(folder.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveFolder(folder.id)
              } else if (e.key === 'Escape') {
                setEditingFolderId(null)
                setEditingFolderName('')
              }
            }}
            className="h-6 text-xs bg-transparent border-none p-0 focus:ring-0 text-gray-200"
            autoFocus
          />
        ) : (
          <span 
            className="text-xs lg:text-sm text-gray-200 truncate flex-1"
            onClick={() => onSelectFolder(folder.id)}
          >
            {folder.name}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 group-hover:text-gray-400">
          {folderNoteCount}
        </span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setEditingFolderId(folder.id)
              setEditingFolderName(folder.name)
            }}
            className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-gray-200"
            title="编辑文件夹"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteFolder(folder.id)
            }}
            className="p-1 hover:bg-red-600 rounded text-gray-400 hover:text-red-400"
            title="删除文件夹"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

// 可放置的分类组件
const DroppableCategory = ({ category, children, isOver }) => {
  const { setNodeRef } = useDroppable({
    id: category.id,
    data: {
      type: 'category',
      category,
    },
  })

  return (
    <div 
      ref={setNodeRef}
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOver ? 'bg-sidebar-accent/20 rounded-lg' : ''
      }`}
    >
      <div className="space-y-1 ml-4 lg:ml-6">
        {children}
      </div>
    </div>
  )
}

const NotesPage = () => {
  const [notes, setNotes] = useState([])
  const [categories, setCategories] = useState([])
  const [folders, setFolders] = useState([])
  const [tags, setTags] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAISuggestion, setShowAISuggestion] = useState(false)
  const [currentNoteData, setCurrentNoteData] = useState({ title: '', content: '' })
  const [loading, setLoading] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState(null)
  const [collapsedCategories, setCollapsedCategories] = useState({})
  
  // 润色弹窗相关状态
  const [showPolishModal, setShowPolishModal] = useState(false)
  const [originalText, setOriginalText] = useState('')
  const [polishedText, setPolishedText] = useState('')
  const [polishLoading, setPolishLoading] = useState(false)

  // 加载数据
  useEffect(() => {
    loadNotesData()
    loadTags()
  }, [])

  const loadNotesData = async () => {
    try {
      setLoading(true)
      
      // 同时获取树状结构和完整笔记列表
      const [treeData, notesListData] = await Promise.all([
        notesAPI.getNotesTree(),
        notesAPI.getNotes()
      ])
      
      // 解析树状数据
      const categoriesData = []
      const foldersData = []
      
      treeData.forEach(category => {
        categoriesData.push({
          id: category.id,
          name: category.name
        })
        
        category.children.forEach(folder => {
          foldersData.push({
            id: folder.id,
            name: folder.name,
            category_id: category.id
          })
        })
      })
      
      console.log('📊 获取到的笔记数据:', { notesListData, count: notesListData?.length })
      setCategories(categoriesData)
      setFolders(foldersData)
      setNotes(notesListData || [])
    } catch (error) {
      console.error('加载笔记数据失败:', error)
      // 如果API失败，使用默认数据
      setCategories([
        { id: '1', name: '工作' },
        { id: '2', name: '学习' },
        { id: '3', name: '生活' }
      ])
      setFolders([
        { id: '1', name: 'React开发', category_id: '2' },
        { id: '2', name: '项目管理', category_id: '1' },
        { id: '3', name: '读书笔记', category_id: '2' },
        { id: '4', name: '日常记录', category_id: '3' }
      ])
      setNotes([])
    } finally {
      setLoading(false)
    }
  }

  const loadTags = async () => {
    try {
      const tagsData = await notesAPI.getTags()
      setTags(tagsData || [])
    } catch (error) {
      console.error('加载标签失败:', error)
      // 如果是认证错误，不显示错误，只是设置空数组
      if (error.message && error.message.includes('401')) {
        console.log('需要登录才能获取标签')
      }
      setTags([])
    }
  }

  const handleNewNote = () => {
    setSelectedNote(null)
    setCurrentNoteData({ title: '', content: '' })
    setIsEditing(true)
  }

  const handleSelectNote = async (note) => {
    console.log('🎯 点击笔记:', note)
    console.log('🔍 笔记内容:', note.content)
    
    // 立即设置选中状态和编辑状态
    setSelectedNote(note)
    setIsEditing(false)
    setLoading(true)
    
    // 检查token状态
    const token = localStorage.getItem('token')
    console.log('🔑 当前token状态:', {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : '无token'
    })
    
    try {
      // 从API获取完整的笔记内容
      console.log('🔍 正在获取笔记详情，ID:', note.id)
      const fullNote = await notesAPI.getNote(note.id)
      console.log('🔄 API返回的完整笔记:', fullNote)
      console.log('📝 笔记内容长度:', fullNote?.content?.length || 0)
      console.log('📝 笔记内容预览:', fullNote?.content?.substring(0, 100) || '无内容')
      
      // 更新为完整数据
      setSelectedNote(fullNote)
      setCurrentNoteData({ 
        title: fullNote.title || '', 
        content: fullNote.content || '' 
      })
      console.log('✅ 状态已更新为完整笔记数据:', {
        title: fullNote.title,
        contentLength: fullNote.content?.length || 0,
        currentNoteData: { 
          title: fullNote.title || '', 
          content: fullNote.content || '' 
        }
      })
    } catch (error) {
      console.error('❌ 加载笔记详情失败:', error)
      console.error('❌ 错误详情:', error.response?.data || error.message)
      
      // 检查是否是认证错误
      if (error.message.includes('401') || error.message.includes('403') || error.message.includes('Could not validate credentials')) {
        console.warn('🔑 检测到认证错误，可能需要重新登录')
        // 显示重新登录提示
        alert('登录已过期，请刷新页面重新登录以查看完整笔记内容')
      }
      
      // API失败时，使用基本信息
      const fallbackData = { 
        title: note.title || '', 
        content: note.content || '' 
      }
      setCurrentNoteData(fallbackData)
      console.log('⚠️ 使用基本笔记信息作为备选:', fallbackData)
    } finally {
      setLoading(false)
      console.log('🏁 handleSelectNote 完成')
    }
  }

  const handleEditNote = () => {
    setIsEditing(true)
  }

  const handleSaveNote = () => {
    if (!currentNoteData.title.trim()) {
      alert('请输入笔记标题')
      return
    }

    // 如果内容不为空，显示AI建议弹窗
    if (currentNoteData.content.trim()) {
      setShowAISuggestion(true)
    } else {
      // 直接保存
      saveNote()
    }
  }

  const saveNote = async (aiSuggestion = null) => {
    try {
      setLoading(true)
      
      const noteData = {
        title: currentNoteData.title,
        content: currentNoteData.content
      }

      console.log('🔍 保存笔记 - 初始状态:', {
        selectedNote: selectedNote?.id,
        selectedFolderId,
        aiSuggestion,
        foldersCount: folders.length,
        firstFolderId: folders[0]?.id
      })

      // 确保总是有有效的folder_id
      let finalFolderId = null

      // 1. 优先使用AI建议的文件夹
      if (aiSuggestion?.folder_id) {
        const validFolder = folders.find(f => f.id === aiSuggestion.folder_id)
        if (validFolder) {
          finalFolderId = aiSuggestion.folder_id
          console.log('📁 使用AI建议的文件夹:', aiSuggestion.folder_id)
        }
      }

      // 2. 如果AI建议无效，使用用户选择的文件夹
      if (!finalFolderId && selectedFolderId) {
        const validFolder = folders.find(f => f.id === selectedFolderId)
        if (validFolder) {
          finalFolderId = selectedFolderId
          console.log('📁 使用用户选择的文件夹:', selectedFolderId)
        }
      }

      // 3. 如果都没有，使用第一个有效的文件夹
      if (!finalFolderId && folders.length > 0) {
        const firstValidFolder = folders.find(f => f.id && f.id.trim())
        if (firstValidFolder) {
          finalFolderId = firstValidFolder.id
          console.log('📁 使用默认文件夹:', firstValidFolder.id)
        }
      }

      // 4. 如果仍然没有文件夹，创建一个默认文件夹
      if (!finalFolderId) {
        console.warn('⚠️ 没有找到有效文件夹，尝试创建默认文件夹')
        try {
          // 确保有分类
          if (categories.length === 0) {
            throw new Error('没有可用的分类')
          }
          
          // 创建默认文件夹
          const defaultFolder = await notesAPI.createFolder('默认文件夹', categories[0].id)
          finalFolderId = defaultFolder.id
          
          // 更新本地文件夹列表
          setFolders([...folders, defaultFolder])
          console.log('📁 创建并使用默认文件夹:', finalFolderId)
        } catch (error) {
          console.error('创建默认文件夹失败:', error)
          throw new Error('无法创建文件夹，请先创建分类和文件夹')
        }
      }

      // 设置最终的folder_id
      noteData.folder_id = finalFolderId

      console.log('📤 发送的笔记数据:', noteData)

      let savedNote
      if (selectedNote) {
        // 更新现有笔记
        console.log('🔄 更新现有笔记:', selectedNote.id)
        savedNote = await notesAPI.updateNote(selectedNote.id, noteData)
        setNotes(notes.map(note => note.id === selectedNote.id ? savedNote : note))
      } else {
        // 创建新笔记
        console.log('➕ 创建新笔记')
        savedNote = await notesAPI.createNote(noteData)
        setNotes([savedNote, ...notes])
      }

      setSelectedNote(savedNote)
      setIsEditing(false)
      setShowAISuggestion(false)
      
      // 重新加载数据以确保同步
      await loadNotesData()
    } catch (error) {
      console.error('保存笔记失败:', error)
      alert('保存失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 设置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 拖拽处理函数
  const handleDragEnd = async (event) => {
    const { active, over } = event

    // 如果没有目标位置，取消拖拽
    if (!over) return

    // 如果位置没有改变，取消拖拽
    if (active.id === over.id) return

    try {
      // 判断拖拽类型
      const activeData = active.data.current
      const overData = over.data.current

      if (activeData?.type === 'folder') {
        // 文件夹拖拽：在不同分类间移动文件夹
        const folderId = active.id
        const newCategoryId = over.id
        
        // 更新本地状态
        setFolders(folders.map(folder => 
          folder.id === folderId 
            ? { ...folder, category_id: newCategoryId }
            : folder
        ))

        // 调用API更新文件夹分类
        await notesAPI.updateFolder(folderId, { category_id: newCategoryId })
        
      } else if (activeData?.type === 'note') {
        // 笔记拖拽：在不同文件夹间移动笔记
        const noteId = active.id
        const newFolderId = over.id
        
        // 更新本地状态
        setNotes(notes.map(note => 
          note.id === noteId 
            ? { ...note, folder_id: newFolderId }
            : note
        ))

        // 调用API更新笔记文件夹
        await notesAPI.updateNote(noteId, { folder_id: newFolderId })
      }
    } catch (error) {
      console.error('拖拽更新失败:', error)
      // 重新加载数据以恢复状态
      await loadNotesData()
    }
  }

  // 文件夹编辑和删除功能
  const [editingFolderId, setEditingFolderId] = useState(null)
  const [editingFolderName, setEditingFolderName] = useState('')

  const handleEditFolder = (folder) => {
    setEditingFolderId(folder.id)
    setEditingFolderName(folder.name)
  }

  const handleSaveFolderEdit = async (folderId) => {
    try {
      await notesAPI.updateFolder(folderId, { name: editingFolderName })
      setFolders(folders.map(folder => 
        folder.id === folderId 
          ? { ...folder, name: editingFolderName }
          : folder
      ))
      setEditingFolderId(null)
      setEditingFolderName('')
    } catch (error) {
      console.error('更新文件夹失败:', error)
      alert('更新文件夹失败，请稍后重试')
    }
  }

  const handleDeleteFolder = async (folderId) => {
    if (confirm('确定要删除这个文件夹吗？文件夹中的笔记将被移动到未分类。')) {
      try {
        await notesAPI.deleteFolder(folderId)
        setFolders(folders.filter(folder => folder.id !== folderId))
        // 重新加载数据以更新笔记状态
        await loadNotesData()
      } catch (error) {
        console.error('删除文件夹失败:', error)
        alert('删除文件夹失败，请稍后重试')
      }
    }
  }

  // 笔记置顶和删除功能
  const handlePinNote = async (noteId) => {
    try {
      const note = notes.find(n => n.id === noteId)
      const newPinnedStatus = !note.is_pinned
      
      await notesAPI.updateNote(noteId, { is_pinned: newPinnedStatus })
      setNotes(notes.map(note => 
        note.id === noteId 
          ? { ...note, is_pinned: newPinnedStatus }
          : note
      ))
    } catch (error) {
      console.error('置顶笔记失败:', error)
      alert('置顶笔记失败，请稍后重试')
    }
  }

  const handleDeleteNoteById = async (noteId) => {
    if (confirm('确定要删除这篇笔记吗？')) {
      try {
        await notesAPI.deleteNote(noteId)
        setNotes(notes.filter(note => note.id !== noteId))
        if (selectedNote?.id === noteId) {
          setSelectedNote(null)
          setIsEditing(false)
        }
      } catch (error) {
        console.error('删除笔记失败:', error)
        alert('删除笔记失败，请稍后重试')
      }
    }
  }

  const handleDeleteNote = async () => {
    if (selectedNote && confirm('确定要删除这篇笔记吗？')) {
      try {
        setLoading(true)
        await notesAPI.deleteNote(selectedNote.id)
        setNotes(notes.filter(note => note.id !== selectedNote.id))
        setSelectedNote(null)
        setCurrentNoteData({ title: '', content: '' })
        setIsEditing(false)
        
        // 重新加载数据以确保同步
        await loadNotesData()
      } catch (error) {
        console.error('删除笔记失败:', error)
        alert('删除失败，请稍后重试')
      } finally {
        setLoading(false)
      }
    }
  }

  const handlePolishText = async () => {
    if (!currentNoteData.content.trim()) {
      alert('请先输入内容')
      return
    }

    // 设置原文并打开润色弹窗
    setOriginalText(currentNoteData.content)
    setPolishedText('')
    setShowPolishModal(true)
    
    // 默认使用专业风格进行首次润色
    await handleRepolish('professional')
  }

  const handleRepolish = async (style) => {
    setPolishLoading(true)
    try {
      const response = await aiAPI.polishText(originalText, style)
      setPolishedText(response.polished_text)
    } catch (error) {
      console.error('AI润色失败:', error)
      alert('AI润色失败，请稍后重试')
    } finally {
      setPolishLoading(false)
    }
  }

  const handleApplyPolish = (polishedContent) => {
    setCurrentNoteData({
      ...currentNoteData,
      content: polishedContent
    })
    setShowPolishModal(false)
    setPolishedText('')
    setOriginalText('')
  }

  const handleClosePolishModal = () => {
    setShowPolishModal(false)
    setPolishedText('')
    setOriginalText('')
  }

  const handleCreateFolder = () => {
    setShowCreateFolder(true)
    setNewFolderName('')
    setSelectedCategory(categories[0]?.id || '')
  }

  const handleSaveFolder = async () => {
    if (!newFolderName.trim()) {
      alert('请输入文件夹名称')
      return
    }

    if (!selectedCategory) {
      alert('请选择分类')
      return
    }

    try {
      setLoading(true)
      const newFolder = await notesAPI.createFolder(newFolderName.trim(), selectedCategory)
      setFolders([...folders, newFolder])
      setShowCreateFolder(false)
      setNewFolderName('')
      
      // 重新加载数据以确保同步
      await loadNotesData()
    } catch (error) {
      console.error('创建文件夹失败:', error)
      alert('创建文件夹失败，请稍后重试')
    } finally {
      setLoading(false)
    }
    setSelectedCategory('')
  }

  const handleCancelCreateFolder = () => {
    setShowCreateFolder(false)
    setNewFolderName('')
    setSelectedCategory('')
  }

  const toggleCategoryCollapse = (categoryId) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFolder = selectedFolderId ? note.folder_id === selectedFolderId : true
    return matchesSearch && matchesFolder
  })

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-[calc(100vh-4rem)]">
      {/* 左侧文件夹列表 */}
      <div className="w-56 lg:w-64 xl:w-72 eva-sidebar border-r border-sidebar-border flex flex-col min-w-0">
        {/* 操作栏 */}
        <div className="p-3 lg:p-4 border-b border-sidebar-border">
          <div className="flex gap-2 mb-3">
            <Button onClick={handleNewNote} className="eva-button flex-1 text-xs lg:text-sm">
              <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">新建笔记</span>
              <span className="sm:hidden">新建</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleCreateFolder}>
              <FolderPlus className="w-3 h-3 lg:w-4 lg:h-4" />
            </Button>
          </div>
        </div>

        {/* 文件夹列表 - 可滚动 */}
        <div className="flex-1 overflow-y-auto p-3 lg:p-4">
          <h3 className="text-xs lg:text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            文件夹
          </h3>
          <div className="space-y-2">
            {/* 全部笔记选项 */}
            <div
              onClick={() => setSelectedFolderId(null)}
              className={`flex items-center justify-between p-2 rounded-lg hover:bg-sidebar-accent cursor-pointer group ${
                selectedFolderId === null ? 'bg-sidebar-accent border border-primary' : ''
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-3 h-3 lg:w-4 lg:h-4 text-primary flex-shrink-0" />
                <span className="text-xs lg:text-sm text-white truncate">全部笔记</span>
              </div>
              <span className="text-xs text-gray-400 group-hover:text-gray-300 flex-shrink-0">
                {notes.length}
              </span>
            </div>
            {categories.map(category => {
               const categoryFolders = folders.filter(f => f.category_id === category.id)
               if (categoryFolders.length === 0) return null
               
               const isCollapsed = collapsedCategories[category.id]
               const totalNotesInCategory = categoryFolders.reduce((total, folder) => {
                 return total + notes.filter(note => note.folder_id === folder.id).length
               }, 0)
               
               return (
                 <div key={category.id} className="mb-4">
                   <div 
                     onClick={() => toggleCategoryCollapse(category.id)}
                     className="flex items-center justify-between p-2 rounded-lg hover:bg-sidebar-accent cursor-pointer group mb-2"
                   >
                     <div className="flex items-center gap-2 min-w-0">
                       <ChevronRight className={`w-3 h-3 lg:w-4 lg:h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                         isCollapsed ? 'rotate-0' : 'rotate-90'
                       }`} />
                       <h4 className="text-xs font-medium text-gray-300 uppercase tracking-wider truncate">
                         {category.name}
                       </h4>
                     </div>
                     <span className="text-xs text-gray-500 group-hover:text-gray-400 flex-shrink-0">
                       {totalNotesInCategory}
                     </span>
                   </div>
                   
                   <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                     isCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
                   }`}>
                     <DroppableCategory category={category}>
                       <SortableContext items={categoryFolders.map(folder => folder.id)} strategy={verticalListSortingStrategy}>
                         {categoryFolders.map((folder) => (
                           <DraggableFolder
                             key={folder.id}
                             folder={folder}
                             isSelected={selectedFolderId === folder.id}
                             onSelectFolder={setSelectedFolderId}
                             notes={notes}
                             editingFolderId={editingFolderId}
                             setEditingFolderId={setEditingFolderId}
                             editingFolderName={editingFolderName}
                             setEditingFolderName={setEditingFolderName}
                             handleSaveFolder={handleSaveFolderEdit}
                             handleDeleteFolder={handleDeleteFolder}
                           />
                         ))}
                       </SortableContext>
                     </DroppableCategory>
                   </div>
                 </div>
               )
             })}
          </div>
        </div>
      </div>

      {/* 中间笔记列表 */}
      <div className="w-72 lg:w-80 xl:w-96 eva-sidebar border-r border-sidebar-border flex flex-col min-w-0">
        {/* 搜索栏 */}
        <div className="p-3 lg:p-4 border-b border-sidebar-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-muted-foreground" />
            <Input
              placeholder="搜索笔记..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="eva-input pl-8 lg:pl-10 text-xs lg:text-sm"
            />
          </div>
        </div>

        {/* 笔记列表 */}
        <div className="flex-1 overflow-y-auto">
          <NotesList
            notes={filteredNotes}
            selectedNote={selectedNote}
            onSelectNote={handleSelectNote}
            folders={folders}
            categories={categories}
            onPinNote={handlePinNote}
            onDeleteNote={handleDeleteNoteById}
          />
        </div>
      </div>

      {/* 右侧编辑区域 */}
      <div className="flex-1 flex flex-col">
        {console.log('🎯 渲染条件检查:', { selectedNote: !!selectedNote, selectedNoteId: selectedNote?.id, isEditing, currentNoteData })}
        {selectedNote || isEditing ? (
          <>
            {/* 编辑器工具栏 */}
            <div className="eva-header p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold">
                    {isEditing ? (selectedNote ? '编辑笔记' : '新建笔记') : selectedNote?.title}
                  </h2>
                  {selectedNote && !isEditing && (
                    <div className="flex gap-1">
                      {selectedNote.tags?.map(tag => (
                        <span key={tag.id} className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {isEditing && (
                    <>
                      <Button onClick={handlePolishText} disabled={loading} className="eva-button" size="sm">
                        <Sparkles className="w-4 h-4 mr-2" />
                        {loading ? '润色中...' : 'AI润色'}
                      </Button>
                      <Button onClick={handleSaveNote} className="eva-button" size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        保存
                      </Button>
                    </>
                  )}
                  
                  {!isEditing && selectedNote && (
                    <>
                      <Button onClick={handleEditNote} variant="outline" size="sm">
                        <Edit3 className="w-4 h-4 mr-2" />
                        编辑
                      </Button>
                      <Button onClick={handleDeleteNote} variant="outline" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 编辑器内容 */}
            <div className="flex-1 p-4">
              <NoteEditor
                note={currentNoteData}
                isEditing={isEditing}
                onChange={setCurrentNoteData}
              />
            </div>
          </>
        ) : (
          /* 空状态 */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">选择一篇笔记开始编辑</h3>
              <p className="text-gray-300 mb-4">或者创建一篇新的笔记</p>
              <Button onClick={handleNewNote} className="eva-button">
                <Plus className="w-4 h-4 mr-2" />
                新建笔记
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* AI建议弹窗 */}
      {showAISuggestion && (
        <AISuggestionModal
          noteData={currentNoteData}
          categories={categories}
          folders={folders}
          tags={tags}
          onSave={saveNote}
          onCancel={() => setShowAISuggestion(false)}
        />
      )}

      {/* 文件夹创建模态框 */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="eva-panel p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4 text-primary">创建新文件夹</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">文件夹名称</label>
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="请输入文件夹名称"
                  className="eva-input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">选择分类</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="eva-input w-full">
                    <SelectValue placeholder="请选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={handleCancelCreateFolder} className="flex-1">
                取消
              </Button>
              <Button onClick={handleSaveFolder} className="eva-button flex-1">
                创建
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI润色弹窗 */}
      <AIPolishModal
        isOpen={showPolishModal}
        onClose={handleClosePolishModal}
        originalText={originalText}
        polishedText={polishedText}
        onApply={handleApplyPolish}
        onRepolish={handleRepolish}
        loading={polishLoading}
      />
      </div>
    </DndContext>
  )
}

export default NotesPage

