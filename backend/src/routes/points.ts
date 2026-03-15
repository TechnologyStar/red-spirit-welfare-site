import { Router, Response } from 'express';
import db from '../utils/db';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/balance', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const user = db.prepare('SELECT points FROM users WHERE id = ?').get(req.userId) as any;
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ points: user.points });
  } catch (error) {
    console.error('获取积分错误:', error);
    res.status(500).json({ error: '获取积分失败' });
  }
});

router.get('/transactions', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const transactions = db.prepare(`
      SELECT * FROM point_transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `).all(req.userId);

    res.json({ transactions });
  } catch (error) {
    console.error('获取积分记录错误:', error);
    res.status(500).json({ error: '获取积分记录失败' });
  }
});

export default router;
