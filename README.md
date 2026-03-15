# 红色精神福利站

一个以红色精神、爱国情怀为主题的积分福利平台，支持答题、集卡、小游戏等多种方式获取积分，积分可兑换福利奖品。

## 功能特性

### 用户功能
- **答题系统**：回答红色精神相关问题获得积分，支持多轮答题
- **集卡系统**：收集红色主题卡片（红船精神、井冈山精神、长征精神等），集齐可获得500积分大礼包
- **趣味游戏**：
  - 红旗飘飘：快速点击红旗获得积分
  - 知识竞速：快速回答问题，速度和正确率决定积分
- **积分商城**：使用积分兑换精美奖品，支持兑换码自动发放
- **个人中心**：查看积分记录、兑换记录

### 管理员功能
- **数据统计**：查看用户数、积分总数、兑换数等统计数据
- **导入兑换码**：批量导入福利兑换码，自动关联奖品
- **添加题目**：添加新的答题题目
- **添加奖品**：添加新的兑换奖品

## 技术栈

- **前端**：React 18 + TypeScript + Vite + Tailwind CSS
- **后端**：Node.js + Express + TypeScript
- **数据库**：SQLite (better-sqlite3)
- **认证**：JWT
- **部署**：Zeabur

## 本地开发

### 前置要求
- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 初始化数据库

```bash
cd backend
npm run init-db
```

### 启动开发服务器

```bash
# 启动后端（在backend目录）
npm run dev

# 启动前端（在frontend目录，新终端）
npm run dev
```

前端默认运行在 http://localhost:3000
后端默认运行在 http://localhost:3001

## Zeabur 一键部署

### 方式一：使用部署按钮

[![Deploy on Zeabur](https://zeabur.com/deploy-button.svg)](https://zeabur.com/new/template?templateUrl=https://github.com/your-repo/red-spirit-welfare-site)

### 方式二：手动部署

1. Fork 本仓库到你的 GitHub
2. 登录 [Zeabur](https://zeabur.com)
3. 创建新项目
4. 添加 GitHub 仓库
5. Zeabur 会自动检测并部署服务

### 环境变量配置

在 Zeabur 控制台设置以下环境变量：

#### 后端服务
- `JWT_SECRET`: JWT密钥（必填，建议使用随机字符串）
- `ADMIN_KEY`: 管理员密钥（必填，用于访问管理后台）

#### 前端服务
- `VITE_API_URL`: 后端API地址（自动注入，格式：`${backend.URL}`）

## 项目结构

```
.
├── backend/              # 后端服务
│   ├── src/
│   │   ├── models/       # 数据模型（预留）
│   │   ├── routes/       # API路由
│   │   │   ├── auth.ts   # 用户认证
│   │   │   ├── quiz.ts   # 答题系统
│   │   │   ├── cards.ts  # 集卡系统
│   │   │   ├── games.ts  # 游戏系统
│   │   │   ├── points.ts # 积分系统
│   │   │   ├── redemption.ts # 兑换系统
│   │   │   └── admin.ts  # 管理员接口
│   │   ├── middleware/   # 中间件
│   │   │   ├── auth.ts   # JWT认证
│   │   │   └── admin.ts  # 管理员验证
│   │   ├── utils/        # 工具函数
│   │   │   └── db.ts     # 数据库连接
│   │   ├── index.ts      # 入口文件
│   │   └── initDb.ts     # 数据库初始化
│   ├── data/             # 数据存储（生产环境）
│   └── package.json
├── frontend/             # 前端应用
│   ├── src/
│   │   ├── components/   # 公共组件
│   │   │   └── Layout.tsx
│   │   ├── pages/        # 页面组件
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Quiz.tsx
│   │   │   ├── Cards.tsx
│   │   │   ├── Games.tsx
│   │   │   ├── Shop.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── admin/
│   │   │       └── AdminPanel.tsx
│   │   ├── hooks/        # 自定义hooks
│   │   │   └── useAuth.ts
│   │   ├── utils/        # 工具函数
│   │   │   └── api.ts
│   │   ├── App.tsx       # 主应用
│   │   └── main.tsx      # 入口文件
│   ├── index.html
│   └── package.json
├── zeabur.yaml           # Zeabur配置
├── start.sh              # 启动脚本
└── README.md
```

## API 文档

### 认证接口

#### 注册
```
POST /api/auth/register
Body: { username, password }
Response: { token, user }
```

#### 登录
```
POST /api/auth/login
Body: { username, password }
Response: { token, user }
```

#### 获取用户信息
```
GET /api/auth/me
Headers: Authorization: Bearer {token}
Response: { user }
```

### 答题接口

#### 获取题目
```
GET /api/quiz/questions?count=5
Headers: Authorization: Bearer {token}
Response: { questions }
```

#### 提交答案
```
POST /api/quiz/answer
Headers: Authorization: Bearer {token}
Body: { questionId, answer }
Response: { isCorrect, correctAnswer, pointsEarned, message }
```

### 集卡接口

#### 获取所有卡片
```
GET /api/cards/cards
Headers: Authorization: Bearer {token}
Response: { cards }
```

#### 获取我的卡片
```
GET /api/cards/my-cards
Headers: Authorization: Bearer {token}
Response: { myCards }
```

#### 抽卡
```
POST /api/cards/draw
Headers: Authorization: Bearer {token}
Response: { card, pointsSpent, isComplete, bonusPoints, message }
```

### 游戏接口

#### 红旗飘飘游戏
```
POST /api/games/red-flag
Headers: Authorization: Bearer {token}
Body: { clicks }
Response: { pointsEarned, message }
```

#### 知识竞速游戏
```
POST /api/games/knowledge-race
Headers: Authorization: Bearer {token}
Body: { correctAnswers, totalQuestions, timeUsed }
Response: { basePoints, timeBonus, totalPoints, message }
```

### 兑换接口

#### 获取奖品列表
```
GET /api/redemption/prizes
Response: { prizes }
```

#### 兑换奖品
```
POST /api/redemption/redeem
Headers: Authorization: Bearer {token}
Body: { prizeId }
Response: { message, redemption }
```

### 管理员接口

#### 导入兑换码
```
POST /api/admin/codes/import
Headers: x-admin-key: {adminKey}
Body: { prizeId, codes: string[] }
Response: { message, imported, duplicates, total }
```

#### 获取统计数据
```
GET /api/admin/stats
Headers: x-admin-key: {adminKey}
Response: { stats }
```

## 管理后台使用

1. 访问 `/admin` 路径
2. 输入管理员密钥（环境变量 `ADMIN_KEY` 的值）
3. 即可查看统计数据和导入兑换码

## 注意事项

- 数据库使用 SQLite，数据存储在 `backend/data/database.db`
- Zeabur 部署时需要配置持久化存储，否则重启后数据会丢失
- 管理员密钥请妥善保管，不要泄露

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
