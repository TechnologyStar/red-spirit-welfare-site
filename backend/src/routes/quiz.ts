import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/questions', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const count = parseInt(req.query.count as string) || 5;
    const questions = db.prepare(`
      SELECT id, question, options, points, category
      FROM questions
      ORDER BY RANDOM()
      LIMIT ?
    `).all(count) as any[];

    res.json({ questions });
  } catch (error) {
    console.error('获取题目错误:', error);
    res.status(500).json({ error: '获取题目失败' });
  }
});

router.post('/answer', authMiddleware, (req: AuthRequest, res: Response) => {
  const { questionId, answer } = req.body;

  if (!questionId || answer === undefined) {
    return res.status(400).json({ error: '题目ID和答案不能为空' });
  }

  try {
    const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(questionId) as any;
    if (!question) {
      return res.status(404).json({ error: '题目不存在' });
    }

    const existingAnswer = db.prepare(`
      SELECT id FROM user_answers 
      WHERE user_id = ? AND question_id = ?
    `).get(req.userId, questionId);

    if (existingAnswer) {
      return res.status(400).json({ error: '该题目已回答过' });
    }

    const isCorrect = answer === question.answer;
    const pointsEarned = isCorrect ? question.points : 0;

    db.prepare(`
      INSERT INTO user_answers (id, user_id, question_id, is_correct, points_earned)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), req.userId, questionId, isCorrect ? 1 : 0, pointsEarned);

    if (isCorrect) {
      db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(pointsEarned, req.userId);
      
      db.prepare(`
        INSERT INTO point_transactions (id, user_id, amount, type, description)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), req.userId, pointsEarned, 'earn', '答题正确获得积分');
    }

    res.json({
      isCorrect,
      correctAnswer: question.answer,
      pointsEarned,
      message: isCorrect ? '回答正确！' : '回答错误'
    });
  } catch (error) {
    console.error('答题错误:', error);
    res.status(500).json({ error: '答题失败' });
  }
});

router.get('/history', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const history = db.prepare(`
      SELECT ua.*, q.question, q.category
      FROM user_answers ua
      JOIN questions q ON ua.question_id = q.id
      WHERE ua.user_id = ?
      ORDER BY ua.answered_at DESC
      LIMIT 50
    `).all(req.userId);

    res.json({ history });
  } catch (error) {
    console.error('获取答题历史错误:', error);
    res.status(500).json({ error: '获取答题历史失败' });
  }
});

export default router;
