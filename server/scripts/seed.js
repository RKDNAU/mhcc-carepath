'use strict'
// One-shot seed. Safe to re-run — skips if data already exists.
// Usage: node server/scripts/seed.js
const db = require('../db')
const { encrypt } = require('../crypto')

// ── Helpers ──────────────────────────────────────────────────────────────────

const AGE_GROUPS = ['Under 18', '18-25', '26-35', '36-45', '46-55', '56-65', '65+']
const G_OFFSET   = { All: 0, Female: 100, Male: 200, 'Non-binary': 300 }
const GENDERS    = ['Female', 'Male', 'Non-binary']

function rng(seed, offset) {
  const x = Math.sin(seed * 9301 + offset * 49297 + 233) * 10000
  return x - Math.floor(x)
}

function mockProgramData(programId, targetGroups, gender) {
  const n = parseInt(programId.replace('PRG', ''), 10)
  const g = G_OFFSET[gender] || 0
  const isYouth  = targetGroups.includes('Young people')
  const isFamily = targetGroups.includes('Families')

  const outcomesByAge = AGE_GROUPS.map((_, i) => {
    let value = Math.round(50 + rng(n + g, i + 1) * 36)
    if (isYouth  && i <= 2) value = Math.min(93, value + 14)
    if (isFamily && i >= 2 && i <= 4) value = Math.min(93, value + 8)
    if (!isYouth && i >= 5) value = Math.min(93, value + 6)
    return value
  })

  const totalCapacity  = Math.round(10 + rng(n, 20) * 40)
  const rawOcc         = rng(n, 21)
  const occupancyRate  = rawOcc > 0.85 ? 0.95 + rng(n, 27) * 0.25 : rawOcc * 0.9
  const currentClients = Math.round(totalCapacity * Math.min(occupancyRate, 1.2))
  const availablePct   = Math.max(0, Math.round(((totalCapacity - currentClients) / totalCapacity) * 100))
  const waitlistBase   = availablePct < 10 ? 8 + rng(n, 32) * 18
                       : availablePct < 30 ? 2 + rng(n, 32) * 7
                       :                         rng(n, 32) * 3
  const demographicSplit = AGE_GROUPS.map((_, i) =>
    Math.max(0, Math.round(rng(n + g, 30 + i) * (currentClients / 4)))
  )

  return {
    avg_wait_days:   parseFloat((1.5 + rng(n + g, 8) * 12).toFixed(1)),
    completion_rate: Math.round(54 + rng(n + g, 9) * 38),
    total_clients:   Math.round(15 + rng(n + g, 10) * 100),
    total_capacity:  totalCapacity, current_clients: currentClients,
    available_pct:   availablePct,  waitlist_depth:  Math.round(waitlistBase),
    has_capacity:    currentClients < totalCapacity ? 1 : 0,
    outcomesByAge, demographicSplit,
  }
}

const PROGRAMS = [
  { id: 'PRG0010', targetGroups: ['Adults', 'People with psychosocial disability'] },
  { id: 'PRG0084', targetGroups: ['Adults', 'Young people', 'Aboriginal and Torres Strait Islander peoples', 'Culturally and Linguistically Diverse communities', 'LGBTQIA+', 'Other'] },
  { id: 'PRG0087', targetGroups: ['Adults', 'Young people', 'Other'] },
  { id: 'PRG0088', targetGroups: ['Adults', 'Young people', 'People with psychosocial disability'] },
  { id: 'PRG0089', targetGroups: ['Adults', 'Young people', 'People with psychosocial disability', 'Other'] },
  { id: 'PRG0150', targetGroups: ['Carers'] },
  { id: 'PRG0170', targetGroups: ['Adults', 'Families', 'Other'] },
  { id: 'PRG0186', targetGroups: ['Adults', 'Young people'] },
  { id: 'PRG0190', targetGroups: ['Adults', 'Other'] },
  { id: 'PRG0191', targetGroups: ['Adults', 'Other'] },
  { id: 'PRG0197', targetGroups: ['Other'] },
  { id: 'PRG0220', targetGroups: ['Adults', 'Young people'] },
  { id: 'PRG0222', targetGroups: ['Families', 'Carers'] },
  { id: 'PRG0223', targetGroups: ['Young people', 'Families', 'Carers'] },
  { id: 'PRG0224', targetGroups: ['Adults', 'Young people'] },
  { id: 'PRG0232', targetGroups: ['Young people'] },
  { id: 'PRG0234', targetGroups: ['Other'] },
  { id: 'PRG0242', targetGroups: ['Adults', 'Families', 'Carers', 'Other'] },
  { id: 'PRG0244', targetGroups: ['Adults', 'Other'] },
  { id: 'PRG0247', targetGroups: ['Adults', 'Families', 'Carers', 'LGBTQIA+', 'Other'] },
  { id: 'PRG0254', targetGroups: ['Adults', 'People with psychosocial disability'] },
  { id: 'PRG0258', targetGroups: ['Adults', 'Families'] },
  { id: 'PRG0261', targetGroups: ['Other'] },
  { id: 'PRG0270', targetGroups: ['Adults', 'People with psychosocial disability'] },
  { id: 'PRG0284', targetGroups: ['Adults', 'People with psychosocial disability'] },
  { id: 'PRG0285', targetGroups: ['Adults', 'People with psychosocial disability'] },
  { id: 'PRG0286', targetGroups: ['Adults', 'People with psychosocial disability'] },
  { id: 'PRG0291', targetGroups: ['Culturally and Linguistically Diverse communities'] },
  { id: 'PRG0293', targetGroups: ['Young people', 'Families', 'Culturally and Linguistically Diverse communities'] },
  { id: 'PRG0294', targetGroups: ['Culturally and Linguistically Diverse communities'] },
  { id: 'PRG0295', targetGroups: ['Culturally and Linguistically Diverse communities'] },
  { id: 'PRG0296', targetGroups: ['Young people', 'Families', 'Culturally and Linguistically Diverse communities'] },
  { id: 'PRG0302', targetGroups: ['Adults'] },
  { id: 'PRG0306', targetGroups: ['Adults', 'Young people'] },
  { id: 'PRG0309', targetGroups: ['Adults', 'Young people', 'Other'] },
  { id: 'PRG0310', targetGroups: ['Adults', 'Young people', 'Other'] },
  { id: 'PRG0323', targetGroups: ['Adults'] },
  { id: 'PRG0324', targetGroups: ['Adults', 'Families'] },
  { id: 'PRG0352', targetGroups: ['Other'] },
  { id: 'PRG0362', targetGroups: ['Adults', 'People with psychosocial disability'] },
  { id: 'PRG0363', targetGroups: ['Adults', 'People with psychosocial disability'] },
  { id: 'PRG0364', targetGroups: ['Adults', 'People with psychosocial disability'] },
  { id: 'PRG0370', targetGroups: ['Adults'] },
  { id: 'PRG0388', targetGroups: ['Culturally and Linguistically Diverse communities'] },
  { id: 'PRG0410', targetGroups: ['Families', 'Carers', 'Other'] },
  { id: 'PRG0413', targetGroups: ['Adults', 'Young people'] },
  { id: 'PRG0414', targetGroups: ['Families', 'Carers', 'Other'] },
  { id: 'PRG0415', targetGroups: ['Justice-involved', 'Other'] },
  { id: 'PRG0416', targetGroups: ['Other'] },
  { id: 'PRG0417', targetGroups: ['Other'] },
  { id: 'PRG0418', targetGroups: ['Families'] },
  { id: 'PRG0419', targetGroups: ['Other'] },
  { id: 'PRG0420', targetGroups: ['Culturally and Linguistically Diverse communities'] },
  { id: 'PRG0426', targetGroups: ['Other'] },
  { id: 'PRG0427', targetGroups: ['Other'] },
  { id: 'PRG0428', targetGroups: ['Other'] },
]

const SAMPLE_INTAKES = [
  { id: 'INT001', dob: '1991-01-15', gender: 'Female',     suburb: 'Belconnen',  urgency: 'medium', submittedAt: '2026-05-24T09:14:00', seekerGroups: ['Adult', 'Carer'],            supportTypes: ['Anxiety / Stress', 'Family / Parenting'],   accessModes: ['Appointment'] },
  { id: 'INT002', dob: '2003-09-20', gender: 'Male',       suburb: 'Tuggeranong',urgency: 'low',    submittedAt: '2026-05-27T14:22:00', seekerGroups: ['Youth', 'LGBTQIA+'],          supportTypes: ['Depression', 'Relationship Issues'],         accessModes: ['Phone/online'] },
  { id: 'INT003', dob: '1981-02-28', gender: 'Non-binary', suburb: 'Gungahlin',  urgency: 'high',   submittedAt: '2026-05-28T11:05:00', seekerGroups: ['Adult', 'Person with psychosocial disability'], supportTypes: ['Trauma / PTSD'],      accessModes: ['Appointment', 'Referral required'] },
  { id: 'INT004', dob: '1967-11-05', gender: 'Female',     suburb: 'Woden',      urgency: 'medium', submittedAt: '2026-05-21T08:45:00', seekerGroups: ['Adult', 'Carer'],            supportTypes: ['Grief & Loss', 'Aged Care Support'],         accessModes: ['Self-referral'] },
  { id: 'INT005', dob: '2006-08-12', gender: 'Male',       suburb: 'Charnwood',  urgency: 'high',   submittedAt: '2026-05-26T16:33:00', seekerGroups: ['Youth', 'Aboriginal or Torres Strait Islander'], supportTypes: ['Depression', 'Substance Use'], accessModes: ['Outreach / proactive reach-in'] },
  { id: 'INT006', dob: '1959-03-22', gender: 'Female',     suburb: 'Phillip',    urgency: 'low',    submittedAt: '2026-05-17T10:18:00', seekerGroups: ['Adult'],                     supportTypes: ['Aged Care Support', 'Anxiety / Stress'],    accessModes: ['Phone/online', 'Appointment'] },
  { id: 'INT007', dob: '1994-12-01', gender: 'Female',     suburb: 'Civic',      urgency: 'medium', submittedAt: '2026-05-25T13:47:00', seekerGroups: ['Adult', 'Culturally and Linguistically Diverse community member'], supportTypes: ['Anxiety / Stress', 'Relationship Issues'], accessModes: ['Appointment'] },
  { id: 'INT008', dob: '1997-07-14', gender: 'Male',       suburb: 'Dickson',    urgency: 'high',   submittedAt: '2026-05-23T09:02:00', seekerGroups: ['Person with psychosocial disability', 'Justice-involved'], supportTypes: ['Depression', 'Substance Use'], accessModes: ['Other'] },
  { id: 'INT009', dob: '1984-02-08', gender: 'Female',     suburb: 'Holder',     urgency: 'medium', submittedAt: '2026-05-20T15:55:00', seekerGroups: ['Family', 'Carer'],           supportTypes: ['Family / Parenting', 'Grief & Loss'],        accessModes: ['Appointment', 'Phone/online'] },
  { id: 'INT010', dob: '2009-10-30', gender: 'Male',       suburb: 'Macquarie',  urgency: 'crisis', submittedAt: '2026-05-29T07:30:00', seekerGroups: ['Youth'],                     supportTypes: ['Youth Mental Health', 'Anxiety / Stress'],  accessModes: ['Self-referral'] },
]

const INTAKE_VOLUME_DEFAULT = [
  { week: 'Apr 7',  count: 3 }, { week: 'Apr 14', count: 5 }, { week: 'Apr 21', count: 4 },
  { week: 'Apr 28', count: 6 }, { week: 'May 5',  count: 3 }, { week: 'May 12', count: 1 },
  { week: 'May 19', count: 4 }, { week: 'May 26', count: 5 },
]

// ── Seed ──────────────────────────────────────────────────────────────────────

const existingIntakes = db.prepare('SELECT COUNT(*) as n FROM intakes').get().n
const existingVolume  = db.prepare('SELECT COUNT(*) as n FROM intake_volume_weeks').get().n
const existingMetrics = db.prepare('SELECT COUNT(*) as n FROM program_metrics').get().n

let seeded = 0

if (existingIntakes === 0) {
  console.log('Seeding intakes…')
  const insertIntake = db.prepare(`
    INSERT INTO intakes (id, submitted_at, dob, gender, suburb, urgency, consent_data, consent_crisis, status)
    VALUES (?, ?, ?, ?, ?, ?, 1, 1, 'queued')
  `)
  const insertTag = db.prepare(
    'INSERT OR IGNORE INTO intake_tags (intake_id, kind, value) VALUES (?, ?, ?)'
  )
  db.transaction(() => {
    for (const r of SAMPLE_INTAKES) {
      insertIntake.run(r.id, r.submittedAt, encrypt(r.dob), r.gender, r.suburb, r.urgency)
      for (const v of r.seekerGroups)  insertTag.run(r.id, 'seekerGroup',  v)
      for (const v of r.supportTypes)  insertTag.run(r.id, 'supportType',  v)
      for (const v of r.accessModes)   insertTag.run(r.id, 'accessMode',   v)
    }
  })()
  console.log(`  ✓ ${SAMPLE_INTAKES.length} intakes inserted`)
  seeded++
} else {
  console.log(`  – Intakes already seeded (${existingIntakes} rows), skipping`)
}

if (existingVolume === 0) {
  console.log('Seeding intake volume…')
  const insert = db.prepare('INSERT INTO intake_volume_weeks (week, count) VALUES (?, ?)')
  db.transaction(() => {
    for (const r of INTAKE_VOLUME_DEFAULT) insert.run(r.week, r.count)
  })()
  console.log(`  ✓ ${INTAKE_VOLUME_DEFAULT.length} weeks inserted`)
  seeded++
} else {
  console.log(`  – Intake volume already seeded (${existingVolume} rows), skipping`)
}

if (existingMetrics === 0) {
  console.log('Seeding program metrics…')
  const insertMetric = db.prepare(`
    INSERT INTO program_metrics
      (program_id, gender, avg_wait_days, completion_rate, total_clients, total_capacity,
       current_clients, available_pct, waitlist_depth, has_capacity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertAge = db.prepare(`
    INSERT INTO program_metrics_age (program_id, gender, age_group, outcome_rate, clients)
    VALUES (?, ?, ?, ?, ?)
  `)
  db.transaction(() => {
    for (const prog of PROGRAMS) {
      for (const gender of GENDERS) {
        const d = mockProgramData(prog.id, prog.targetGroups, gender)
        insertMetric.run(
          prog.id, gender, d.avg_wait_days, d.completion_rate, d.total_clients,
          d.total_capacity, d.current_clients, d.available_pct, d.waitlist_depth, d.has_capacity
        )
        for (let i = 0; i < AGE_GROUPS.length; i++) {
          insertAge.run(prog.id, gender, AGE_GROUPS[i], d.outcomesByAge[i], d.demographicSplit[i])
        }
      }
    }
  })()
  const rows = PROGRAMS.length * GENDERS.length
  console.log(`  ✓ ${rows} program×gender metrics inserted`)
  seeded++
} else {
  console.log(`  – Program metrics already seeded (${existingMetrics} rows), skipping`)
}

console.log(seeded > 0 ? '\nSeed complete.' : '\nNothing to seed — DB already populated.')
db.close()
