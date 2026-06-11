import { useState, useMemo } from 'react'
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
  ChartTipPlain,
  MetricCard,
  OutcomeModeToggle,
  outcomeChartRows,
  OutcomeStackTip,
  SectionLabel,
} from './ui/AnalyticsPrimitives'

const GRID_GROUPS = [
  { key: 'Adults',                                            label: 'Adults'       },
  { key: 'Young people',                                      label: 'Young people' },
  { key: 'Carers',                                            label: 'Carers'       },
  { key: 'Families',                                          label: 'Families'     },
  { key: 'People with psychosocial disability',               label: 'Psychosocial' },
  { key: 'Culturally and Linguistically Diverse communities', label: 'CALD'         },
  { key: 'Aboriginal and Torres Strait Islander peoples',     label: 'ATSI'         },
  { key: 'LGBTQIA+',                                          label: 'LGBTQIA+'     },
  { key: 'Justice-involved',                                  label: 'Justice'      },
]
const GRID_FUNCTIONS = [
  { key: 'Holding / continuity',            label: 'Holding'      },
  { key: 'Early recognition',               label: 'Early recog.' },
  { key: 'Coordination / navigation',       label: 'Coordination' },
  { key: 'Crisis response / stabilisation', label: 'Crisis resp.' },
  { key: 'Belonging & participation',       label: 'Belonging'    },
  { key: 'Advocacy & rights',               label: 'Advocacy'     },
  { key: 'Lived experience leadership',     label: 'Lived exp.'   },
]

const GENDERS = ['All', 'Female', 'Male', 'Non-binary']
function buildUnmetGrid(programs) {
  return GRID_GROUPS.map(tg => ({
    ...tg,
    cells: GRID_FUNCTIONS.map(fn => {
      const count = programs.filter(p =>
        p.targetGroups.includes(tg.key) &&
        p.functions.some(pf =>
          pf === fn.key ||
          pf.split(' / ').some(part => fn.key.split(' / ').includes(part))
        )
      ).length
      return { ...fn, count }
    }),
  }))
}

function aggregateSectorMetrics(programs, genderFilter, memberSharedData) {
  if (!programs.length) return null
  const genders = genderFilter === 'All' ? ['Female', 'Male', 'Non-binary'] : [genderFilter]
  const rows = programs.flatMap(prog =>
    genders.map(g => memberSharedData?.[`${prog.id}_${g}`]).filter(Boolean)
  )
  const n = rows.length
  if (!n) return null
  const totalCapacity  = rows.reduce((s, r) => s + r.totalCapacity,  0)
  const currentClients = rows.reduce((s, r) => s + r.currentClients, 0)
  return {
    avgWaitDays:    parseFloat((rows.reduce((s, r) => s + r.avgWaitDays,    0) / n).toFixed(1)),
    completionRate: Math.round( rows.reduce((s, r) => s + r.completionRate, 0) / n),
    totalClients:   rows.reduce((s, r) => s + r.totalClients,  0),
    waitlistDepth:  Math.round(rows.reduce((s, r) => s + r.waitlistDepth, 0) / n),
    totalCapacity, currentClients,
    availablePct: Math.max(0, Math.round(((totalCapacity - currentClients) / totalCapacity) * 100)),
    hasCapacity:  rows.some(r => r.hasCapacity),
    outcomesByAge: AGE_GROUPS.map((label, i) => ({
      label,
      positive: rows.reduce((s, r) => s + (r.outcomesByAge[i]?.positive ?? 0), 0),
      negative: rows.reduce((s, r) => s + (r.outcomesByAge[i]?.negative ?? 0), 0),
    })),
    demographicSplit: AGE_GROUPS.map((label, i) => ({
      label,
      value: rows.reduce((s, r) => s + (r.demographicSplit[i]?.value ?? 0), 0),
    })),
  }
}

function cellCls(n) {
  return n === 0 ? 'bg-red-50 text-red-700 border-red-200 font-semibold'
       : n <= 2  ? 'bg-amber-50 text-amber-700 border-amber-200'
       :            'bg-emerald-50 text-emerald-700 border-emerald-200'
}

export default function SharedData() {
  const { memberSharedData } = useData()

  const [selectedGender,    setSelectedGender]    = useState('All')
  const [selectedAge,       setSelectedAge]        = useState(null)
  const [selectedDescribes, setSelectedDescribes]  = useState('All')
  const [selectedOrg,       setSelectedOrg]        = useState('All')
  const [selectedProgram,   setSelectedProgram]    = useState(null)
  const [outcomeMode,       setOutcomeMode]        = useState('raw')

  const orgs = useMemo(() => {
    const map = {}
    PROGRAMS.forEach(p => { map[p.orgId] = p.orgName })
    return Object.entries(map).sort(([, a], [, b]) => a.localeCompare(b))
  }, [])

  const orgPrograms = useMemo(() => {
    if (selectedOrg === 'All') return []
    return PROGRAMS.filter(p => p.orgId === selectedOrg)
  }, [selectedOrg])

  const filteredPrograms = useMemo(() => {
    let progs = PROGRAMS
    if (selectedOrg !== 'All')       progs = progs.filter(p => p.orgId === selectedOrg)
    if (selectedProgram)             progs = progs.filter(p => p.id === selectedProgram)
    if (selectedDescribes !== 'All') progs = progs.filter(p => p.targetGroups.includes(selectedDescribes))
    return progs
  }, [selectedOrg, selectedProgram, selectedDescribes])

  const unmetGrid = useMemo(() => {
    const rows = buildUnmetGrid(filteredPrograms)
    return selectedDescribes !== 'All' ? rows.filter(r => r.key === selectedDescribes) : rows
  }, [filteredPrograms, selectedDescribes])

  const base = useMemo(
    () => aggregateSectorMetrics(filteredPrograms, selectedGender, memberSharedData),
    [filteredPrograms, selectedGender, memberSharedData]
  )
  const outcomeRows = useMemo(
    () => base ? outcomeChartRows(base.outcomesByAge, outcomeMode) : [],
    [base, outcomeMode]
  )

  const displayClients = useMemo(() => {
    if (!base) return 0
    if (!selectedAge) return base.totalClients
    return base.demographicSplit.find(d => d.label === selectedAge)?.value ?? 0
  }, [base, selectedAge])

  const positiveData = useMemo(() => {
    if (!base) return { pct: 0, positive: 0, total: 0 }
    const scoped      = selectedAge
      ? base.outcomesByAge.filter(o => o.label === selectedAge)
      : base.outcomesByAge
    const positive    = scoped.reduce((s, o) => s + (o.positive ?? 0), 0)
    const notPositive = scoped.reduce((s, o) => s + Math.abs(o.negative ?? 0), 0)
    const total       = positive + notPositive
    return { positive, total, pct: total > 0 ? Math.round((positive / total) * 100) : 0 }
  }, [base, selectedAge])

  const waitColor = !base
    ? 'text-slate-400'
    : base.avgWaitDays <= 3 ? 'text-emerald-700'
    : base.avgWaitDays <= 7 ? 'text-amber-700'
    : 'text-red-700'

  const capColor = !base
    ? 'text-slate-400'
    : base.availablePct < 10 ? 'text-red-700'
    : base.availablePct < 30 ? 'text-amber-700'
    : 'text-emerald-700'

  const hasActiveFilters = selectedGender !== 'All' || selectedAge !== null ||
    selectedDescribes !== 'All' || selectedOrg !== 'All' || selectedProgram !== null

  function clearFilters() {
    setSelectedGender('All')
    setSelectedAge(null)
    setSelectedDescribes('All')
    setSelectedOrg('All')
    setSelectedProgram(null)
  }

  function handleOrgChange(orgId) {
    setSelectedOrg(orgId)
    setSelectedProgram(null)
  }

  const toggleAge = (label) => setSelectedAge(prev => prev === label ? null : label)

  const selectedOrgName = orgs.find(([id]) => id === selectedOrg)?.[1]

  return (
    <div className="space-y-10">

      {/* ── Filters ────────────────────────────────────────────────── */}
      <div>
        <SectionLabel color="brand">Sector analytics</SectionLabel>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">

          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filters</p>
            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className={`text-xs font-medium transition-colors px-3 py-1 rounded-full border ${
                hasActiveFilters
                  ? 'text-slate-600 border-slate-200 hover:text-red-500 hover:border-red-300 cursor-pointer'
                  : 'text-slate-300 border-slate-100 cursor-not-allowed'
              }`}
            >
              Clear all filters
            </button>
          </div>

          {/* Gender */}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap w-20">Gender</label>
            <div className="flex gap-2 flex-wrap ml-12">
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
          </div>

          {/* Age */}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap w-20">Age</label>
            <select
              value={selectedAge ?? ''}
              onChange={e => setSelectedAge(e.target.value || null)}
              className="ml-12 text-sm border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All ages</option>
              {AGE_GROUPS.map(ag => <option key={ag} value={ag}>{ag}</option>)}
            </select>
            {selectedAge && (
              <span className="text-[11px] text-brand-600">
                Showing data for <strong>{selectedAge}</strong> · click the bar again or change dropdown to deselect
              </span>
            )}
          </div>

          {/* Describes */}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap w-20">Describes</label>
            <select
              value={selectedDescribes}
              onChange={e => setSelectedDescribes(e.target.value)}
              className="ml-12 text-sm border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All</option>
              {GRID_GROUPS.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
            </select>
          </div>

          {/* Organisation + Program (linked) */}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap w-20">Organisation</label>
            <select
              value={selectedOrg}
              onChange={e => handleOrgChange(e.target.value)}
              className="ml-12 flex-1 min-w-[180px] max-w-xs text-sm border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All organisations</option>
              {orgs.map(([orgId, orgName]) => (
                <option key={orgId} value={orgId}>{orgName}</option>
              ))}
            </select>
            <select
              value={selectedProgram ?? ''}
              onChange={e => setSelectedProgram(e.target.value || null)}
              disabled={selectedOrg === 'All'}
              className={`flex-1 min-w-[180px] max-w-xs text-sm border rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-opacity ${
                selectedOrg === 'All'
                  ? 'border-slate-100 bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed'
                  : 'border-slate-200 bg-white text-slate-800'
              }`}
            >
              <option value="">All programs</option>
              {orgPrograms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

        </div>
      </div>

      {/* ── Unmet needs analysis ───────────────────────────────────── */}
      <div>
        <SectionLabel color="amber">Unmet needs analysis</SectionLabel>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-slate-900 mb-0.5">Target group × function coverage</p>
          <p className="text-[11px] text-slate-400 mb-4">
            Programs available per combination
            {selectedOrgName ? ` · ${selectedOrgName}` : ''}
            {selectedProgram ? ` · ${orgPrograms.find(p => p.id === selectedProgram)?.name ?? ''}` : ''}.{' '}
            <span className="text-red-600 font-semibold">Red = no programs</span>, amber = 1–2, green = 3+.
          </p>
          {unmetGrid.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">No target groups match the current filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse" style={{ minWidth: '560px' }}>
                <thead>
                  <tr>
                    <th className="py-2 pr-3 text-left text-slate-400 font-semibold w-24" />
                    {GRID_FUNCTIONS.map(fn => (
                      <th key={fn.key} className="py-2 px-1 text-center text-slate-500 font-semibold whitespace-nowrap">{fn.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {unmetGrid.map(row => (
                    <tr key={row.key}>
                      <td className="py-1.5 pr-3 text-slate-600 font-medium whitespace-nowrap">{row.label}</td>
                      {row.cells.map(cell => (
                        <td key={cell.key} className="py-1.5 px-1 text-center">
                          <span className={`inline-flex w-8 h-6 items-center justify-center rounded border text-[11px] ${cellCls(cell.count)}`}>
                            {cell.count}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Sector performance ────────────────────────────────────── */}
      {base ? (
        <div>
          <SectionLabel color="slate">Sector performance</SectionLabel>
          <div className="space-y-5">

            {/* Best outcome demographics - stacked positive / non-positive client outcomes */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-0.5">Best outcome demographics</p>
                  <p className="text-[11px] text-slate-400">
                    Positive and non-positive client outcomes by age group across{' '}
                    {filteredPrograms.length} program{filteredPrograms.length !== 1 ? 's' : ''} · click a bar to filter
                  </p>
                </div>
                <OutcomeModeToggle value={outcomeMode} onChange={setOutcomeMode} />
              </div>
              <ResponsiveContainer width="100%" height={200}>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard
                title="Clients served"
                value={displayClients.toLocaleString()}
                sub={`past 12 months${selectedAge ? ` · ${selectedAge}` : ''}${selectedGender !== 'All' ? ` · ${selectedGender}` : ''}`}
                color="text-brand-700"
              />
              <MetricCard
                title="Average wait time"
                value={base.avgWaitDays}
                unit=" days"
                sub="intake to first contact"
                color={waitColor}
              />
              <MetricCard
                title="Positive outcome rate"
                value={positiveData.pct}
                unit="%"
                sub={`${positiveData.positive.toLocaleString()} of ${positiveData.total.toLocaleString()} clients`}
                color="text-emerald-700"
              />
              <MetricCard
                title="Available capacity"
                value={base.availablePct}
                unit="%"
                sub={`${Math.max(0, base.totalCapacity - base.currentClients).toLocaleString()} places across sector`}
                color={capColor}
              />
            </div>

            {/* Current client demographics */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-slate-900 mb-0.5">Current client demographics</p>
              <p className="text-[11px] text-slate-400 mb-4">
                Active clients by age group
                {selectedGender !== 'All' && <> · {selectedGender}</>}
                {' '}· click to filter
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
      ) : (
        <p className="text-sm text-slate-400 py-4">
          No programs match the current filters — try adjusting your selection.
        </p>
      )}

    </div>
  )
}
