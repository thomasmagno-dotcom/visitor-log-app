import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "visitors.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.exec(`
      CREATE TABLE IF NOT EXISTS visitors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        company TEXT NOT NULL,
        purpose TEXT NOT NULL,
        host TEXT NOT NULL,
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
  }
  return _db;
}
