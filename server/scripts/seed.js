'use strict'

const db = require('../db')
const { encrypt } = require('../crypto')
const { AGE_GROUPS } = require('../csvUtils')
const { PROGRAMS } = require('../programs')

const GENDERS = ['Female', 'Male', 'Non-binary']
const G_OFFSET = { Female: 100, Male: 200, 'Non-binary': 300 }
const SUPPORT_TYPES = [
  'Anxiety / Stress',
  'Depression',
  'Trauma / PTSD',
  'Grief & Loss',
  'Relationship Issues',
  'Family / Parenting',
  'Substance Use',
  'Eating Disorders',
  'Youth Mental Health',
  'Aged Care Support',
]
const SEEKER_GROUPS = [
  'Adult',
  'Youth',
  'Family',
  'Carer',
  'LGBTQIA+',
  'Person with psychosocial disability',
  'Culturally and Linguistically Diverse community member',
  'Aboriginal or Torres Strait Islander',
]
const ACCESS_MODES = ['Appointment', 'Phone/online', 'Self-referral', 'Referral required', 'Outreach / proactive reach-in']
const SUBURBS = ['Belconnen', 'Tuggeranong', 'Gungahlin', 'Woden', 'Charnwood', 'Dickson', 'Holder', 'Macquarie']
const URGENCIES = ['low', 'medium', 'medium', 'high', 'high', 'crisis']

function rng(seed, offset) {
  const x = Math.sin(seed * 9301 + offset * 49297 + 233) * 10000
  return x - Math.floor(x)
}

function programSeed(programId) {
  const parsed = parseInt(String(programId).replace(/\D/g, ''), 10)
  if (!Number.isNaN(parsed)) return parsed
  return String(programId).split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
}

const AGE_RANGES = {
  '0-3':   { start: 0,  end: 3,  width: 3 },
  '4-6':   { start: 4,  end: 6,  width: 3 },
  '7-9':   { start: 7,  end: 9,  width: 3 },
  '10-12': { start: 10, end: 12, width: 3 },
  '13-15': { start: 13, end: 15, width: 3 },
  '16-18': { start: 16, end: 18, width: 3 },
  '19-21': { start: 19, end: 21, width: 3 },
  '22-25': { start: 22, end: 25, width: 4 },
  '26-35': { start: 26, end: 35, width: 10 },
  '36-45': { start: 36, end: 45, width: 10 },
  '46-55': { start: 46, end: 55, width: 10 },
  '56-65': { start: 56, end: 65, width: 10 },
  '65+':   { start: 66, end: 75, width: 10 },
}

function ageMortalityFactor(age) {
  const boundedAge = Math.max(0, Math.min(75, age))
  return 1 - (boundedAge / 75) * 0.30
}

function ageGroupWeight(ageGroup) {
  const range = AGE_RANGES[ageGroup]
  if (!range) return 1
  const midpoint = (range.start + range.end) / 2
  return range.width * ageMortalityFactor(midpoint)
}

function weightedAgeCounts(total, seed, offset) {
  const weights = AGE_GROUPS.map((ageGroup, i) => {
    const variation = 0.97 + rng(seed, offset + i) * 0.06
    return ageGroupWeight(ageGroup) * variation
  })
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || 1
  return weights.map(weight => Math.max(0, Math.round((total * weight) / totalWeight)))
}

function buildProgramMetricSeed(program, gender, capacityBand, hasProgramWaitlist = false) {
  const n = programSeed(program.id)
  const g = G_OFFSET[gender] || 0
  const isYouth = program.targetGroups.includes('Young people')
  const isFamily = program.targetGroups.includes('Families')

  const baseCapacity = Math.round(42 + rng(n, 20) * 38)
  const femaleCapacity = Math.max(10, Math.round(baseCapacity * 0.38))
  const maleCapacity = Math.max(10, Math.round(baseCapacity * 0.37))
  const genderCapacity = {
    Female: femaleCapacity,
    Male: maleCapacity,
    'Non-binary': Math.max(10, baseCapacity - femaleCapacity - maleCapacity),
  }
  const totalCapacity = genderCapacity[gender] || Math.max(1, Math.round(baseCapacity / GENDERS.length))
  let currentClients
  let waitlistDepth

  if (capacityBand === 'available') {
    const spare = Math.max(1, Math.round(1 + rng(n + g, 22) * Math.max(2, totalCapacity * 0.28)))
    currentClients = Math.max(0, totalCapacity - spare)
    waitlistDepth = 0
  } else if (capacityBand === 'atCapacity') {
    currentClients = totalCapacity
    waitlistDepth = hasProgramWaitlist
      ? 1 + Math.floor(rng(n + g, 28) * 3)
      : 0
  } else if (capacityBand === 'overCapacity') {
    const maxOverBy = Math.max(1, Math.floor(totalCapacity * 0.10))
    const overBy = Math.max(1, Math.ceil(rng(n + g, 25) * maxOverBy))
    currentClients = totalCapacity + overBy
    waitlistDepth = hasProgramWaitlist
      ? overBy + Math.floor(rng(n + g, 29) * 3)
      : 0
  } else {
    currentClients = totalCapacity
    waitlistDepth = 0
  }

  const availablePct = Math.max(0, Math.round(((totalCapacity - currentClients) / totalCapacity) * 100))
  const totalClients = Math.round(15 + rng(n + g, 10) * 100)

  const demographicSplit = weightedAgeCounts(currentClients, n + g, 30)
  const outcomeSampleByAge = weightedAgeCounts(totalClients, n + g, 70)

  const outcomesByAge = AGE_GROUPS.map((_, i) => {
    const total = Math.max(1, outcomeSampleByAge[i])
    let baseRate = 0.85
    if (isYouth && i <= 6) baseRate = 0.92
    if (isFamily && i >= 4 && i <= 9) baseRate = 0.88
    if (!isYouth && i >= 8) baseRate = 0.88
    const rate = Math.min(0.97, Math.max(0.50, baseRate + (rng(n + g, 60 + i) - 0.5) * 0.24))
    const positive = Math.min(total - 1, Math.round(total * rate))
    return { positive, negative: total - positive }
  })

  return {
    avg_wait_days: parseFloat((1.5 + rng(n + g, 8) * 12).toFixed(1)),
    completion_rate: Math.round(54 + rng(n + g, 9) * 38),
    total_clients: totalClients,
    total_capacity: totalCapacity,
    current_clients: currentClients,
    available_pct: availablePct,
    waitlist_depth: waitlistDepth,
    has_capacity: currentClients < totalCapacity ? 1 : 0,
    outcomesByAge,
    demographicSplit,
  }
}

function isoDaysAgo(days, hour = 9, minute = 0) {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function dateOnlyDaysAgo(days) {
  return isoDaysAgo(days).slice(0, 10)
}

function weekLabel(daysAgo) {
  const d = new Date(isoDaysAgo(daysAgo))
  return d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })
}

function sampleIntakes() {
  return Array.from({ length: 54 }, (_, i) => {
    const seed = i + 1
    const daysAgo = Math.max(1, 123 - Math.round(i * 2.35) - Math.floor(rng(seed, 1) * 3))
    const supportA = SUPPORT_TYPES[i % SUPPORT_TYPES.length]
    const supportB = SUPPORT_TYPES[(i * 3 + 2) % SUPPORT_TYPES.length]
    const seekerA = SEEKER_GROUPS[i % SEEKER_GROUPS.length]
    const seekerB = SEEKER_GROUPS[(i * 2 + 3) % SEEKER_GROUPS.length]
    const program = PROGRAMS[(i * 7 + 3) % PROGRAMS.length]
    const routeDelay = Math.round(1 + rng(seed, 6) * 6)
    const isRecent = daysAgo <= 30
    const isRouted = !isRecent || rng(seed, 7) < 0.35

    return {
      id: `INT${String(seed).padStart(3, '0')}`,
      daysAgo,
      hour: 8 + (i % 9),
      gender: GENDERS[i % GENDERS.length],
      dob: `${1958 + (i * 7) % 49}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i * 3) % 27).padStart(2, '0')}`,
      suburb: SUBURBS[i % SUBURBS.length],
      urgency: URGENCIES[i % URGENCIES.length],
      seekerGroups: seekerA === seekerB ? [seekerA] : [seekerA, seekerB],
      supportTypes: supportA === supportB ? [supportA] : [supportA, supportB],
      accessModes: [ACCESS_MODES[i % ACCESS_MODES.length]],
      status: isRouted ? 'routed' : 'queued',
      assignedOrgId: isRouted ? program.orgId : null,
      assignedAt: isRouted ? isoDaysAgo(Math.max(0, daysAgo - Math.max(0, routeDelay - 1)), 10, 0) : null,
      routedProgramId: isRouted ? program.id : null,
      routedAt: isRouted ? isoDaysAgo(Math.max(0, daysAgo - routeDelay), 11, 30) : null,
      routedOrgName: isRouted ? program.orgName : null,
      routedProgramName: isRouted ? (program.shortName || program.name) : null,
    }
  }).map(r => ({ ...r, submittedAt: isoDaysAgo(r.daysAgo, r.hour, 15) }))
}

function intakeVolumeWeeks() {
  return Array.from({ length: 18 }, (_, i) => {
    const days = (17 - i) * 7
    return {
      week: weekLabel(days),
      count: Math.round(2 + rng(i + 1, 90) * 5),
    }
  })
}

function seedIntakes() {
  const insertIntake = db.prepare(`
    INSERT INTO intakes (
      id, submitted_at, dob, gender, suburb, urgency, consent_data, consent_crisis, status,
      assigned_org_id, assigned_at, routed_program_id, routed_at, routed_org_name, routed_program_name
    )
    VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertTag = db.prepare('INSERT OR IGNORE INTO intake_tags (intake_id, kind, value) VALUES (?, ?, ?)')
  const insertRoute = db.prepare(`
    INSERT INTO intake_routes (intake_id, program_id, org_id, org_name, program_name, support_type, routed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  const rows = sampleIntakes()

  for (const r of rows) {
    insertIntake.run(
      r.id,
      r.submittedAt,
      encrypt(r.dob),
      r.gender,
      r.suburb,
      r.urgency,
      r.status,
      r.assignedOrgId,
      r.assignedAt,
      r.routedProgramId,
      r.routedAt,
      r.routedOrgName,
      r.routedProgramName
    )
    for (const v of r.seekerGroups) insertTag.run(r.id, 'seekerGroup', v)
    for (const v of r.supportTypes) insertTag.run(r.id, 'supportType', v)
    for (const v of r.accessModes) insertTag.run(r.id, 'accessMode', v)
    if (r.routedProgramId) {
      insertRoute.run(
        r.id,
        r.routedProgramId,
        r.assignedOrgId,
        r.routedOrgName,
        r.routedProgramName,
        r.supportTypes[0] || null,
        r.routedAt
      )
    }
  }
  return rows.length
}

function seedIntakeVolume() {
  const insert = db.prepare('INSERT INTO intake_volume_weeks (week, count) VALUES (?, ?)')
  const rows = intakeVolumeWeeks()
  for (const r of rows) insert.run(r.week, r.count)
  return rows.length
}

function seedProgramMetrics() {
  const insertMetric = db.prepare(`
    INSERT INTO program_metrics
      (program_id, gender, avg_wait_days, completion_rate, total_clients, total_capacity,
       current_clients, available_pct, waitlist_depth, has_capacity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertAge = db.prepare(`
    INSERT INTO program_metrics_age (program_id, gender, age_group, positive_outcome, negative_outcome, clients)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const bandedPrograms = [...PROGRAMS]
    .sort((a, b) => rng(programSeed(a.id), 99) - rng(programSeed(b.id), 99))
    .map((program, i, rows) => {
      const availableEnd = Math.round(rows.length * 0.55)
      const atCapacityEnd = availableEnd + Math.round(rows.length * 0.30)
      const atCapacityCount = atCapacityEnd - availableEnd
      const overCapacityCount = rows.length - atCapacityEnd
      let capacityBand = 'overCapacity'
      let hasProgramWaitlist = (i - atCapacityEnd) < Math.round(overCapacityCount * 0.80)
      if (i < availableEnd) capacityBand = 'available'
      else if (i < atCapacityEnd) {
        capacityBand = 'atCapacity'
        hasProgramWaitlist = (i - availableEnd) < Math.round(atCapacityCount * 0.25)
      }
      return { program, capacityBand, hasProgramWaitlist }
    })

  for (const { program, capacityBand, hasProgramWaitlist } of bandedPrograms) {
    for (const gender of GENDERS) {
      const d = buildProgramMetricSeed(program, gender, capacityBand, hasProgramWaitlist)
      insertMetric.run(
        program.id,
        gender,
        d.avg_wait_days,
        d.completion_rate,
        d.total_clients,
        d.total_capacity,
        d.current_clients,
        d.available_pct,
        d.waitlist_depth,
        d.has_capacity
      )
      for (let i = 0; i < AGE_GROUPS.length; i++) {
        insertAge.run(
          program.id,
          gender,
          AGE_GROUPS[i],
          d.outcomesByAge[i].positive,
          d.outcomesByAge[i].negative,
          d.demographicSplit[i]
        )
      }
    }
  }
  return PROGRAMS.length * GENDERS.length
}

function refreshMockData() {
  return db.transaction(() => {
    db.prepare('DELETE FROM intake_tags').run()
    db.prepare('DELETE FROM intake_routes').run()
    db.prepare('DELETE FROM intakes').run()
    db.prepare('DELETE FROM intake_volume_weeks').run()
    db.prepare('DELETE FROM program_metrics_age').run()
    db.prepare('DELETE FROM program_metrics').run()

    return {
      intakes: seedIntakes(),
      intakeVolumeWeeks: seedIntakeVolume(),
      programMetrics: seedProgramMetrics(),
      refreshedAt: new Date().toISOString(),
    }
  })()
}

function seedMockData({ forceMetrics = false } = {}) {
  const result = { intakes: 0, intakeVolumeWeeks: 0, programMetrics: 0 }

  if (forceMetrics) {
    db.prepare('DELETE FROM program_metrics_age').run()
    db.prepare('DELETE FROM program_metrics').run()
  }

  if (db.prepare('SELECT COUNT(*) as n FROM intakes').get().n === 0) {
    result.intakes = db.transaction(seedIntakes)()
  }
  if (db.prepare('SELECT COUNT(*) as n FROM intake_volume_weeks').get().n === 0) {
    result.intakeVolumeWeeks = db.transaction(seedIntakeVolume)()
  }
  if (db.prepare('SELECT COUNT(*) as n FROM program_metrics').get().n === 0) {
    result.programMetrics = db.transaction(seedProgramMetrics)()
  }

  return result
}

if (require.main === module) {
  const refresh = process.argv.includes('--refresh')
  const forceMetrics = process.argv.includes('--force')
  const result = refresh ? refreshMockData() : seedMockData({ forceMetrics })
  console.log(JSON.stringify(result, null, 2))
  db.close()
}

module.exports = {
  dateOnlyDaysAgo,
  refreshMockData,
  seedMockData,
}
