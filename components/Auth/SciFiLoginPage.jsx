import React, { useState, useEffect } from 'react';
import './SciFiLoginPage.css';

const SciFiLoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [glitchText, setGlitchText] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const texts = ['NEURAL', 'SYNTHETIC', 'QUANTUM', 'DIGITAL'];
      const randomText = texts[Math.floor(Math.random() * texts.length)];
      setGlitchText(randomText);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);

        const verifyResponse = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        });

        if (verifyResponse.ok) {
          onLogin(data.access_token);
        } else {
          setError('登录验证失败，请重试');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || '登录失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sci-fi-login-container">
      <div className="matrix-background">
        <div className="matrix-rain"></div>
        <div className="hologram-grid"></div>
        <div className="energy-particles"></div>
      </div>

      <div className="cyberpunk-card">
        <div className="card-glow"></div>
        <div className="card-scanline"></div>

        <div className="login-header">
          <div className="neural-logo">
            <div className="logo-core">
              <div className="core-pulse"></div>
              <div className="core-ring"></div>
            </div>
            <div className="logo-text-container">
              <div className="main-logo-text">
                CORTEX
                <span className="glitch-overlay" data-text={glitchText}>
                  {glitchText}
                </span>
              </div>
              <div className="sub-logo-text">CONSCIOUSNESS</div>
            </div>
          </div>

          <div className="access-prompt">
            <div className="prompt-text">:: ACCESS TERMINAL ::</div>
            <div className="prompt-subtitle">Neural Interface Authentication Required</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="cyber-form">
          <div className="input-container">
            <div className="input-label">
              <span className="label-icon">⎙</span>
              <span>USER_ID</span>
            </div>
            <div className="input-wrapper">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="cyber-input"
                placeholder="Enter neural signature..."
                required
              />
              <div className="input-glow"></div>
            </div>
          </div>

          <div className="input-container">
            <div className="input-label">
              <span className="label-icon">⚿</span>
              <span>ACCESS_KEY</span>
            </div>
            <div className="input-wrapper">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="cyber-input"
                placeholder="Decrypt access sequence..."
                required
              />
              <div className="input-glow"></div>
            </div>
          </div>

          {error && (
            <div className="error-alert">
              <div className="error-icon">⚠</div>
              <div className="error-text">{error}</div>
            </div>
          )}

          <button type="submit" className="neural-button" disabled={isLoading}>
            <div className="button-core">
              {isLoading ? (
                <>
                  <div className="loading-ring"></div>
                  <span>CONNECTING...</span>
                </>
              ) : (
                <>
                  <div className="button-pulse"></div>
                  <span>INITIALIZE CONNECTION</span>
                </>
              )}
            </div>
            <div className="button-energy"></div>
          </button>
        </form>

        <div className="system-status">
          <div className="status-grid">
            <div className="status-item online">
              <div className="status-pulse"></div>
              <span>NEURAL_LINK</span>
            </div>
            <div className="status-item online">
              <div className="status-pulse"></div>
              <span>QUANTUM_CORE</span>
            </div>
            <div className="status-item online">
              <div className="status-pulse"></div>
              <span>DATA_STREAM</span>
            </div>
          </div>
        </div>

        <div className="terminal-footer">
          <div className="footer-text">v2.0.87 - Neural Consciousness Platform</div>
          <div className="footer-line"></div>
        </div>
      </div>

      <div className="floating-elements">
        <div className="float-element" style={{'--delay': '0s', '--duration': '20s'}}>
          <div className="element-core"></div>
        </div>
        <div className="float-element" style={{'--delay': '5s', '--duration': '25s'}}>
          <div className="element-core"></div>
        </div>
        <div className="float-element" style={{'--delay': '10s', '--duration': '30s'}}>
          <div className="element-core"></div>
        </div>
      </div>
    </div>
  );
};

export default SciFiLoginPage;