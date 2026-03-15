import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.NODE_ENV === 'production' 
  ? '/data/database.db'
  : path.join(__dirname, '../../data/database.db');

export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

export default db;
