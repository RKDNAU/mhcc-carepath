'use strict'
const { Router } = require('express')
const { randomUUID } = require('crypto')
const { z } = require('zod')
const db = require('../db')
const { encrypt, decrypt } = require('../crypto')

const router = Router()

const IntakeSchema = z.object({
  firstName:           z.string().optional().default(''),
  lastName:            z.string().optional().default(''),
  dob:                 z.string().optional().default(''),
  email:               z.string().optional().default(''),
  phone:               z.string().optional().default(''),
  suburb:              z.string().optional().default(''),
  gender:              z.string().optional().default(''),
  genderSelfDescribe:  z.string().optional().default(''),
  seekerGroups:        z.array(z.string()).default([]),
  supportTypes:        z.array(z.string()).default([]),
  urgency:             z.enum(['low', 'medium', 'high', 'crisis']),
  description:         z.string().optional().default(''),
  previousServices:    z.string().optional().default(''),
  accessModes:         z.array(z.string()).default([]),
  contactMethod:       z.array(z.string()).default([]),
  contactTime:         z.string().optional().default(''),
  specialRequirements: z.string().optional().default(''),
  consentData:         z.boolean().default(false),
  consentCrisis:       z.boolean().default(false),
})

function rowsToIntake(intakeRow, tags) {
  const grouped = { seekerGroup: [], supportType: [], accessMode: [], contactMethod: [] }
  for (const t of tags) {
    if (grouped[t.kind]) grouped[t.kind].push(t.value)
  }
  return {
    id:                   intakeRow.id,
    submittedAt:          intakeRow.submitted_at,
    urgency:              intakeRow.urgency,
    status:               intakeRow.status,
    gender:               intakeRow.gender,
    suburb:               intakeRow.suburb,
    dob:                  decrypt(intakeRow.dob),
    firstName:            decrypt(intakeRow.first_name),
    lastName:             decrypt(intakeRow.last_name),
    email:                decrypt(intakeRow.email),
    phone:                decrypt(intakeRow.phone),
    genderSelfDescribe:   intakeRow.gender_self_describe || '',
    description:          intakeRow.description || '',
    previousServices:     intakeRow.previous_services || '',
    contactTime:          intakeRow.contact_time || '',
    specialRequirements:  intakeRow.special_requirements || '',
    consentData:          !!intakeRow.consent_data,
    consentCrisis:        !!intakeRow.consent_crisis,
    assignedOrgId:        intakeRow.assigned_org_id || null,
    assignedAt:           intakeRow.assigned_at || null,
    routedProgramId:      intakeRow.routed_program_id   || null,
    routedAt:             intakeRow.routed_at           || null,
    routedOrgName:        intakeRow.routed_org_name     || null,
    routedProgramName:    intakeRow.routed_program_name || null,
    seekerGroups:   grouped.seekerGroup,
    supportTypes:   grouped.supportType,
    accessModes:    grouped.accessMode,
    contactMethod:  grouped.contactMethod,
  }
}

// GET /api/intakes
router.get('/', (req, res) => {
  const { urgency, status } = req.query
  let sql = 'SELECT * FROM intakes'
  const params = []
  const clauses = []
  if (urgency) { clauses.push('urgency = ?'); params.push(urgency) }
  if (status)  { clauses.push('status = ?');  params.push(status)  }
  if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ')
  sql += ' ORDER BY submitted_at DESC'

  const intakeRows = db.prepare(sql).all(...params)
  if (!intakeRows.length) return res.json([])

  const ids = intakeRows.map(r => r.id)
  const placeholders = ids.map(() => '?').join(',')
  const tagRows = db.prepare(`SELECT * FROM intake_tags WHERE intake_id IN (${placeholders})`).all(...ids)

  const tagsByIntake = {}
  for (const t of tagRows) {
    if (!tagsByIntake[t.intake_id]) tagsByIntake[t.intake_id] = []
    tagsByIntake[t.intake_id].push(t)
  }

  res.json(intakeRows.map(r => rowsToIntake(r, tagsByIntake[r.id] || [])))
})

// POST /api/intakes
router.post('/', (req, res) => {
  const parsed = IntakeSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const d = parsed.data

  const id = 'INT-' + randomUUID().slice(0, 8).toUpperCase()
  const submittedAt = new Date().toISOString()

  const insertIntake = db.prepare(`
    INSERT INTO intakes (
      id, submitted_at, first_name, last_name, email, phone, dob,
      gender, gender_self_describe, suburb, urgency, description,
      previous_services, contact_time, special_requirements,
      consent_data, consent_crisis, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'queued')
  `)

  const insertTag = db.prepare(
    'INSERT OR IGNORE INTO intake_tags (intake_id, kind, value) VALUES (?, ?, ?)'
  )

  db.transaction(() => {
    insertIntake.run(
      id, submittedAt,
      encrypt(d.firstName), encrypt(d.lastName), encrypt(d.email), encrypt(d.phone), encrypt(d.dob),
      d.gender, d.genderSelfDescribe, d.suburb,
      d.urgency, d.description, d.previousServices, d.contactTime, d.specialRequirements,
      d.consentData ? 1 : 0, d.consentCrisis ? 1 : 0
    )
    for (const v of d.seekerGroups)  insertTag.run(id, 'seekerGroup',  v)
    for (const v of d.supportTypes)  insertTag.run(id, 'supportType',  v)
    for (const v of d.accessModes)   insertTag.run(id, 'accessMode',   v)
    for (const v of d.contactMethod) insertTag.run(id, 'contactMethod', v)
  })()

  const row = db.prepare('SELECT * FROM intakes WHERE id = ?').get(id)
  const tags = db.prepare('SELECT * FROM intake_tags WHERE intake_id = ?').all(id)
  res.status(201).json(rowsToIntake(row, tags))
})

// PATCH /api/intakes/:id
router.patch('/:id', (req, res) => {
  const { id } = req.params
  const { status, assignedOrgId, routedProgramId, routedOrgName, routedProgramName } = req.body
  const row = db.prepare('SELECT id FROM intakes WHERE id = ?').get(id)
  if (!row) return res.status(404).json({ error: 'Not found' })

  const fields = [], params = []
  if (status)       { fields.push('status = ?');          params.push(status)       }
  if (assignedOrgId !== undefined) {
    fields.push('assigned_org_id = ?', 'assigned_at = ?')
    params.push(assignedOrgId, new Date().toISOString())
  }
  if (routedProgramId !== undefined) {
    fields.push('routed_program_id = ?', 'routed_at = ?')
    params.push(routedProgramId, new Date().toISOString())
  }
  if (routedOrgName     !== undefined) { fields.push('routed_org_name = ?');     params.push(routedOrgName)     }
  if (routedProgramName !== undefined) { fields.push('routed_program_name = ?'); params.push(routedProgramName) }
  if (!fields.length) return res.status(400).json({ error: 'Nothing to update' })

  params.push(id)
  db.prepare(`UPDATE intakes SET ${fields.join(', ')} WHERE id = ?`).run(...params)
  const updated = db.prepare('SELECT * FROM intakes WHERE id = ?').get(id)
  const tags = db.prepare('SELECT * FROM intake_tags WHERE intake_id = ?').all(id)
  res.json(rowsToIntake(updated, tags))
})

module.exports = router
