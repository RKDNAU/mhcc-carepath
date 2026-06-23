'use strict'
const { Router } = require('express')
const { randomUUID } = require('crypto')
const { z } = require('zod')
const db = require('../db')
const { encrypt, decrypt } = require('../crypto')

const router = Router()

const VALID_STATUSES = new Set(['queued', 'routed', 'accepted', 'contacted', 'waitlisted', 'declined', 'closed'])

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

function rowsToIntake(intakeRow, tags, routes = []) {
  const grouped = { seekerGroup: [], supportType: [], accessMode: [], contactMethod: [] }
  for (const t of tags) {
    if (grouped[t.kind]) grouped[t.kind].push(t.value)
  }
  const routedPrograms = routes.map(route => ({
    programId: route.program_id,
    orgId: route.org_id || null,
    orgName: route.org_name || null,
    programName: route.program_name,
    supportType: route.support_type || null,
    routedAt: route.routed_at,
  }))
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
    referralOwner:        intakeRow.referral_owner      || '',
    followUpDue:          intakeRow.follow_up_due       || '',
    routingNote:          intakeRow.routing_note        || '',
    declineReason:        intakeRow.decline_reason      || '',
    routedPrograms,
    seekerGroups:   grouped.seekerGroup,
    supportTypes:   grouped.supportType,
    accessModes:    grouped.accessMode,
    contactMethod:  grouped.contactMethod,
  }
}

function eventFromRow(row) {
  return {
    id: row.id,
    intakeId: row.intake_id,
    eventType: row.event_type,
    body: row.body || '',
    createdBy: row.created_by || '',
    createdAt: row.created_at,
    metadata: row.metadata_json ? JSON.parse(row.metadata_json) : null,
  }
}

function addEvent({ intakeId, eventType, body = '', createdBy = 'CarePath', metadata = null, createdAt = new Date().toISOString() }) {
  const id = 'EVT-' + randomUUID().slice(0, 8).toUpperCase()
  db.prepare(`
    INSERT INTO intake_events (id, intake_id, event_type, body, created_by, created_at, metadata_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    intakeId,
    eventType,
    body,
    createdBy,
    createdAt,
    metadata ? JSON.stringify(metadata) : null
  )
  return id
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
  const routeRows = db.prepare(`SELECT * FROM intake_routes WHERE intake_id IN (${placeholders}) ORDER BY routed_at, program_name`).all(...ids)

  const tagsByIntake = {}
  for (const t of tagRows) {
    if (!tagsByIntake[t.intake_id]) tagsByIntake[t.intake_id] = []
    tagsByIntake[t.intake_id].push(t)
  }
  const routesByIntake = {}
  for (const r of routeRows) {
    if (!routesByIntake[r.intake_id]) routesByIntake[r.intake_id] = []
    routesByIntake[r.intake_id].push(r)
  }

  res.json(intakeRows.map(r => rowsToIntake(r, tagsByIntake[r.id] || [], routesByIntake[r.id] || [])))
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
    addEvent({
      intakeId: id,
      eventType: 'submitted',
      body: 'Intake submitted through the public form.',
      createdBy: 'CarePath',
      createdAt: submittedAt,
    })
  })()

  const row = db.prepare('SELECT * FROM intakes WHERE id = ?').get(id)
  const tags = db.prepare('SELECT * FROM intake_tags WHERE intake_id = ?').all(id)
  res.status(201).json(rowsToIntake(row, tags))
})

router.get('/:id/events', (req, res) => {
  const { id } = req.params
  const intake = db.prepare('SELECT id FROM intakes WHERE id = ?').get(id)
  if (!intake) return res.status(404).json({ error: 'Not found' })

  const rows = db.prepare('SELECT * FROM intake_events WHERE intake_id = ? ORDER BY created_at ASC').all(id)
  res.json(rows.map(eventFromRow))
})

router.post('/:id/events', (req, res) => {
  const { id } = req.params
  const intake = db.prepare('SELECT id FROM intakes WHERE id = ?').get(id)
  if (!intake) return res.status(404).json({ error: 'Not found' })

  const parsed = z.object({
    body: z.string().trim().min(1).max(2000),
    createdBy: z.string().trim().max(200).optional().default('Provider user'),
  }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const eventId = addEvent({
    intakeId: id,
    eventType: 'note',
    body: parsed.data.body,
    createdBy: parsed.data.createdBy,
  })
  const row = db.prepare('SELECT * FROM intake_events WHERE id = ?').get(eventId)
  res.status(201).json(eventFromRow(row))
})

// PATCH /api/intakes/:id
router.patch('/:id', (req, res) => {
  const { id } = req.params
  const {
    status,
    assignedOrgId,
    routedProgramId,
    routedOrgName,
    routedProgramName,
    routes,
    referralOwner,
    followUpDue,
    routingNote,
    declineReason,
    updatedBy = 'Provider user',
  } = req.body
  const row = db.prepare('SELECT * FROM intakes WHERE id = ?').get(id)
  if (!row) return res.status(404).json({ error: 'Not found' })
  if (status && !VALID_STATUSES.has(status)) return res.status(400).json({ error: 'Invalid status' })

  const routeRows = Array.isArray(routes)
    ? routes.filter(route => route?.programId && route?.programName)
    : null

  const fields = [], params = []
  if (status)       { fields.push('status = ?');          params.push(status)       }
  if (referralOwner !== undefined) { fields.push('referral_owner = ?'); params.push(referralOwner || null) }
  if (followUpDue !== undefined)   { fields.push('follow_up_due = ?');  params.push(followUpDue || null)   }
  if (routingNote !== undefined)   { fields.push('routing_note = ?');   params.push(routingNote || null)   }
  if (declineReason !== undefined) { fields.push('decline_reason = ?'); params.push(declineReason || null) }
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
  if (routeRows?.length) {
    const first = routeRows[0]
    const routedAt = new Date().toISOString()
    fields.push(
      'status = ?',
      'assigned_org_id = ?',
      'assigned_at = ?',
      'routed_program_id = ?',
      'routed_at = ?',
      'routed_org_name = ?',
      'routed_program_name = ?'
    )
    params.push(
      'routed',
      first.orgId || null,
      routedAt,
      first.programId,
      routedAt,
      first.orgName || null,
      first.programName
    )
  }
  if (!fields.length) return res.status(400).json({ error: 'Nothing to update' })

  const update = db.prepare(`UPDATE intakes SET ${fields.join(', ')} WHERE id = ?`)
  const deleteRoutes = db.prepare('DELETE FROM intake_routes WHERE intake_id = ?')
  const insertRoute = db.prepare(`
    INSERT INTO intake_routes (intake_id, program_id, org_id, org_name, program_name, support_type, routed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  db.transaction(() => {
    params.push(id)
    update.run(...params)
    if (routeRows?.length) {
      deleteRoutes.run(id)
      const routedAt = new Date().toISOString()
      for (const route of routeRows) {
        insertRoute.run(
          id,
          route.programId,
          route.orgId || null,
          route.orgName || null,
          route.programName,
          route.supportType || null,
          routedAt
        )
      }
      addEvent({
        intakeId: id,
        eventType: 'routed',
        body: routingNote || `${routeRows.length} program${routeRows.length === 1 ? '' : 's'} added to the care plan.`,
        createdBy: updatedBy,
        metadata: { routes: routeRows },
      })
    } else if (routedProgramId !== undefined) {
      deleteRoutes.run(id)
      const updated = db.prepare('SELECT * FROM intakes WHERE id = ?').get(id)
      insertRoute.run(
        id,
        routedProgramId,
        assignedOrgId || updated.assigned_org_id || null,
        routedOrgName || null,
        routedProgramName || '',
        null,
        updated.routed_at || new Date().toISOString()
      )
      addEvent({
        intakeId: id,
        eventType: 'routed',
        body: routingNote || `Referral routed to ${routedProgramName || 'selected program'}.`,
        createdBy: updatedBy,
        metadata: { programId: routedProgramId, orgName: routedOrgName, programName: routedProgramName },
      })
    }

    if (status && status !== row.status) {
      addEvent({
        intakeId: id,
        eventType: 'status',
        body: `Status changed from ${row.status} to ${status}.`,
        createdBy: updatedBy,
        metadata: { from: row.status, to: status },
      })
    }

    if (referralOwner !== undefined || followUpDue !== undefined || declineReason !== undefined || routingNote !== undefined) {
      addEvent({
        intakeId: id,
        eventType: 'workflow',
        body: 'Workflow details updated.',
        createdBy: updatedBy,
        metadata: { referralOwner, followUpDue, declineReason, routingNote },
      })
    }
  })()

  const updated = db.prepare('SELECT * FROM intakes WHERE id = ?').get(id)
  const tags = db.prepare('SELECT * FROM intake_tags WHERE intake_id = ?').all(id)
  const updatedRoutes = db.prepare('SELECT * FROM intake_routes WHERE intake_id = ? ORDER BY routed_at, program_name').all(id)
  res.json(rowsToIntake(updated, tags, updatedRoutes))
})

module.exports = router
