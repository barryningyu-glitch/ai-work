import React, { useState, useEffect } from 'react';
import './App.css';
import LoginPage from './components/Auth/LoginPage';
import UserManagement from './components/Admin/UserManagement';

// 导入各个模块组件
import NotesPage from './components/Notes/NotesPage';
import TodoPage from './components/Todo/TodoPage';
import ChatPage from './components/Chat/ChatPage';
import PomodoroPage from './components/Pomodoro/PomodoroPage';

// 导入新的动态背景组件
import DynamicBackground from './components/ui/DynamicBackground';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // 检查本地存储的token
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      verifyToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    console.log('开始验证token:', token ? '存在' : '不存在');
    
    if (!token) {
      console.log('没有token，跳过验证');
      setLoading(false);
      return;
    }
    
    try {
      console.log('发送token验证请求...');
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Token验证响应状态:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Token验证成功，用户:', userData.username);
        setUser(userData);
        setToken(token);
        setIsAuthenticated(true);
      } else {
        console.error('Token验证失败，状态码:', response.status);
        const errorText = await response.text();
        console.error('错误详情:', errorText);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Token验证网络错误:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (newToken) => {
    console.log('处理登录，设置新token');
    setToken(newToken);
    setIsAuthenticated(true);
    verifyToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="matrix-spinner">
            <circle cx="12" cy="12" r="10" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
              <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
              <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
        <p>正在加载...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'notes':
        return <NotesPage />;
      case 'todo':
        return <TodoPage />;
      case 'chat':
        return <ChatPage />;
      case 'pomodoro':
        return <PomodoroPage />;
      case 'users':
        return user?.is_superuser ? <UserManagement token={token} /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  const Dashboard = () => (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>
            <svg className="logo-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#00ff88" stroke="#00ff88" strokeWidth="1"/>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="none" stroke="#00ff88" strokeWidth="1" opacity="0.5">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
              </path>
            </svg>
            Cortex AI Workspace
          </h1>
          <p>欢迎来到智能工作台 - 您的第二大脑</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="feature-card" onClick={() => setCurrentPage('notes')}>
          <div className="card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#00ff88" strokeWidth="2" fill="none"/>
              <path d="M7 7h10M7 11h10M7 15h6" stroke="#00ff88" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="17" cy="17" r="2" fill="#00ff88" opacity="0.7">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
          <h3>智能笔记</h3>
          <p>AI辅助的笔记管理</p>
        </div>

        <div className="feature-card" onClick={() => setCurrentPage('todo')}>
          <div className="card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#00ff88" strokeWidth="2" fill="none"/>
              <path d="M9 12l2 2 4-4" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite"/>
              </path>
            </svg>
          </div>
          <h3>待办事项</h3>
          <p>智能任务规划</p>
        </div>

        <div className="feature-card" onClick={() => setCurrentPage('chat')}>
          <div className="card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#00ff88" strokeWidth="2" fill="none"/>
              <circle cx="9" cy="10" r="1" fill="#00ff88"/>
              <circle cx="15" cy="10" r="1" fill="#00ff88"/>
              <path d="M9 14s1.5 2 3 2 3-2 3-2" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="9" cy="10" r="1" fill="#00ff88" opacity="0.5">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="15" cy="10" r="1" fill="#00ff88" opacity="0.5">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" begin="0.3s" repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
          <h3>AI对话</h3>
          <p>智能助手对话</p>
        </div>

        <div className="feature-card" onClick={() => setCurrentPage('pomodoro')}>
          <div className="card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#00ff88" strokeWidth="2" fill="none"/>
              <path d="M12 6v6l4 2" stroke="#00ff88" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="2" fill="#00ff88"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#00ff88" strokeWidth="1" opacity="0.6">
                <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="8s" repeatCount="indefinite"/>
              </path>
            </svg>
          </div>
          <h3>专注模式</h3>
          <p>番茄钟时间管理</p>
        </div>
      </div>

      <div className="dashboard-status">
        <div className="status-section">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginRight: '8px', verticalAlign: 'middle'}}>
              <rect x="6" y="6" width="12" height="12" rx="2" stroke="#00ff88" strokeWidth="2" fill="none"/>
              <path d="M9 12l2 2 4-4" stroke="#00ff88" strokeWidth="2" strokeLinecap="round"/>
              <rect x="6" y="6" width="12" height="12" rx="2" stroke="#00ff88" strokeWidth="1" fill="none" opacity="0.5">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite"/>
              </rect>
            </svg>
            系统状态
          </h3>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">AI服务</span>
              <span className="status-value online">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{marginRight: '4px'}}>
                  <circle cx="12" cy="12" r="10" fill="#00ff88"/>
                </svg>
                在线
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">数据库</span>
              <span className="status-value online">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{marginRight: '4px'}}>
                  <circle cx="12" cy="12" r="10" fill="#00ff88"/>
                </svg>
                正常
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">同步状态</span>
              <span className="status-value syncing">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{marginRight: '4px'}}>
                  <circle cx="12" cy="12" r="10" fill="#ffaa00">
                    <animate attributeName="fill" values="#ffaa00;#ff6600;#ffaa00" dur="2s" repeatCount="indefinite"/>
                  </circle>
                </svg>
                同步中
              </span>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginRight: '8px', verticalAlign: 'middle'}}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#00ff88" stroke="#00ff88" strokeWidth="1"/>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="none" stroke="#00ff88" strokeWidth="1" opacity="0.5">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
              </path>
            </svg>
            快速操作
          </h3>
          <div className="action-buttons">
            <button className="eva-button" onClick={() => setCurrentPage('notes')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="#00ff88" strokeWidth="2" fill="none"/>
                <path d="M7 7h10M7 11h10M7 15h6" stroke="#00ff88" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              新建笔记 <span className="badge">9</span>
            </button>
            <button className="eva-button" onClick={() => setCurrentPage('todo')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="#00ff88" strokeWidth="2" fill="none"/>
                <path d="M9 12l2 2 4-4" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              添加任务 <span className="badge">19</span>
            </button>
            <button className="eva-button" onClick={() => setCurrentPage('chat')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#00ff88" strokeWidth="2" fill="none"/>
                <circle cx="9" cy="10" r="1" fill="#00ff88"/>
                <circle cx="15" cy="10" r="1" fill="#00ff88"/>
              </svg>
              开始对话 <span className="badge">11</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app matrix-theme" style={{ animation: 'systemBoot 1.5s ease-out' }}>
      <DynamicBackground />
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <nav className={`sidebar ${isMobileMenuOpen ? 'sidebar-mobile-open' : ''}`} style={{ animation: 'systemBoot 1.8s ease-out 0.3s both' }}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#00ff88" stroke="#00ff88" strokeWidth="1"/>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="none" stroke="#00ff88" strokeWidth="1" opacity="0.5">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
                </path>
              </svg>
            </div>
            <div className="logo-text">Barry's Cortex</div>
          </div>
          
          {/* Mobile Close Button */}
          <button 
            className="mobile-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#00ff88" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="nav-menu">
          <button 
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <svg className="nav-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#00ff88" strokeWidth="2" fill="none"/>
              <polyline points="9,22 9,12 15,12 15,22" stroke="#00ff88" strokeWidth="2"/>
            </svg>
            <span className="nav-item-text">工作台</span>
            <span className="nav-badge">1</span>
          </button>

          <button 
            className={`nav-item ${currentPage === 'notes' ? 'active' : ''}`}
            onClick={() => setCurrentPage('notes')}
          >
            <svg className="nav-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#00ff88" strokeWidth="2" fill="none"/>
              <path d="M7 7h10M7 11h10M7 15h6" stroke="#00ff88" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="nav-item-text">笔记</span>
            <span className="nav-badge">2</span>
          </button>

          <button 
            className={`nav-item ${currentPage === 'todo' ? 'active' : ''}`}
            onClick={() => setCurrentPage('todo')}
          >
            <svg className="nav-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#00ff88" strokeWidth="2" fill="none"/>
              <path d="M9 12l2 2 4-4" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-item-text">待办</span>
            <span className="nav-badge">5</span>
          </button>

          <button 
            className={`nav-item ${currentPage === 'chat' ? 'active' : ''}`}
            onClick={() => setCurrentPage('chat')}
          >
            <svg className="nav-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#00ff88" strokeWidth="2" fill="none"/>
              <circle cx="9" cy="10" r="1" fill="#00ff88"/>
              <circle cx="15" cy="10" r="1" fill="#00ff88"/>
            </svg>
            <span className="nav-item-text">对话</span>
            <span className="nav-badge">4</span>
          </button>

          <button 
            className={`nav-item ${currentPage === 'pomodoro' ? 'active' : ''}`}
            onClick={() => setCurrentPage('pomodoro')}
          >
            <svg className="nav-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#00ff88" strokeWidth="2" fill="none"/>
              <path d="M12 6v6l4 2" stroke="#00ff88" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="nav-item-text">专注</span>
            <span className="nav-badge">5</span>
          </button>

          {user?.is_superuser && (
            <button 
              className={`nav-item ${currentPage === 'users' ? 'active' : ''}`}
              onClick={() => setCurrentPage('users')}
            >
              <svg className="nav-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#00ff88" strokeWidth="2"/>
                <circle cx="9" cy="7" r="4" stroke="#00ff88" strokeWidth="2" fill="none"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#00ff88" strokeWidth="2"/>
              </svg>
              <span className="nav-item-text">用户管理</span>
            </button>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="#00ff88" strokeWidth="2" fill="none"/>
                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="#00ff88" strokeWidth="2" fill="none"/>
                <circle cx="12" cy="8" r="2" fill="#00ff88" opacity="0.3">
                  <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite"/>
                </circle>
              </svg>
            </div>
            <div className="user-details">
              <div className="user-name">{user?.full_name || user?.username}</div>
              <div className="user-role">
                {user?.is_superuser ? '超级用户' : '普通用户'}
              </div>
            </div>
          </div>
          <button className="matrix-btn matrix-btn-destructive px-4 py-2" onClick={handleLogout}>
                  <span className="relative z-10">退出登录</span>
                </button>
        </div>
      </nav>

      <main className="main-content" style={{ animation: 'systemBoot 2s ease-out 0.6s both' }}>
        <header className="top-bar" style={{ animation: 'systemBoot 1.5s ease-out 0.9s both' }}>
          <div className="top-bar-left">
            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="#00ff88" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            
            <h2 className="page-title">
              {currentPage === 'dashboard' && '工作台'}
              {currentPage === 'notes' && '智能笔记'}
              {currentPage === 'todo' && '待办事项'}
              {currentPage === 'chat' && 'AI对话'}
              {currentPage === 'pomodoro' && '专注番茄钟'}
              {currentPage === 'users' && '用户管理'}
            </h2>
          </div>
          <div className="top-bar-right">
            <div className="status-indicator">
              <span className="status-dot online"></span>
              <span className="status-text">AI在线</span>
            </div>
            <button className="notification-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#00ff88" strokeWidth="2" fill="none"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#00ff88" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="18" cy="6" r="3" fill="#ff4444" opacity="0.8"/>
              </svg>
              <span className="notification-badge">3</span>
            </button>
          </div>
        </header>

        <div className="page-content">
          {renderCurrentPage()}
        </div>
      </main>
    </div>
  );
}

export default App;

