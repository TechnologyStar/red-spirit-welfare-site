import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth';
import quizRoutes from './routes/quiz';
import cardsRoutes from './routes/cards';
import gamesRoutes from './routes/games';
import pointsRoutes from './routes/points';
import redemptionRoutes from './routes/redemption';
import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/redemption', redemptionRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend static files
const frontendDistPath = process.env.NODE_ENV === 'production'
  ? path.join(process.cwd(), '../frontend/dist')
  : path.join(__dirname, '../../frontend/dist');

app.use(express.static(frontendDistPath));

// Handle SPA routing - send index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
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
