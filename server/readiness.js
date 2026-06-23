'use strict'

const fs = require('fs')
const path = require('path')

function isLikelyEphemeralDbPath(dbPath) {
  const normal = path.resolve(dbPath).replace(/\\/g, '/').toLowerCase()
  return normal.includes('/tmp/') ||
    normal.includes('/temp/') ||
    normal.endsWith('/server/data/mhcc.db')
}

function readinessWarnings({ dbPath, distPath } = {}) {
  const warnings = []
  const isProd = process.env.NODE_ENV === 'production'
  const allowedOrigins = process.env.ALLOWED_ORIGINS || ''

  if (isProd && !process.env.SERVER_ENCRYPTION_KEY) {
    warnings.push('SERVER_ENCRYPTION_KEY is not set; production is using the development encryption fallback.')
  }

  if (isProd && isLikelyEphemeralDbPath(dbPath || '')) {
    warnings.push('DB_PATH appears to use local app storage; confirm the database is on persistent storage.')
  }

  if (isProd && (!allowedOrigins || allowedOrigins.includes('localhost'))) {
    warnings.push('ALLOWED_ORIGINS is unset or includes localhost in production.')
  }

  if (isProd && distPath && !fs.existsSync(path.join(distPath, 'index.html'))) {
    warnings.push('Production client build was not found at dist/index.html.')
  }

  return warnings
}

module.exports = { readinessWarnings }
