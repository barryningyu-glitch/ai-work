// API 工具函数
const API_BASE_URL = 'http://localhost:8001/api';

// 获取认证token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// 通用API请求函数
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`API Request: ${url}`, { token: token ? 'present' : 'missing' });
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      
      // 如果是认证错误，清除无效token并提示重新登录
      if (response.status === 401 || response.status === 403) {
        console.warn('Authentication failed, clearing invalid token');
        localStorage.removeItem('token');
        
        // 触发页面刷新以显示登录页面
        if (window.location.pathname !== '/login') {
          window.location.reload();
        }
      }
      
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// 笔记相关API
export const notesAPI = {
  // 获取笔记树状结构
  getNotesTree: () => apiRequest('/notes/tree'),
  
  // 获取所有笔记
  getNotes: (skip = 0, limit = 100) => 
    apiRequest(`/notes/?skip=${skip}&limit=${limit}`),
  
  // 获取单个笔记
  getNote: (noteId) => apiRequest(`/notes/${noteId}`),
  
  // 创建笔记
  createNote: (noteData) => 
    apiRequest('/notes/', {
      method: 'POST',
      body: JSON.stringify(noteData),
    }),
  
  // 更新笔记
  updateNote: (noteId, noteData) => 
    apiRequest(`/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    }),
  
  // 删除笔记
  deleteNote: (noteId) => 
    apiRequest(`/notes/${noteId}`, {
      method: 'DELETE',
    }),
  
  // 创建文件夹
  createFolder: (name, categoryId) => 
    apiRequest(`/notes/folders?name=${encodeURIComponent(name)}&category_id=${encodeURIComponent(categoryId)}`, {
      method: 'POST',
    }),
  
  // 获取标签
  getTags: () => apiRequest('/notes/tags'),
  
  // 创建标签
  createTag: (name) => 
    apiRequest('/notes/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ name }),
    }),
};

// AI相关API
export const aiAPI = {
  // AI文本润色
  polishText: (text, style = 'professional') => 
    apiRequest('/ai/polish-text', {
      method: 'POST',
      body: JSON.stringify({ text, style }),
    }),
  
  // AI分析笔记内容
  analyzeNote: (title, content) => 
    apiRequest('/ai/analyze-note', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    }),
  
  // AI解析任务
  parseTask: (requestData) => 
    apiRequest('/ai/parse-task', {
      method: 'POST',
      body: JSON.stringify(requestData),
    }),
};

// 任务相关API
export const tasksAPI = {
  // 获取任务列表
  getTasks: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    return apiRequest(`/tasks/${queryString ? `?${queryString}` : ''}`);
  },
  
  // 获取单个任务
  getTask: (taskId) => apiRequest(`/tasks/${taskId}`),
  
  // 创建任务
  createTask: (taskData) => 
    apiRequest('/tasks/', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),
  
  // 更新任务
  updateTask: (taskId, taskData) => 
    apiRequest(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    }),
  
  // 删除任务
  deleteTask: (taskId) => 
    apiRequest(`/tasks/${taskId}`, {
      method: 'DELETE',
    }),
  
  // 更新任务状态
  updateTaskStatus: (taskId, status) => 
    apiRequest(`/tasks/${taskId}/status?status=${status}`, {
      method: 'PATCH',
    }),
  
  // 获取日历事件
  getCalendarEvents: (start, end) => 
    apiRequest(`/tasks/calendar/events?start=${start}&end=${end}`),
  
  // 获取任务统计
  getTaskStats: () => apiRequest('/tasks/stats/summary'),
};

// 分类相关API（如果后端有的话）
export const categoriesAPI = {
  // 这里可以添加分类相关的API调用
  // 目前从笔记树状结构中获取分类信息
};

export default { notesAPI, aiAPI, tasksAPI, categoriesAPI };