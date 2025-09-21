import { useState } from 'react'
import { X, Sparkles, FileText, MessageCircle, Zap, Minimize2, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'

const AIPolishModal = ({ 
  isOpen, 
  onClose, 
  originalText, 
  polishedText, 
  onApply, 
  onRepolish,
  loading = false 
}) => {
  const [selectedStyle, setSelectedStyle] = useState('professional')
  const [showComparison, setShowComparison] = useState(true)

  if (!isOpen) return null

  const polishStyles = [
    {
      value: 'professional',
      label: '正式专业',
      icon: <FileText className="w-4 h-4" />,
      description: '适合商务文档、学术论文等正式场合'
    },
    {
      value: 'casual',
      label: '口语化',
      icon: <MessageCircle className="w-4 h-4" />,
      description: '更加亲切自然，适合日常交流'
    },
    {
      value: 'lively',
      label: '活泼生动',
      icon: <Zap className="w-4 h-4" />,
      description: '增加趣味性和感染力，适合创意内容'
    },
    {
      value: 'concise',
      label: '精简提炼',
      icon: <Minimize2 className="w-4 h-4" />,
      description: '去除冗余，突出核心要点'
    },
    {
      value: 'detailed',
      label: '扩充丰富',
      icon: <Maximize2 className="w-4 h-4" />,
      description: '增加细节描述，内容更加充实'
    }
  ]

  const handleStyleChange = (style) => {
    setSelectedStyle(style)
  }

  const handleRepolish = () => {
    onRepolish(selectedStyle)
  }

  const currentStyle = polishStyles.find(style => style.value === selectedStyle)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 border border-cyan-500/30 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI 文本润色</h2>
              <p className="text-gray-400 text-sm">选择润色风格并预览效果</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* 润色风格选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              选择润色风格
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {polishStyles.map((style) => (
                <div
                  key={style.value}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedStyle === style.value
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                  onClick={() => handleStyleChange(style.value)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1 rounded ${
                      selectedStyle === style.value ? 'text-cyan-400' : 'text-gray-400'
                    }`}>
                      {style.icon}
                    </div>
                    <span className={`font-medium ${
                      selectedStyle === style.value ? 'text-cyan-400' : 'text-white'
                    }`}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{style.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 对比显示切换 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">润色结果</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComparison(!showComparison)}
              className="text-gray-300 border-gray-600 hover:bg-gray-800"
            >
              {showComparison ? '隐藏对比' : '显示对比'}
            </Button>
          </div>

          {/* 文本对比区域 */}
          <div className={`grid gap-4 ${showComparison ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
            {showComparison && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">原文</h4>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 h-64 overflow-y-auto">
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">
                    {originalText}
                  </pre>
                </div>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium text-cyan-400 mb-2">
                润色后 ({currentStyle?.label})
              </h4>
              <div className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-4 h-64 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>AI 正在润色中...</span>
                    </div>
                  </div>
                ) : (
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">
                    {polishedText || '请选择润色风格并点击"重新润色"'}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="flex items-center justify-between p-6 border-t border-cyan-500/20 bg-gray-900/50">
          <div className="text-sm text-gray-400">
            {polishedText && (
              <span>
                字数变化: {originalText.length} → {polishedText.length} 
                ({polishedText.length > originalText.length ? '+' : ''}{polishedText.length - originalText.length})
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-gray-300 border-gray-600 hover:bg-gray-800"
            >
              取消
            </Button>
            
            <Button
              onClick={handleRepolish}
              disabled={loading}
              className="eva-button"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {loading ? '润色中...' : '重新润色'}
            </Button>
            
            <Button
              onClick={() => onApply(polishedText)}
              disabled={!polishedText || loading}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              应用润色
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIPolishModal