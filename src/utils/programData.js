export const AGE_GROUPS = [
  '0-3', '4-6', '7-9', '10-12', '13-15', '16-18',
  '19-21', '22-25', '26-35', '36-45', '46-55', '56-65', '65+',
]

export function getAgeGroup(dob) {
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--
  if (age <= 3) return '0-3'
  if (age <= 6) return '4-6'
  if (age <= 9) return '7-9'
  if (age <= 12) return '10-12'
  if (age <= 15) return '13-15'
  if (age <= 18) return '16-18'
  if (age <= 21) return '19-21'
  if (age <= 25) return '22-25'
  if (age <= 35) return '26-35'
  if (age <= 45) return '36-45'
  if (age <= 55) return '46-55'
  if (age <= 65) return '56-65'
  return '65+'
}

export function mapGender(intakeGender) {
  return { Male: 'Male', Female: 'Female', 'Non-binary': 'Non-binary' }[intakeGender] || 'All'
}
