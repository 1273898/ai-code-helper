# 连接问题排查指南

## 问题：无法连接到后端服务

### 1. 检查后端服务是否启动

**Windows PowerShell:**
```powershell
netstat -ano | findstr :8080
```

如果看到输出，说明端口被占用（服务可能已启动）
如果没有输出，说明服务未启动

### 2. 启动后端服务

在项目根目录执行：

```bash
# 使用 Maven
mvn spring-boot:run

# 或使用已编译的 JAR
java -jar target/ai-code-0.0.1-SNAPSHOT.jar
```

### 3. 验证后端服务

在浏览器访问：
- `http://localhost:8080/ai/test` - 应该返回 "API is working!"

### 4. 检查常见问题

#### 问题 A: CORS 错误
**症状**: 浏览器控制台显示 CORS 相关错误

**解决**: 
- 确保后端 `CorsConfig.java` 配置正确
- 检查 `@CrossOrigin` 注解是否添加

#### 问题 B: 端口被占用
**症状**: 启动时提示端口 8080 已被占用

**解决**:
```powershell
# 查找占用端口的进程
netstat -ano | findstr :8080

# 结束进程（替换 PID 为实际进程ID）
taskkill /PID <PID> /F
```

#### 问题 C: WebFlux 依赖缺失
**症状**: 编译错误或运行时错误

**解决**: 
- 确保 `pom.xml` 中包含 `spring-boot-starter-webflux` 依赖
- 执行 `mvn clean install` 重新编译

### 5. 前端连接测试

打开浏览器控制台（F12），查看：
- Network 标签：检查请求是否发送
- Console 标签：查看错误信息

### 6. 手动测试 SSE 连接

在浏览器控制台执行：
```javascript
const eventSource = new EventSource('http://localhost:8080/ai/chat?memoryId=test&message=你好');
eventSource.onmessage = (e) => console.log('收到:', e.data);
eventSource.onerror = (e) => console.error('错误:', e);
```

## 快速检查清单

- [ ] 后端服务已启动
- [ ] 端口 8080 可访问
- [ ] `/ai/test` 端点返回正常
- [ ] 浏览器控制台无 CORS 错误
- [ ] `pom.xml` 包含 WebFlux 依赖
- [ ] `application-local.yml` 配置了端口 8080

## 联系支持

如果以上方法都无法解决，请检查：
1. Java 版本是否为 21
2. Maven 版本是否兼容
3. 防火墙是否阻止了 8080 端口

