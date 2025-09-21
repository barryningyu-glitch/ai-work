// Railway API 测试脚本
// 用法: node test-api.js https://your-app.up.railway.app

const https = require('https');
const http = require('http');

const apiUrl = process.argv[2];

if (!apiUrl) {
  console.log('❌ 请提供 Railway API URL');
  console.log('用法: node test-api.js https://your-app.up.railway.app');
  process.exit(1);
}

console.log('🧪 测试 Railway API 部署...');
console.log('🌐 API URL:', apiUrl);

// 测试端点列表
const testEndpoints = [
  '/health',
  '/api/',
  '/docs'
];

// 测试函数
const testEndpoint = (endpoint) => {
  return new Promise((resolve) => {
    const fullUrl = apiUrl + endpoint;
    const client = fullUrl.startsWith('https') ? https : http;
    
    const req = client.get(fullUrl, (res) => {
      const status = res.statusCode;
      const success = status >= 200 && status < 400;
      
      console.log(`${success ? '✅' : '❌'} ${endpoint} - 状态码: ${status}`);
      resolve({ endpoint, status, success });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${endpoint} - 错误: ${error.message}`);
      resolve({ endpoint, status: 0, success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`⏰ ${endpoint} - 超时`);
      resolve({ endpoint, status: 0, success: false, error: 'timeout' });
    });
  });
};

// 执行测试
const runTests = async () => {
  console.log('\n📋 开始测试 API 端点...\n');
  
  const results = [];
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  console.log('\n📊 测试结果汇总:');
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`✅ 成功: ${successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 Railway 部署成功！API 正常运行');
    console.log('🔄 现在可以更新前端配置了');
  } else {
    console.log('\n⚠️  部分端点测试失败，请检查部署日志');
  }
};

runTests();