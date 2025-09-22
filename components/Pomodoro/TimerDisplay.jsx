import { useState, useEffect } from 'react'

const TimerDisplay = ({ timeLeft, progress, mode, theme, isRunning, isMobile = false }) => {
  const [pulseAnimation, setPulseAnimation] = useState(false)

  // 格式化时间显示
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return {
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0')
    }
  }

  // 脉冲动画效果
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setPulseAnimation(true)
        setTimeout(() => setPulseAnimation(false), 200)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isRunning])

  const { minutes, seconds } = formatTime(timeLeft)
  
  // 根据设备类型调整尺寸
  const radius = isMobile ? 80 : 120
  const svgSize = isMobile ? 200 : 280
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  // 根据模式确定颜色
  const getColorByMode = () => {
    switch (mode) {
      case 'work':
        return {
          primary: '#ef4444', // red-500
          secondary: '#fca5a5', // red-300
          glow: 'rgba(239, 68, 68, 0.3)'
        }
      case 'shortBreak':
        return {
          primary: '#22c55e', // green-500
          secondary: '#86efac', // green-300
          glow: 'rgba(34, 197, 94, 0.3)'
        }
      case 'longBreak':
        return {
          primary: '#3b82f6', // blue-500
          secondary: '#93c5fd', // blue-300
          glow: 'rgba(59, 130, 246, 0.3)'
        }
      default:
        return {
          primary: theme.primary,
          secondary: theme.secondary,
          glow: `${theme.primary}33`
        }
    }
  }

  const colors = getColorByMode()

  return (
    <div className="relative flex items-center justify-center">
      {/* 外圈发光效果 */}
      <div 
        className={`
          absolute inset-0 rounded-full blur-xl transition-all duration-1000
          ${isRunning ? 'opacity-60' : 'opacity-30'}
          ${pulseAnimation ? 'scale-110' : 'scale-100'}
        `}
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          width: isMobile ? '240px' : '320px',
          height: isMobile ? '240px' : '320px'
        }}
      />

      {/* 主要计时器容器 */}
      <div className="relative">
        {/* SVG 进度圆环 */}
        <svg
          width={svgSize}
          height={svgSize}
          className="transform -rotate-90"
          style={{ filter: `drop-shadow(0 0 ${isMobile ? '15px' : '20px'} ${colors.glow})` }}
        >
          {/* 背景圆环 */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={isMobile ? "6" : "8"}
            fill="none"
          />
          
          {/* 进度圆环 */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={colors.primary}
            strokeWidth={isMobile ? "6" : "8"}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-out ${pulseAnimation ? 'opacity-90' : 'opacity-100'}`}
            style={{
              filter: `drop-shadow(0 0 ${isMobile ? '8px' : '12px'} ${colors.primary})`
            }}
          />

          {/* 内圈装饰 */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius - (isMobile ? 15 : 20)}
            stroke={colors.secondary}
            strokeWidth="1"
            fill="none"
            opacity="0.3"
          />
        </svg>

        {/* 时间显示 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`font-mono font-bold text-white ${isMobile ? 'text-3xl' : 'text-5xl'} tracking-wider`}>
            <span className="drop-shadow-lg">{minutes}</span>
            <span className={`mx-1 ${pulseAnimation ? 'opacity-50' : 'opacity-100'} transition-opacity`}>:</span>
            <span className="drop-shadow-lg">{seconds}</span>
          </div>
          
          {/* 进度百分比 */}
          <div className={`mt-2 ${isMobile ? 'text-xs' : 'text-sm'} text-white/70 font-medium`}>
            {Math.round(progress)}%
          </div>

          {/* 运行状态指示器 */}
          {isRunning && (
            <div className={`mt-2 flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-sm'} text-white/60`}>
              <div 
                className={`w-2 h-2 rounded-full bg-current animate-pulse`}
                style={{ backgroundColor: colors.primary }}
              />
              <span>运行中</span>
            </div>
          )}
        </div>

        {/* 装饰性光点 */}
        <div 
          className={`
            absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            ${isMobile ? 'w-3 h-3' : 'w-4 h-4'} rounded-full transition-all duration-1000
            ${isRunning ? 'opacity-80 scale-110' : 'opacity-40 scale-100'}
          `}
          style={{
            backgroundColor: colors.primary,
            boxShadow: `0 0 ${isMobile ? '15px' : '20px'} ${colors.primary}`,
            top: `${isMobile ? '15px' : '20px'}`
          }}
        />

        {/* 底部装饰光点 */}
        <div 
          className={`
            absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2
            ${isMobile ? 'w-2 h-2' : 'w-3 h-3'} rounded-full transition-all duration-1000
            ${isRunning ? 'opacity-60 scale-105' : 'opacity-30 scale-100'}
          `}
          style={{
            backgroundColor: colors.secondary,
            boxShadow: `0 0 ${isMobile ? '10px' : '15px'} ${colors.secondary}`,
            bottom: `${isMobile ? '15px' : '20px'}`
          }}
        />

        {/* 左侧装饰光点 */}
        <div 
          className={`
            absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2
            ${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full transition-all duration-1000
            ${isRunning ? 'opacity-50 scale-110' : 'opacity-25 scale-100'}
          `}
          style={{
            backgroundColor: colors.secondary,
            boxShadow: `0 0 ${isMobile ? '8px' : '12px'} ${colors.secondary}`,
            left: `${isMobile ? '15px' : '20px'}`
          }}
        />

        {/* 右侧装饰光点 */}
        <div 
          className={`
            absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2
            ${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full transition-all duration-1000
            ${isRunning ? 'opacity-50 scale-110' : 'opacity-25 scale-100'}
          `}
          style={{
            backgroundColor: colors.secondary,
            boxShadow: `0 0 ${isMobile ? '8px' : '12px'} ${colors.secondary}`,
            right: `${isMobile ? '15px' : '20px'}`
          }}
        />

        {/* 中心发光效果 */}
        <div 
          className={`
            absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            ${isMobile ? 'w-20 h-20' : 'w-32 h-32'} rounded-full transition-all duration-1000
            ${isRunning ? 'opacity-20 scale-110' : 'opacity-10 scale-100'}
          `}
          style={{
            background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
            filter: 'blur(20px)'
          }}
        />
      </div>
    </div>
  )
}

export default TimerDisplay

