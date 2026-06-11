'use strict'

const { Router } = require('express')
const db = require('../db')
const { decrypt } = require('../crypto')
const { PROGRAMS_MAP } = require('../programs')
const { refreshMockData } = require('../scripts/seed')
const {
  intakeQueueToCsv,
  intakeVolumeToCsv,
  memberSharedDataToCsv,
} = require('../csvUtils')

const router = Router()

router.get('/export-csv', (req, res) => {
  const { type } = req.query
  let csv

  if (type === 'intake-queue') {
    const intakeRows = db.prepare('SELECT * FROM intakes ORDER BY submitted_at DESC').all()
    const tagRows = intakeRows.length
      ? db.prepare(`SELECT * FROM intake_tags WHERE intake_id IN (${intakeRows.map(() => '?').join(',')})`)
          .all(...intakeRows.map(r => r.id))
      : []
    const tagsByIntake = {}
    for (const t of tagRows) {
      if (!tagsByIntake[t.intake_id]) tagsByIntake[t.intake_id] = {}
      const g = tagsByIntake[t.intake_id]
      if (!g[t.kind]) g[t.kind] = []
      g[t.kind].push(t.value)
    }
    const records = intakeRows.map(r => ({
      id: r.id,
      status: r.status || 'queued',
      dob: decrypt(r.dob),
      gender: r.gender,
      suburb: r.suburb,
      urgency: r.urgency,
      submittedAt: r.submitted_at,
      description: r.description || '',
      previousServices: r.previous_services || '',
      contactTime: r.contact_time || '',
      specialRequirements: r.special_requirements || '',
      seekerGroups: tagsByIntake[r.id]?.seekerGroup || [],
      supportTypes: tagsByIntake[r.id]?.supportType || [],
      accessModes: tagsByIntake[r.id]?.accessMode || [],
      contactMethod: tagsByIntake[r.id]?.contactMethod || [],
    }))
    csv = intakeQueueToCsv(records)
  } else if (type === 'intake-volume') {
    const rows = db.prepare('SELECT week, count FROM intake_volume_weeks ORDER BY rowid').all()
    csv = intakeVolumeToCsv(rows)
  } else if (type === 'member-shared') {
    const metrics = db.prepare('SELECT * FROM program_metrics ORDER BY program_id, gender').all()
    const ageRows = db.prepare('SELECT * FROM program_metrics_age ORDER BY program_id, gender').all()
    const ageByKey = {}
    for (const a of ageRows) {
      const key = `${a.program_id}_${a.gender}`
      if (!ageByKey[key]) ageByKey[key] = []
      ageByKey[key].push(a)
    }
    const metricRows = metrics.map(m => ({
      ...m,
      ageRows: ageByKey[`${m.program_id}_${m.gender}`] || [],
    }))
    csv = memberSharedDataToCsv(metricRows, PROGRAMS_MAP)
  } else {
    return res.status(400).json({ error: 'Unknown type. Use intake-queue, intake-volume, or member-shared.' })
  }

  res.setHeader('Content-Type', 'text/csv')
  res.send(csv)
})

router.post('/refresh-mock-data', (req, res) => {
  try {
    return res.json(refreshMockData())
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

module.exports = router
