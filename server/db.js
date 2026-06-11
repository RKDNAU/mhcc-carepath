const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'mhcc.db')
const MIGRATIONS_DIR = path.join(__dirname, 'migrations')

const DB_DIR = path.dirname(DB_PATH)
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })

const db = new Database(DB_PATH)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  )
`)

function runSqlMigration(version, sql) {
  const statements = sql.split(';').map(s => s.trim()).filter(Boolean)
  for (const statement of statements) {
    try {
      db.exec(statement)
    } catch (err) {
      if (!/duplicate column name/i.test(err.message)) throw err
    }
  }
  db.prepare('INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (?, ?)').run(version, new Date().toISOString())
}

for (const file of fs.readdirSync(MIGRATIONS_DIR).filter(f => /^\d+_.*\.sql$/.test(f)).sort()) {
  const version = file.replace(/\.sql$/, '')
  const applied = db.prepare('SELECT 1 FROM schema_migrations WHERE version = ?').get(version)
  if (!applied) runSqlMigration(version, fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8'))
}

const ageCols = db.pragma('table_info(program_metrics_age)').map(c => c.name)
if (!ageCols.includes('positive_outcome')) db.exec('ALTER TABLE program_metrics_age ADD COLUMN positive_outcome INTEGER DEFAULT 0')
if (!ageCols.includes('negative_outcome')) db.exec('ALTER TABLE program_metrics_age ADD COLUMN negative_outcome INTEGER DEFAULT 0')

module.exports = db
