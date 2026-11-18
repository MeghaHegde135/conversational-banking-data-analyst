import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';

// Use native Node.js SQLite synchronous database engine
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { DatabaseSync } = require('node:sqlite');

// Load environment variables if not already loaded
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let dbInstance: any = null;

export function getDbFilePath(): string {
  const configured = process.env.DB_FILE || './src/database/banking.db';
  if (path.isAbsolute(configured)) {
    return configured;
  }
  return path.resolve(__dirname, '../../', configured);
}

export function getDatabase(customPath?: string): any {
  if (dbInstance && !customPath) {
    return dbInstance;
  }

  const dbPath = customPath || getDbFilePath();
  const dbDir = path.dirname(dbPath);

  if (dbPath !== ':memory:' && !fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  // CRITICAL: Always enforce SQLite Foreign Key Constraints
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  if (!customPath) {
    dbInstance = db;
  }

  return db;
}

export function initSchema(db: any): void {
  let schemePath = path.resolve(__dirname, 'scheme.sql');
  if (!fs.existsSync(schemePath)) {
    schemePath = path.resolve(__dirname, '../../src/database/scheme.sql');
  }
  const sql = fs.readFileSync(schemePath, 'utf-8');
  db.exec(sql);
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
