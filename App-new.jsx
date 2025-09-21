import React, { useState, useEffect } from 'react';
import './App.css';
import LoginPage from './components/Auth/LoginPage';
import UserManagement from './components/Admin/UserManagement';

// 导入各个模块组件
import NotesPage from './components/Notes/NotesPage';
import TodoPage from './components/Todo/TodoPage';
import ChatPage from './components/Chat/ChatPage';
import PomodoroPage from './components/Pomodoro/PomodoroPage';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    try {
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setToken(token);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Token验证失败:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (newToken) => {
    setToken(newToken);
    setIsAuthenticated(true);
    verifyToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">⟳</div>
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
            <span className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#00ff88"/>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#00ff88" strokeWidth="1" fill="none">
                  <animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
                </path>
              </svg>
            </span>
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
            </svg>
          </div>
          <h3>专注模式</h3>
          <p>番茄钟时间管理</p>
        </div>
      </div>

      <div className="dashboard-status">
        <div className="status-section">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{display: 'inline-block', marginRight: '8px'}}>
              <rect x="2" y="6" width="20" height="12" rx="2" stroke="#00ff88" strokeWidth="2" fill="none"/>
              <path d="M22 12h2" stroke="#00ff88" strokeWidth="2" strokeLinecap="round"/>
              <path d="M6 10h8M6 14h4" stroke="#00ff88" strokeWidth="1" strokeLinecap="round"/>
            </svg>
            系统状态
          </h3>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">AI服务</span>
              <span className="status-value online">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{display: 'inline-block', marginRight: '4px'}}>
                  <circle cx="12" cy="12" r="10" fill="#00ff88"/>
                </svg>
                在线
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">数据库</span>
              <span className="status-value online">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{display: 'inline-block', marginRight: '4px'}}>
                  <circle cx="12" cy="12" r="10" fill="#00ff88"/>
                </svg>
                正常
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">同步状态</span>
              <span className="status-value syncing">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{display: 'inline-block', marginRight: '4px'}}>
                  <circle cx="12" cy="12" r="10" fill="#ff9500"/>
                </svg>
                同步中
              </span>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{display: 'inline-block', marginRight: '8px'}}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#00ff88"/>
            </svg>
            快速操作
          </h3>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => setCurrentPage('notes')}>
              新建笔记 <span className="badge">9</span>
            </button>
            <button className="action-btn" onClick={() => setCurrentPage('todo')}>
              添加任务 <span className="badge">19</span>
            </button>
            <button className="action-btn" onClick={() => setCurrentPage('chat')}>
              开始对话 <span className="badge">11</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#00ff88"/>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#00ff88" strokeWidth="1" fill="none">
                  <animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
                </path>
              </svg>
            </span>
            <span className="logo-text">Cortex AI</span>
          </div>
        </div>

        <div className="nav-menu">
          <button 
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <span className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            工作台
            <span className="nav-badge">1</span>
          </button>

          <button 
            className={`nav-item ${currentPage === 'notes' ? 'active' : ''}`}
            onClick={() => setCurrentPage('notes')}
          >
            <span className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M7 7h10M7 11h10M7 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            笔记
            <span className="nav-badge">2</span>
          </button>

          <button 
            className={`nav-item ${currentPage === 'todo' ? 'active' : ''}`}
            onClick={() => setCurrentPage('todo')}
          >
            <span className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            待办
            <span className="nav-badge">5</span>
          </button>

          <button 
            className={`nav-item ${currentPage === 'chat' ? 'active' : ''}`}
            onClick={() => setCurrentPage('chat')}
          >
            <span className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <circle cx="9" cy="10" r="1" fill="currentColor"/>
                <circle cx="15" cy="10" r="1" fill="currentColor"/>
              </svg>
            </span>
            对话
            <span className="nav-badge">4</span>
          </button>

          <button 
            className={`nav-item ${currentPage === 'pomodoro' ? 'active' : ''}`}
            onClick={() => setCurrentPage('pomodoro')}
          >
            <span className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="2" fill="currentColor"/>
              </svg>
            </span>
            专注
            <span className="nav-badge">5</span>
          </button>

          {user?.is_superuser && (
            <button 
              className={`nav-item ${currentPage === 'users' ? 'active' : ''}`}
              onClick={() => setCurrentPage('users')}
            >
              <span className="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </span>
              用户管理
            </button>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="5" stroke="#00ff88" strokeWidth="2" fill="none"/>
                <path d="M20 21a8 8 0 1 0-16 0" stroke="#00ff88" strokeWidth="2" fill="none"/>
                <circle cx="12" cy="8" r="2" fill="#00ff88">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>
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
          <button className="logout-btn" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </nav>

      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
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
              <span>AI在线</span>
            </div>
            <button className="notification-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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

