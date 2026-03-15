import db from './utils/db';

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    answer INTEGER NOT NULL,
    points INTEGER DEFAULT 10,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_answers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    is_correct INTEGER NOT NULL,
    points_earned INTEGER DEFAULT 0,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
  );

  CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    rarity TEXT DEFAULT 'common',
    theme TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_cards (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    card_id TEXT NOT NULL,
    obtained_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (card_id) REFERENCES cards(id)
  );

  CREATE TABLE IF NOT EXISTS game_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    game_type TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS prizes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    points_required INTEGER NOT NULL,
    stock INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS redemption_codes (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    prize_id TEXT NOT NULL,
    is_used INTEGER DEFAULT 0,
    used_by TEXT,
    used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prize_id) REFERENCES prizes(id),
    FOREIGN KEY (used_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS redemptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    prize_id TEXT NOT NULL,
    redemption_code TEXT,
    points_spent INTEGER NOT NULL,
    redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (prize_id) REFERENCES prizes(id)
  );

  CREATE TABLE IF NOT EXISTS point_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

console.log('数据库表创建成功');

const questions = [
  {
    id: 'q1',
    question: '中华人民共和国成立于哪一年？',
    options: JSON.stringify(['1949年', '1950年', '1948年', '1951年']),
    answer: 0,
    points: 10,
    category: '历史'
  },
  {
    id: 'q2',
    question: '中国共产党的成立时间是？',
    options: JSON.stringify(['1921年7月1日', '1920年7月1日', '1922年7月1日', '1919年7月1日']),
    answer: 0,
    points: 10,
    category: '历史'
  },
  {
    id: 'q3',
    question: '红军长征开始于哪一年？',
    options: JSON.stringify(['1934年', '1935年', '1936年', '1933年']),
    answer: 0,
    points: 10,
    category: '历史'
  },
  {
    id: 'q4',
    question: '延安精神的核心是什么？',
    options: JSON.stringify(['自力更生、艰苦奋斗', '改革开放', '与时俱进', '科学发展']),
    answer: 0,
    points: 15,
    category: '精神'
  },
  {
    id: 'q5',
    question: '井冈山精神的重要意义是什么？',
    options: JSON.stringify(['农村包围城市、武装夺取政权', '城市中心论', '议会斗争', '和平演变']),
    answer: 0,
    points: 15,
    category: '精神'
  }
];

const insertQuestion = db.prepare(`
  INSERT OR IGNORE INTO questions (id, question, options, answer, points, category)
  VALUES (@id, @question, @options, @answer, @points, @category)
`);

for (const q of questions) {
  insertQuestion.run(q);
}

console.log('初始化题目数据成功');

const cards = [
  {
    id: 'c1',
    name: '红船精神',
    description: '开天辟地、敢为人先的首创精神',
    image_url: '/cards/red-boat.svg',
    rarity: 'rare',
    theme: '建党精神'
  },
  {
    id: 'c2',
    name: '井冈山精神',
    description: '坚定信念、艰苦奋斗、实事求是、敢闯新路',
    image_url: '/cards/jinggangshan.svg',
    rarity: 'epic',
    theme: '革命精神'
  },
  {
    id: 'c3',
    name: '长征精神',
    description: '不怕牺牲、前赴后继、勇往直前、坚韧不拔',
    image_url: '/cards/long-march.svg',
    rarity: 'legendary',
    theme: '革命精神'
  },
  {
    id: 'c4',
    name: '延安精神',
    description: '自力更生、艰苦奋斗的创业精神',
    image_url: '/cards/yanan.svg',
    rarity: 'epic',
    theme: '革命精神'
  },
  {
    id: 'c5',
    name: '西柏坡精神',
    description: '谦虚谨慎、不骄不躁、艰苦奋斗',
    image_url: '/cards/xibaipo.svg',
    rarity: 'rare',
    theme: '革命精神'
  },
  {
    id: 'c6',
    name: '抗美援朝精神',
    description: '爱国主义、革命英雄主义、革命乐观主义',
    image_url: '/cards/kangmei.svg',
    rarity: 'legendary',
    theme: '爱国精神'
  },
  {
    id: 'c7',
    name: '两弹一星精神',
    description: '热爱祖国、无私奉献、自力更生、艰苦奋斗',
    image_url: '/cards/missile.svg',
    rarity: 'legendary',
    theme: '建设精神'
  },
  {
    id: 'c8',
    name: '雷锋精神',
    description: '全心全意为人民服务',
    image_url: '/cards/leifeng.svg',
    rarity: 'rare',
    theme: '奉献精神'
  }
];

const insertCard = db.prepare(`
  INSERT OR IGNORE INTO cards (id, name, description, image_url, rarity, theme)
  VALUES (@id, @name, @description, @image_url, @rarity, @theme)
`);

for (const c of cards) {
  insertCard.run(c);
}

console.log('初始化卡片数据成功');

const prizes = [
  {
    id: 'p1',
    name: '红色经典书籍套装',
    description: '包含《红星照耀中国》等经典红色书籍',
    image_url: '/prizes/books.svg',
    points_required: 500,
    stock: 100
  },
  {
    id: 'p2',
    name: '红色主题纪念品',
    description: '精美红色主题纪念徽章',
    image_url: '/prizes/badge.svg',
    points_required: 200,
    stock: 200
  },
  {
    id: 'p3',
    name: '革命圣地旅游券',
    description: '延安、井冈山等革命圣地旅游优惠券',
    image_url: '/prizes/travel.svg',
    points_required: 2000,
    stock: 50
  },
  {
    id: 'p4',
    name: '红色电影观影券',
    description: '红色主题电影观影券',
    image_url: '/prizes/movie.svg',
    points_required: 100,
    stock: 300
  }
];

const insertPrize = db.prepare(`
  INSERT OR IGNORE INTO prizes (id, name, description, image_url, points_required, stock)
  VALUES (@id, @name, @description, @image_url, @points_required, @stock)
`);

for (const p of prizes) {
  insertPrize.run(p);
}

console.log('初始化奖品数据成功');

db.close();
