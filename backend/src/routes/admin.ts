import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db';
import { adminMiddleware } from '../middleware/admin';

const router = Router();

router.post('/codes/import', adminMiddleware, (req: Request, res: Response) => {
  const { prizeId, codes } = req.body;

  if (!prizeId || !Array.isArray(codes) || codes.length === 0) {
    return res.status(400).json({ error: '奖品ID和兑换码列表不能为空' });
  }

  try {
    const prize = db.prepare('SELECT id FROM prizes WHERE id = ?').get(prizeId);
    if (!prize) {
      return res.status(404).json({ error: '奖品不存在' });
    }

    const insertCode = db.prepare(`
      INSERT OR IGNORE INTO redemption_codes (id, code, prize_id)
      VALUES (?, ?, ?)
    `);

    let imported = 0;
    let duplicates = 0;

    for (const code of codes) {
      if (!code || typeof code !== 'string') continue;

      const existing = db.prepare('SELECT id FROM redemption_codes WHERE code = ?').get(code.trim());
      if (existing) {
        duplicates++;
        continue;
      }

      try {
        insertCode.run(uuidv4(), code.trim(), prizeId);
        imported++;
      } catch (error) {
        duplicates++;
      }
    }

    db.prepare('UPDATE prizes SET stock = stock + ? WHERE id = ?').run(imported, prizeId);

    res.json({
      message: '导入完成',
      imported,
      duplicates,
      total: codes.length
    });
  } catch (error) {
    console.error('导入兑换码错误:', error);
    res.status(500).json({ error: '导入兑换码失败' });
  }
});

router.get('/stats', adminMiddleware, (req: Request, res: Response) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const totalPoints = db.prepare('SELECT SUM(points) as total FROM users').get() as any;
    const totalQuestions = db.prepare('SELECT COUNT(*) as count FROM questions').get() as any;
    const totalCards = db.prepare('SELECT COUNT(*) as count FROM cards').get() as any;
    const totalPrizes = db.prepare('SELECT COUNT(*) as count FROM prizes').get() as any;
    const totalRedemptions = db.prepare('SELECT COUNT(*) as count FROM redemptions').get() as any;

    res.json({
      stats: {
        totalUsers: totalUsers.count,
        totalPoints: totalPoints.total || 0,
        totalQuestions: totalQuestions.count,
        totalCards: totalCards.count,
        totalPrizes: totalPrizes.count,
        totalRedemptions: totalRedemptions.count
      }
    });
  } catch (error) {
    console.error('获取统计错误:', error);
    res.status(500).json({ error: '获取统计失败' });
  }
});

router.post('/questions', adminMiddleware, (req: Request, res: Response) => {
  const { question, options, answer, points, category } = req.body;

  if (!question || !Array.isArray(options) || answer === undefined || !points) {
    return res.status(400).json({ error: '题目信息不完整' });
  }

  try {
    const id = uuidv4();
    db.prepare(`
      INSERT INTO questions (id, question, options, answer, points, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, question, JSON.stringify(options), answer, points, category || '其他');

    res.json({
      message: '题目添加成功',
      question: { id, question, options, answer, points, category }
    });
  } catch (error) {
    console.error('添加题目错误:', error);
    res.status(500).json({ error: '添加题目失败' });
  }
});

router.post('/prizes', adminMiddleware, (req: Request, res: Response) => {
  const { name, description, imageUrl, pointsRequired, stock } = req.body;

  if (!name || !pointsRequired) {
    return res.status(400).json({ error: '奖品名称和所需积分不能为空' });
  }

  try {
    const id = uuidv4();
    db.prepare(`
      INSERT INTO prizes (id, name, description, image_url, points_required, stock)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, description, imageUrl, pointsRequired, stock || 0);

    res.json({
      message: '奖品添加成功',
      prize: { id, name, description, imageUrl, pointsRequired, stock }
    });
  } catch (error) {
    console.error('添加奖品错误:', error);
    res.status(500).json({ error: '添加奖品失败' });
  }
});

export default router;
