import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // 从localStorage读取保存的主题，默认为雷蛇主题
    return localStorage.getItem('theme') || 'razer';
  });

  useEffect(() => {
    // 保存主题到localStorage
    localStorage.setItem('theme', theme);
    
    // 更新document的data-theme属性
    document.documentElement.setAttribute('data-theme', theme);
    
    // 更新body的class
    const themeClassMap = {
      'razer': 'razer-theme',
      'unit-01': 'unit-01-theme',
      'strike-freedom': 'strike-freedom-theme',
      'matrix': 'matrix-theme'
    };
    document.body.className = themeClassMap[theme] || 'razer-theme';
  }, [theme]);

  const toggleTheme = () => {
    const themes = ['razer', 'unit-01', 'strike-freedom', 'matrix'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const setSpecificTheme = (themeName) => {
    setTheme(themeName);
  };

  const value = {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme,
    isRazer: theme === 'razer',
    isUnit01: theme === 'unit-01',
    isStrikeFreedom: theme === 'strike-freedom',
    isMatrix: theme === 'matrix',
    // 保持向后兼容
    isDark: ['razer', 'unit-01', 'matrix'].includes(theme),
    isLight: theme === 'strike-freedom'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

