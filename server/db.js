const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const DATA_DIR = path.join(__dirname, 'data')
const DB_PATH = path.join(DATA_DIR, 'mhcc.db')
const MIGRATION_PATH = path.join(__dirname, 'migrations', '001_init.sql')

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(DB_PATH)

// Enable WAL for better concurrent read performance and safer writes
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Run migration on startup (CREATE TABLE IF NOT EXISTS — safe to re-run)
const migration = fs.readFileSync(MIGRATION_PATH, 'utf8')
db.exec(migration)

module.exports = db
