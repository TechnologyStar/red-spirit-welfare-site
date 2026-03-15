import { Request, Response, NextFunction } from 'express';

const ADMIN_KEY = process.env.ADMIN_KEY || 'admin-secret-key';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = req.headers['x-admin-key'];

  if (!adminKey || adminKey !== ADMIN_KEY) {
    return res.status(403).json({ error: '管理员权限不足' });
  }

  next();
};
