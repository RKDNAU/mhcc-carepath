import { COLORS } from '../../constants/theme'

export function barFill(value, allValues, base = COLORS.brand, greyedOut = false) {
  if (greyedOut) return '#e2e8f0'
  const max = Math.max(...allValues.map(d => typeof d === 'number' ? d : d.value ?? d.count))
  return value === max ? COLORS.highlight : base
}

export function SectionLabel({ children, color = 'brand' }) {
  const cls = color === 'brand' ? 'bg-brand-50 text-brand-700 border-brand-200'
            : color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200'
            :                     'bg-slate-100 text-slate-600 border-slate-300'
  return (
    <div className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border mb-4 ${cls}`}>
      {children}
    </div>
  )
}

export function MetricCard({ title, value, unit = '', sub, color = 'text-brand-700', size = 'lg' }) {
  const valueClass = size === 'sm' ? 'text-3xl' : 'text-4xl'
  const unitClass = size === 'sm' ? 'text-base font-semibold ml-0.5 opacity-70' : 'text-xl'

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center flex flex-col items-center gap-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
      <p className={`${valueClass} font-extrabold ${color} leading-none`}>
        {value}<span className={unitClass}>{unit}</span>
      </p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  )
}

export function ChartTipPlain({ active, payload, suffix = '', labelKey = null }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  const label = labelKey ? d.payload[labelKey] : d.payload.name ?? d.payload.label ?? d.payload.week ?? ''
  const value = typeof d.value === 'number' ? d.value.toLocaleString() : d.value
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-800">{label}</p>
      <p className="text-brand-700 mt-0.5 font-bold">{value}{suffix}</p>
    </div>
  )
}

export function outcomeChartRows(rows, mode = 'raw') {
  if (mode !== 'percentage') return rows
  return rows.map(row => {
    const positive = row.positive ?? 0
    const notPositive = Math.abs(row.negative ?? 0)
    const total = positive + notPositive
    const positivePct = total > 0 ? Math.round((positive / total) * 1000) / 10 : 0
    return {
      ...row,
      positive: positivePct,
      negative: -(total > 0 ? Math.round((100 - positivePct) * 10) / 10 : 0),
      rawPositive: positive,
      rawNotPositive: notPositive,
    }
  })
}

export function OutcomeModeToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5">
      {[
        ['raw', 'Raw Numbers'],
        ['percentage', 'Percentage'],
      ].map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
            value === key
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function OutcomeStackTip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload ?? {}
  const positive = d.positive ?? 0
  const negative = Math.abs(d.negative ?? 0)
  const total = positive + negative
  const isPercentage = d.rawPositive !== undefined
  const rawTotal = (d.rawPositive ?? 0) + (d.rawNotPositive ?? 0)
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-800 mb-1">{d.label}</p>
      <p className="text-teal-700 font-medium">
        {isPercentage
          ? `${positive.toLocaleString()}% positive`
          : `${positive.toLocaleString()} positive${total > 0 ? ` (${Math.round(positive / total * 100)}%)` : ''}`}
      </p>
      <p style={{ color: COLORS.negative }} className="font-medium">
        {isPercentage
          ? `${negative.toLocaleString()}% non-positive`
          : `${negative.toLocaleString()} non-positive${total > 0 ? ` (${Math.round(negative / total * 100)}%)` : ''}`}
      </p>
      {total > 0 && (
        <p className="text-slate-400 mt-0.5 border-t border-slate-100 pt-0.5">
          {(isPercentage ? rawTotal : total).toLocaleString()} clients
        </p>
      )}
    </div>
  )
}
