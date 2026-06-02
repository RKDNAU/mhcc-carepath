import { AGE_GROUPS, mockProgramData } from './programData'
import { PROGRAMS } from '../data/programs'

// ── CSV field helpers ────────────────────────────────────────────────────────

function escapeCsvField(val) {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

function rowToCsv(fields) {
  return fields.map(escapeCsvField).join(',')
}

function parseCsvLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
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

// ── Download trigger ─────────────────────────────────────────────────────────

export function downloadCsv(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Shared Intake Queue ──────────────────────────────────────────────────────
// Filename: shared-intake-queue.csv
// Arrays stored as pipe-separated (|) values within a field.

const INTAKE_QUEUE_HEADERS = [
  'id', 'dob', 'gender', 'suburb',
  'seekerGroups', 'supportTypes', 'urgency', 'submittedAt', 'accessModes',
  'description', 'previousServices', 'contactMethod', 'contactTime', 'specialRequirements',
]

export function intakeQueueToCsv(records) {
  const rows = [INTAKE_QUEUE_HEADERS.join(',')]
  for (const r of records) {
    rows.push(rowToCsv([
      r.id, r.dob, r.gender, r.suburb,
      (r.seekerGroups  || []).join('|'),
      (r.supportTypes  || []).join('|'),
      r.urgency,
      r.submittedAt,
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

export function csvToIntakeQueue(text) {
  const lines = text.trim().split('\n').filter(Boolean)
  const headers = parseCsvLine(lines[0]).map(h => h.trim())
  return lines.slice(1).map(line => {
    const vals = parseCsvLine(line)
    const r = {}
    headers.forEach((h, i) => { r[h] = (vals[i] ?? '').trim() })
    if (!r.id) return null
    return {
      id:          r.id,
      dob:         r.dob,
      gender:      r.gender,
      suburb:      r.suburb,
      seekerGroups: r.seekerGroups  ? r.seekerGroups.split('|').filter(Boolean)  : [],
      supportTypes: r.supportTypes  ? r.supportTypes.split('|').filter(Boolean)  : [],
      urgency:      r.urgency,
      submittedAt:  r.submittedAt,
      accessModes:  r.accessModes   ? r.accessModes.split('|').filter(Boolean)   : [],
      ...(r.description        && { description:        r.description        }),
      ...(r.previousServices   && { previousServices:   r.previousServices   }),
      ...(r.contactMethod      && { contactMethod:      r.contactMethod.split('|').filter(Boolean) }),
      ...(r.contactTime        && { contactTime:        r.contactTime        }),
      ...(r.specialRequirements && { specialRequirements: r.specialRequirements }),
    }
  }).filter(Boolean)
}

// ── CarePath Intake Volume ───────────────────────────────────────────────────
// Filename: carepath-intake-data.csv

const INTAKE_VOLUME_HEADERS = ['week', 'count']

export function intakeVolumeToCsv(records) {
  const rows = [INTAKE_VOLUME_HEADERS.join(',')]
  for (const r of records) {
    rows.push(rowToCsv([r.week, r.count]))
  }
  return rows.join('\n')
}

export function csvToIntakeVolume(text) {
  const lines = text.trim().split('\n').filter(Boolean)
  return lines.slice(1).map(line => {
    const vals = parseCsvLine(line)
    const week  = (vals[0] ?? '').trim()
    const count = parseInt((vals[1] ?? '').trim(), 10)
    if (!week) return null
    return { week, count: isNaN(count) ? 0 : count }
  }).filter(Boolean)
}

// ── Member Shared Data ───────────────────────────────────────────────────────
// Filename: member-shared-data.csv
// One row per program × gender (Female / Male / Non-binary).
// Age-group columns use safe identifiers derived from AGE_GROUPS labels.

const GENDERS_EXPORT = ['Female', 'Male', 'Non-binary']

// Maps each AGE_GROUPS label to a safe CSV column suffix
const AGE_COL = {
  'Under 18': 'Under_18',
  '18-25':    '18_25',
  '26-35':    '26_35',
  '36-45':    '36_45',
  '46-55':    '46_55',
  '56-65':    '56_65',
  '65+':      '65plus',
}

const MEMBER_SHARED_HEADERS = [
  'programId', 'programName', 'orgId', 'orgName', 'gender',
  'avgWaitDays', 'completionRate', 'totalClients', 'totalCapacity',
  'currentClients', 'availablePct', 'waitlistDepth', 'hasCapacity',
  ...AGE_GROUPS.flatMap(a => [`outcomeRate_${AGE_COL[a]}`, `clients_${AGE_COL[a]}`]),
]

export function memberSharedDataToCsv() {
  const rows = [MEMBER_SHARED_HEADERS.join(',')]
  for (const program of PROGRAMS) {
    for (const gender of GENDERS_EXPORT) {
      const d = mockProgramData(program, gender)
      const ageFields = AGE_GROUPS.flatMap((_, i) => [
        d.outcomesByAge[i]?.value    ?? '',
        d.demographicSplit[i]?.value ?? '',
      ])
      rows.push(rowToCsv([
        program.id, program.name, program.orgId, program.orgName, gender,
        d.avgWaitDays, d.completionRate, d.totalClients, d.totalCapacity,
        d.currentClients, d.availablePct, d.waitlistDepth,
        d.hasCapacity ? 'true' : 'false',
        ...ageFields,
      ]))
    }
  }
  return rows.join('\n')
}

// Returns a map keyed by "programId_gender" → metrics object compatible with
// what mockProgramData() returns. Supabase upload will replace this map with
// a table-backed equivalent once wired up.
export function csvToMemberSharedData(text) {
  const lines = text.trim().split('\n').filter(Boolean)
  const headers = parseCsvLine(lines[0]).map(h => h.trim())
  const result = {}
  for (const line of lines.slice(1)) {
    const vals = parseCsvLine(line)
    const r = {}
    headers.forEach((h, i) => { r[h] = (vals[i] ?? '').trim() })
    if (!r.programId || !r.gender) continue
    const key = `${r.programId}_${r.gender}`
    result[key] = {
      avgWaitDays:    parseFloat(r.avgWaitDays)     || 0,
      completionRate: parseInt(r.completionRate, 10) || 0,
      totalClients:   parseInt(r.totalClients,   10) || 0,
      totalCapacity:  parseInt(r.totalCapacity,  10) || 0,
      currentClients: parseInt(r.currentClients, 10) || 0,
      availablePct:   parseInt(r.availablePct,   10) || 0,
      waitlistDepth:  parseInt(r.waitlistDepth,  10) || 0,
      hasCapacity:    r.hasCapacity === 'true',
      outcomesByAge: AGE_GROUPS.map(a => ({
        label: a,
        value: parseInt(r[`outcomeRate_${AGE_COL[a]}`], 10) || 0,
      })),
      demographicSplit: AGE_GROUPS.map(a => ({
        label: a,
        value: parseInt(r[`clients_${AGE_COL[a]}`], 10) || 0,
      })),
    }
  }
  return result
}

// ── File-type detection ──────────────────────────────────────────────────────

export const CSV_TYPES = {
  INTAKE_QUEUE:  'intake-queue',
  INTAKE_VOLUME: 'intake-volume',
  MEMBER_SHARED: 'member-shared',
}

export const CSV_FILENAMES = {
  [CSV_TYPES.INTAKE_QUEUE]:  'shared-intake-queue.csv',
  [CSV_TYPES.INTAKE_VOLUME]: 'carepath-intake-data.csv',
  [CSV_TYPES.MEMBER_SHARED]: 'member-shared-data.csv',
}

export const CSV_LABELS = {
  [CSV_TYPES.INTAKE_QUEUE]:  'Shared Intake Queue',
  [CSV_TYPES.INTAKE_VOLUME]: 'CarePath Intake Data',
  [CSV_TYPES.MEMBER_SHARED]: 'Member Shared Data',
}

export function detectCsvType(filename) {
  const lower = filename.toLowerCase()
  if (lower.startsWith('shared-intake-queue'))  return CSV_TYPES.INTAKE_QUEUE
  if (lower.startsWith('carepath-intake-data')) return CSV_TYPES.INTAKE_VOLUME
  if (lower.startsWith('member-shared-data'))   return CSV_TYPES.MEMBER_SHARED
  return null
}
