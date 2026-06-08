import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "visitors.db");
export const PHOTOS_DIR = path.join(process.cwd(), "visitor-photos");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
    _db = new Database(DB_PATH);
    _db.exec(`
      CREATE TABLE IF NOT EXISTS visitors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        company TEXT NOT NULL,
        purpose TEXT NOT NULL,
        host TEXT NOT NULL,
        photo TEXT,
        signed_in_at TEXT NOT NULL,
        signed_out_at TEXT
      );
      CREATE TABLE IF NOT EXISTS hosts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        title TEXT,
        active INTEGER NOT NULL DEFAULT 1
      );
    `);
    // Add photo column to existing deployments that predate this migration
    try {
      _db.exec("ALTER TABLE visitors ADD COLUMN photo TEXT");
    } catch {
      // column already exists — safe to ignore
    }
  }
  return _db;
}
