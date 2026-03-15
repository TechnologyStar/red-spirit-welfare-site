import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth';
import quizRoutes from './routes/quiz';
import cardsRoutes from './routes/cards';
import gamesRoutes from './routes/games';
import pointsRoutes from './routes/points';
import redemptionRoutes from './routes/redemption';
import adminRoutes from './routes/admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

app.use(express.static(path.join(__dirname, '../../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
