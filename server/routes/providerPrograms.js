'use strict'

const { Router } = require('express')
const { z } = require('zod')
const db = require('../db')
const { PROGRAMS } = require('../programs')

const router = Router()

const OverrideSchema = z.object({
  description: z.string().max(2000).optional().nullable(),
  accessMode: z.string().max(120).optional().nullable(),
  referralRequirements: z.string().max(1000).optional().nullable(),
  contactName: z.string().max(200).optional().nullable(),
  contactEmail: z.string().max(320).optional().nullable(),
  contactPhone: z.string().max(80).optional().nullable(),
  listedAvgWaitDays: z.number().min(0).max(365).optional().nullable(),
  listedTotalCapacity: z.number().int().min(0).max(10000).optional().nullable(),
  listedCurrentClients: z.number().int().min(0).max(10000).optional().nullable(),
  updatedBy: z.string().max(200).optional().nullable(),
})

function camelOverride(row) {
  if (!row) return null
  return {
    programId: row.program_id,
    description: row.description,
    accessMode: row.access_mode,
    referralRequirements: row.referral_requirements,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    listedAvgWaitDays: row.listed_avg_wait_days,
    listedTotalCapacity: row.listed_total_capacity,
    listedCurrentClients: row.listed_current_clients,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  }
}

function mergeProgram(program, override) {
  if (!override) return { ...program, override: null }
  const totalCapacity = override.listedTotalCapacity ?? null
  const currentClients = override.listedCurrentClients ?? null
  const capacity = totalCapacity != null && currentClients != null
    ? Math.max(0, totalCapacity - currentClients)
    : program.capacity

  return {
    ...program,
    description: override.description ?? program.description,
    accessMode: override.accessMode ?? program.accessMode,
    avgWaitDays: override.listedAvgWaitDays ?? program.avgWaitDays,
    capacity,
    referralRequirements: override.referralRequirements || '',
    contactName: override.contactName || '',
    contactEmail: override.contactEmail || '',
    contactPhone: override.contactPhone || '',
    listedTotalCapacity: totalCapacity,
    listedCurrentClients: currentClients,
    override,
  }
}

function allMergedPrograms(orgId = null) {
  const overrides = db.prepare('SELECT * FROM program_overrides').all()
  const byId = Object.fromEntries(overrides.map(row => [row.program_id, camelOverride(row)]))
  return PROGRAMS
    .filter(program => !orgId || program.orgId === orgId)
    .map(program => mergeProgram(program, byId[program.id]))
}

router.get('/programs', (req, res) => {
  res.json(allMergedPrograms(req.query.orgId || null))
})

router.patch('/programs/:programId', (req, res) => {
  const { programId } = req.params
  const program = PROGRAMS.find(row => row.id === programId)
  if (!program) return res.status(404).json({ error: 'Program not found' })

  const parsed = OverrideSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const d = parsed.data
  const updatedAt = new Date().toISOString()

  db.prepare(`
    INSERT INTO program_overrides (
      program_id, description, access_mode, referral_requirements, contact_name,
      contact_email, contact_phone, listed_avg_wait_days, listed_total_capacity,
      listed_current_clients, updated_at, updated_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(program_id) DO UPDATE SET
      description = excluded.description,
      access_mode = excluded.access_mode,
      referral_requirements = excluded.referral_requirements,
      contact_name = excluded.contact_name,
      contact_email = excluded.contact_email,
      contact_phone = excluded.contact_phone,
      listed_avg_wait_days = excluded.listed_avg_wait_days,
      listed_total_capacity = excluded.listed_total_capacity,
      listed_current_clients = excluded.listed_current_clients,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by
  `).run(
    programId,
    d.description ?? null,
    d.accessMode ?? null,
    d.referralRequirements ?? null,
    d.contactName ?? null,
    d.contactEmail ?? null,
    d.contactPhone ?? null,
    d.listedAvgWaitDays ?? null,
    d.listedTotalCapacity ?? null,
    d.listedCurrentClients ?? null,
    updatedAt,
    d.updatedBy || 'Provider user'
  )

  const row = db.prepare('SELECT * FROM program_overrides WHERE program_id = ?').get(programId)
  res.json(mergeProgram(program, camelOverride(row)))
})

module.exports = router
