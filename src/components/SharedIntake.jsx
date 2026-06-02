import { useMemo, useState } from 'react'
import { Filter, ChevronDown } from 'lucide-react'
import IntakeDetailModal from './IntakeDetailModal'
import { useData } from '../context/DataContext'
import { PROGRAMS, ALL_TARGET_GROUPS, ALL_FUNCTIONS, ALL_ACCESS_MODES } from '../data/programs'
import { mockProgramData, getAgeGroup, mapGender } from '../utils/programData'

const TARGET_MAP = {
  'Adult':                                                  'Adults',
  'Youth':                                                  'Young people',
  'Carer':                                                  'Carers',
  'Family':                                                 'Families',
  'Person with psychosocial disability':                    'People with psychosocial disability',
  'Culturally and Linguistically Diverse community member': 'Culturally and Linguistically Diverse communities',
  'Aboriginal or Torres Strait Islander':                   'Aboriginal and Torres Strait Islander peoples',
  'LGBTQIA+':                                               'LGBTQIA+',
  'Justice-involved':                                       'Justice-involved',
  'Other':                                                  'Other',
}

const SUPPORT_FN_MAP = {
  'Anxiety / Stress':   ['Holding / continuity', 'Early recognition'],
  'Depression':         ['Holding / continuity', 'Early recognition'],
  'Trauma / PTSD':      ['Holding / continuity', 'Crisis response / stabilisation'],
  'Grief & Loss':       ['Holding / continuity', 'Belonging & participation'],
  'Relationship Issues':['Holding / continuity'],
  'Family / Parenting': ['Holding / continuity', 'Belonging & participation'],
  'Substance Use':      ['Coordination / navigation', 'Holding / continuity'],
  'Eating Disorders':   ['Holding / continuity'],
  'Youth Mental Health':['Early recognition', 'Holding / continuity'],
  'Aged Care Support':  ['Holding / continuity', 'Belonging & participation'],
}

// Normalise access mode strings for comparison (strip spaces/slashes)
const norm = s => s.toLowerCase().replace(/[\s/]/g, '')

// ── New match scoring ────────────────────────────────────────────────────
// Criteria (80%): each seekerGroup and supportType is one criterion.
// 'Other' is excluded — it can't be matched to a specific program.
// Capacity + outcomes (20%): if no capacity → 0; if capacity → (outcomeRate / 100) × 20.

function computeMatchScore(program, intake) {
  // Criteria: seekerGroups (non-Other)
  const groups = intake.seekerGroups.filter(g => g !== 'Other')
  const matchedGroups   = groups.filter(g => {
    const mapped = TARGET_MAP[g]
    return mapped && mapped !== 'Other' && program.targetGroups.includes(mapped)
  })
  const unmatchedGroups = groups.filter(g => !matchedGroups.includes(g))

  // Criteria: supportTypes (non-Other)
  const types = (intake.supportTypes || []).filter(t => t !== 'Other')
  const matchedTypes = types.filter(t => {
    const fns = SUPPORT_FN_MAP[t] || []
    return fns.some(fn =>
      program.functions.some(pf =>
        pf.split(' / ').some(part =>
          fn.split(' / ').map(s => s.trim().toLowerCase()).includes(part.trim().toLowerCase())
        )
      )
    )
  })
  const unmatchedTypes = types.filter(t => !matchedTypes.includes(t))

  // Access modes (intake can have multiple; program has one)
  const accessModes    = (intake.accessModes || [])
  const matchedAccess  = accessModes.filter(am => norm(am) === norm(program.accessMode))
  const unmatchedAccess = accessModes.filter(am => norm(am) !== norm(program.accessMode))

  const totalCriteria = groups.length + types.length
  const matched       = matchedGroups.length + matchedTypes.length
  const criteriaScore = totalCriteria > 0 ? (matched / totalCriteria) * 80 : 0

  // Capacity gate
  const pd          = mockProgramData(program, 'All')
  const hasCapacity = pd.hasCapacity

  // Outcomes component (only if capacity) + demographic detail
  let outcomeScore  = 0
  let demographicFit = 0
  let ageGroup      = null

  if (intake.dob) {
    ageGroup = getAgeGroup(intake.dob)
    const gender = mapGender(intake.gender || '')
    const gPd    = mockProgramData(program, gender)
    const entry  = gPd.outcomesByAge.find(d => d.label === ageGroup)
    demographicFit = entry ? entry.value : 0
    if (hasCapacity) outcomeScore = (demographicFit / 100) * 20
  }

  return {
    matchPercent:   Math.round(criteriaScore + outcomeScore),
    criteriaScore:  Math.round(criteriaScore),
    hasCapacity,
    waitlistDepth:  pd.waitlistDepth,
    matched,
    totalCriteria,
    matchedGroups,
    unmatchedGroups,
    matchedTypes,
    unmatchedTypes,
    matchedAccess,
    unmatchedAccess,
    demographicFit,
    ageGroup,
  }
}

export function getTopMatchesWithScores(intake, n = 2) {
  return PROGRAMS
    .map(p => ({ program: p, ...computeMatchScore(p, intake) }))
    .filter(m => m.matched > 0)
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, n)
}

function ageFromDob(dob) {
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--
  return age
}

function daysInQueue(submittedAt) {
  return Math.floor((Date.now() - new Date(submittedAt).getTime()) / 86_400_000)
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

const URGENCY_META = {
  low:    { label: 'Can wait', cls: 'bg-emerald-50 text-emerald-700' },
  medium: { label: 'Soon',     cls: 'bg-amber-50  text-amber-700'   },
  high:   { label: 'Urgent',   cls: 'bg-orange-50 text-orange-700'  },
  crisis: { label: 'Crisis',   cls: 'bg-red-50    text-red-700 font-semibold' },
}

const URGENCY_ORDER = { crisis: 0, high: 1, medium: 2, low: 3 }

// In the provider portal, abbreviate the long CALD label for readability.
// The public-facing intake form still uses the full expression.
const BADGE_OVERRIDES = {
  'Culturally and Linguistically Diverse community member': 'CALD community member',
}

const badgeLabel = label => BADGE_OVERRIDES[label] ?? label

const INITIAL_SELECTIONS = { targetGroup: [], function: [], accessMode: [] }

// ─── Filter bar ────────────────────────────────────────────────────────────

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 whitespace-nowrap ${
        active
          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
          : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400 hover:text-brand-700'
      }`}
    >
      {label}
    </button>
  )
}

function FilterBar({ openPanel, togglePanel, selections, toggleSelection }) {
  const count = key => selections[key].length
  const hasAny = count('targetGroup') + count('function') + count('accessMode') > 0

  const PANELS = [
    { key: 'targetGroup', label: 'Target group', options: ALL_TARGET_GROUPS },
    { key: 'function',    label: 'Function',      options: ALL_FUNCTIONS      },
    { key: 'accessMode',  label: 'Access mode',   options: ALL_ACCESS_MODES   },
  ]

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm mb-4 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-2 px-4 py-3 flex-wrap">
        <Filter size={13} className="text-slate-400 flex-shrink-0" />
        {PANELS.map(({ key, label }) => {
          const n = count(key)
          const isOpen = openPanel === key
          return (
            <button
              key={key}
              onClick={() => togglePanel(key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                isOpen || n > 0
                  ? 'bg-brand-50 text-brand-700 border-brand-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {label}
              {n > 0 && (
                <span className="w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0" style={{ backgroundColor: '#c8336d' }}>
                  {n}
                </span>
              )}
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
          )
        })}
        {hasAny && (
          <button
            onClick={() => {
              toggleSelection('targetGroup', null, true)
              toggleSelection('function', null, true)
              toggleSelection('accessMode', null, true)
            }}
            className="ml-auto text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Expanded chip rows */}
      {PANELS.map(({ key, options }) =>
        openPanel === key ? (
          <div key={key} className="px-4 pb-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3 animate-fade-in">
            {options.map(o => (
              <FilterChip
                key={o}
                label={o}
                active={selections[key].includes(o)}
                onClick={() => toggleSelection(key, o)}
              />
            ))}
          </div>
        ) : null
      )}
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function SharedIntake() {
  const { intakeQueue } = useData()
  const [openPanel, setOpenPanel] = useState(null)
  const [selections, setSelections] = useState(INITIAL_SELECTIONS)
  const [activeIntake, setActiveIntake] = useState(null)

  const togglePanel = key => setOpenPanel(prev => prev === key ? null : key)

  const toggleSelection = (key, value, clearAll = false) => {
    if (clearAll) {
      setSelections(prev => ({ ...prev, [key]: [] }))
      return
    }
    setSelections(prev => {
      const current = prev[key]
      return {
        ...prev,
        [key]: current.includes(value) ? current.filter(v => v !== value) : [...current, value],
      }
    })
  }

  const allRows = useMemo(() =>
    [...intakeQueue]
      .sort((a, b) => {
        const u = URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]
        if (u !== 0) return u
        return new Date(a.submittedAt) - new Date(b.submittedAt)
      })
      .map(intake => ({
        ...intake,
        age: ageFromDob(intake.dob),
        days: daysInQueue(intake.submittedAt),
        dateLabel: formatDate(intake.submittedAt),
        matches: getTopMatchesWithScores(intake),
      })),
  [intakeQueue])

  const rows = useMemo(() => {
    return allRows.filter(row => {
      // Target group: filter value is from ALL_TARGET_GROUPS (e.g. 'Adults')
      // Match if the intake's mapped target groups include the selected value
      if (selections.targetGroup.length) {
        const mapped = row.seekerGroups.map(g => TARGET_MAP[g] || g)
        if (!selections.targetGroup.some(g => mapped.includes(g))) return false
      }

      // Function: filter values are split terms (e.g. 'Holding', 'Coordination')
      // Match if any of the intake's relevant functions contain that term
      if (selections.function.length) {
        const fns = [...new Set(row.supportTypes.flatMap(st => SUPPORT_FN_MAP[st] || []))]
        const parts = fns.flatMap(fn => fn.split(' / ').map(s => s.trim()))
        if (!selections.function.some(f =>
          parts.some(p => p.toLowerCase() === f.toLowerCase())
        )) return false
      }

      // Access mode: normalise both sides to handle spacing differences
      if (selections.accessMode.length) {
        if (!selections.accessMode.some(m =>
          (row.accessModes || []).some(am => norm(am) === norm(m))
        )) return false
      }

      return true
    })
  }, [allRows, selections])

  const totalFilters = Object.values(selections).flat().length

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900">Shared Intake queue</h2>
        <span className="text-sm text-slate-400">
          {rows.length} of {allRows.length} records
          {totalFilters > 0 && ` · ${totalFilters} filter${totalFilters > 1 ? 's' : ''} active`}
        </span>
      </div>

      <FilterBar
        openPanel={openPanel}
        togglePanel={togglePanel}
        selections={selections}
        toggleSelection={toggleSelection}
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse" style={{ minWidth: '1100px' }}>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  'Age', 'Gender', 'Suburb',
                  'Describes', 'Seeking support for',
                  'Urgency', 'Submitted', 'In queue',
                  'Top service matches',
                ].map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400 text-sm">
                    No intakes match the active filters.
                  </td>
                </tr>
              ) : rows.map(row => {
                const u = URGENCY_META[row.urgency]
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-brand-50 transition-colors cursor-pointer"
                    onClick={() => setActiveIntake(row)}
                    title="Click to open intake detail"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{row.age}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{row.gender}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{row.suburb}</td>

                    <td className="px-4 py-3">
                      <div className="w-32 flex flex-wrap gap-1">
                        {row.seekerGroups.map(g => (
                          <span key={g} className="inline-block text-[10px] bg-brand-50 text-brand-700 border border-brand-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            {badgeLabel(g)}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="w-40 flex flex-wrap gap-1">
                        {row.supportTypes.map(t => (
                          <span key={t} className="inline-block text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${u.cls}`}>
                        {u.label}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.dateLabel}</td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`font-semibold ${row.days >= 7 ? 'text-red-600' : row.days >= 3 ? 'text-amber-600' : 'text-slate-700'}`}>
                        {row.days}d
                      </span>
                    </td>

                    <td className="px-4 py-3 min-w-[260px]">
                      {row.matches.length === 0 ? (
                        <span className="text-slate-400 text-xs">No close matches</span>
                      ) : (
                        <div className="space-y-2.5">
                          {row.matches.map(m => {
                            const pctCls = m.matchPercent >= 80 ? 'text-emerald-700'
                                         : m.matchPercent >= 65 ? 'text-amber-700'
                                         : 'text-slate-500'
                            const wlCls  = m.waitlistDepth > 5 ? 'text-red-600'
                                         : m.waitlistDepth > 0 ? 'text-amber-600'
                                         : 'text-emerald-600'
                            return (
                              <div key={m.program.id}>
                                <p className="text-xs font-medium text-slate-800 leading-snug">{m.program.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <span className={`text-[11px] font-bold ${pctCls}`}>{m.matchPercent}%</span>
                                  <span className="text-slate-300 text-[10px]">·</span>
                                  <span className={`text-[10px] font-semibold ${wlCls}`}>
                                    {m.waitlistDepth === 0 ? 'No waitlist' : `WL: ${m.waitlistDepth}`}
                                  </span>
                                  <span className="text-slate-300 text-[10px]">·</span>
                                  <span className="text-[10px] text-slate-400">{m.program.orgName}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {activeIntake && (
        <IntakeDetailModal
          intake={activeIntake}
          onClose={() => setActiveIntake(null)}
        />
      )}
    </div>
  )
}
