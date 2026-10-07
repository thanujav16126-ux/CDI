import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

const sqlite = new Database('cropguard.db');
sqlite.exec(`CREATE TABLE IF NOT EXISTS scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  crop TEXT NOT NULL,
  disease TEXT NOT NULL,
  healthy INTEGER NOT NULL,
  confidence INTEGER NOT NULL,
  thumb TEXT,
  created_at TEXT NOT NULL
)`);

export const db = drizzle(sqlite, { schema });
