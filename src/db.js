import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';

// Ensure the data directory exists
mkdirSync('data', { recursive: true });

// Initialize SQLite database (persistent)
const db = new Database('data/bot.db');
db.pragma('journal_mode = wal');

/* ---- Database Schema ---- */
db.exec(`
CREATE TABLE IF NOT EXISTS pokemon (
  instance_id   TEXT PRIMARY KEY,
  owner_id      TEXT NOT NULL,
  dex_name      TEXT NOT NULL,
  level         INTEGER NOT NULL DEFAULT 100,
  ivs           TEXT NOT NULL,          /* JSON string: {hp,atk,def,spa,spd,spe} */
  nature        TEXT NOT NULL DEFAULT 'hardy',
  moves         TEXT NOT NULL DEFAULT '[]'   /* JSON array */
);

CREATE TABLE IF NOT EXISTS users (
  discord_id      TEXT PRIMARY KEY,
  active_pokemon  TEXT
);
`);

export default db;

