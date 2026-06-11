export function FilterChip({ label, active, onClick }) {
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

export const FILTER_SELECTIONS = { targetGroup: [], supportType: [], accessMode: [], function: [] }
