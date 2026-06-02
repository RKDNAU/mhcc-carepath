import { useState, useMemo } from 'react'
import { X, Heart, CheckCircle } from 'lucide-react'
import { PROGRAMS } from '../data/programs'
import { getTopMatchesWithScores } from './SharedIntake'

const URGENCY_LABELS = {
  low: 'Can wait', medium: 'Soon', high: 'Urgent', crisis: 'Crisis',
}
const URGENCY_CLS = {
  low: 'bg-emerald-50 text-emerald-700', medium: 'bg-amber-50 text-amber-700',
  high: 'bg-orange-50 text-orange-700', crisis: 'bg-red-50 text-red-700 font-semibold',
}

function ageFromDob(dob) {
  const today = new Date(), birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  if (today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--
  return age
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function Field({ label, value }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-slate-800">{value}</p>
    </div>
  )
}

function TagList({ label, values }) {
  if (!values?.length) return null
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {values.map(v => (
          <span key={v} className="text-xs bg-brand-50 text-brand-700 border border-brand-100 px-2 py-0.5 rounded-full">{v}</span>
        ))}
      </div>
    </div>
  )
}

export default function IntakeDetailModal({ intake, onClose }) {
  const [selectedProgramId, setSelectedProgramId] = useState('')
  const [routed, setRouted] = useState(false)

  const matches = useMemo(() => getTopMatchesWithScores(intake), [intake])

  const programsByOrg = useMemo(() => {
    const groups = {}
    PROGRAMS.forEach(p => { if (!groups[p.orgName]) groups[p.orgName] = []; groups[p.orgName].push(p) })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [])

  const handleRoute = () => {
    if (!selectedProgramId) return
    setRouted(true)
  }

  const selectedProg = PROGRAMS.find(p => p.id === selectedProgramId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-slide-up border-t-[3px]"
        style={{ borderColor: '#c8336d' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">Intake record</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Submitted {formatDate(intake.submittedAt)}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Personal details */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Personal details</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Field label="Age" value={`${ageFromDob(intake.dob)} years old`} />
              <Field label="Gender" value={intake.gender || 'Not specified'} />
              <Field label="Suburb" value={intake.suburb} />
              <Field label="Date of birth" value={formatDate(intake.dob)} />
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Support needs */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Support needs</h3>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Urgency</p>
              <span className={`inline-flex text-xs px-2.5 py-1 rounded-full ${URGENCY_CLS[intake.urgency]}`}>
                {URGENCY_LABELS[intake.urgency]}
              </span>
            </div>
            <TagList label="Describes" values={intake.seekerGroups} />
            <TagList label="Seeking support for" values={intake.supportTypes} />
            {intake.description && <Field label="Additional context" value={intake.description} />}
            <Field label="Previously accessed services" value={intake.previousServices || 'Not specified'} />
          </section>

          <div className="border-t border-slate-100" />

          {/* Preferences */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Preferences</h3>
            <TagList label="Access modes" values={intake.accessModes} />
            <TagList label="Contact method" values={intake.contactMethod} />
            <Field label="Best time to contact" value={intake.contactTime || 'No preference'} />
            {intake.specialRequirements && <Field label="Special requirements" value={intake.specialRequirements} />}
          </section>

          <div className="border-t border-slate-100" />

          {/* Top service matches */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Top service matches</h3>
            {matches.length === 0 ? (
              <p className="text-sm text-slate-400">No close program matches for this intake.</p>
            ) : (
              <div className="space-y-3">
                {matches.map(m => {
                  const pctCls = m.matchPercent >= 80 ? 'text-emerald-700'
                               : m.matchPercent >= 65 ? 'text-amber-700' : 'text-slate-500'
                  const wlCls  = m.waitlistDepth > 5 ? 'text-red-600'
                               : m.waitlistDepth > 0 ? 'text-amber-600' : 'text-emerald-600'
                  return (
                    <div
                      key={m.program.id}
                      className={`rounded-xl p-3 cursor-pointer transition-all border ${
                        selectedProgramId === m.program.id
                          ? 'bg-brand-50 border-brand-200'
                          : 'bg-slate-50 hover:bg-brand-50 border-transparent'
                      }`}
                      onClick={() => setSelectedProgramId(m.program.id)}
                      title="Click to select for routing"
                    >
                      {/* Header row */}
                      <div className="flex items-start gap-3">
                        <div className="text-center flex-shrink-0 w-12">
                          <p className={`text-lg font-extrabold leading-none ${pctCls}`}>{m.matchPercent}%</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">match</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 leading-snug">{m.program.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{m.program.orgName}</p>
                        </div>
                        <span className={`text-[11px] font-semibold flex-shrink-0 ${wlCls}`}>
                          {m.waitlistDepth === 0 ? 'No waitlist' : `WL: ${m.waitlistDepth}`}
                        </span>
                      </div>

                      {/* Criteria badges */}
                      <div className="flex flex-wrap gap-1 mt-2.5 pl-15">
                        {[...m.matchedGroups, ...m.matchedTypes, ...m.matchedAccess].map(v => (
                          <span key={v} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full">{v}</span>
                        ))}
                        {[...m.unmatchedGroups, ...m.unmatchedTypes, ...m.unmatchedAccess].map(v => (
                          <span key={v} className="text-[10px] bg-slate-100 text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded-full">{v}</span>
                        ))}
                      </div>

                      {/* Demographic fit */}
                      {m.ageGroup && (
                        <p className="text-[11px] text-slate-500 mt-2 pl-15">
                          <span className={`font-bold ${m.demographicFit >= 75 ? 'text-emerald-700' : m.demographicFit >= 60 ? 'text-amber-700' : 'text-slate-600'}`}>
                            {m.demographicFit}%
                          </span>
                          {' '}demographic fit · {m.ageGroup} age group
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <div className="border-t border-slate-100" />

          {/* Route referral */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Route referral</h3>

            {routed ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fade-in">
                <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Referral routed</p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    This intake has been routed to <strong>{selectedProg?.name}</strong> ({selectedProg?.orgName}).
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Select a program to route this referral. The top matches above are recommended,
                  but any program can be selected.
                </p>
                <select
                  value={selectedProgramId}
                  onChange={e => setSelectedProgramId(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select a program…</option>
                  {programsByOrg.map(([orgName, progs]) => (
                    <optgroup key={orgName} label={orgName}>
                      {progs.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <button
                  onClick={handleRoute}
                  disabled={!selectedProgramId}
                  className="w-full inline-flex items-center justify-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed text-white"
                  style={{ backgroundColor: selectedProgramId ? '#c8336d' : '#94a3b8' }}
                >
                  <Heart size={15} fill="currentColor" />
                  Route referral
                </button>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  )
}
