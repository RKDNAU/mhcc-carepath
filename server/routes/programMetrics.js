'use strict'
const { Router } = require('express')
const db = require('../db')
const { AGE_GROUPS } = require('../csvUtils')

const router = Router()

router.get('/', (_req, res) => {
  const metrics = db.prepare('SELECT * FROM program_metrics ORDER BY program_id, gender').all()
  if (!metrics.length) return res.json([])

  const ageRows = db.prepare('SELECT * FROM program_metrics_age ORDER BY program_id, gender').all()

  // Index age rows by "programId_gender"
  const ageByKey = {}
  for (const a of ageRows) {
    const key = `${a.program_id}_${a.gender}`
    if (!ageByKey[key]) ageByKey[key] = []
    ageByKey[key].push(a)
  }

  const result = metrics.map(m => {
    const key = `${m.program_id}_${m.gender}`
    const ages = ageByKey[key] || []

    // Sort by AGE_GROUPS order and build the two arrays expected by SharedData
    const byGroup = {}
    for (const a of ages) byGroup[a.age_group] = a

    return {
      programId:       m.program_id,
      gender:          m.gender,
      avgWaitDays:     m.avg_wait_days,
      completionRate:  m.completion_rate,
      totalClients:    m.total_clients,
      totalCapacity:   m.total_capacity,
      currentClients:  m.current_clients,
      availablePct:    m.available_pct,
      waitlistDepth:   m.waitlist_depth,
      hasCapacity:     !!m.has_capacity,
      outcomesByAge:   AGE_GROUPS.map(label => ({
        label,
        positive:  byGroup[label]?.positive_outcome ?? 0,
        negative: -(byGroup[label]?.negative_outcome ?? 0),
      })),
      demographicSplit: AGE_GROUPS.map(label => ({ label, value: byGroup[label]?.clients ?? 0 })),
    }
  })

  res.json(result)
})

module.exports = router
