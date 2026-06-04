// CJS port of src/utils/csvUtils.js — pure parsing/serialisation, no browser APIs
'use strict'

const AGE_GROUPS = ['Under 18', '18-25', '26-35', '36-45', '46-55', '56-65', '65+']
const AGE_COL = {
  'Under 18': 'Under_18', '18-25': '18_25',  '26-35': '26_35',
  '36-45':    '36_45',    '46-55': '46_55',   '56-65': '56_65', '65+': '65plus',
}

const MEMBER_SHARED_HEADERS = [
  'programId', 'programName', 'orgId', 'orgName', 'gender',
  'avgWaitDays', 'completionRate', 'totalClients', 'totalCapacity',
  'currentClients', 'availablePct', 'waitlistDepth', 'hasCapacity',
  ...AGE_GROUPS.flatMap(a => [`outcomeRate_${AGE_COL[a]}`, `clients_${AGE_COL[a]}`]),
]

// ── Field helpers ────────────────────────────────────────────────────────────

function escapeCsvField(val) {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

function rowToCsv(fields) { return fields.map(escapeCsvField).join(',') }

function parseCsvLine(line) {
  const result = []
  let current = '', inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++ }
      else if (ch === '"') inQuotes = false
      else current += ch
    } else {
      if (ch === '"') { inQuotes = true }
      else if (ch === ',') { result.push(current); current = '' }
      else current += ch
    }
  }
  result.push(current)
  return result
}

// ── Date helpers ─────────────────────────────────────────────────────────────

// Converts DD/MM/YYYY (Excel auto-format) → YYYY-MM-DD (ISO). Passes through ISO dates unchanged.
function normaliseDob(raw) {
  if (!raw) return raw
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  return raw
}

// ── Intake Queue ─────────────────────────────────────────────────────────────

const INTAKE_QUEUE_HEADERS = [
  'id', 'status', 'dob', 'gender', 'suburb',
  'seekerGroups', 'supportTypes', 'urgency', 'submittedAt', 'accessModes',
  'description', 'previousServices', 'contactMethod', 'contactTime', 'specialRequirements',
]

function intakeQueueToCsv(records) {
  const rows = [INTAKE_QUEUE_HEADERS.join(',')]
  for (const r of records) {
    rows.push(rowToCsv([
      r.id, r.status || 'queued', r.dob, r.gender, r.suburb,
      (r.seekerGroups  || []).join('|'),
      (r.supportTypes  || []).join('|'),
      r.urgency, r.submittedAt,
      (r.accessModes   || []).join('|'),
      r.description        || '',
      r.previousServices   || '',
      (r.contactMethod || []).join('|'),
      r.contactTime        || '',
      r.specialRequirements || '',
    ]))
  }
  return rows.join('\n')
}

function csvToIntakeQueue(text) {
  const lines = text.trim().split('\n').filter(Boolean)
  const headers = parseCsvLine(lines[0]).map(h => h.trim())
  return lines.slice(1).map(line => {
    const vals = parseCsvLine(line)
    const r = {}
    headers.forEach((h, i) => { r[h] = (vals[i] ?? '').trim() })
    if (!r.id) return null
    return {
      id: r.id, status: r.status || 'queued', dob: normaliseDob(r.dob), gender: r.gender, suburb: r.suburb,
      seekerGroups:  r.seekerGroups  ? r.seekerGroups.split('|').filter(Boolean)  : [],
      supportTypes:  r.supportTypes  ? r.supportTypes.split('|').filter(Boolean)  : [],
      urgency:       r.urgency,
      submittedAt:   r.submittedAt,
      accessModes:   r.accessModes   ? r.accessModes.split('|').filter(Boolean)   : [],
      ...(r.description         && { description:         r.description         }),
      ...(r.previousServices    && { previousServices:    r.previousServices    }),
      ...(r.contactMethod       && { contactMethod:       r.contactMethod.split('|').filter(Boolean) }),
      ...(r.contactTime         && { contactTime:         r.contactTime         }),
      ...(r.specialRequirements && { specialRequirements: r.specialRequirements }),
    }
  }).filter(Boolean)
}

// ── Intake Volume ─────────────────────────────────────────────────────────────

function intakeVolumeToCsv(records) {
  const rows = ['week,count']
  for (const r of records) rows.push(rowToCsv([r.week, r.count]))
  return rows.join('\n')
}

function csvToIntakeVolume(text) {
  const lines = text.trim().split('\n').filter(Boolean)
  return lines.slice(1).map(line => {
    const vals = parseCsvLine(line)
    const week  = (vals[0] ?? '').trim()
    const count = parseInt((vals[1] ?? '').trim(), 10)
    if (!week) return null
    return { week, count: isNaN(count) ? 0 : count }
  }).filter(Boolean)
}

// ── Member Shared Data ────────────────────────────────────────────────────────
// metricRows shape from DB query (see routes/programMetrics.js):
//   [{program_id, gender, avg_wait_days, ..., ageRows:[{age_group,outcome_rate,clients}]}]

function memberSharedDataToCsv(metricRows, programsMap) {
  const rows = [MEMBER_SHARED_HEADERS.join(',')]
  for (const r of metricRows) {
    const byGroup = {}
    for (const a of (r.ageRows || [])) byGroup[a.age_group] = a
    const ageFields = AGE_GROUPS.flatMap(a => [
      byGroup[a]?.outcome_rate ?? '',
      byGroup[a]?.clients      ?? '',
    ])
    const prog = programsMap?.[r.program_id] || {}
    rows.push(rowToCsv([
      r.program_id, prog.name || '', prog.orgId || '', prog.orgName || '', r.gender,
      r.avg_wait_days, r.completion_rate, r.total_clients, r.total_capacity,
      r.current_clients, r.available_pct, r.waitlist_depth,
      r.has_capacity ? 'true' : 'false',
      ...ageFields,
    ]))
  }
  return rows.join('\n')
}

// Returns array ready for DB upsert
function csvToMemberSharedData(text) {
  const lines = text.trim().split('\n').filter(Boolean)
  const headers = parseCsvLine(lines[0]).map(h => h.trim())
  const result = []
  for (const line of lines.slice(1)) {
    const vals = parseCsvLine(line)
    const r = {}
    headers.forEach((h, i) => { r[h] = (vals[i] ?? '').trim() })
    if (!r.programId || !r.gender) continue
    result.push({
      program_id:     r.programId,
      gender:         r.gender,
      avg_wait_days:  parseFloat(r.avgWaitDays)     || 0,
      completion_rate: parseInt(r.completionRate, 10) || 0,
      total_clients:  parseInt(r.totalClients,   10) || 0,
      total_capacity: parseInt(r.totalCapacity,  10) || 0,
      current_clients: parseInt(r.currentClients, 10) || 0,
      available_pct:  parseInt(r.availablePct,   10) || 0,
      waitlist_depth: parseInt(r.waitlistDepth,  10) || 0,
      has_capacity:   r.hasCapacity === 'true' ? 1 : 0,
      ageRows: AGE_GROUPS.map(a => ({
        age_group:    a,
        outcome_rate: parseInt(r[`outcomeRate_${AGE_COL[a]}`], 10) || 0,
        clients:      parseInt(r[`clients_${AGE_COL[a]}`],     10) || 0,
      })),
    })
  }
  return result
}

module.exports = {
  AGE_GROUPS,
  intakeQueueToCsv, csvToIntakeQueue,
  intakeVolumeToCsv, csvToIntakeVolume,
  memberSharedDataToCsv, csvToMemberSharedData,
}
