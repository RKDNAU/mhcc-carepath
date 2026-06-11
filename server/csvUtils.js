'use strict'

const AGE_GROUPS = [
  '0-3', '4-6', '7-9', '10-12', '13-15', '16-18',
  '19-21', '22-25', '26-35', '36-45', '46-55', '56-65', '65+',
]

const AGE_COL = {
  '0-3': '0_3',
  '4-6': '4_6',
  '7-9': '7_9',
  '10-12': '10_12',
  '13-15': '13_15',
  '16-18': '16_18',
  '19-21': '19_21',
  '22-25': '22_25',
  '26-35': '26_35',
  '36-45': '36_45',
  '46-55': '46_55',
  '56-65': '56_65',
  '65+': '65plus',
}

const INTAKE_QUEUE_HEADERS = [
  'id', 'status', 'dob', 'gender', 'suburb',
  'seekerGroups', 'supportTypes', 'urgency', 'submittedAt', 'accessModes',
  'description', 'previousServices', 'contactMethod', 'contactTime', 'specialRequirements',
]

const MEMBER_SHARED_HEADERS = [
  'programId', 'programName', 'orgId', 'orgName', 'gender',
  'avgWaitDays', 'completionRate', 'totalClients', 'totalCapacity',
  'currentClients', 'availablePct', 'waitlistDepth', 'hasCapacity',
  ...AGE_GROUPS.flatMap(ageGroup => [
    `positiveOutcome_${AGE_COL[ageGroup]}`,
    `nonPositiveOutcome_${AGE_COL[ageGroup]}`,
    `clients_${AGE_COL[ageGroup]}`,
  ]),
]

function escapeCsvField(value) {
  if (value === null || value === undefined) return ''
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

function rowToCsv(fields) {
  return fields.map(escapeCsvField).join(',')
}

function intakeQueueToCsv(records) {
  const rows = [INTAKE_QUEUE_HEADERS.join(',')]
  for (const record of records) {
    rows.push(rowToCsv([
      record.id,
      record.status || 'queued',
      record.dob,
      record.gender,
      record.suburb,
      (record.seekerGroups || []).join('|'),
      (record.supportTypes || []).join('|'),
      record.urgency,
      record.submittedAt,
      (record.accessModes || []).join('|'),
      record.description || '',
      record.previousServices || '',
      (record.contactMethod || []).join('|'),
      record.contactTime || '',
      record.specialRequirements || '',
    ]))
  }
  return rows.join('\n')
}

function intakeVolumeToCsv(records) {
  return [
    'week,count',
    ...records.map(record => rowToCsv([record.week, record.count])),
  ].join('\n')
}

function memberSharedDataToCsv(metricRows, programsMap) {
  const rows = [MEMBER_SHARED_HEADERS.join(',')]
  for (const record of metricRows) {
    const ageRowsByGroup = {}
    for (const ageRow of record.ageRows || []) {
      ageRowsByGroup[ageRow.age_group] = ageRow
    }

    const ageFields = AGE_GROUPS.flatMap(ageGroup => [
      ageRowsByGroup[ageGroup]?.positive_outcome ?? '',
      ageRowsByGroup[ageGroup]?.negative_outcome ?? '',
      ageRowsByGroup[ageGroup]?.clients ?? '',
    ])
    const program = programsMap?.[record.program_id] || {}

    rows.push(rowToCsv([
      record.program_id,
      program.name || '',
      program.orgId || '',
      program.orgName || '',
      record.gender,
      record.avg_wait_days,
      record.completion_rate,
      record.total_clients,
      record.total_capacity,
      record.current_clients,
      record.available_pct,
      record.waitlist_depth,
      record.has_capacity ? 'true' : 'false',
      ...ageFields,
    ]))
  }
  return rows.join('\n')
}

module.exports = {
  AGE_GROUPS,
  intakeQueueToCsv,
  intakeVolumeToCsv,
  memberSharedDataToCsv,
}
