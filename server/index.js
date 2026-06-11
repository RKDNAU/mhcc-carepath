'use strict'
const express = require('express')
const cors = require('cors')
const path = require('path')
const db = require('./db')

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173']
app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ status: 'ok', db: 'connected' }))

app.use('/api/intakes',         require('./routes/intakes'))
app.use('/api/intake-volume',   require('./routes/intakeVolume'))
app.use('/api/program-metrics', require('./routes/programMetrics'))
app.use('/api/admin',           require('./routes/admin'))

// In production, serve the compiled React app from dist/
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`MHCC API server running on port ${PORT}`)
})
