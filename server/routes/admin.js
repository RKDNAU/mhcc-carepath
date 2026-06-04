'use strict'
const { Router } = require('express')
const db = require('../db')
const { encrypt, decrypt } = require('../crypto')
const { PROGRAMS_MAP } = require('../programs')
const {
  intakeQueueToCsv, csvToIntakeQueue,
  intakeVolumeToCsv, csvToIntakeVolume,
  memberSharedDataToCsv, csvToMemberSharedData,
  AGE_GROUPS,
} = require('../csvUtils')

const router = Router()

// ── Export ────────────────────────────────────────────────────────────────────

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
      id:                r.id,
      status:            r.status || 'queued',
      dob:               decrypt(r.dob),
      gender:            r.gender,
      suburb:            r.suburb,
      urgency:           r.urgency,
      submittedAt:       r.submitted_at,
      description:       r.description || '',
      previousServices:  r.previous_services || '',
      contactTime:       r.contact_time || '',
      specialRequirements: r.special_requirements || '',
      seekerGroups:  tagsByIntake[r.id]?.seekerGroup  || [],
      supportTypes:  tagsByIntake[r.id]?.supportType  || [],
      accessModes:   tagsByIntake[r.id]?.accessMode   || [],
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

// ── Import ────────────────────────────────────────────────────────────────────

router.post('/import-csv', (req, res) => {
  const { type } = req.query
  const { content } = req.body
  if (!content) return res.status(400).json({ error: 'Missing content' })

  try {
    if (type === 'intake-queue') {
      const records = csvToIntakeQueue(content)
      const insertIntake = db.prepare(`
        INSERT INTO intakes
          (id, submitted_at, dob, gender, suburb, urgency,
           description, previous_services, contact_time, special_requirements,
           consent_data, consent_crisis, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?)
      `)
      const insertTag = db.prepare(
        'INSERT INTO intake_tags (intake_id, kind, value) VALUES (?, ?, ?)'
      )
      db.transaction(() => {
        db.prepare('DELETE FROM intake_tags').run()
        db.prepare('DELETE FROM intakes').run()
        for (const r of records) {
          insertIntake.run(
            r.id, r.submittedAt, encrypt(r.dob), r.gender, r.suburb, r.urgency,
            r.description || '', r.previousServices || '', r.contactTime || '',
            r.specialRequirements || '', r.status || 'queued'
          )
          for (const v of (r.seekerGroups  || [])) insertTag.run(r.id, 'seekerGroup',  v)
          for (const v of (r.supportTypes  || [])) insertTag.run(r.id, 'supportType',  v)
          for (const v of (r.accessModes   || [])) insertTag.run(r.id, 'accessMode',   v)
          for (const v of (r.contactMethod || [])) insertTag.run(r.id, 'contactMethod', v)
        }
      })()
      return res.json({ imported: records.length })

    } else if (type === 'intake-volume') {
      const rows = csvToIntakeVolume(content)
      db.transaction(() => {
        db.prepare('DELETE FROM intake_volume_weeks').run()
        const insert = db.prepare('INSERT INTO intake_volume_weeks (week, count) VALUES (?, ?)')
        for (const r of rows) insert.run(r.week, r.count)
      })()
      return res.json({ imported: rows.length })

    } else if (type === 'member-shared') {
      const rows = csvToMemberSharedData(content)
      const insertMetric = db.prepare(`
        INSERT OR REPLACE INTO program_metrics
          (program_id, gender, avg_wait_days, completion_rate, total_clients, total_capacity,
           current_clients, available_pct, waitlist_depth, has_capacity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      const insertAge = db.prepare(`
        INSERT OR REPLACE INTO program_metrics_age
          (program_id, gender, age_group, outcome_rate, clients)
        VALUES (?, ?, ?, ?, ?)
      `)
      db.transaction(() => {
        db.prepare('DELETE FROM program_metrics_age').run()
        db.prepare('DELETE FROM program_metrics').run()
        for (const r of rows) {
          insertMetric.run(
            r.program_id, r.gender, r.avg_wait_days, r.completion_rate,
            r.total_clients, r.total_capacity, r.current_clients,
            r.available_pct, r.waitlist_depth, r.has_capacity
          )
          for (const a of (r.ageRows || [])) {
            insertAge.run(r.program_id, r.gender, a.age_group, a.outcome_rate, a.clients)
          }
        }
      })()
      return res.json({ imported: rows.length })

    } else {
      return res.status(400).json({ error: 'Unknown type' })
    }
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

module.exports = router
