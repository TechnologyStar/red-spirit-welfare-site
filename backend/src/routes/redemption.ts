import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/prizes', (req, res: Response) => {
  try {
    const prizes = db.prepare('SELECT * FROM prizes WHERE stock > 0').all();
    res.json({ prizes });
  } catch (error) {
    console.error('获取奖品错误:', error);
    res.status(500).json({ error: '获取奖品失败' });
  }
});

router.post('/redeem', authMiddleware, (req: AuthRequest, res: Response) => {
  const { prizeId } = req.body;

  if (!prizeId) {
    return res.status(400).json({ error: '奖品ID不能为空' });
  }

  try {
    const prize = db.prepare('SELECT * FROM prizes WHERE id = ?').get(prizeId) as any;
    if (!prize) {
      return res.status(404).json({ error: '奖品不存在' });
    }

    if (prize.stock <= 0) {
      return res.status(400).json({ error: '奖品库存不足' });
    }

    const user = db.prepare('SELECT points FROM users WHERE id = ?').get(req.userId) as any;
    if (!user || user.points < prize.points_required) {
      return res.status(400).json({ error: '积分不足' });
    }

    const redemptionCode = db.prepare(`
      SELECT * FROM redemption_codes
      WHERE prize_id = ? AND is_used = 0
      LIMIT 1
    `).get(prizeId) as any;

    db.prepare('UPDATE users SET points = points - ? WHERE id = ?').run(prize.points_required, req.userId);

    db.prepare(`
      INSERT INTO point_transactions (id, user_id, amount, type, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), req.userId, -prize.points_required, 'spend', `兑换奖品：${prize.name}`);

    const redemptionId = uuidv4();
    let code = null;

    if (redemptionCode) {
      db.prepare(`
        UPDATE redemption_codes
        SET is_used = 1, used_by = ?, used_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(req.userId, redemptionCode.id);

      code = redemptionCode.code;
    }

    db.prepare(`
      INSERT INTO redemptions (id, user_id, prize_id, redemption_code, points_spent)
      VALUES (?, ?, ?, ?, ?)
    `).run(redemptionId, req.userId, prizeId, code, prize.points_required);

    db.prepare('UPDATE prizes SET stock = stock - 1 WHERE id = ?').run(prizeId);

    res.json({
      message: '兑换成功',
      redemption: {
        id: redemptionId,
        prize: prize.name,
        code,
        pointsSpent: prize.points_required
      }
    });
  } catch (error) {
    console.error('兑换错误:', error);
    res.status(500).json({ error: '兑换失败' });
  }
});

router.get('/my-redemptions', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const redemptions = db.prepare(`
      SELECT r.*, p.name as prize_name, p.description as prize_description, p.image_url
      FROM redemptions r
      JOIN prizes p ON r.prize_id = p.id
      WHERE r.user_id = ?
      ORDER BY r.redeemed_at DESC
    `).all(req.userId);

    res.json({ redemptions });
  } catch (error) {
    console.error('获取兑换记录错误:', error);
    res.status(500).json({ error: '获取兑换记录失败' });
  }
});

export default router;
