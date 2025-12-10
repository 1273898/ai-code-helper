// 配置
const API_BASE = 'http://localhost:8080';
const CHAT_ENDPOINT = `${API_BASE}/ai/chat`;

// DOM 元素
const chatContainer = document.getElementById('chatContainer');
const chatPlaceholder = document.getElementById('chatPlaceholder');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const resetBtn = document.getElementById('resetBtn');
const chatIdEl = document.getElementById('chatId');
const statusText = document.getElementById('statusText');
const loadingOverlay = document.getElementById('loadingOverlay');

// 状态管理
let chatId = '';
let isStreaming = false;
let currentEventSource = null;

// 初始化
function init() {
    generateChatId();
    bindEvents();
    autoResizeInput();
}

// 生成聊天ID
function generateChatId() {
    chatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    chatIdEl.textContent = chatId;
}

// 绑定事件
function bindEvents() {
    // 发送按钮
    sendBtn.addEventListener('click', handleSend);
    
    // 输入框事件
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
    
    messageInput.addEventListener('input', () => {
        updateSendButton();
        autoResizeInput();
    });
    
    // 重置按钮
    resetBtn.addEventListener('click', handleReset);
    
    // 快速问题按钮
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const text = chip.getAttribute('data-text');
            messageInput.value = text;
            messageInput.focus();
            autoResizeInput();
            updateSendButton();
        });
    });
}

// 自动调整输入框高度
function autoResizeInput() {
    messageInput.style.height = 'auto';
    messageInput.style.height = `${Math.min(messageInput.scrollHeight, 120)}px`;
}

// 更新发送按钮状态
function updateSendButton() {
    const hasText = messageInput.value.trim().length > 0;
    sendBtn.disabled = !hasText || isStreaming;
}

// 滚动到底部
function scrollToBottom() {
    requestAnimationFrame(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    });
}

// 创建消息气泡
function createMessage(role, content, isStreaming = false) {
    // 隐藏占位符
    if (chatPlaceholder) {
        chatPlaceholder.style.display = 'none';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // 头像
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = role === 'user' ? '我' : 'AI';
    
    // 消息气泡
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = content;
    
    // 如果是流式输出，添加ID以便更新
    if (isStreaming) {
        textDiv.id = `streaming-${Date.now()}`;
    }
    
    // 时间戳
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    bubble.appendChild(textDiv);
    bubble.appendChild(timeDiv);
    
    messageContent.appendChild(avatar);
    messageContent.appendChild(bubble);
    messageDiv.appendChild(messageContent);
    
    chatContainer.appendChild(messageDiv);
    scrollToBottom();
    
    return textDiv;
}

// 显示打字指示器
function showTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai';
    messageDiv.id = 'typing-indicator';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = 'AI';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    
    bubble.appendChild(typingDiv);
    messageContent.appendChild(avatar);
    messageContent.appendChild(bubble);
    messageDiv.appendChild(messageContent);
    
    chatContainer.appendChild(messageDiv);
    scrollToBottom();
}

// 移除打字指示器
function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// 发送消息
async function handleSend() {
    const message = messageInput.value.trim();
    if (!message || isStreaming) return;
    
    // 创建用户消息
    createMessage('user', message);
    
    // 清空输入框
    messageInput.value = '';
    autoResizeInput();
    updateSendButton();
    
    // 显示AI回复区域
    showTypingIndicator();
    
    // 开始流式接收
    await streamChatResponse(message);
}

// 检查后端连接
async function checkBackendConnection() {
    try {
        const testResponse = await fetch(`${API_BASE}/ai/test`, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        });
        return testResponse.ok;
    } catch (error) {
        console.error('Backend connection check failed:', error);
        return false;
    }
}

// 流式接收AI回复
async function streamChatResponse(message) {
    isStreaming = true;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="send-icon">⏸️</span><span class="send-text">生成中...</span>';
    statusText.textContent = 'AI 正在思考...';
    
    // 移除打字指示器
    removeTypingIndicator();
    
    // 创建AI消息气泡
    const aiMessageText = createMessage('ai', '', true);
    const streamingId = aiMessageText.id;
    
    // 构建SSE URL
    const url = `${CHAT_ENDPOINT}?memoryId=${encodeURIComponent(chatId)}&message=${encodeURIComponent(message)}`;
    
    // 先检查连接
    const isConnected = await checkBackendConnection();
    if (!isConnected) {
        const textElement = document.getElementById(streamingId);
        if (textElement) {
            textElement.textContent = '❌ 无法连接到后端服务！\n\n请确保：\n1. 后端服务已启动\n2. 服务运行在 http://localhost:8080\n3. 检查控制台是否有错误信息';
            textElement.style.color = '#ef4444';
            textElement.style.whiteSpace = 'pre-line';
        }
        handleStreamEnd();
        showToast('无法连接到后端服务，请检查服务是否启动');
        return;
    }
    
    try {
        // 使用 EventSource 接收 SSE
        currentEventSource = new EventSource(url);
        
        let buffer = '';
        let hasReceivedData = false;
        
        // 设置超时检测
        const timeout = setTimeout(() => {
            if (!hasReceivedData && currentEventSource) {
                currentEventSource.close();
                const textElement = document.getElementById(streamingId);
                if (textElement) {
                    textElement.textContent = '⏱️ 请求超时，请稍后重试';
                    textElement.style.color = '#ef4444';
                }
                handleStreamEnd();
                showToast('请求超时，请检查网络连接');
            }
        }, 30000); // 30秒超时
        
        currentEventSource.onopen = () => {
            console.log('SSE 连接已建立');
            statusText.textContent = '正在接收回复...';
        };
        
        currentEventSource.onmessage = (event) => {
            hasReceivedData = true;
            clearTimeout(timeout);
            const data = event.data;
            
            // 检查是否结束
            if (data === '[DONE]' || data.trim() === '') {
                currentEventSource.close();
                handleStreamEnd();
                return;
            }
            
            // 累积文本
            buffer += data;
            
            // 更新消息内容
            const textElement = document.getElementById(streamingId);
            if (textElement) {
                textElement.textContent = buffer;
                scrollToBottom();
            }
        };
        
        currentEventSource.onerror = (error) => {
            clearTimeout(timeout);
            console.error('SSE Error:', error);
            
            // 检查连接状态
            if (currentEventSource.readyState === EventSource.CLOSED) {
                currentEventSource.close();
                
                // 显示错误消息
                const textElement = document.getElementById(streamingId);
                if (textElement) {
                    if (buffer) {
                        textElement.textContent = buffer + '\n\n⚠️ 连接已断开';
                        textElement.style.color = '#f59e0b';
                    } else {
                        textElement.textContent = '❌ 连接失败！\n\n可能的原因：\n1. 后端服务未启动\n2. CORS 配置问题\n3. 网络连接问题\n\n请检查后端服务是否正常运行在 http://localhost:8080';
                        textElement.style.color = '#ef4444';
                        textElement.style.whiteSpace = 'pre-line';
                    }
                }
                
                handleStreamEnd();
                showToast('连接已断开，请检查后端服务');
            }
        };
        
    } catch (error) {
        console.error('Error starting stream:', error);
        removeTypingIndicator();
        
        // 显示错误消息
        const errorText = createMessage('ai', `❌ 无法建立连接！\n\n错误信息：${error.message}\n\n请确保后端服务已启动并运行在 http://localhost:8080`);
        errorText.style.color = '#ef4444';
        errorText.style.whiteSpace = 'pre-line';
        
        handleStreamEnd();
        showToast('连接失败：' + error.message);
    }
}

// 处理流结束
function handleStreamEnd() {
    isStreaming = false;
    currentEventSource = null;
    sendBtn.disabled = false;
    sendBtn.innerHTML = '<span class="send-icon">📤</span><span class="send-text">发送</span>';
    statusText.textContent = '就绪';
    updateSendButton();
}

// 重置聊天
function handleReset() {
    if (isStreaming) {
        if (currentEventSource) {
            currentEventSource.close();
            currentEventSource = null;
        }
        handleStreamEnd();
    }
    
    // 清空聊天记录
    chatContainer.innerHTML = '';
    if (chatPlaceholder) {
        chatPlaceholder.style.display = 'flex';
    }
    
    // 生成新的聊天ID
    generateChatId();
    
    // 清空输入框
    messageInput.value = '';
    autoResizeInput();
    updateSendButton();
    
    statusText.textContent = '已重置会话';
    setTimeout(() => {
        statusText.textContent = '就绪';
    }, 2000);
}

// 显示提示消息
function showToast(message) {
    // 创建临时提示
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1e293b;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

// 页面可见性变化时处理
document.addEventListener('visibilitychange', () => {
    if (document.hidden && currentEventSource) {
        // 页面隐藏时可以选择关闭连接或保持连接
        // 这里选择保持连接，以便用户切换回来时继续接收
    }
});

