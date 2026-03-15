import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/cards', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const cards = db.prepare('SELECT * FROM cards').all();
    res.json({ cards });
  } catch (error) {
    console.error('获取卡片错误:', error);
    res.status(500).json({ error: '获取卡片失败' });
  }
});

router.get('/my-cards', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const myCards = db.prepare(`
      SELECT uc.*, c.name, c.description, c.image_url, c.rarity, c.theme
      FROM user_cards uc
      JOIN cards c ON uc.card_id = c.id
      WHERE uc.user_id = ?
      ORDER BY uc.obtained_at DESC
    `).all(req.userId);

    res.json({ myCards });
  } catch (error) {
    console.error('获取我的卡片错误:', error);
    res.status(500).json({ error: '获取我的卡片失败' });
  }
});

router.post('/draw', authMiddleware, (req: AuthRequest, res: Response) => {
  const costPoints = 50;

  try {
    const user = db.prepare('SELECT points FROM users WHERE id = ?').get(req.userId) as any;
    if (!user || user.points < costPoints) {
      return res.status(400).json({ error: '积分不足，需要50积分' });
    }

    const cards = db.prepare('SELECT * FROM cards').all() as any[];
    if (cards.length === 0) {
      return res.status(400).json({ error: '没有可抽的卡片' });
    }

    const rarityWeights = {
      legendary: 5,
      epic: 15,
      rare: 30,
      common: 50
    };

    const totalWeight = cards.reduce((sum, card) => sum + (rarityWeights[card.rarity as keyof typeof rarityWeights] || 50), 0);
    let random = Math.random() * totalWeight;
    
    let selectedCard = cards[0];
    for (const card of cards) {
      random -= rarityWeights[card.rarity as keyof typeof rarityWeights] || 50;
      if (random <= 0) {
        selectedCard = card;
        break;
      }
    }

    const cardId = uuidv4();
    db.prepare(`
      INSERT INTO user_cards (id, user_id, card_id)
      VALUES (?, ?, ?)
    `).run(cardId, req.userId, selectedCard.id);

    db.prepare('UPDATE users SET points = points - ? WHERE id = ?').run(costPoints, req.userId);

    db.prepare(`
      INSERT INTO point_transactions (id, user_id, amount, type, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), req.userId, -costPoints, 'spend', '抽卡消费');

    const allCards = db.prepare('SELECT DISTINCT card_id FROM user_cards WHERE user_id = ?').all(req.userId) as any[];
    const isComplete = cards.length === allCards.length;

    if (isComplete) {
      const bonusPoints = 500;
      db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(bonusPoints, req.userId);
      
      db.prepare(`
        INSERT INTO point_transactions (id, user_id, amount, type, description)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), req.userId, bonusPoints, 'earn', '集齐所有卡片奖励');

      return res.json({
        card: selectedCard,
        pointsSpent: costPoints,
        isComplete: true,
        bonusPoints,
        message: `恭喜集齐所有卡片！获得${bonusPoints}积分奖励！`
      });
    }

    res.json({
      card: selectedCard,
      pointsSpent: costPoints,
      isComplete: false,
      message: '抽卡成功'
    });
  } catch (error) {
    console.error('抽卡错误:', error);
    res.status(500).json({ error: '抽卡失败' });
  }
});

export default router;
