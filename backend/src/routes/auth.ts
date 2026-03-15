import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db';
import { AuthRequest, authMiddleware, generateToken } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: '用户名长度应在3-20个字符之间' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码长度至少6个字符' });
  }

  try {
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    db.prepare(`
      INSERT INTO users (id, username, password)
      VALUES (?, ?, ?)
    `).run(userId, username, hashedPassword);

    const token = generateToken(userId);

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: userId,
        username,
        points: 0
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

router.post('/login', async (req, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = generateToken(user.id);

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        points: user.points
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const user = db.prepare('SELECT id, username, points, created_at FROM users WHERE id = ?').get(req.userId) as any;
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ user });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

export default router;
