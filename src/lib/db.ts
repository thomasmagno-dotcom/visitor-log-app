import { createClient } from "@libsql/client";
import { GMP_POLICY, COMMUNICABLE_DISEASE_POLICY } from "./policies";

export type Policy = {
  id: number;
  key: string;
  title: string;
  version: string;
  effective_date: string;
  body: string;
  updated_at: string;
};

export type Visitor = {
  id: number;
  name: string;
  company: string;
  purpose: string;
  host: string;
  email: string | null;
  phone: string | null;
  photo: string | null;
  signed_in_at: string;
  signed_out_at: string | null;
};

export type Host = {
  id: number;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  active: number;
};

let _client: ReturnType<typeof createClient> | null = null;

export function getDb() {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

let _initialized = false;

export async function initDb() {
  if (_initialized) return;
  _initialized = true;

  const db = getDb();

  // Create tables
  for (const sql of [
    `CREATE TABLE IF NOT EXISTS visitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      purpose TEXT NOT NULL,
      host TEXT NOT NULL,
      photo TEXT,
      signed_in_at TEXT NOT NULL,
      signed_out_at TEXT,
      email TEXT,
      phone TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS hosts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      title TEXT,
      email TEXT,
      phone TEXT,
      active INTEGER NOT NULL DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS policies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      version TEXT NOT NULL,
      effective_date TEXT NOT NULL,
      body TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  ]) {
    await db.execute(sql);
  }

  // Seed policies if not already present
  const now = new Date().toISOString();
  for (const p of [GMP_POLICY, COMMUNICABLE_DISEASE_POLICY]) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO policies (key, title, version, effective_date, body, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [p.key, p.title, p.version, p.effectiveDate, p.body, now],
    });
  }
}
