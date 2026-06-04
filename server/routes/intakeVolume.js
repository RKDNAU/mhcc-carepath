'use strict'
const { Router } = require('express')
const db = require('../db')

const router = Router()

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT week, count FROM intake_volume_weeks ORDER BY rowid').all()
  res.json(rows)
})

module.exports = router
