import React, { useState, useEffect } from 'react';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // 登录页面logo始终显示完整内容，无需切换状态

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('尝试登录:', formData.username);
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('登录响应状态:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('登录成功，获取到token:', data.access_token ? '是' : '否');
        
        // 确保token存储成功
        localStorage.setItem('token', data.access_token);
        const storedToken = localStorage.getItem('token');
        console.log('Token存储验证:', storedToken === data.access_token ? '成功' : '失败');
        
        // 立即验证token是否有效
        const verifyResponse = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        });
        
        if (verifyResponse.ok) {
          console.log('Token验证成功');
          onLogin(data.access_token);
        } else {
          console.error('Token验证失败:', verifyResponse.status);
          setError('登录验证失败，请重试');
        }
      } else {
        const errorData = await response.json();
        console.error('登录失败:', errorData);
        setError(errorData.detail || '登录失败');
      }
    } catch (err) {
      console.error('登录网络错误:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="circuit-pattern"></div>
        <div className="glow-effects"></div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="logo expanded">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">Cortex AI</span>
          </div>
          <h1>智能工作台</h1>
          <p>您的第二大脑 - AI驱动的智能工作空间</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="请输入用户名"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入密码"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner">⟳</span>
            ) : (
              '登录'
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="system-info">
            <div className="info-item">
              <span className="status-dot online"></span>
              <span>AI服务在线</span>
            </div>
            <div className="info-item">
              <span className="status-dot online"></span>
              <span>数据库正常</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

