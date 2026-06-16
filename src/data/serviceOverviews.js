import programs from './programs.json'

const realPrograms = programs.filter(program => !program.demoOnly)

const SERVICE_DEFINITIONS = [
  {
    slug: 'anxiety-depression',
    title: 'Anxiety & Depression',
    intro: 'Support across the sector can help with worry, low mood, stress, motivation, adjustment, and day-to-day coping.',
    supportTypes: ['Anxiety / Stress', 'Depression'],
    terms: ['anxiety', 'depression', 'stress', 'low intensity', 'counselling', 'coaching', 'wellbeing'],
  },
  {
    slug: 'trauma-ptsd',
    title: 'Trauma & PTSD',
    intro: 'Trauma-informed supports focus on safety, emotional regulation, recovery planning, and rebuilding confidence at a manageable pace.',
    supportTypes: ['Trauma / PTSD'],
    terms: ['trauma', 'ptsd', 'safety', 'healing trauma', 'postnatal', 'distress'],
  },
  {
    slug: 'support-groups',
    title: 'Support Groups',
    intro: 'Group and peer options can offer connection, shared learning, practical coping strategies, and a sense of belonging.',
    supportTypes: ['Other'],
    functions: ['Belonging & participation', 'Lived experience leadership'],
    terms: ['group', 'peer', 'community', 'connection', 'workshop', 'network'],
  },
  {
    slug: 'youth-services',
    title: 'Youth Services',
    intro: 'Youth-focused services support children, teenagers, young adults, parents, carers, and families navigating mental health concerns.',
    supportTypes: ['Youth Mental Health'],
    targetGroups: ['Young people'],
    terms: ['young', 'youth', 'children', 'school', 'kids', 'teens'],
  },
  {
    slug: 'relationships-family',
    title: 'Relationships & Family',
    intro: 'Family and relationship supports can help with parenting, caring roles, household stress, communication, and family wellbeing.',
    supportTypes: ['Relationship Issues', 'Family / Parenting'],
    targetGroups: ['Families', 'Carers'],
    terms: ['family', 'families', 'carer', 'parenting', 'relationship', 'perinatal'],
  },
  {
    slug: 'substance-use',
    title: 'Substance Use',
    intro: 'Some services can support people where mental health and alcohol or other drug concerns overlap, including coordinated and non-judgemental help.',
    supportTypes: ['Substance Use'],
    terms: ['substance', 'alcohol', 'drug', 'comorbid', 'atod'],
  },
  {
    slug: 'aged-care-support',
    title: 'Aged Care Support',
    intro: 'Older people can seek help through broader mental health, psychosocial, navigation, counselling, and community connection services.',
    supportTypes: ['Aged Care Support'],
    terms: ['older', 'aged', 'senior', 'adult', 'continuity', 'community'],
  },
  {
    slug: 'eating-disorders',
    title: 'Eating Disorders',
    intro: 'Eating disorder support may include planning, referrals, wellbeing care, mental health plans, and help finding appropriate clinical pathways.',
    supportTypes: ['Eating Disorders'],
    terms: ['eating disorder', 'eating disorders', 'treatment plan', 'mental health care plan'],
  },
]

const FUNCTION_LABELS = {
  'Advocacy & rights': 'rights, complaints, and advocacy support',
  'Belonging & participation': 'peer connection and community participation',
  'Continuity': 'ongoing support',
  'Coordination': 'service coordination',
  'Coordination / navigation': 'service navigation and coordination',
  'Court, custody & community transitions': 'justice and transition support',
  'Crisis response': 'crisis and stabilisation support',
  'Crisis response / stabilisation': 'crisis and stabilisation support',
  'Early recognition': 'early support and education',
  'Holding': 'steady follow-up support',
  'Holding / continuity': 'steady follow-up support',
  'Initiation': 'early engagement',
  'Initiation / reach-in': 'early engagement and reach-in',
  'Lived experience leadership': 'lived-experience-led support',
  'Navigation': 'service navigation',
  'Practical life support': 'practical daily living support',
  'Reach-in': 'proactive reach-in',
  'Stabilisation': 'stabilisation support',
}

const TARGET_LABELS = {
  Adults: 'adults',
  'Young people': 'young people',
  Carers: 'carers',
  Families: 'families',
  'People with psychosocial disability': 'people living with psychosocial disability',
  'Culturally and Linguistically Diverse communities': 'multicultural communities',
  'Aboriginal and Torres Strait Islander peoples': 'Aboriginal and Torres Strait Islander people',
  LGBTQIA: 'LGBTQIA+ communities',
  'LGBTQIA+': 'LGBTQIA+ communities',
  'Justice-involved': 'people connected with the justice system',
  Other: 'people with other needs or circumstances',
}

const ACCESS_LABELS = {
  Appointment: 'booked appointments',
  'Phone/online': 'phone or online support',
  'Referral required': 'referral-based services',
  'Self-referral': 'self-referral options',
  'Outreach / proactive reach-in': 'outreach or proactive contact',
  'Walk-in': 'walk-in access',
  Other: 'other access pathways',
}

function includesAny(haystack, terms = []) {
  const text = haystack.toLowerCase()
  return terms.some(term => text.includes(term.toLowerCase()))
}

function matchesDefinition(program, definition) {
  const searchable = [
    program.name,
    program.shortName,
    program.description,
    program.accessMode,
    ...(program.functions || []),
    ...(program.targetGroups || []),
  ].filter(Boolean).join(' ')

  const targetMatch = definition.targetGroups?.some(group => program.targetGroups?.includes(group))
  const functionMatch = definition.functions?.some(fn => program.functions?.includes(fn))
  const termMatch = includesAny(searchable, definition.terms)

  return Boolean(targetMatch || functionMatch || termMatch)
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function topValues(values, labels, limit = 5) {
  const counts = values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([value]) => labels[value] || value)
}

function summarisePrograms(definition) {
  const matches = realPrograms.filter(program => matchesDefinition(program, definition))
  const source = matches.length ? matches : realPrograms
  const organisations = unique(source.map(program => program.orgName))
  const accessModes = topValues(source.map(program => program.accessMode), ACCESS_LABELS, 4)
  const demographics = topValues(source.flatMap(program => program.targetGroups || []), TARGET_LABELS, 6)
  const supportStyles = topValues(source.flatMap(program => program.functions || []), FUNCTION_LABELS, 5)
  const waitDays = source.map(program => program.avgWaitDays).filter(days => Number.isFinite(days) && days > 0)
  const shortestWait = waitDays.length ? Math.min(...waitDays) : null

  return {
    ...definition,
    programCount: matches.length,
    organisationCount: organisations.length,
    accessModes,
    demographics,
    supportStyles,
    shortestWait,
  }
}

export const SERVICE_OVERVIEWS = SERVICE_DEFINITIONS.map(summarisePrograms)

export function getServiceOverview(slug) {
  return SERVICE_OVERVIEWS.find(service => service.slug === slug)
}
