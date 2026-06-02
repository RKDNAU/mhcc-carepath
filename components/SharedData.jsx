import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Cell,
} from 'recharts'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PROGRAMS } from '../data/programs'
import { mockProgramData, AGE_GROUPS } from '../utils/programData'
import { useData } from '../context/DataContext'

const GENDERS  = ['All', 'Female', 'Male', 'Non-binary']
const G_OFFSET = { All: 0, Female: 100, Male: 200, 'Non-binary': 300 }

// Age-filtered overrides for metric cards (seeded, consistent)
const rng = (seed, offset) => {
  const x = Math.sin(seed * 9301 + offset * 49297 + 233) * 10000
  return x - Math.floor(x)
}

function ageMetrics(base, program, ageLabel, gender) {
  if (!ageLabel) return base
  const n    = parseInt(program.id.replace('PRG', ''), 10)
  const aOff = AGE_GROUPS.indexOf(ageLabel) * 50
  const gOff = G_OFFSET[gender] || 0
  return {
    ...base,
    avgWaitDays:    parseFloat((base.avgWaitDays * (0.7 + rng(n, 50 + aOff + gOff) * 0.6)).toFixed(1)),
    completionRate: Math.round(Math.min(97, base.completionRate * (0.8 + rng(n, 51 + aOff + gOff) * 0.4))),
    totalClients:   Math.round(base.totalClients * (0.1 + rng(n, 52 + aOff + gOff) * 0.5)),
  }
}

// ── Temporal support types (60-day periods) ────────────────────────────
const SUPPORT_LABELS = {
  'Anxiety / Stress':   'Anxiety/Stress',
  'Depression':         'Depression',
  'Trauma / PTSD':      'Trauma/PTSD',
  'Grief & Loss':       'Grief & Loss',
  'Relationship Issues':'Relationship Iss.',
  'Family / Parenting': 'Family/Parenting',
  'Substance Use':      'Substance Use',
  'Eating Disorders':   'Eating Disorders',
  'Youth Mental Health':'Youth Mental Hlth',
  'Aged Care Support':  'Aged Care',
}
const ST_ALL   = Object.keys(SUPPORT_LABELS)
const ST_BASE  = [4, 3, 1, 2, 2, 2, 2, 1, 1, 2]

function getSupportForPeriod(pIdx) {
  return ST_ALL.map((name, i) => {
    const v = Math.round(
      Math.sin(pIdx * 1.8 + i * 0.9) * 2.5 +
      (pIdx > 0 ? Math.sin(i * 3.7 + pIdx * 2.3) * 1.5 : 0)
    )
    const count = Math.max(0, ST_BASE[i] + v)
    return { name: SUPPORT_LABELS[name], count }
  }).filter(d => d.count > 0).sort((a, b) => b.count - a.count)
}

function periodLabel(pIdx) {
  const DAY = 86400000
  const end   = new Date(Date.UTC(2026, 4, 29) - pIdx * 60 * DAY)
  const start = new Date(end.getTime() - 59 * DAY)
  const fmt   = d => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: '2-digit' })
  return `${fmt(start)} – ${fmt(end)}`
}

// ── Unmet needs grid ───────────────────────────────────────────────────
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
function buildUnmetGrid() {
  return GRID_GROUPS.map(tg => ({
    ...tg,
    cells: GRID_FUNCTIONS.map(fn => {
      const count = PROGRAMS.filter(p =>
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
function cellCls(n) {
  return n === 0 ? 'bg-red-50 text-red-700 border-red-200 font-semibold'
       : n <= 2  ? 'bg-amber-50 text-amber-700 border-amber-200'
       :            'bg-emerald-50 text-emerald-700 border-emerald-200'
}

// ── Colour helpers ─────────────────────────────────────────────────────
const PINK = '#c8336d'
const TEAL = '#0d9488'

function barFill(value, allValues, base, greyedOut) {
  if (greyedOut) return '#e2e8f0'
  const max = Math.max(...allValues.map(d => typeof d === 'number' ? d : d.value ?? d.count))
  return value === max ? PINK : base
}

// ── Chart tooltip ──────────────────────────────────────────────────────
function ChartTip({ active, payload, suffix = '' }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-800">{d.payload.name ?? d.payload.label ?? d.payload.week ?? ''}</p>
      <p className="text-brand-700 mt-0.5 font-bold">{d.value}{suffix}</p>
    </div>
  )
}

// ── Section label ──────────────────────────────────────────────────────
function SectionLabel({ children, color = 'brand' }) {
  const cls = color === 'brand' ? 'bg-brand-50 text-brand-700 border-brand-200'
            : color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200'
            :                     'bg-slate-100 text-slate-600 border-slate-300'
  return (
    <div className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border mb-4 ${cls}`}>
      {children}
    </div>
  )
}

// ── Metric card ────────────────────────────────────────────────────────
function MetricCard({ title, value, unit, sub, color = 'text-brand-700' }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center flex flex-col items-center gap-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
      <p className={`text-4xl font-extrabold ${color} leading-none`}>
        {value}<span className="text-xl">{unit}</span>
      </p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  )
}

// ── Completion card ────────────────────────────────────────────────────
function CompletionCard({ rate }) {
  const color    = rate >= 80 ? '#059669' : rate >= 60 ? '#d97706' : '#dc2626'
  const textCls  = rate >= 80 ? 'text-emerald-700' : rate >= 60 ? 'text-amber-700' : 'text-red-700'
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center flex flex-col items-center gap-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Service completion rate</p>
      <p className={`text-4xl font-extrabold leading-none ${textCls}`}>
        {rate}<span className="text-xl">%</span>
      </p>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${rate}%`, backgroundColor: color }} />
      </div>
      <p className="text-xs text-slate-400">of clients complete the program</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
export default function SharedData() {
  const { intakeVolume, memberSharedData } = useData()
  const [selectedId,     setSelectedId]     = useState(PROGRAMS[2].id)
  const [selectedAge,    setSelectedAge]     = useState(null)
  const [selectedGender, setSelectedGender] = useState('All')
  const [supportPeriod,  setSupportPeriod]  = useState(0)

  const selectedProg = PROGRAMS.find(p => p.id === selectedId) || PROGRAMS[0]

  // Use uploaded member shared data if available for the current program+gender,
  // otherwise fall back to seeded generated data.
  const base = useMemo(() => {
    const key = `${selectedId}_${selectedGender}`
    return (memberSharedData && memberSharedData[key])
      ? memberSharedData[key]
      : mockProgramData(selectedProg, selectedGender)
  }, [selectedProg, selectedId, selectedGender, memberSharedData])

  const displayMetrics = useMemo(() => ageMetrics(base, selectedProg, selectedAge, selectedGender), [base, selectedProg, selectedAge, selectedGender])
  const supportData    = useMemo(() => getSupportForPeriod(supportPeriod), [supportPeriod])
  const unmetGrid      = useMemo(() => buildUnmetGrid(), [])

  const waitColor = displayMetrics.avgWaitDays <= 3 ? 'text-emerald-700'
                  : displayMetrics.avgWaitDays <= 7 ? 'text-amber-700'
                  : 'text-red-700'

  const toggleAge = (label) => setSelectedAge(prev => prev === label ? null : label)

  const programsByOrg = useMemo(() => {
    const groups = {}
    PROGRAMS.forEach(p => { if (!groups[p.orgName]) groups[p.orgName] = []; groups[p.orgName].push(p) })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [])

  return (
    <div className="space-y-10">

      {/* ── Section 1: CarePath Intake ─────────────────────────────── */}
      <div>
        <SectionLabel color="brand">CarePath intake data</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Intake volume */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-slate-900 mb-0.5">Intake volume over time</p>
            <p className="text-[11px] text-slate-400 mb-4">Weekly submissions · last 8 weeks</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={intakeVolume} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTip suffix=" intakes" />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {intakeVolume.map((d, i) => (
                    <Cell key={i} fill={barFill(d.count, intakeVolume, TEAL, false)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top support types — temporal */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-2 mb-0.5">
              <p className="text-sm font-semibold text-slate-900">Top support types requested</p>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setSupportPeriod(p => p + 1)}
                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                  title="Previous 60-day period"
                >
                  <ChevronLeft size={13} />
                </button>
                <button
                  onClick={() => setSupportPeriod(p => Math.max(0, p - 1))}
                  disabled={supportPeriod === 0}
                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Next 60-day period"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">{periodLabel(supportPeriod)}</p>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart
                data={supportData}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 128, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  type="category" dataKey="name" width={124}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false} axisLine={false}
                />
                <Tooltip content={<ChartTip suffix=" intakes" />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {supportData.map((d, i) => (
                    <Cell key={i} fill={barFill(d.count, supportData, TEAL, false)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>

      {/* ── Section 2: Unmet Needs ─────────────────────────────────── */}
      <div>
        <SectionLabel color="amber">Unmet needs analysis</SectionLabel>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-slate-900 mb-0.5">Target group × function coverage</p>
          <p className="text-[11px] text-slate-400 mb-4">
            Programs available per combination.{' '}
            <span className="text-red-600 font-semibold">Red = no programs</span>,
            amber = 1-2, green = 3+.
          </p>
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
        </div>
      </div>

      {/* ── Section 3: Member Shared Data ─────────────────────────── */}
      <div>
        <SectionLabel color="slate">Member shared data</SectionLabel>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 space-y-3">
          {/* Program selector */}
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

          {/* Gender filter */}
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
              {selectedGender !== 'All' && <> · <strong>{selectedGender}</strong></>}.
              Click the bar again to deselect.
            </p>
          )}
        </div>

        <div className="space-y-5">

          {/* Outcome by age group — clickable bars */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-slate-900 mb-0.5">Best outcome demographics</p>
            <p className="text-[11px] text-slate-400 mb-1">Positive outcome rate by age group · click a bar to filter</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={base.outcomesByAge}
                margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} unit="%" />
                <Tooltip content={<ChartTip suffix="%" />} />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={(d) => toggleAge(d.label)}
                >
                  {base.outcomesByAge.map((d, i) => {
                    const greyed = !!selectedAge && selectedAge !== d.label
                    const vals   = base.outcomesByAge.map(x => x.value)
                    const base_c = d.value >= 75 ? '#059669' : d.value >= 60 ? TEAL : '#94a3b8'
                    return <Cell key={i} fill={barFill(d.value, vals, base_c, greyed)} />
                  })}
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
            />
            <CompletionCard rate={displayMetrics.completionRate} />
            <MetricCard
              title="Clients served"
              value={displayMetrics.totalClients}
              unit=""
              sub={`past 12 months${selectedAge ? ` · ${selectedAge}` : ''}${selectedGender !== 'All' ? ` · ${selectedGender}` : ''}`}
              color="text-brand-700"
            />
          </div>

          {/* Capacity & availability + client demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Capacity */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <p className="text-sm font-semibold text-slate-900">Capacity & availability</p>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Current occupancy</span>
                  <span className="font-semibold text-slate-800">
                    {base.currentClients} / {base.totalCapacity} places
                    {base.currentClients > base.totalCapacity && (
                      <span className="ml-1.5 text-red-600 font-bold text-[10px] uppercase tracking-wide">Over capacity</span>
                    )}
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.round((base.currentClients / base.totalCapacity) * 100))}%`,
                      backgroundColor: base.availablePct < 10 ? '#dc2626'
                        : base.availablePct < 30 ? '#d97706' : TEAL,
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                  <p className={`text-2xl font-extrabold leading-none ${
                    base.availablePct === 0  ? 'text-red-700'
                    : base.availablePct < 20 ? 'text-red-700'
                    : base.availablePct < 40 ? 'text-amber-700'
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
                  ? 'No current waitlist — referrals can proceed immediately.'
                  : base.availablePct === 0 || base.currentClients >= base.totalCapacity
                  ? `At or over capacity. Waitlist of ${base.waitlistDepth} — factor into referral decision.`
                  : base.waitlistDepth <= 5
                  ? `Short waitlist. Estimated wait ~${Math.round(base.waitlistDepth * base.avgWaitDays)} additional days.`
                  : `Waitlist is building despite available places. Verify before referring.`}
              </p>
            </div>

            {/* Demographics — clickable bars */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-slate-900 mb-0.5">Current client demographics</p>
              <p className="text-[11px] text-slate-400 mb-4">
                Active clients by age group
                {selectedGender !== 'All' && <> · {selectedGender}</>}
                {' '}· click to filter
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart
                  data={base.demographicSplit}
                  margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTip suffix=" clients" />} />
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
      </div>

    </div>
  )
}
