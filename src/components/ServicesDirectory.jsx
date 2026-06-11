import { useState, useMemo } from 'react'
import { X, Search, ExternalLink, ChevronDown, Filter } from 'lucide-react'
import { PROGRAMS, ALL_TARGET_GROUPS, ALL_FUNCTIONS, ALL_ACCESS_MODES } from '../data/programs'
import { ORGANISATIONS } from '../data/organisations'
import { FilterChip, FILTER_SELECTIONS } from './ui/FilterControls'

const orgUrlMap = Object.fromEntries(ORGANISATIONS.map(o => [o.id, o.url]))

const FUNCTION_COLORS = {
  'Advocacy & rights':                    'bg-violet-50 text-violet-700 border-violet-200',
  'Belonging & participation':            'bg-green-50 text-green-700 border-green-200',
  'Coordination / navigation':            'bg-blue-50 text-blue-700 border-blue-200',
  'Court, custody & community transitions': 'bg-slate-100 text-slate-600 border-slate-300',
  'Crisis response / stabilisation':      'bg-red-50 text-red-700 border-red-200',
  'Early recognition':                    'bg-amber-50 text-amber-700 border-amber-200',
  'Holding / continuity':                 'bg-teal-50 text-teal-700 border-teal-200',
  'Initiation / reach-in':                'bg-orange-50 text-orange-700 border-orange-200',
  'Lived experience leadership':          'bg-pink-50 text-pink-700 border-pink-200',
  'Practical life support':               'bg-lime-50 text-lime-700 border-lime-200',
}

const ACCESS_COLORS = {
  'Self-referral':               'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Referral required':           'bg-amber-50 text-amber-700 border-amber-200',
  'Appointment':                 'bg-blue-50 text-blue-700 border-blue-200',
  'Phone/online':                'bg-sky-50 text-sky-700 border-sky-200',
  'Outreach / proactive reach-in': 'bg-purple-50 text-purple-700 border-purple-200',
  'Walk-in':                     'bg-green-50 text-green-700 border-green-200',
  'Other':                       'bg-slate-100 text-slate-600 border-slate-300',
}

function FilterBar({ openPanel, togglePanel, selections, toggleSelection }) {
  const activeCount = (key) => selections[key].length

  return (
    <div className="border-b border-slate-100 bg-white">
      {/* Filter type row */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-slate-400 flex-shrink-0" />
        {[
          { key: 'targetGroup', label: 'Target group', options: ALL_TARGET_GROUPS },
          { key: 'function',    label: 'Function',      options: ALL_FUNCTIONS      },
          { key: 'accessMode',  label: 'Access mode',   options: ALL_ACCESS_MODES   },
        ].map(({ key, label }) => {
          const count = activeCount(key)
          const isOpen = openPanel === key
          return (
            <button
              key={key}
              onClick={() => togglePanel(key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                isOpen || count > 0
                  ? 'bg-brand-50 text-brand-700 border-brand-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {label}
              {count > 0 && (
                <span className="w-4 h-4 rounded-full bg-highlight text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                  {count}
                </span>
              )}
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
          )
        })}

        {/* Clear all */}
        {(selections.targetGroup.length || selections.function.length || selections.accessMode.length) ? (
          <button
            onClick={() => {
              toggleSelection('targetGroup', null, true)
              toggleSelection('function', null, true)
              toggleSelection('accessMode', null, true)
            }}
            className="ml-auto text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            Clear all filters
          </button>
        ) : null}
      </div>

      {/* Expanded chip rows */}
      {openPanel === 'targetGroup' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-3 flex flex-wrap gap-2 animate-fade-in">
          {ALL_TARGET_GROUPS.map(g => (
            <FilterChip
              key={g}
              label={g}
              active={selections.targetGroup.includes(g)}
              onClick={() => toggleSelection('targetGroup', g)}
            />
          ))}
        </div>
      )}
      {openPanel === 'function' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-3 flex flex-wrap gap-2 animate-fade-in">
          {ALL_FUNCTIONS.map(f => (
            <FilterChip
              key={f}
              label={f}
              active={selections.function.includes(f)}
              onClick={() => toggleSelection('function', f)}
            />
          ))}
        </div>
      )}
      {openPanel === 'accessMode' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-3 flex flex-wrap gap-2 animate-fade-in">
          {ALL_ACCESS_MODES.map(m => (
            <FilterChip
              key={m}
              label={m}
              active={selections.accessMode.includes(m)}
              onClick={() => toggleSelection('accessMode', m)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProgramCard({ program }) {
  const orgUrl = orgUrlMap[program.orgId]

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      {/* Header */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">
          {program.name}
        </h3>
        {orgUrl ? (
          <a
            href={orgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 hover:underline transition-colors font-medium"
          >
            {program.orgName}
            <ExternalLink size={10} />
          </a>
        ) : (
          <span className="text-xs text-slate-400">{program.orgName}</span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 leading-relaxed">
        {program.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
        {program.functions.map(fn => (
          <span
            key={fn}
            className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border ${FUNCTION_COLORS[fn] || 'bg-slate-100 text-slate-600 border-slate-200'}`}
          >
            {fn}
          </span>
        ))}
        <span
          className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border ${ACCESS_COLORS[program.accessMode] || 'bg-slate-100 text-slate-600 border-slate-200'}`}
        >
          {program.accessMode}
        </span>
      </div>
    </div>
  )
}

export default function ServicesDirectory({ onClose, embedded = false }) {
  const [query, setQuery] = useState('')
  const [openPanel, setOpenPanel] = useState(null)
  const [selections, setSelections] = useState(FILTER_SELECTIONS)

  const togglePanel = (key) => setOpenPanel(prev => prev === key ? null : key)

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

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PROGRAMS.filter(p => {
      if (q && !p.name.toLowerCase().includes(q) && !p.orgName.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false
      if (selections.targetGroup.length && !selections.targetGroup.some(g => p.targetGroups.includes(g))) return false
      if (selections.function.length && !selections.function.some(filterTerm =>
        p.functions.some(progFn =>
          progFn.toLowerCase() === filterTerm.toLowerCase() ||
          progFn.split(' / ').map(s => s.trim().toLowerCase()).includes(filterTerm.toLowerCase())
        )
      )) return false
      if (selections.accessMode.length && !selections.accessMode.includes(p.accessMode)) return false
      return true
    })
  }, [query, selections])

  const totalFilters = selections.targetGroup.length + selections.function.length + selections.accessMode.length
  const shellClass = embedded
    ? 'h-full min-h-0 flex flex-col bg-slate-50 animate-fade-in rounded-xl border border-slate-200 overflow-hidden'
    : 'fixed inset-0 z-50 flex flex-col bg-slate-50 animate-fade-in'

  return (
    <div className={shellClass}>
      {/* Header */}
      <div className="bg-white border-b border-slate-100 shadow-sm flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">Services directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {results.length} of {PROGRAMS.length} programs
              {totalFilters > 0 && ` · ${totalFilters} filter${totalFilters > 1 ? 's' : ''} active`}
              {' '}· Canberra & ACT
            </p>
          </div>
          {!embedded && (
            <button
              onClick={onClose}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              autoFocus
              type="search"
              placeholder="Search by program name, organisation, or keyword…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar
        openPanel={openPanel}
        togglePanel={togglePanel}
        selections={selections}
        toggleSelection={toggleSelection}
      />

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {results.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Search size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No programs match your search or filters</p>
              <button
                onClick={() => { setQuery(''); setSelections(FILTER_SELECTIONS) }}
                className="mt-3 text-xs text-brand-600 hover:underline"
              >
                Clear search and filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map(p => <ProgramCard key={p.id} program={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-slate-200 bg-white flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap gap-x-4 gap-y-1 justify-center">
          {Object.entries(FUNCTION_COLORS).slice(0, 5).map(([label, cls]) => (
            <span key={label} className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cls}`}>
              {label}
            </span>
          ))}
          <span className="text-[10px] text-slate-400">+ more function types</span>
        </div>
        <p className="text-xs text-slate-400 text-center pb-3">
          All programs delivered by member organisations of the{' '}
          <strong className="text-slate-500">Mental Health Community Coalition of the ACT</strong>.
        </p>
      </div>
    </div>
  )
}
