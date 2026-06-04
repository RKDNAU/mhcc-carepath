'use strict'
const express = require('express')
const cors = require('cors')
const db = require('./db')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ status: 'ok', db: 'connected' }))

app.use('/api/intakes',         require('./routes/intakes'))
app.use('/api/intake-volume',   require('./routes/intakeVolume'))
app.use('/api/program-metrics', require('./routes/programMetrics'))
app.use('/api/admin',           require('./routes/admin'))

app.listen(PORT, () => {
  console.log(`MHCC API server running on http://localhost:${PORT}`)
})
