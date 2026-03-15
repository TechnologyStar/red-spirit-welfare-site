import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/red-flag', authMiddleware, (req: AuthRequest, res: Response) => {
  const { clicks } = req.body;

  if (!clicks || clicks < 0) {
    return res.status(400).json({ error: '点击次数无效' });
  }

  try {
    const maxClicks = 100;
    const effectiveClicks = Math.min(clicks, maxClicks);
    const pointsEarned = Math.floor(effectiveClicks / 10);

    if (pointsEarned > 0) {
      db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(pointsEarned, req.userId);

      db.prepare(`
        INSERT INTO point_transactions (id, user_id, amount, type, description)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), req.userId, pointsEarned, 'earn', '红旗飘飘游戏奖励');

      db.prepare(`
        INSERT INTO game_records (id, user_id, game_type, score, points_earned)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), req.userId, 'red-flag', effectiveClicks, pointsEarned);
    }

    res.json({
      pointsEarned,
      message: pointsEarned > 0 ? `获得${pointsEarned}积分！` : '继续努力！'
    });
  } catch (error) {
    console.error('游戏记录错误:', error);
    res.status(500).json({ error: '游戏记录失败' });
  }
});

router.post('/knowledge-race', authMiddleware, (req: AuthRequest, res: Response) => {
  const { correctAnswers, totalQuestions, timeUsed } = req.body;

  if (correctAnswers === undefined || !totalQuestions || !timeUsed) {
    return res.status(400).json({ error: '游戏数据不完整' });
  }

  try {
    const basePoints = correctAnswers * 5;
    const timeBonus = Math.max(0, 60 - timeUsed);
    const totalPoints = basePoints + timeBonus;

    if (totalPoints > 0) {
      db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(totalPoints, req.userId);

      db.prepare(`
        INSERT INTO point_transactions (id, user_id, amount, type, description)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), req.userId, totalPoints, 'earn', '知识竞速游戏奖励');

      db.prepare(`
        INSERT INTO game_records (id, user_id, game_type, score, points_earned)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), req.userId, 'knowledge-race', correctAnswers, totalPoints);
    }

    res.json({
      basePoints,
      timeBonus,
      totalPoints,
      message: `恭喜！获得${totalPoints}积分！`
    });
  } catch (error) {
    console.error('游戏记录错误:', error);
    res.status(500).json({ error: '游戏记录失败' });
  }
});

router.get('/history', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const history = db.prepare(`
      SELECT * FROM game_records
      WHERE user_id = ?
      ORDER BY played_at DESC
      LIMIT 50
    `).all(req.userId);

    res.json({ history });
  } catch (error) {
    console.error('获取游戏历史错误:', error);
    res.status(500).json({ error: '获取游戏历史失败' });
  }
});

export default router;
