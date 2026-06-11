import { useState, useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Cell,
} from 'recharts'
import { useData } from '../context/DataContext'
import { COLORS, LINE_COLORS } from '../constants/theme'
import { barFill, ChartTipPlain, MetricCard, SectionLabel } from './ui/AnalyticsPrimitives'

const SUPPORT_LABELS = {
  'Anxiety / Stress': 'Anxiety / Stress',
  Depression: 'Depression',
  'Trauma / PTSD': 'Trauma / PTSD',
  'Grief & Loss': 'Grief & Loss',
  'Relationship Issues': 'Relationship Issues',
  'Family / Parenting': 'Family / Parenting',
  'Substance Use': 'Substance Use',
  'Eating Disorders': 'Eating Disorders',
  'Youth Mental Health': 'Youth Mental Health',
  'Aged Care Support': 'Aged Care Support',
}

const SUPPORT_KEYS = Object.values(SUPPORT_LABELS)

function weekStartIso(value) {
  const d = new Date(value)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return d.toISOString().slice(0, 10)
}

function fmtMonthTick(w) {
  return new Date(w + 'T00:00:00Z').toLocaleDateString('en-AU', { month: 'short' })
}

function truncateAxisLabel(value) {
  const max = 24
  return value.length > max ? `${value.slice(0, max - 3)}...` : value
}

function getSupportData(intakes) {
  const counts = {}
  for (const intake of intakes) {
    for (const type of intake.supportTypes || []) {
      const name = SUPPORT_LABELS[type] || type
      counts[name] = (counts[name] || 0) + 1
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

function getSupportTimeSeries(intakes) {
  const latest = intakes.reduce((max, intake) => {
    const t = new Date(intake.submittedAt).getTime()
    return Number.isFinite(t) ? Math.max(max, t) : max
  }, Date.now())
  const latestWeek = new Date(weekStartIso(latest))
  const rows = Array.from({ length: 52 }, (_, i) => {
    const d = new Date(latestWeek)
    d.setDate(d.getDate() - (51 - i) * 7)
    const week = d.toISOString().slice(0, 10)
    return Object.fromEntries([['week', week], ...SUPPORT_KEYS.map(key => [key, 0])])
  })
  const byWeek = Object.fromEntries(rows.map(row => [row.week, row]))

  for (const intake of intakes) {
    const row = byWeek[weekStartIso(intake.submittedAt)]
    if (!row) continue
    for (const type of intake.supportTypes || []) {
      const key = SUPPORT_LABELS[type] || type
      row[key] = (row[key] || 0) + 1
    }
  }

  return rows
}

function LineTip({ active, payload, label, focusedLine }) {
  if (!active || !payload?.length) return null
  const d = new Date(label + 'T00:00:00Z')
  const weekStr = d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: '2-digit' })
  const visible = payload
    .filter(p => p.value > 0 && (focusedLine ? p.dataKey === focusedLine : true))
    .sort((a, b) => b.value - a.value)
  if (!visible.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs min-w-[150px]">
      <p className="font-semibold text-slate-500 mb-1.5">w/c {weekStr}</p>
      {visible.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium leading-snug">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function IntakeData() {
  const { intakeVolume, intakeQueue } = useData()
  const [focusedLine, setFocusedLine] = useState(null)

  const supportData = useMemo(() => getSupportData(intakeQueue), [intakeQueue])
  const supportTimeSeries = useMemo(() => getSupportTimeSeries(intakeQueue), [intakeQueue])
  const supportChartHeight = Math.max(230, supportData.length * 28 + 36)
  const monthTicks = useMemo(() =>
    supportTimeSeries.filter(pt => new Date(pt.week + 'T00:00:00Z').getDate() <= 7).map(pt => pt.week),
  [supportTimeSeries])

  const metrics = useMemo(() => {
    const avgThroughput = intakeVolume.length
      ? parseFloat((intakeVolume.reduce((s, w) => s + w.count, 0) / intakeVolume.length).toFixed(1))
      : null
    const total = intakeQueue.length
    const routed = intakeQueue.filter(i => i.status === 'routed')
    const routingRate = total > 0 ? Math.round((routed.length / total) * 100) : null
    const withTimes = routed.filter(i => i.submittedAt && i.routedAt)
    const avgRouteWait = withTimes.length
      ? parseFloat((withTimes.reduce((s, i) => s + (new Date(i.routedAt) - new Date(i.submittedAt)), 0) / withTimes.length / 86400000).toFixed(1))
      : null
    const queueDepth = intakeQueue.filter(i => i.status === 'queued' || i.status === 'pending').length
    return { avgThroughput, routingRate, avgRouteWait, queueDepth, total, routedCount: routed.length }
  }, [intakeQueue, intakeVolume])

  const waitColor = metrics.avgRouteWait == null ? 'text-slate-400'
                  : metrics.avgRouteWait <= 2 ? 'text-emerald-700'
                  : metrics.avgRouteWait <= 5 ? 'text-amber-700'
                  : 'text-red-700'
  const routeColor = metrics.routingRate == null ? 'text-slate-400'
                   : metrics.routingRate >= 80 ? 'text-emerald-700'
                   : metrics.routingRate >= 50 ? 'text-amber-700'
                   : 'text-red-700'
  const queueColor = metrics.queueDepth === 0 ? 'text-emerald-700'
                   : metrics.queueDepth <= 5 ? 'text-amber-700'
                   : 'text-red-700'

  function focusLine(key) {
    setFocusedLine(prev => prev === key ? null : key)
  }

  return (
    <div className="space-y-10">
      <div>
        <SectionLabel color="brand">Intake Data</SectionLabel>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <MetricCard title="Avg route wait" value={metrics.avgRouteWait ?? '-'} unit={metrics.avgRouteWait != null ? ' days' : ''} sub="submission to routing" color={waitColor} size="sm" />
          <MetricCard title="Weekly throughput" value={metrics.avgThroughput ?? '-'} unit={metrics.avgThroughput != null ? ' / wk' : ''} sub="avg intakes per week" color="text-brand-700" size="sm" />
          <MetricCard title="Routing rate" value={metrics.routingRate != null ? `${metrics.routingRate}%` : '-'} sub={`${metrics.routedCount} of ${metrics.total} intakes routed`} color={routeColor} size="sm" />
          <MetricCard title="Queue depth" value={metrics.queueDepth} sub="unrouted intakes pending" color={queueColor} size="sm" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-slate-900 mb-0.5">Intake volume over time</p>
            <p className="text-[11px] text-slate-400 mb-4">Weekly submissions from SQLite</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={intakeVolume} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chartGrid} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: COLORS.chartTick }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: COLORS.chartTick }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTipPlain suffix=" intakes" />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {intakeVolume.map((d, i) => (
                    <Cell key={i} fill={barFill(d.count, intakeVolume, COLORS.brand, false)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-slate-900 mb-0.5">Top support types requested</p>
            <p className="text-[11px] text-slate-400 mb-4">Current intake records from SQLite</p>
            <ResponsiveContainer width="100%" height={supportChartHeight}>
              <BarChart data={supportData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chartGrid} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: COLORS.chartTick }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={136}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={truncateAxisLabel}
                  interval={0}
                  minTickGap={0}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTipPlain suffix=" intakes" />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {supportData.map((d, i) => (
                    <Cell key={i} fill={barFill(d.count, supportData, COLORS.brand, false)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mt-5">
          <p className="text-sm font-semibold text-slate-900 mb-0.5">Support types requested over time</p>
          <p className="text-[11px] text-slate-400 mb-4">
            Weekly intake counts by support type from SQLite intake records
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={supportTimeSeries} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chartGrid} />
              <XAxis dataKey="week" ticks={monthTicks} tickFormatter={fmtMonthTick} tick={{ fontSize: 10, fill: COLORS.chartTick }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: COLORS.chartTick }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<LineTip focusedLine={focusedLine} />} />
              {SUPPORT_KEYS
                .filter(key => key !== focusedLine)
                .map((key, i) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={focusedLine ? COLORS.mutedLine : LINE_COLORS[i]}
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3, strokeWidth: 0 }}
                    isAnimationActive={false}
                  />
                ))}
              {focusedLine && (
                <Line
                  key={`${focusedLine}-overlay`}
                  type="monotone"
                  dataKey={focusedLine}
                  stroke={LINE_COLORS[SUPPORT_KEYS.indexOf(focusedLine)]}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 px-1">
            {SUPPORT_KEYS.map((key, i) => (
              <button
                key={key}
                onClick={() => focusLine(key)}
                className={`flex items-center gap-1.5 text-[11px] transition-opacity hover:opacity-80 ${
                  focusedLine && focusedLine !== key ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <span
                  className="inline-block w-4 rounded-full flex-shrink-0"
                  style={{ height: '2px', backgroundColor: focusedLine && focusedLine !== key ? COLORS.mutedLine : LINE_COLORS[i] }}
                />
                <span className={focusedLine === key ? 'font-semibold text-slate-900' : 'text-slate-600'}>{key}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
