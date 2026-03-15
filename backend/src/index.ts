import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import quizRoutes from './routes/quiz';
import cardsRoutes from './routes/cards';
import gamesRoutes from './routes/games';
import pointsRoutes from './routes/points';
import redemptionRoutes from './routes/redemption';
import adminRoutes from './routes/admin';
import { 
  securityHeaders, 
  sanitizeInput, 
  requestSizeLimit, 
  sqlInjectionCheck,
  generalLimiter,
  authLimiter,
  apiLimiter
} from './middleware/security';

// 验证必需的环境变量
const requiredEnvVars = ['JWT_SECRET', 'ADMIN_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ 缺少必需的环境变量:', missingEnvVars.join(', '));
  console.error('请在 .env 文件中设置这些变量');
  process.exit(1);
}

// 验证JWT密钥强度
const jwtSecret = process.env.JWT_SECRET!;
if (jwtSecret.length < 32) {
  console.warn('⚠️  警告: JWT_SECRET 长度应至少32个字符以确保安全');
}

const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: false, // 我们使用自定义CSP
  crossOriginEmbedderPolicy: false
}));

app.use(securityHeaders);
app.use(requestSizeLimit);
app.use(sanitizeInput);
app.use(sqlInjectionCheck);

// CORS配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key']
}));

// Body解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 速率限制
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);
app.use(generalLimiter);

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/redemption', redemptionRoutes);
app.use('/api/admin', adminRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve frontend static files
const frontendDistPath = process.env.NODE_ENV === 'production'
  ? path.join(process.cwd(), '../frontend/dist')
  : path.join(__dirname, '../../frontend/dist');

app.use(express.static(frontendDistPath));

// Handle SPA routing - send index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  // 不暴露错误详情给客户端
  const message = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误'
    : err.message || '服务器内部错误';
  
  res.status(err.status || 500).json({
    error: message,
    code: 'INTERNAL_ERROR'
  });
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`✅ 服务器运行在端口 ${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/redemption', redemptionRoutes);
app.use('/api/admin', adminRoutes);

const frontendPath = process.env.NODE_ENV === 'production' 
  ? path.join(process.cwd(), '../frontend/dist')
  : path.join(__dirname, '../../frontend/dist');

app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
