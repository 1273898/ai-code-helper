# AI 编程小助手 - 前端项目

## 项目说明

这是一个单页面聊天应用，用于与 AI 编程助手进行实时对话。

## 功能特性

- ✅ 实时流式对话（SSE）
- ✅ 美观的聊天界面
- ✅ 自动生成会话ID
- ✅ 快速问题模板
- ✅ 响应式设计
- ✅ 打字动画效果
- ✅ 消息时间戳
- ✅ 新建会话功能

## 文件结构

```
frontend/
├── index.html    # 主页面
├── styles.css    # 样式文件
├── app.js        # 主要逻辑
└── README.md     # 说明文档
```

## 使用方法

### 1. 启动后端服务

确保后端服务运行在 `http://localhost:8080`

### 2. 打开前端页面

直接在浏览器中打开 `index.html` 文件，或者使用本地服务器：

```bash
# 使用 Python 启动简单服务器（Python 3）
python -m http.server 8000

# 或使用 Node.js 的 http-server
npx http-server -p 8000
```

然后在浏览器访问：`http://localhost:8000`

### 3. 使用说明

- 在输入框中输入问题，按 `Enter` 发送
- 按 `Shift + Enter` 换行
- 点击快速问题按钮快速提问
- 点击右上角的 🔄 按钮新建会话

## API 接口

前端调用后端接口：
- **URL**: `http://localhost:8080/ai/chat`
- **方法**: GET
- **参数**: 
  - `memoryId`: 会话ID（字符串）
  - `message`: 用户消息（字符串）
- **返回**: Server-Sent Events (SSE) 流

## 技术栈

- 原生 JavaScript (ES6+)
- 原生 CSS3
- EventSource API (SSE)
- 响应式设计

## 浏览器兼容性

- Chrome/Edge (推荐)
- Firefox
- Safari
- 不支持 IE

## 注意事项

1. 确保后端服务已启动并运行在 8080 端口
2. 如果遇到 CORS 错误，检查后端 CORS 配置
3. 确保浏览器支持 EventSource API

