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

export const CSV_TYPES = {
  INTAKE_QUEUE: 'intake-queue',
  INTAKE_VOLUME: 'intake-volume',
  MEMBER_SHARED: 'member-shared',
}

export const CSV_FILENAMES = {
  [CSV_TYPES.INTAKE_QUEUE]: 'intake-data-queue.csv',
  [CSV_TYPES.INTAKE_VOLUME]: 'intake-data-volume.csv',
  [CSV_TYPES.MEMBER_SHARED]: 'sector-data.csv',
}

export const CSV_LABELS = {
  [CSV_TYPES.INTAKE_QUEUE]: 'Intake Data - Queue',
  [CSV_TYPES.INTAKE_VOLUME]: 'Intake Data - Volume',
  [CSV_TYPES.MEMBER_SHARED]: 'Sector Data',
}
