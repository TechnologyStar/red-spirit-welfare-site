# 红色精神福利站 - 安全配置指南

## 快速开始

### 1. 环境配置

复制环境变量示例文件：
```bash
cp backend/.env.example backend/.env
```

编辑 `backend/.env` 文件：
```env
# JWT密钥（必须至少32个字符，建议使用随机字符串）
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long-change-this

# 管理员密钥（用于访问管理后台）
ADMIN_KEY=your-admin-secret-key-change-this

# 运行环境
NODE_ENV=development

# 服务器端口
PORT=3001

# 允许的跨域来源（生产环境用逗号分隔）
ALLOWED_ORIGINS=http://localhost:3000
```

### 2. 启动服务

```bash
# 安装依赖
cd backend && npm install
cd ../frontend && npm install

# 初始化数据库
cd backend && npm run init-db

# 开发模式
# 后端
cd backend && npm run dev

# 前端（新终端）
cd frontend && npm run dev

# 生产模式
cd backend
npm run build
npm start
```

## 安全功能

### 1. 认证与授权
- ✅ JWT令牌认证（7天有效期）
- ✅ 密码加密（bcrypt 12轮）
- ✅ 密码强度验证（必须包含字母和数字）
- ✅ 登录失败不暴露具体错误

### 2. 速率限制
- **通用限制**: 100请求/15分钟
- **认证接口**: 5次尝试/15分钟
- **游戏API**: 30请求/分钟

### 3. 输入验证
- 用户名：3-20字符，字母数字下划线中文
- 密码：6-100字符，必须包含字母和数字
- SQL注入检测
- XSS防护（输入清理）
- 请求大小限制（10MB）

### 4. HTTP安全头
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 5. CORS配置
- 生产环境限制允许的来源
- 限制HTTP方法
- 限制允许的请求头

## 管理后台

### 访问方式
1. 访问 `/admin` 路径
2. 输入 `ADMIN_KEY` 环境变量的值

### 管理员功能
- 查看统计数据
- 批量导入兑换码
- 添加题目和奖品

## 生产部署

### Zeabur部署

1. 在Zeabur创建新项目
2. 连接GitHub仓库
3. 设置环境变量：
   ```
   JWT_SECRET=<你的JWT密钥>
   ADMIN_KEY=<你的管理员密钥>
   NODE_ENV=production
   ALLOWED_ORIGINS=https://你的域名
   ```

### 部署前检查清单

- [ ] 修改 `JWT_SECRET` 为强密钥（至少32字符）
- [ ] 修改 `ADMIN_KEY` 为强密钥
- [ ] 设置 `NODE_ENV=production`
- [ ] 配置 `ALLOWED_ORIGINS`
- [ ] 确保使用HTTPS
- [ ] 配置数据库备份
- [ ] 设置日志监控

## 安全建议

### 1. 定期维护
```bash
# 检查依赖漏洞
npm audit

# 修复漏洞
npm audit fix

# 更新依赖
npm update
```

### 2. 监控日志
- 关注异常登录尝试
- 监控API调用频率
- 记录管理员操作
- 追踪兑换码使用

### 3. 数据备份
```bash
# 备份SQLite数据库
cp backend/data/database.db backups/database_$(date +%Y%m%d).db
```

### 4. 密钥轮换
- 定期更换 `JWT_SECRET`
- 定期更换 `ADMIN_KEY`
- 使用强随机密码生成器

### 5. 访问控制
- 限制管理后台访问IP
- 实施最小权限原则
- 定期审查用户权限

## 常见问题

### Q: 如何重置用户密码？
A: 目前需要直接操作数据库，未来会添加密码重置功能。

### Q: 如何查看API日志？
A: 服务器会自动记录请求日志，查看控制台输出或日志文件。

### Q: 兑换码泄露怎么办？
A: 在数据库中删除对应的兑换码记录，或联系用户重新发放。

### Q: 如何防止恶意刷分？
A: 系统已实现速率限制和输入验证，异常行为会被自动拦截。

## 技术支持

- GitHub Issues: https://github.com/TechnologyStar/red-spirit-welfare-site/issues
- 查看完整文档: README.md
- 安全问题: 请私下联系维护者
