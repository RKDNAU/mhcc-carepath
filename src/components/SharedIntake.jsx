import { useMemo, useState, useEffect, useCallback } from 'react'
import { Filter, ChevronDown, CheckCircle, Search } from 'lucide-react'
import IntakeDetailModal from './IntakeDetailModal'
import { useData } from '../context/DataContext'
import { PROGRAMS, ALL_TARGET_GROUPS, ALL_FUNCTIONS, ALL_ACCESS_MODES } from '../data/programs'
import { getAgeGroup, mapGender } from '../utils/programData'
import { FilterChip, FILTER_SELECTIONS } from './ui/FilterControls'

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

const SUPPORT_TYPE_OPTIONS = Object.keys(SUPPORT_FN_MAP)

// Normalise access mode strings for comparison (strip spaces/slashes)
const norm = s => s.toLowerCase().replace(/[\s/]/g, '')

// Match scoring (5 components, 100% total)
//
// 1. Describes       30%  proportion of seekerGroups (non-Other) matched
// 2. Seeking support 30%  proportion of supportTypes (non-Other) matched
// 3. Access modes    10%  any access mode match -> 10%, else 0%
// 4. Demographic     20%  (outcomeRate for age+gender / 100) x 20
// 5. Availability    10%  three equal sub-factors (3.333% each):
//      - Capacity      boolean - program.capacity > 0
//      - Waitlist      relative depth across all programs (lower = better)
//      - Wait time     relative avgWaitDays across all programs (lower = better)
//
// computeMatchScore receives pre-computed pd (mock data) and globalStats so
// getTopMatchesWithScores can do a single pass for global baselines.

function metricForProgram(program, gender, memberSharedData) {
  const exact = memberSharedData?.[`${program.id}_${gender}`]
  if (exact) return exact
  const rows = ['Female', 'Male', 'Non-binary']
    .map(g => memberSharedData?.[`${program.id}_${g}`])
    .filter(Boolean)
  if (!rows.length) return null
  return {
    waitlistDepth: Math.round(rows.reduce((sum, row) => sum + row.waitlistDepth, 0) / rows.length),
    outcomesByAge: rows[0].outcomesByAge.map((age, index) => ({
      label: age.label,
      positive: rows.reduce((sum, row) => sum + (row.outcomesByAge[index]?.positive ?? 0), 0),
      negative: rows.reduce((sum, row) => sum + (row.outcomesByAge[index]?.negative ?? 0), 0),
    })),
  }
}

function computeMatchScore(program, intake, pd, globalStats, memberSharedData, options = {}) {
  // 1. Describes (up to 30%)
  const groups = intake.seekerGroups.filter(g => g !== 'Other')
  const matchedGroups = groups.filter(g => {
    const mapped = TARGET_MAP[g]
    return mapped && mapped !== 'Other' && program.targetGroups.includes(mapped)
  })
  const unmatchedGroups = groups.filter(g => !matchedGroups.includes(g))
  const describesScore = groups.length > 0 ? (matchedGroups.length / groups.length) * 30 : 0

  // 2. Seeking Support For (up to 30%)
  const types = options.ignoreSupportTypes ? [] : (intake.supportTypes || []).filter(t => t !== 'Other')
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
  const seekingScore = options.ignoreSupportTypes ? 30 : (types.length > 0 ? (matchedTypes.length / types.length) * 30 : 0)

  // 3. Access Modes (10% or 0%)
  const accessModes = intake.accessModes || []
  const matchedAccess = accessModes.filter(am => norm(am) === norm(program.accessMode))
  const unmatchedAccess = accessModes.filter(am => norm(am) !== norm(program.accessMode))
  const accessScore = matchedAccess.length > 0 ? 10 : 0

  // 4. Demographic success (up to 20%)
  let demographicScore = 0
  let demographicFit = 0
  let ageGroup = null
  if (intake.dob) {
    ageGroup = getAgeGroup(intake.dob)
    const gender = mapGender(intake.gender || '')
    const gPd = metricForProgram(program, gender, memberSharedData)
    const entry = gPd?.outcomesByAge?.find(d => d.label === ageGroup)
    const positive = entry?.positive ?? 0
    const negative = Math.abs(entry?.negative ?? 0)
    demographicFit = positive + negative > 0
      ? Math.round((positive / (positive + negative)) * 100)
      : 0
    demographicScore = (demographicFit / 100) * 20
  }

  // 5. Availability (up to 10%)
  const PER_FACTOR = 10 / 3

  // Capacity: boolean from explicit program field
  const hasCapacity = (program.capacity ?? 0) > 0
  const capacityScore = hasCapacity ? PER_FACTOR : 0

  // Waitlist depth: lower is better; 0 -> full score, max -> 0
  const wlDepth = pd?.waitlistDepth ?? 0
  const waitlistScore = globalStats.maxWaitlistDepth > 0
    ? (1 - wlDepth / globalStats.maxWaitlistDepth) * PER_FACTOR
    : PER_FACTOR

  // Average wait days: lower is better; min -> full score, max -> 0
  const wd = program.avgWaitDays ?? 7
  const wdRange = globalStats.maxAvgWaitDays - globalStats.minAvgWaitDays
  const waitTimeScore = wdRange > 0
    ? (1 - (wd - globalStats.minAvgWaitDays) / wdRange) * PER_FACTOR
    : PER_FACTOR

  const availabilityScore = capacityScore + waitlistScore + waitTimeScore

  return {
    matchPercent: Math.round(describesScore + seekingScore + accessScore + demographicScore + availabilityScore),
    hasCapacity,
    waitlistDepth: wlDepth,
    matched: matchedGroups.length + matchedTypes.length,
    totalCriteria: groups.length + types.length,
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

export function getTopMatchesWithScores(intake, n = 2, memberSharedData = null, options = {}) {
  const programs = options.programs || PROGRAMS
  const allPd = programs.map(p => metricForProgram(p, 'All', memberSharedData))

  // Global baselines for relative availability scoring
  const allWaitlistDepths = allPd.map(pd => pd?.waitlistDepth ?? 0)
  const allAvgWaitDays = programs.map(p => p.avgWaitDays ?? 7)
  const globalStats = {
    maxWaitlistDepth: Math.max(...allWaitlistDepths, 1),
    minAvgWaitDays:   Math.min(...allAvgWaitDays),
    maxAvgWaitDays:   Math.max(...allAvgWaitDays),
  }

  return programs
    .map((p, i) => ({ program: p, ...computeMatchScore(p, intake, allPd[i], globalStats, memberSharedData, options) }))
    .filter(m => options.ignoreSupportTypes || m.matched > 0)
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

const STATUS_META = {
  queued:    { label: 'Queued',    cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  routed:    { label: 'Routed',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  accepted:  { label: 'Accepted',  cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  contacted: { label: 'Contacted', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  waitlisted:{ label: 'Waitlisted',cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  declined:  { label: 'Declined',  cls: 'bg-red-50 text-red-700 border-red-200' },
  closed:    { label: 'Closed',    cls: 'bg-slate-100 text-slate-500 border-slate-200' },
}

const QUICK_FILTERS = [
  { id: 'urgent', label: 'Crisis/urgent' },
  { id: 'stale', label: 'Over 7 days' },
  { id: 'followUpDue', label: 'Follow-up due' },
  { id: 'unrouted', label: 'No route yet' },
  { id: 'active', label: 'Active routed' },
]

// In the provider portal, abbreviate the long CALD label for readability.
// The public-facing intake form still uses the full expression.
const BADGE_OVERRIDES = {
  'Culturally and Linguistically Diverse community member': 'CALD community member',
}

const badgeLabel = label => BADGE_OVERRIDES[label] ?? label

// Filter bar

function FilterBar({ openPanel, togglePanel, selections, toggleSelection, showRouted, onToggleShowRouted }) {
  const count = key => selections[key].length
  const hasAny = count('targetGroup') + count('supportType') + count('accessMode') + count('function') > 0

  const PANELS = [
    { key: 'targetGroup', label: 'Target group',  options: ALL_TARGET_GROUPS  },
    { key: 'supportType', label: 'Support type',  options: SUPPORT_TYPE_OPTIONS },
    { key: 'accessMode',  label: 'Access mode',   options: ALL_ACCESS_MODES    },
    { key: 'function',    label: 'Function',      options: ALL_FUNCTIONS       },
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
                <span className="w-4 h-4 rounded-full bg-highlight text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">
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

        {/* Right-side controls */}
        <div className="ml-auto flex items-center gap-3">
          {hasAny && (
            <button
              onClick={() => {
                toggleSelection('targetGroup', null, true)
                toggleSelection('supportType', null, true)
                toggleSelection('accessMode', null, true)
                toggleSelection('function', null, true)
              }}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onToggleShowRouted}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
              showRouted
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            {showRouted ? 'Hide Routed' : 'Show Routed'}
          </button>
        </div>
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

// Main component

// Toast

function Toast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4500)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl animate-fade-in">
      <CheckCircle size={18} className="flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold">Referral routed</p>
        <p className="text-xs opacity-80 mt-0.5">{message}</p>
      </div>
    </div>
  )
}

// Main component

export default function SharedIntake() {
  const { intakeQueue, memberSharedData, providerPrograms } = useData()
  const [openPanel, setOpenPanel] = useState(null)
  const [selections, setSelections] = useState(FILTER_SELECTIONS)
  const [query, setQuery] = useState('')
  const [quickFilters, setQuickFilters] = useState([])
  const [activeIntake, setActiveIntake] = useState(null)
  const [showRouted, setShowRouted] = useState(false)
  const [toast, setToast] = useState(null) // string message or null

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

  const handleRouted = useCallback((program) => {
    setActiveIntake(null)
    setToast(Array.isArray(program)
      ? `${program.length} programs added to care plan`
      : `${program.name} - ${program.orgName}`)
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

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
        // Frozen days: diff between submission and routing (used for routed rows)
        frozenDays: intake.routedAt
          ? Math.floor((new Date(intake.routedAt) - new Date(intake.submittedAt)) / 86_400_000)
          : null,
        dateLabel: formatDate(intake.submittedAt),
        matches: getTopMatchesWithScores(intake, 2, memberSharedData, { programs: providerPrograms }),
      })),
  [intakeQueue, memberSharedData, providerPrograms])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return allRows.filter(row => {
      // Hide non-queued workflow entries unless show routed/active records is enabled.
      if (!showRouted && row.status !== 'queued') return false

      if (q) {
        const searchable = [
          row.id,
          row.suburb,
          row.gender,
          row.urgency,
          row.status,
          row.referralOwner,
          row.routingNote,
          row.declineReason,
          row.routedOrgName,
          row.routedProgramName,
          ...(row.seekerGroups || []),
          ...(row.supportTypes || []),
          ...(row.accessModes || []),
          ...(row.routedPrograms || []).flatMap(route => [route.orgName, route.programName, route.supportType]),
        ].filter(Boolean).join(' ').toLowerCase()
        if (!searchable.includes(q)) return false
      }

      if (quickFilters.includes('urgent') && !['crisis', 'high'].includes(row.urgency)) return false
      if (quickFilters.includes('stale') && row.days <= 7) return false
      if (quickFilters.includes('followUpDue')) {
        if (!row.followUpDue) return false
        const due = new Date(row.followUpDue)
        due.setHours(0, 0, 0, 0)
        if (due > today) return false
      }
      if (quickFilters.includes('unrouted') && row.status !== 'queued') return false
      if (quickFilters.includes('active') && !['routed', 'accepted', 'contacted', 'waitlisted'].includes(row.status)) return false

      if (selections.targetGroup.length) {
        const mapped = row.seekerGroups.map(g => TARGET_MAP[g] || g)
        if (!selections.targetGroup.some(g => mapped.includes(g))) return false
      }

      if (selections.supportType.length) {
        if (!selections.supportType.some(type => row.supportTypes.includes(type))) return false
      }

      if (selections.accessMode.length) {
        if (!selections.accessMode.some(m =>
          (row.accessModes || []).some(am => norm(am) === norm(m))
        )) return false
      }

      if (selections.function.length) {
        const fns = [...new Set(row.supportTypes.flatMap(st => SUPPORT_FN_MAP[st] || []))]
        const parts = fns.flatMap(fn => fn.split(' / ').map(s => s.trim()))
        if (!selections.function.some(f =>
          parts.some(p => p.toLowerCase() === f.toLowerCase())
        )) return false
      }

      return true
    })
  }, [allRows, selections, showRouted, query, quickFilters])

  const totalFilters = Object.values(selections).flat().length + quickFilters.length + (query.trim() ? 1 : 0)
  const colCount = showRouted ? 11 : 10
  const toggleQuickFilter = id => setQuickFilters(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900">Shared Intake queue</h2>
        <span className="text-sm text-slate-400">
          {rows.length} of {allRows.length} records
          {totalFilters > 0 && ` - ${totalFilters} filter${totalFilters > 1 ? 's' : ''} active`}
        </span>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm mb-4 p-4 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search suburb, support type, status, route, notes, or program..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map(filter => (
            <button
              key={filter.id}
              type="button"
              onClick={() => toggleQuickFilter(filter.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                quickFilters.includes(filter.id)
                  ? 'bg-brand-50 text-brand-700 border-brand-300'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
          {(quickFilters.length || query.trim()) ? (
            <button
              type="button"
              onClick={() => { setQuickFilters([]); setQuery('') }}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
            >
              Clear search
            </button>
          ) : null}
        </div>
      </div>

      <FilterBar
        openPanel={openPanel}
        togglePanel={togglePanel}
        selections={selections}
        toggleSelection={toggleSelection}
        showRouted={showRouted}
        onToggleShowRouted={() => setShowRouted(v => !v)}
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full w-max text-sm border-collapse" style={{ minWidth: showRouted ? '1660px' : '1420px' }}>
            <colgroup>
              <col className="w-[70px]" />
              <col className="w-[120px]" />
              <col className="w-[120px]" />
              <col className="w-[220px]" />
              <col className="w-[260px]" />
              <col className="w-[150px]" />
              <col className="w-[140px]" />
              <col className="w-[125px]" />
              <col className="w-[95px]" />
              <col />
              {showRouted && <col className="w-[260px]" />}
            </colgroup>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  'Age', 'Gender', 'Suburb',
                  'Describes', 'Seeking support for',
                  'Urgency', 'Status', 'Submitted', 'In queue',
                  'Top service matches',
                  ...(showRouted ? ['Routed To'] : []),
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
                  <td colSpan={colCount} className="px-4 py-12 text-center text-slate-400 text-sm">
                    No intakes match the active filters.
                  </td>
                </tr>
              ) : rows.map(row => {
                const u = URGENCY_META[row.urgency]
                const status = STATUS_META[row.status] || STATUS_META.queued
                const isActiveWorkflow = row.status !== 'queued'
                const displayDays = isActiveWorkflow ? (row.frozenDays ?? row.days) : row.days

                return (
                  <tr
                    key={row.id}
                    className={`transition-colors cursor-pointer ${isActiveWorkflow ? 'bg-slate-50/60 hover:bg-slate-100/60' : 'hover:bg-brand-50'}`}
                    onClick={() => setActiveIntake(row)}
                    title="Click to open intake detail"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{row.age}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{row.gender}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{row.suburb}</td>

                    <td className="px-4 py-3 align-middle">
                      <div className="w-[188px] flex flex-wrap gap-1" style={{ minWidth: 'min-content' }}>
                        {row.seekerGroups.map(g => (
                          <span key={g} className="inline-block text-[10px] bg-brand-50 text-brand-700 border border-brand-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            {badgeLabel(g)}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="w-[228px] flex flex-wrap gap-1" style={{ minWidth: 'min-content' }}>
                        {row.supportTypes.map(t => (
                          <span key={t} className="inline-block text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${u.cls}`}>
                          {u.label}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full border font-semibold ${status.cls}`}>
                          {status.label}
                        </span>
                        {row.followUpDue && (
                          <p className="text-[10px] text-slate-400">
                            Due {formatDate(row.followUpDue)}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.dateLabel}</td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {isActiveWorkflow ? (
                        <span className="font-semibold text-slate-900">{displayDays}d</span>
                      ) : (
                        <span className={`font-semibold ${displayDays >= 7 ? 'text-red-600' : displayDays >= 3 ? 'text-amber-600' : 'text-slate-700'}`}>
                          {displayDays}d
                        </span>
                      )}
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
                                  <span className="text-slate-300 text-[10px]">-</span>
                                  <span className={`text-[10px] font-semibold ${wlCls}`}>
                                    {m.waitlistDepth === 0 ? 'No waitlist' : `WL: ${m.waitlistDepth}`}
                                  </span>
                                  <span className="text-slate-300 text-[10px]">-</span>
                                  <span className="text-[10px] text-slate-400">{m.program.orgName}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </td>

                    {showRouted && (
                      <td className="px-4 py-3 min-w-[240px]">
                        {(row.routedPrograms?.length || row.routedOrgName) ? (
                          <div className="space-y-2">
                            {(row.routedPrograms?.length ? row.routedPrograms : [{
                              orgName: row.routedOrgName,
                              programName: row.routedProgramName,
                              routedAt: row.routedAt,
                            }]).map((route, i) => (
                              <div key={`${route.programId || route.programName}_${i}`} className="space-y-0.5">
                                <p className="text-xs font-bold text-slate-900 leading-snug">{route.orgName}</p>
                                <p className="text-[11px] text-slate-600 leading-snug">{route.programName}</p>
                                {route.supportType && (
                                  <p className="text-[10px] text-brand-600 font-semibold leading-snug">{route.supportType}</p>
                                )}
                                <p className="text-[11px] text-slate-400">
                                  {'Routed on: '}
                                  {route.routedAt
                                    ? new Date(route.routedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                                    : '-'}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>
                    )}
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
          onRouted={handleRouted}
        />
      )}

      {toast && <Toast message={toast} onDismiss={dismissToast} />}
    </div>
  )
}
