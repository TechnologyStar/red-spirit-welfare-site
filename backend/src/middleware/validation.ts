import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// 验证错误处理
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: '输入验证失败',
      code: 'VALIDATION_ERROR',
      details: errors.array()
    });
  }
  next();
};

// 用户名验证规则
export const validateUsername = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度应在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
    .withMessage('用户名只能包含字母、数字、下划线和中文')
    .escape(),
  handleValidationErrors
];

// 密码验证规则
export const validatePassword = [
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('密码长度应在6-100个字符之间')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/)
    .withMessage('密码必须包含至少一个字母和一个数字'),
  handleValidationErrors
];

// 答题验证规则
export const validateAnswer = [
  body('questionId')
    .notEmpty()
    .withMessage('题目ID不能为空')
    .isString()
    .withMessage('题目ID必须是字符串'),
  body('answer')
    .notEmpty()
    .withMessage('答案不能为空')
    .isInt({ min: 0, max: 3 })
    .withMessage('答案必须是0-3之间的整数'),
  handleValidationErrors
];

// 抽卡验证
export const validateDraw = (req: Request, res: Response, next: NextFunction) => {
  // 抽卡不需要额外参数，但可以添加频率限制检查
  const lastDraw = req.headers['x-last-draw'];
  if (lastDraw) {
    const timeSinceLastDraw = Date.now() - parseInt(lastDraw as string);
    if (timeSinceLastDraw < 1000) { // 1秒内不能重复抽卡
      return res.status(429).json({
        error: '操作过于频繁，请稍后再试',
        code: 'TOO_FREQUENT'
      });
    }
  }
  next();
};

// 游戏数据验证
export const validateGameData = [
  body('clicks')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('点击次数无效'),
  body('correctAnswers')
    .optional()
    .isInt({ min: 0 })
    .withMessage('正确答案数无效'),
  body('totalQuestions')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('问题总数无效'),
  body('timeUsed')
    .optional()
    .isInt({ min: 0, max: 3600 })
    .withMessage('用时无效'),
  handleValidationErrors
];

// 兑换验证
export const validateRedemption = [
  body('prizeId')
    .notEmpty()
    .withMessage('奖品ID不能为空')
    .isString()
    .withMessage('奖品ID必须是字符串'),
  handleValidationErrors
];

// 管理员兑换码导入验证
export const validateImportCodes = [
  body('prizeId')
    .notEmpty()
    .withMessage('奖品ID不能为空'),
  body('codes')
    .isArray({ min: 1, max: 1000 })
    .withMessage('兑换码列表必须是1-1000个元素的数组'),
  body('codes.*')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('每个兑换码长度应在1-100个字符之间'),
  handleValidationErrors
];

// MongoDB风格的ObjectId验证
export const isValidObjectId = (id: string): boolean => {
  return /^[a-f\d]{24}$/i.test(id) || /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id);
};

// 通用ID验证
export const validateId = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName] || req.body[paramName];
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: '无效的ID',
        code: 'INVALID_ID'
      });
    }
    next();
  };
};
