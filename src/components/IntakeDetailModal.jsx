import { useState, useMemo, useRef, useLayoutEffect } from 'react'
import { X, Heart, Plus } from 'lucide-react'
import { PROGRAMS } from '../data/programs'
import { getTopMatchesWithScores } from './SharedIntake'
import { useData } from '../context/DataContext'
import { COLORS } from '../constants/theme'

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

function FitnessFactor({ label, value, tone = 'slate' }) {
  if (!value) return null
  const dotCls = tone === 'positive' ? 'bg-emerald-500'
               : tone === 'caution'  ? 'bg-amber-500'
               : tone === 'muted'    ? 'bg-slate-300'
               :                       'bg-brand-500'
  return (
    <div className="flex items-start gap-2">
      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${dotCls}`} />
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">{label}</p>
        <p className="text-xs text-slate-700 leading-snug">{value}</p>
      </div>
    </div>
  )
}

function listText(values, fallback) {
  return values?.length ? values.join(', ') : fallback
}

function MatchFitnessTooltip({ match, intake, visible, modalBodyRef }) {
  const tooltipRef = useRef(null)
  const [shiftY, setShiftY] = useState(0)
  const hasMatchedNeeds = match.matchedGroups.length || match.matchedTypes.length
  const hasGaps = match.unmatchedGroups.length || match.unmatchedTypes.length
  const programAccess = Array.isArray(match.program.accessModes)
    ? match.program.accessModes.join(', ')
    : match.program.accessMode
  const accessText = match.matchedAccess.length
    ? `Offers requested access: ${match.matchedAccess.join(', ')}`
    : match.unmatchedAccess.length
    ? `Preferred access mode not offered. Program has ${programAccess}.`
    : `Program access is ${programAccess}.`
  const demographicText = match.ageGroup
    ? `${match.demographicFit}% Positive Outcomes for ${match.ageGroup} cohort for ${intake.gender || 'the intake gender'} persons.`
    : 'No age cohort could be derived for this intake.'
  const availabilityText = match.waitlistDepth === 0
    ? 'No current waitlist.'
    : `Current waitlist of ${match.waitlistDepth}.`

  useLayoutEffect(() => {
    if (!visible || !tooltipRef.current || !modalBodyRef.current) return
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const bodyRect = modalBodyRef.current.getBoundingClientRect()
    const maxBottom = bodyRect.bottom - 20
    const naturalBottom = tooltipRect.bottom - shiftY
    setShiftY(Math.min(0, maxBottom - naturalBottom))
  }, [visible, modalBodyRef, match.program.id, shiftY])

  if (!visible) return null

  return (
    <div
      ref={tooltipRef}
      className="pointer-events-none absolute left-4 right-4 top-full z-30 mt-2"
      style={{ transform: `translateY(${shiftY}px)` }}
    >
      <div className="rounded-xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur px-3 py-3">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Fitness Factors</p>
        <div className="space-y-2.5">
          <FitnessFactor
            label="Intake Particular Matches"
            tone={hasMatchedNeeds ? 'positive' : 'muted'}
            value={[
              listText(match.matchedGroups, null),
              listText(match.matchedTypes, null),
            ].filter(Boolean).join(', ') || 'No direct intake particular matches identified.'}
          />
          <FitnessFactor
            label="Intake Particular Non-Matches"
            tone={hasGaps ? 'caution' : 'positive'}
            value={[
              listText(match.unmatchedGroups, null),
              listText(match.unmatchedTypes, null),
            ].filter(Boolean).join(', ') || 'All requested describes and support types are covered.'}
          />
          <FitnessFactor label="Access" tone={match.matchedAccess.length ? 'positive' : 'caution'} value={accessText} />
          <FitnessFactor label="Demographics" tone={match.demographicFit >= 60 ? 'positive' : 'caution'} value={demographicText} />
          <FitnessFactor
            label="Availability"
            tone={match.waitlistDepth === 0 && match.hasCapacity ? 'positive' : 'caution'}
            value={`${match.hasCapacity ? 'Capacity is listed as available.' : 'No listed spare capacity.'} ${availabilityText}`}
          />
        </div>
      </div>
    </div>
  )
}

export default function IntakeDetailModal({ intake, onClose, onRouted }) {
  const { routeIntake, routeCarePlan, memberSharedData } = useData()
  const modalBodyRef = useRef(null)
  const [selectedProgramId, setSelectedProgramId] = useState('')
  const [routeMode, setRouteMode] = useState('single')
  const [activeTabId, setActiveTabId] = useState('support-0')
  const [multiSelections, setMultiSelections] = useState({})
  const [carePlan, setCarePlan] = useState([])
  const [extraTabs, setExtraTabs] = useState([])
  const [hoveredMatch, setHoveredMatch] = useState(null)
  const [isRouting, setIsRouting] = useState(false)
  const [routeError, setRouteError] = useState(null)

  const matches = useMemo(() => getTopMatchesWithScores(intake, 2, memberSharedData), [intake, memberSharedData])
  const supportTypes = intake.supportTypes?.length ? intake.supportTypes : ['General support']
  const carePlanTabs = useMemo(() => [
    ...supportTypes.map((type, index) => ({
      id: `support-${index}`,
      label: type,
      supportType: type,
      ignoreSupportTypes: false,
    })),
    ...extraTabs,
  ], [supportTypes, extraTabs])
  const activeTab = carePlanTabs.find(tab => tab.id === activeTabId) || carePlanTabs[0]
  const multiMatchesByType = useMemo(() => {
    const entries = carePlanTabs.map(tab => [
      tab.id,
      getTopMatchesWithScores(
        { ...intake, supportTypes: tab.ignoreSupportTypes || tab.supportType === 'General support' ? [] : [tab.supportType] },
        2,
        memberSharedData,
        { ignoreSupportTypes: tab.ignoreSupportTypes }
      ),
    ])
    return Object.fromEntries(entries)
  }, [intake, memberSharedData, carePlanTabs])

  const programsByOrg = useMemo(() => {
    const groups = {}
    PROGRAMS.forEach(p => { if (!groups[p.orgName]) groups[p.orgName] = []; groups[p.orgName].push(p) })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [])

  const activeMultiProgramId = multiSelections[activeTab?.id] || ''
  const activeMultiProgram = PROGRAMS.find(p => p.id === activeMultiProgramId)
  const activeProgramAlreadyAdded = !!activeTab && carePlan.some(item =>
    item.program.id === activeMultiProgramId && item.supportTypes.includes(activeTab.supportType)
  )
  const selectedProg = PROGRAMS.find(p => p.id === selectedProgramId)

  const handleRoute = async () => {
    if (isRouting) return
    if (routeMode === 'single' && !selectedProgramId) return
    if (routeMode === 'multi' && carePlan.length === 0) return
    setRouteError(null)
    setIsRouting(true)
    try {
      if (routeMode === 'multi') {
        await routeCarePlan(intake.id, carePlan)
        onRouted?.(carePlan.map(item => item.program))
      } else {
        await routeIntake(intake.id, selectedProg)
        onRouted?.(selectedProg)
      }
    } catch (err) {
      setRouteError('Routing failed — please try again.')
      setIsRouting(false)
    }
  }

  function selectMultiProgram(tabId, programId) {
    setMultiSelections(prev => ({ ...prev, [tabId]: programId }))
  }

  function addToCarePlan() {
    if (!activeMultiProgram || !activeTab) return
    setCarePlan(prev => {
      const existing = prev.find(item => item.program.id === activeMultiProgram.id)
      if (existing?.supportTypes.includes(activeTab.supportType)) return prev
      if (existing) {
        return prev.map(item => item.program.id === activeMultiProgram.id
          ? { ...item, supportTypes: [...item.supportTypes, activeTab.supportType] }
          : item
        )
      }
      return [...prev, { supportTypes: [activeTab.supportType], program: activeMultiProgram }]
    })
  }

  function removeFromCarePlan(programId) {
    setCarePlan(prev => prev.filter(item => item.program.id !== programId))
  }

  function addExtraTab() {
    const nextIndex = extraTabs.length + 1
    const tab = {
      id: `extra-${Date.now()}-${nextIndex}`,
      label: `New ${nextIndex}`,
      supportType: `New ${nextIndex}`,
      ignoreSupportTypes: true,
    }
    setExtraTabs(prev => [...prev, tab])
    setActiveTabId(tab.id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-slide-up border-t-[3px]"
        style={{ borderColor: COLORS.highlight }}
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
        <div ref={modalBodyRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

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
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Urgency</p>
                <span className={`inline-flex text-xs px-2.5 py-1 rounded-full ${URGENCY_CLS[intake.urgency]}`}>
                  {URGENCY_LABELS[intake.urgency]}
                </span>
              </div>
              <TagList label="Access modes" values={intake.accessModes} />
            </div>
            <TagList label="Describes" values={intake.seekerGroups} />
            <TagList label="Seeking support for" values={intake.supportTypes} />
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Field label="Previously accessed services" value={intake.previousServices || 'Not specified'} />
              <Field label="Best time to contact" value={intake.contactTime || 'No preference'} />
            </div>
            {intake.description && <Field label="Additional context" value={intake.description} />}
          </section>

          {(intake.contactMethod?.length || intake.specialRequirements) && (
            <>
              <div className="border-t border-slate-100" />

              {/* Preferences */}
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Preferences</h3>
                <TagList label="Contact method" values={intake.contactMethod} />
                {intake.specialRequirements && <Field label="Special requirements" value={intake.specialRequirements} />}
              </section>
            </>
          )}

          <div className="border-t border-slate-100" />

          {/* Top service matches */}
          <section>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Top service matches</h3>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5">
                {[
                  ['single', 'Single'],
                  ['multi', 'Multi'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRouteMode(key)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                      routeMode === key
                        ? 'bg-white text-brand-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {routeMode === 'single' && (matches.length === 0 ? (
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
                      tabIndex={0}
                      className={`group relative rounded-xl p-3 cursor-pointer transition-all border hover:z-20 focus-within:z-20 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                        selectedProgramId === m.program.id
                          ? 'bg-brand-50 border-brand-200'
                          : 'bg-slate-50 hover:bg-brand-50 border-transparent'
                      }`}
                      onClick={() => setSelectedProgramId(m.program.id)}
                      onMouseEnter={() => setHoveredMatch(`single-${m.program.id}`)}
                      onMouseLeave={() => setHoveredMatch(null)}
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
                      <MatchFitnessTooltip
                        match={m}
                        intake={intake}
                        visible={hoveredMatch === `single-${m.program.id}`}
                        modalBodyRef={modalBodyRef}
                      />
                    </div>
                  )
                })}
              </div>
            ))}
            {routeMode === 'multi' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {carePlanTabs.map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTabId(tab.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        activeTab?.id === tab.id
                          ? 'text-white border-brand-600 bg-brand-600'
                          : 'text-slate-600 border-slate-200 hover:border-brand-400'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={addExtraTab}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-dashed border-slate-300 text-slate-500 hover:border-brand-400 hover:text-brand-700 transition-colors"
                  >
                    <Plus size={12} />
                    New
                  </button>
                </div>

                <div className="space-y-3 min-h-[142px]">
                  {(multiMatchesByType[activeTab?.id] || []).map(m => {
                    const pctCls = m.matchPercent >= 80 ? 'text-emerald-700'
                                 : m.matchPercent >= 65 ? 'text-amber-700' : 'text-slate-500'
                    const wlCls  = m.waitlistDepth > 5 ? 'text-red-600'
                                 : m.waitlistDepth > 0 ? 'text-amber-600' : 'text-emerald-600'
                    return (
                      <div
                        key={m.program.id}
                        tabIndex={0}
                        className={`group relative min-h-[62px] rounded-xl p-3 cursor-pointer transition-colors border hover:z-20 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                          activeMultiProgramId === m.program.id
                            ? 'bg-brand-50 border-brand-200'
                            : 'bg-slate-50 hover:bg-brand-50 border-transparent'
                        }`}
                        onClick={() => selectMultiProgram(activeTab.id, m.program.id)}
                        onMouseEnter={() => setHoveredMatch(`multi-${activeTab.id}-${m.program.id}`)}
                        onMouseLeave={() => setHoveredMatch(null)}
                      >
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
                        <MatchFitnessTooltip
                          match={m}
                          intake={{ ...intake, supportTypes: activeTab.ignoreSupportTypes ? [] : [activeTab.supportType] }}
                          visible={hoveredMatch === `multi-${activeTab.id}-${m.program.id}`}
                          modalBodyRef={modalBodyRef}
                        />
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-2">
                  <select
                    value={activeMultiProgramId}
                    onChange={e => selectMultiProgram(activeTab.id, e.target.value)}
                    disabled={isRouting}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                  >
                    <option value="">Select a program for {activeTab?.label}...</option>
                    {programsByOrg.map(([orgName, progs]) => (
                      <optgroup key={orgName} label={orgName}>
                        {progs.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addToCarePlan}
                    disabled={!activeMultiProgramId || activeProgramAlreadyAdded || isRouting}
                    className="w-full inline-flex items-center justify-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
                    style={{ backgroundColor: activeMultiProgramId && !activeProgramAlreadyAdded && !isRouting ? COLORS.highlight : '#94a3b8' }}
                  >
                    <Plus size={15} />
                    Add to Care Plan
                  </button>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Care Plan</p>
                  {carePlan.length === 0 ? (
                    <p className="text-xs text-slate-400">No programs added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {carePlan.map(item => (
                        <div key={item.program.id} className="flex items-start justify-between gap-3 bg-white border border-slate-100 rounded-lg px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-brand-700">{item.supportTypes.join(', ')}</p>
                            <p className="text-xs font-semibold text-slate-900 leading-snug">{item.program.name}</p>
                            <p className="text-[11px] text-slate-400">{item.program.orgName}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCarePlan(item.program.id)}
                            className="text-[11px] font-semibold text-slate-400 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          <div className="border-t border-slate-100" />

          {/* Route referral */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Route referral</h3>
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                {routeMode === 'multi'
                  ? 'Commit the care plan to route this intake to each selected program.'
                  : 'Select a program to route this referral. The top matches above are recommended, but any program can be selected.'}
              </p>
              {routeMode === 'single' && (
              <select
                value={selectedProgramId}
                onChange={e => setSelectedProgramId(e.target.value)}
                disabled={isRouting}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
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
              )}
              {routeError && (
                <p className="text-xs text-red-600">{routeError}</p>
              )}
              <button
                onClick={handleRoute}
                disabled={(routeMode === 'single' ? !selectedProgramId : carePlan.length === 0) || isRouting}
                className="w-full inline-flex items-center justify-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed text-white"
                style={{ backgroundColor: (routeMode === 'single' ? selectedProgramId : carePlan.length > 0) && !isRouting ? COLORS.highlight : '#94a3b8' }}
              >
                <Heart size={15} fill="currentColor" />
                {isRouting ? 'Routing...' : routeMode === 'multi' ? 'Route care plan' : 'Route referral'}
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
