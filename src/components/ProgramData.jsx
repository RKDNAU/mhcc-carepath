import { useState, useMemo, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import { PROGRAMS } from '../data/programs'
import { AGE_GROUPS } from '../utils/programData'
import { useData } from '../context/DataContext'
import { COLORS } from '../constants/theme'
import {
  barFill,
  AnalyticsCaveat,
  ChartTipPlain,
  MetricCard,
  OutcomeModeToggle,
  outcomeChartRows,
  OutcomeStackTip,
  SectionLabel,
} from './ui/AnalyticsPrimitives'

const GENDERS  = ['All', 'Female', 'Male', 'Non-binary']
const G_OFFSET = { All: 0, Female: 100, Male: 200, 'Non-binary': 300 }

const rng = (seed, offset) => {
  const x = Math.sin(seed * 9301 + offset * 49297 + 233) * 10000
  return x - Math.floor(x)
}

function programSeed(programId) {
  const parsed = parseInt(String(programId).replace(/\D/g, ''), 10)
  if (!Number.isNaN(parsed)) return parsed
  return String(programId).split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
}

function aggregateAllGender(map, programId) {
  const rows = ['Female', 'Male', 'Non-binary'].map(g => map[`${programId}_${g}`]).filter(Boolean)
  if (!rows.length) return null
  if (rows.length === 1) return rows[0]
  const n = rows.length
  const totalCapacity   = rows.reduce((s, r) => s + r.totalCapacity, 0)
  const currentClients  = rows.reduce((s, r) => s + r.currentClients, 0)
  const availablePct    = Math.max(0, Math.round(((totalCapacity - currentClients) / totalCapacity) * 100))
  return {
    avgWaitDays:      parseFloat((rows.reduce((s, r) => s + r.avgWaitDays, 0) / n).toFixed(1)),
    completionRate:   Math.round(rows.reduce((s, r) => s + r.completionRate, 0) / n),
    totalClients:     rows.reduce((s, r) => s + r.totalClients, 0),
    totalCapacity, currentClients, availablePct,
    waitlistDepth:    rows.reduce((s, r) => s + r.waitlistDepth, 0),
    hasCapacity:      currentClients < totalCapacity,
    outcomesByAge:    rows[0].outcomesByAge.map((ag, i) => ({
      label:    ag.label,
      positive: rows.reduce((s, r) => s + (r.outcomesByAge[i]?.positive ?? 0), 0),
      negative: rows.reduce((s, r) => s + (r.outcomesByAge[i]?.negative ?? 0), 0),
    })),
    demographicSplit: rows[0].demographicSplit.map((ag, i) => ({
      label: ag.label,
      value: rows.reduce((s, r) => s + r.demographicSplit[i].value, 0),
    })),
  }
}

function ageMetrics(base, program, ageLabel, gender) {
  if (!ageLabel) return base
  const n    = programSeed(program.id)
  const aOff = AGE_GROUPS.indexOf(ageLabel) * 50
  const gOff = G_OFFSET[gender] || 0
  return {
    ...base,
    avgWaitDays:  parseFloat((base.avgWaitDays * (0.7 + rng(n, 50 + aOff + gOff) * 0.6)).toFixed(1)),
    totalClients: Math.round(base.totalClients * (0.1 + rng(n, 52 + aOff + gOff) * 0.5)),
  }
}

const TIME_BRACKETS = [
  { key: 'all', label: 'All time'        },
  { key: 'cy',  label: 'Calendar Year'   },
  { key: 'fy',  label: 'Financial Year'  },
  { key: 'r12', label: 'Rolling 12 Mths' },
  { key: 'r6',  label: 'Rolling 6 Mths'  },
  { key: 'r3',  label: 'Rolling 3 Mths'  },
  { key: 'r30', label: 'Rolling 30 Days' },
  { key: 'r7',  label: 'Rolling 7 Days'  },
]
const _d   = new Date()
const _soy = new Date(_d.getFullYear(), 0, 1)
const _sfy = _d.getMonth() >= 6
  ? new Date(_d.getFullYear(), 6, 1)
  : new Date(_d.getFullYear() - 1, 6, 1)
const TIME_FRACTIONS = {
  all: 1,  cy: Math.min(1, (_d - _soy) / (365 * 86400000)),
  fy:  Math.min(1, (_d - _sfy) / (365 * 86400000)),
  r12: 1,  r6: 0.5,  r3: 0.25,  r30: 30 / 365,  r7: 7 / 365,
}

function PositiveOutcomeCard({ base, selectedAge }) {
  const filtered    = selectedAge
    ? base.outcomesByAge.filter(o => o.label === selectedAge)
    : base.outcomesByAge
  const positive    = filtered.reduce((s, o) => s + (o.positive ?? 0), 0)
  const notPositive = filtered.reduce((s, o) => s + Math.abs(o.negative ?? 0), 0)
  const total       = positive + notPositive
  const pct         = total > 0 ? Math.round((positive / total) * 100) : 0

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col items-center gap-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Positive outcome rate</p>
      <div className="flex items-end gap-1.5 mt-1">
        <span className="text-4xl font-extrabold leading-none text-emerald-700">{positive.toLocaleString()}</span>
        <span className="text-lg text-slate-400 leading-none mb-0.5">/ {total.toLocaleString()}</span>
      </div>
      <div className="w-full h-2.5 bg-red-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 bg-emerald-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between w-full text-xs">
        <span className="text-emerald-700 font-semibold">{positive.toLocaleString()} ({pct}%) above zero</span>
        <span style={{ color: COLORS.negative }} className="font-semibold">{notPositive.toLocaleString()} ({total > 0 ? 100 - pct : 0}%) at/below zero</span>
      </div>
    </div>
  )
}

export default function ProgramData({ orgId, orgName }) {
  const { memberSharedData, dataErrors } = useData()
  const controlledPrograms = useMemo(() => {
    const scoped = orgId ? PROGRAMS.filter(p => p.orgId === orgId) : PROGRAMS
    return scoped.length ? scoped : []
  }, [orgId])
  const [selectedId,     setSelectedId]     = useState(controlledPrograms[0]?.id ?? PROGRAMS[0].id)
  const [selectedAge,    setSelectedAge]     = useState(null)
  const [selectedGender, setSelectedGender] = useState('All')
  const [timeBracket,    setTimeBracket]    = useState('all')
  const [outcomeMode,    setOutcomeMode]    = useState('raw')

  const selectedProg = controlledPrograms.find(p => p.id === selectedId) || controlledPrograms[0] || PROGRAMS[0]
  const activeProgramId = selectedProg.id

  useEffect(() => {
    if (selectedId !== activeProgramId) setSelectedId(activeProgramId)
  }, [selectedId, activeProgramId])

  const base = useMemo(() => {
    if (!memberSharedData) return null
    return selectedGender === 'All'
      ? aggregateAllGender(memberSharedData, activeProgramId)
      : (memberSharedData[`${activeProgramId}_${selectedGender}`] || null)
  }, [activeProgramId, selectedGender, memberSharedData])

  const scaledBase = useMemo(() => {
    if (!base) return null
    const f = TIME_FRACTIONS[timeBracket] ?? 1
    if (f >= 1) return base
    return {
      ...base,
      totalClients: Math.max(1, Math.round(base.totalClients * f)),
      outcomesByAge: base.outcomesByAge.map(o => ({
        ...o,
        positive: Math.max(0, Math.round(o.positive * f)),
        negative: Math.min(0, Math.round(o.negative * f)),
      })),
    }
  }, [base, timeBracket])

  const displayMetrics = useMemo(
    () => scaledBase ? ageMetrics(scaledBase, selectedProg, selectedAge, selectedGender) : null,
    [scaledBase, selectedProg, selectedAge, selectedGender]
  )
  const outcomeRows = useMemo(
    () => scaledBase ? outcomeChartRows(scaledBase.outcomesByAge, outcomeMode) : [],
    [scaledBase, outcomeMode]
  )

  const waitColor = !displayMetrics               ? 'text-slate-400'
                  : displayMetrics.avgWaitDays <= 3 ? 'text-emerald-700'
                  : displayMetrics.avgWaitDays <= 7 ? 'text-amber-700'
                  : 'text-red-700'

  const toggleAge = (label) => setSelectedAge(prev => prev === label ? null : label)

  const programsByOrg = useMemo(() => {
    const groups = {}
    controlledPrograms.forEach(p => { if (!groups[p.orgName]) groups[p.orgName] = []; groups[p.orgName].push(p) })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [controlledPrograms])

  return (
    <div className="space-y-10">
      <div>
        <SectionLabel color="slate">Program Data</SectionLabel>
        <AnalyticsCaveat />
        <p className="text-xs text-slate-400 -mt-2 mb-4">
          Organisation-scoped view of Sector Data{orgName ? ` for ${orgName}` : ''}.
        </p>
        {!base ? (
          <p className="text-sm text-slate-400 py-4">
            {dataErrors?.programMetrics ? (
              'Program metrics could not be loaded. Check the API server and refresh this page.'
            ) : (
              <>No program data available - run <code>npm run seed</code> to populate,
                or <code>npm run seed -- --force</code> to reseed with updated age groups.</>
            )}
          </p>
        ) : <>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 space-y-3">

          {/* Time period filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap w-16">Period</label>
            <div className="flex flex-wrap gap-1.5">
              {TIME_BRACKETS.map(b => (
                <button
                  key={b.key}
                  onClick={() => setTimeBracket(b.key)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    timeBracket === b.key
                      ? 'text-white border-brand-600 bg-brand-600'
                      : 'text-slate-600 border-slate-200 hover:border-brand-400'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap w-16">Program</label>
            <select
              value={selectedId}
              onChange={e => { setSelectedId(e.target.value); setSelectedAge(null) }}
              className="flex-1 min-w-0 text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {programsByOrg.map(([orgName, progs]) => (
                <optgroup key={orgName} label={orgName}>
                  {progs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap w-16">Gender</label>
            <div className="flex gap-2 flex-wrap">
              {GENDERS.map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(g)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    selectedGender === g
                      ? 'text-white border-brand-600 bg-brand-600'
                      : 'text-slate-600 border-slate-200 hover:border-brand-400'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            {(selectedAge || selectedGender !== 'All') && (
              <button
                onClick={() => { setSelectedAge(null); setSelectedGender('All') }}
                className="ml-auto text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>

          {selectedAge && (
            <p className="text-[11px] text-brand-600 pl-20">
              Showing data for <strong>{selectedAge}</strong> age group
              {selectedGender !== 'All' && <> - <strong>{selectedGender}</strong></>}.
              Click the bar again to deselect.
            </p>
          )}
        </div>

        <div className="space-y-5">

          {/* Best outcome demographics - stacked positive / non-positive client outcomes */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-0.5">Best outcome demographics</p>
                <p className="text-[11px] text-slate-400">
                  Positive and non-positive client outcomes by age group - click a bar to filter
                </p>
              </div>
              <OutcomeModeToggle value={outcomeMode} onChange={setOutcomeMode} />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={outcomeRows}
                stackOffset="sign"
                margin={{ top: 8, right: 4, left: -24, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" interval={0} tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={outcomeMode === 'percentage'}
                  domain={outcomeMode === 'percentage' ? [-100, 100] : undefined}
                  tickFormatter={value => outcomeMode === 'percentage' ? `${value}%` : value}
                />
                <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1.5} />
                <Tooltip content={<OutcomeStackTip />} />
                <Bar
                  dataKey="positive"
                  stackId="a"
                  radius={[3, 3, 0, 0]}
                  cursor="pointer"
                  onClick={(d) => toggleAge(d.label)}
                >
                  {(() => {
                    const maxPos = Math.max(...outcomeRows.map(x => x.positive))
                    return outcomeRows.map((d, i) => {
                      const greyed = !!selectedAge && selectedAge !== d.label
                      const fill = greyed ? '#e2e8f0' : d.positive === maxPos ? COLORS.highlight : COLORS.brand
                      return <Cell key={i} fill={fill} />
                    })
                  })()}
                </Bar>
                <Bar
                  dataKey="negative"
                  stackId="a"
                  radius={[0, 0, 3, 3]}
                  cursor="pointer"
                  onClick={(d) => toggleAge(d.label)}
                >
                  {outcomeRows.map((d, i) => (
                    <Cell key={i} fill={!!selectedAge && selectedAge !== d.label ? '#e2e8f0' : COLORS.negative} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <MetricCard
              title="Average wait time"
              value={displayMetrics.avgWaitDays}
              unit=" days"
              sub="intake to first contact"
              color={waitColor}
              help="Average listed wait days between intake and first contact in the prototype metrics."
            />
            <PositiveOutcomeCard base={scaledBase} selectedAge={selectedAge} />
            <MetricCard
              title="Clients served"
              value={displayMetrics.totalClients.toLocaleString()}
              unit=""
              sub={`past 12 months${selectedAge ? ` - ${selectedAge}` : ''}${selectedGender !== 'All' ? ` - ${selectedGender}` : ''}`}
              color="text-brand-700"
              help="Total clients represented in seeded program metric rows for the selected scope."
            />
          </div>

          {/* Capacity & availability + client demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <p className="text-sm font-semibold text-slate-900">Capacity & availability</p>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Current occupancy</span>
                  <span className="font-semibold text-slate-800">
                    {base.currentClients.toLocaleString()} / {base.totalCapacity.toLocaleString()} places
                    {base.currentClients > base.totalCapacity && (
                      <span className="ml-1.5 text-amber-600 font-bold text-[10px] uppercase tracking-wide">Over capacity</span>
                    )}
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.round((base.currentClients / base.totalCapacity) * 100))}%`,
                      backgroundColor: base.availablePct < 10 ? '#d97706' : COLORS.brand,
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                  <p className={`text-2xl font-extrabold leading-none ${
                    base.availablePct === 0  ? 'text-amber-700'
                    : base.availablePct < 20 ? 'text-amber-700'
                    : base.availablePct < 40 ? 'text-teal-700'
                    : 'text-emerald-700'
                  }`}>{base.availablePct}%</p>
                  <p className="text-[11px] text-slate-400 mt-1">Available capacity</p>
                </div>
                <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                  <p className={`text-2xl font-extrabold leading-none ${
                    base.waitlistDepth === 0 ? 'text-emerald-700'
                    : base.waitlistDepth <= 5 ? 'text-amber-700'
                    : 'text-red-700'
                  }`}>{base.waitlistDepth}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Waitlist depth</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {base.waitlistDepth === 0
                  ? 'No current waitlist - referrals can proceed immediately.'
                  : base.currentClients > base.totalCapacity
                  ? `Slightly over capacity (${base.currentClients - base.totalCapacity} above limit). Waitlist of ${base.waitlistDepth} - factor into referral decision.`
                  : base.availablePct === 0
                  ? `At capacity. Waitlist of ${base.waitlistDepth} - factor into referral decision.`
                  : base.waitlistDepth <= 5
                  ? `Short waitlist. Estimated wait ~${Math.round(base.waitlistDepth * base.avgWaitDays)} additional days.`
                  : `Waitlist is building despite available places. Verify before referring.`}
              </p>
            </div>

            {/* Current client demographics */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-slate-900 mb-0.5">Current client demographics</p>
              <p className="text-[11px] text-slate-400 mb-4">
                Active clients by age group
                {selectedGender !== 'All' && <> - {selectedGender}</>}
                {' '}- click to filter
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={base.demographicSplit}
                  margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" interval={0} tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTipPlain suffix=" clients" />} />
                  <Bar
                    dataKey="value"
                    radius={[3, 3, 0, 0]}
                    cursor="pointer"
                    onClick={(d) => toggleAge(d.label)}
                  >
                    {base.demographicSplit.map((d, i) => {
                      const greyed = !!selectedAge && selectedAge !== d.label
                      const vals   = base.demographicSplit.map(x => x.value)
                      return <Cell key={i} fill={barFill(d.value, vals, '#6366f1', greyed)} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
        </>}
      </div>
    </div>
  )
}
