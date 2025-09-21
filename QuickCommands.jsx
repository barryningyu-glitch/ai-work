import { useState } from 'react'
import { 
  Zap, 
  Search, 
  Code, 
  FileText, 
  Lightbulb, 
  BookOpen,
  Calculator,
  Globe,
  Palette,
  Settings,
  X,
  Star,
  Clock,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'

const QuickCommands = ({ onCommandSelect, onClose, isMobile = false }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // 快捷指令数据
  const commandCategories = [
    { id: 'all', name: '全部', icon: Zap },
    { id: 'writing', name: '写作', icon: FileText },
    { id: 'coding', name: '编程', icon: Code },
    { id: 'analysis', name: '分析', icon: Search },
    { id: 'creative', name: '创意', icon: Palette },
    { id: 'learning', name: '学习', icon: BookOpen },
    { id: 'productivity', name: '效率', icon: Target }
  ]

  const commands = [
    // 写作类
    {
      id: 'summarize',
      category: 'writing',
      title: '总结文本',
      description: '帮我总结以下内容的要点',
      command: '请帮我总结以下内容的核心要点：\n\n[在这里粘贴要总结的内容]',
      icon: FileText,
      popular: true
    },
    {
      id: 'improve_writing',
      category: 'writing',
      title: '改进文本',
      description: '优化文本表达和语法',
      command: '请帮我改进以下文本的表达和语法：\n\n[在这里粘贴要改进的文本]',
      icon: FileText
    },
    {
      id: 'translate',
      category: 'writing',
      title: '翻译文本',
      description: '翻译为其他语言',
      command: '请将以下文本翻译为英文：\n\n[在这里粘贴要翻译的文本]',
      icon: Globe
    },

    // 编程类
    {
      id: 'code_review',
      category: 'coding',
      title: '代码审查',
      description: '审查代码质量和最佳实践',
      command: '请帮我审查以下代码，指出可能的问题和改进建议：\n\n```\n[在这里粘贴代码]\n```',
      icon: Code,
      popular: true
    },
    {
      id: 'debug_code',
      category: 'coding',
      title: '调试代码',
      description: '帮助找出代码中的bug',
      command: '我的代码有问题，请帮我找出bug：\n\n```\n[在这里粘贴有问题的代码]\n```\n\n错误信息：[描述错误现象]',
      icon: Code
    },
    {
      id: 'explain_code',
      category: 'coding',
      title: '解释代码',
      description: '详细解释代码的工作原理',
      command: '请详细解释以下代码的工作原理：\n\n```\n[在这里粘贴代码]\n```',
      icon: Code
    },
    {
      id: 'optimize_code',
      category: 'coding',
      title: '优化代码',
      description: '提供代码性能优化建议',
      command: '请帮我优化以下代码的性能：\n\n```\n[在这里粘贴代码]\n```',
      icon: Code
    },

    // 分析类
    {
      id: 'analyze_data',
      category: 'analysis',
      title: '数据分析',
      description: '分析数据趋势和模式',
      command: '请帮我分析以下数据，找出趋势和模式：\n\n[在这里粘贴数据或描述数据情况]',
      icon: Search
    },
    {
      id: 'pros_cons',
      category: 'analysis',
      title: '利弊分析',
      description: '分析方案的优缺点',
      command: '请帮我分析以下方案的利弊：\n\n[描述要分析的方案或决策]',
      icon: Search,
      popular: true
    },
    {
      id: 'compare_options',
      category: 'analysis',
      title: '方案对比',
      description: '对比多个选项的差异',
      command: '请帮我对比以下几个选项的差异：\n\n选项A：[描述]\n选项B：[描述]\n选项C：[描述]',
      icon: Search
    },

    // 创意类
    {
      id: 'brainstorm',
      category: 'creative',
      title: '头脑风暴',
      description: '生成创意想法',
      command: '请帮我进行头脑风暴，围绕以下主题生成创意想法：\n\n主题：[描述主题]',
      icon: Lightbulb
    },
    {
      id: 'naming',
      category: 'creative',
      title: '命名建议',
      description: '为项目或产品起名',
      command: '请帮我为以下项目/产品起一些有创意的名字：\n\n描述：[项目/产品描述]\n风格要求：[简洁/专业/有趣等]',
      icon: Palette
    },

    // 学习类
    {
      id: 'explain_concept',
      category: 'learning',
      title: '概念解释',
      description: '解释复杂概念',
      command: '请用简单易懂的方式解释以下概念：\n\n[要解释的概念]',
      icon: BookOpen,
      popular: true
    },
    {
      id: 'learning_plan',
      category: 'learning',
      title: '学习计划',
      description: '制定学习路线图',
      command: '请帮我制定学习以下技能的计划：\n\n技能：[要学习的技能]\n当前水平：[初学者/中级/高级]\n目标：[学习目标]\n时间：[可用时间]',
      icon: BookOpen
    },

    // 效率类
    {
      id: 'task_breakdown',
      category: 'productivity',
      title: '任务分解',
      description: '将复杂任务分解为小步骤',
      command: '请帮我将以下复杂任务分解为具体的执行步骤：\n\n任务：[描述任务]\n截止时间：[时间要求]',
      icon: Target
    },
    {
      id: 'time_management',
      category: 'productivity',
      title: '时间管理',
      description: '优化时间安排',
      command: '请帮我优化以下时间安排：\n\n当前安排：[描述当前时间安排]\n目标：[想要达到的效果]',
      icon: Clock
    }
  ]

  // 过滤指令
  const filteredCommands = commands.filter(command => {
    const matchesCategory = selectedCategory === 'all' || command.category === selectedCategory
    const matchesSearch = command.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         command.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // 热门指令
  const popularCommands = commands.filter(cmd => cmd.popular)

  return (
    <div className={`
      fixed inset-0 bg-black/50 flex items-center justify-center z-50 
      ${isMobile ? 'p-2' : 'p-4'}
    `}>
      <div className={`
        eva-panel max-h-[90vh] overflow-hidden flex flex-col
        ${isMobile ? 'w-full max-w-sm' : 'w-full max-w-4xl'}
      `}>
        {/* 头部 */}
        <div className={`${isMobile ? 'p-3' : 'p-4'} border-b border-border`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-semibold flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
              <Zap className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary`} />
              快捷指令
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索指令..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`eva-input pl-10 ${isMobile ? 'text-sm' : ''}`}
            />
          </div>
        </div>

        {/* 分类标签 */}
        {!isMobile && (
          <div className="p-4 border-b border-border">
            <div className="flex flex-wrap gap-2">
              {commandCategories.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="text-xs"
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {category.name}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* 移动端分类选择 */}
        {isMobile && (
          <div className="p-3 border-b border-border">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="eva-input w-full text-sm"
            >
              {commandCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 指令列表 */}
        <div className="flex-1 overflow-y-auto">
          <div className={`${isMobile ? 'p-2' : 'p-4'} space-y-2`}>
            {filteredCommands.map((command) => {
              const Icon = command.icon
              return (
                <div
                  key={command.id}
                  className={`
                    ${isMobile ? 'p-3' : 'p-4'} rounded-lg border border-border 
                    hover:bg-accent/50 cursor-pointer transition-colors
                    ${command.popular ? 'ring-1 ring-primary/20' : ''}
                  `}
                  onClick={() => {
                    onCommandSelect(command.command)
                    onClose()
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      ${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-primary/20 
                      flex items-center justify-center flex-shrink-0
                    `}>
                      <Icon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                          {command.title}
                        </h4>
                        {command.popular && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            {!isMobile && (
                              <span className="text-xs text-yellow-600">热门</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {command.description}
                      </p>
                      
                      {!isMobile && (
                        <div className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                          {command.command.length > 100 
                            ? command.command.substring(0, 100) + '...'
                            : command.command
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredCommands.length === 0 && (
              <div className="text-center py-8">
                <Search className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} mx-auto mb-3 text-muted-foreground opacity-50`} />
                <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                  没有找到匹配的指令
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 底部提示 */}
        {!isMobile && (
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>热门指令</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>最近使用</span>
                </div>
              </div>
              <span>点击指令即可使用</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuickCommands

