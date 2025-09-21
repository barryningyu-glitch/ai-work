import React from 'react';
import { useTheme } from './ThemeProvider';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
      aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
    >
      <span className="theme-icon">
        {isDark ? '☀️' : '🌙'}
      </span>
      <span className="theme-text">
        {isDark ? '浅色' : '深色'}
      </span>
    </button>
  );
};

export default ThemeToggle;

