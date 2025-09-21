// API 配置模板 - 用于更新生产环境
// 将 RAILWAY_API_URL 替换为实际的 Railway 域名

// 生产环境配置
const RAILWAY_API_URL = 'https://your-app-name.up.railway.app/api';

// 环境检测和API URL配置
const getApiBaseUrl = () => {
  // 检查是否在本地开发环境
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8002/api';  // 本地后端端口
  }
  
  // 生产环境使用 Railway API
  return RAILWAY_API_URL;
};

// 更新后的 API_BASE_URL
const API_BASE_URL = getApiBaseUrl();

// 使用示例：
// 1. 将 RAILWAY_API_URL 替换为实际域名
// 2. 更新 utils/api.js 中的 API_BASE_URL 配置
// 3. 重新构建和部署前端

console.log('当前 API 端点:', API_BASE_URL);