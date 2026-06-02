// Shared mock data for program capacity/outcomes.
// Uses a seeded RNG so every program always produces the same numbers
// regardless of which component renders it.

const rng = (seed, offset) => {
  const x = Math.sin(seed * 9301 + offset * 49297 + 233) * 10000
  return x - Math.floor(x)
}

export const AGE_GROUPS = ['Under 18', '18-25', '26-35', '36-45', '46-55', '56-65', '65+']

const G_OFFSET = { All: 0, Female: 100, Male: 200, 'Non-binary': 300 }

export function mockProgramData(program, gender = 'All') {
  const n = parseInt(program.id.replace('PRG', ''), 10)
  const g = G_OFFSET[gender] || 0
  const isYouth  = program.targetGroups.includes('Young people')
  const isFamily = program.targetGroups.includes('Families')

  const outcomesByAge = AGE_GROUPS.map((label, i) => {
    let value = Math.round(50 + rng(n + g, i + 1) * 36)
    if (isYouth  && i <= 2) value = Math.min(93, value + 14)
    if (isFamily && i >= 2 && i <= 4) value = Math.min(93, value + 8)
    if (!isYouth && i >= 5) value = Math.min(93, value + 6)
    return { label, value }
  })

  const totalCapacity  = Math.round(10 + rng(n, 20) * 40)
  const rawOcc         = rng(n, 21)
  const occupancyRate  = rawOcc > 0.85 ? 0.95 + rng(n, 27) * 0.25 : rawOcc * 0.9
  const currentClients = Math.round(totalCapacity * Math.min(occupancyRate, 1.2))
  const availablePct   = Math.max(0, Math.round(((totalCapacity - currentClients) / totalCapacity) * 100))

  const waitlistBase = availablePct < 10 ? 8 + rng(n, 32) * 18
                     : availablePct < 30 ? 2 + rng(n, 32) * 7
                     :                         rng(n, 32) * 3
  const waitlistDepth = Math.round(waitlistBase)

  const demographicSplit = AGE_GROUPS.map((label, i) => ({
    label,
    value: Math.max(0, Math.round(rng(n + g, 30 + i) * (currentClients / 4))),
  }))

  return {
    outcomesByAge, demographicSplit,
    avgWaitDays:    parseFloat((1.5 + rng(n + g, 8) * 12).toFixed(1)),
    completionRate: Math.round(54 + rng(n + g, 9) * 38),
    totalClients:   Math.round(15 + rng(n + g, 10) * 100),
    totalCapacity, currentClients, availablePct, waitlistDepth,
    hasCapacity: currentClients < totalCapacity,
  }
}

export function getAgeGroup(dob) {
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--
  if (age < 18)  return 'Under 18'
  if (age <= 25) return '18-25'
  if (age <= 35) return '26-35'
  if (age <= 45) return '36-45'
  if (age <= 55) return '46-55'
  if (age <= 65) return '56-65'
  return '65+'
}

export function mapGender(intakeGender) {
  return { Male: 'Male', Female: 'Female', 'Non-binary': 'Non-binary' }[intakeGender] || 'All'
}
