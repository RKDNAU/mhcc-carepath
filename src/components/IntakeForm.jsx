import { useState } from 'react'
import { X, ChevronRight, ChevronLeft, CheckCircle, Heart, AlertTriangle, ExternalLink } from 'lucide-react'
import carePath from '/img/CarePath.png'
import { apiPost } from '../api/client'

const SEEKER_GROUPS = [
  'Adult',
  'Youth',
  'Carer',
  'Family',
  'Person with psychosocial disability',
  'LGBTQIA+',
  'Culturally and Linguistically Diverse community member',
  'Aboriginal or Torres Strait Islander',
  'Justice-involved',
  'Other',
]

const SUPPORT_TYPES = [
  'Anxiety / Stress',
  'Depression',
  'Trauma / PTSD',
  'Grief & Loss',
  'Relationship Issues',
  'Family / Parenting',
  'Substance Use',
  'Eating Disorders',
  'Youth Mental Health',
  'Aged Care Support',
  'Other',
]

const ACCESS_MODES = [
  'Self-referral',
  'Outreach / proactive reach-in',
  'Referral required',
  'Walk-in',
  'Phone / online',
  'Appointment',
  'Other',
]

const GENDER_OPTIONS = [
  'Male', 'Female', 'Non-binary', 'Prefer not to say', 'Prefer to self-describe',
]

const URGENCY_OPTIONS = [
  { value: 'low',    label: 'I can wait', sub: 'Within a few weeks' },
  { value: 'medium', label: 'Soon',       sub: 'Within a week'      },
  { value: 'high',   label: 'Urgent',     sub: 'Within 1–2 days'   },
  { value: 'crisis', label: 'Crisis',     sub: 'I need help now'    },
]

const URGENCY_COLORS = {
  low:    { active: 'border-emerald-400 bg-emerald-50', dot: 'bg-emerald-400' },
  medium: { active: 'border-amber-400   bg-amber-50',   dot: 'bg-amber-400'   },
  high:   { active: 'border-orange-400  bg-orange-50',  dot: 'bg-orange-400'  },
  crisis: { active: 'border-red-400     bg-red-50',     dot: 'bg-red-400'     },
}

const CRISIS_ORGS = [
  { name: 'Lifeline', url: 'https://www.lifeline.org.au', phone: '13 11 14', tel: '131114' },
  { name: 'ACT Mental Health Triage', url: 'https://www.health.act.gov.au/services-and-programs/mental-health', phone: '1800 629 354', tel: '1800629354' },
]

const INITIAL_FORM = {
  firstName: '', lastName: '', dob: '', email: '', phone: '', suburb: '', gender: '',
  genderSelfDescribe: '',
  seekerGroups: [], seekerGroupOther: '',
  supportTypes: [], supportTypeOther: '', urgency: '', description: '', previousServices: '',
  accessModes: [], accessModeOther: '',
  contactMethod: [], contactTime: '', specialRequirements: '',
  consentData: false, consentCrisis: false,
}

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              n < current
                ? 'bg-brand-600 text-white'
                : n === current
                ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {n < current ? <CheckCircle size={16} /> : n}
          </div>
          {n < total && (
            <div
              className={`h-0.5 w-8 sm:w-16 rounded-full transition-all duration-300 ${
                n < current ? 'bg-brand-500' : 'bg-slate-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function ToggleChip({ id, label, checked, onChange }) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border cursor-pointer transition-all duration-150 text-sm select-none ${
        checked
          ? 'border-brand-400 bg-brand-50 text-brand-800 font-medium'
          : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300'
      }`}
    >
      <input id={id} type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <span
        className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all ${
          checked ? 'bg-brand-600 border-brand-600' : 'border-slate-300'
        }`}
      >
        {checked && (
          <svg viewBox="0 0 10 8" fill="none" className="w-2.5">
            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </label>
  )
}

function OtherInput({ value, onChange }) {
  return (
    <div className="mt-2 animate-fade-in">
      <input
        className="form-input text-sm"
        maxLength={255}
        placeholder="Please describe (optional)…"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

function Step1({ data, update }) {
  const toggle = (field, value) => {
    const current = data[field]
    update(field, current.includes(value) ? current.filter(v => v !== value) : [...current, value])
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">About you</h2>
        <p className="text-slate-500 text-sm">Your details are kept strictly confidential.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">First name <span className="text-red-400">*</span></label>
          <input className="form-input" placeholder="Jane" value={data.firstName} onChange={e => update('firstName', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Last name <span className="text-red-400">*</span></label>
          <input className="form-input" placeholder="Smith" value={data.lastName} onChange={e => update('lastName', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Date of birth <span className="text-red-400">*</span></label>
          <input type="date" className="form-input" value={data.dob} onChange={e => update('dob', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Gender identity</label>
          <select className="form-input" value={data.gender} onChange={e => update('gender', e.target.value)}>
            <option value="">Prefer not to say</option>
            {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {data.gender === 'Prefer to self-describe' && (
        <div>
          <label className="form-label">How do you identify?</label>
          <input className="form-input" placeholder="Your identity" value={data.genderSelfDescribe} onChange={e => update('genderSelfDescribe', e.target.value)} />
        </div>
      )}

      <div>
        <label className="form-label">Email address <span className="text-red-400">*</span></label>
        <input type="email" className="form-input" placeholder="jane@example.com" value={data.email} onChange={e => update('email', e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Phone number <span className="text-red-400">*</span></label>
          <input type="tel" className="form-input" placeholder="04xx xxx xxx" value={data.phone} onChange={e => update('phone', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Suburb <span className="text-red-400">*</span></label>
          <input className="form-input" placeholder="e.g. Belconnen" value={data.suburb} onChange={e => update('suburb', e.target.value)} />
        </div>
      </div>

      {/* Seeker group */}
      <div>
        <label className="form-label">
          Which of the following describes you or the person you're seeking support for?{' '}
          <span className="text-red-400">*</span>
          <span className="text-slate-400 font-normal ml-1">(select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2 mt-2">
          {SEEKER_GROUPS.map(g => (
            <ToggleChip
              key={g}
              id={`grp-${g}`}
              label={g}
              checked={data.seekerGroups.includes(g)}
              onChange={() => toggle('seekerGroups', g)}
            />
          ))}
        </div>
        {data.seekerGroups.includes('Other') && (
          <OtherInput
            value={data.seekerGroupOther}
            onChange={val => update('seekerGroupOther', val)}
          />
        )}
      </div>
    </div>
  )
}

function Step2({ data, update }) {
  const toggle = (field, value) => {
    const current = data[field]
    update(field, current.includes(value) ? current.filter(v => v !== value) : [...current, value])
  }

  return (
    <div className="space-y-7 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Your needs</h2>
        <p className="text-slate-500 text-sm">Help us understand what you're looking for.</p>
      </div>

      {/* Support types */}
      <div>
        <label className="form-label">
          What type of support are you looking for?
          <span className="text-slate-400 font-normal ml-1">(select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2 mt-2">
          {SUPPORT_TYPES.map(t => (
            <ToggleChip
              key={t}
              id={`type-${t}`}
              label={t}
              checked={data.supportTypes.includes(t)}
              onChange={() => toggle('supportTypes', t)}
            />
          ))}
        </div>
        {data.supportTypes.includes('Other') && (
          <OtherInput
            value={data.supportTypeOther}
            onChange={val => update('supportTypeOther', val)}
          />
        )}
      </div>

      {/* Urgency */}
      <div>
        <label className="form-label">
          How urgent is your need? <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          {URGENCY_OPTIONS.map(opt => {
            const colors = URGENCY_COLORS[opt.value]
            const isSelected = data.urgency === opt.value
            return (
              <label
                key={opt.value}
                className={`flex flex-col items-center text-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                  isSelected ? colors.active : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input type="radio" name="urgency" value={opt.value} className="sr-only" checked={isSelected} onChange={() => update('urgency', opt.value)} />
                {isSelected && <span className={`w-2 h-2 rounded-full mb-1.5 ${colors.dot}`} />}
                <span className="font-semibold text-sm text-slate-800">{opt.label}</span>
                <span className="text-xs text-slate-500 mt-0.5">{opt.sub}</span>
              </label>
            )
          })}
        </div>
      </div>

      {data.urgency === 'crisis' && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">
            If you are in immediate danger, please call <strong>000</strong> or{' '}
            <strong>Lifeline on 13 11 14</strong>. This form is not monitored in real time.
          </p>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="form-label">Tell us a bit more about what you're looking for <span className="text-slate-400 font-normal">(optional)</span></label>
        <textarea
          className="form-input resize-none"
          rows={3}
          placeholder="You don't need to share more than you're comfortable with…"
          value={data.description}
          onChange={e => update('description', e.target.value)}
        />
      </div>

      {/* Previous services */}
      <div>
        <label className="form-label">Have you previously accessed mental health services?</label>
        <div className="flex gap-3 mt-2">
          {['Yes', 'No'].map(opt => (
            <label key={opt} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all ${
              data.previousServices === opt ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}>
              <input type="radio" name="prev" value={opt} className="sr-only" checked={data.previousServices === opt} onChange={() => update('previousServices', opt)} />
              {opt}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step3({ data, update, onPrivacy }) {
  const toggle = (field, value) => {
    const current = data[field]
    update(field, current.includes(value) ? current.filter(v => v !== value) : [...current, value])
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Your preferences</h2>
        <p className="text-slate-500 text-sm">Help us connect you in the way that works best for you.</p>
      </div>

      {/* Access modes */}
      <div>
        <label className="form-label">
          How would you like to access services?{' '}
          <span className="text-red-400">*</span>
          <span className="text-slate-400 font-normal ml-1">(select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2 mt-2">
          {ACCESS_MODES.map(mode => (
            <ToggleChip
              key={mode}
              id={`mode-${mode}`}
              label={mode}
              checked={data.accessModes.includes(mode)}
              onChange={() => toggle('accessModes', mode)}
            />
          ))}
        </div>
        {data.accessModes.includes('Other') && (
          <OtherInput
            value={data.accessModeOther}
            onChange={val => update('accessModeOther', val)}
          />
        )}
      </div>

      {/* Contact method */}
      <div>
        <label className="form-label">
          Preferred contact method
          <span className="text-slate-400 font-normal ml-1">(select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2 mt-2">
          {['Email', 'Phone call', 'SMS', 'Video call'].map(method => (
            <ToggleChip
              key={method}
              id={`contact-${method}`}
              label={method}
              checked={data.contactMethod.includes(method)}
              onChange={() => toggle('contactMethod', method)}
            />
          ))}
        </div>
      </div>

      {/* Contact time */}
      <div>
        <label className="form-label">Best time to contact</label>
        <select className="form-input" value={data.contactTime} onChange={e => update('contactTime', e.target.value)}>
          <option value="">No preference</option>
          <option>Morning (8am – 12pm)</option>
          <option>Afternoon (12pm – 5pm)</option>
          <option>Evening (5pm – 8pm)</option>
        </select>
      </div>

      {/* Special requirements */}
      <div>
        <label className="form-label">Any specific requirements? <span className="text-slate-400 font-normal">(optional)</span></label>
        <textarea
          className="form-input resize-none"
          rows={3}
          placeholder="Language requirements, cultural considerations, accessibility needs, etc."
          value={data.specialRequirements}
          onChange={e => update('specialRequirements', e.target.value)}
        />
      </div>

      {/* Consent */}
      <div className="space-y-3 pt-2">
        <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${data.consentData ? 'border-brand-400 bg-brand-50' : 'border-slate-200'}`}>
          <input type="checkbox" className="mt-0.5 w-4 h-4 accent-brand-600" checked={data.consentData} onChange={e => update('consentData', e.target.checked)} />
          <span className="text-sm text-slate-700">
            I consent to my information being used by the Mental Health Community Coalition of the ACT
            (MHCC ACT) to match me with appropriate mental health services. My data will be handled in
            accordance with the{' '}
            <button
              type="button"
              onClick={onPrivacy}
              className="text-brand-600 underline hover:text-brand-800 transition-colors"
            >
              Privacy Policy
            </button>. <span className="text-red-400">*</span>
          </span>
        </label>
        <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${data.consentCrisis ? 'border-brand-400 bg-brand-50' : 'border-slate-200'}`}>
          <input type="checkbox" className="mt-0.5 w-4 h-4 accent-brand-600" checked={data.consentCrisis} onChange={e => update('consentCrisis', e.target.checked)} />
          <span className="text-sm text-slate-700">
            I understand that CarePath is not a crisis service and that if I am in immediate danger I
            should contact emergency services (000) or Lifeline (13 11 14). <span className="text-red-400">*</span>
          </span>
        </label>
      </div>
    </div>
  )
}

function SuccessScreen({ data, onClose }) {
  return (
    <div className="text-center py-6 animate-slide-up">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-emerald-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-3">Intake submitted</h2>
      <p className="text-slate-500 mb-2 max-w-sm mx-auto">
        Thank you, <strong className="text-slate-700">{data.firstName}</strong>. Your intake has been
        received and is being reviewed by the MHCC ACT team.
      </p>
      <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
        We'll be in touch via{' '}
        {data.contactMethod.join(' or ') || 'your preferred contact method'} within 1–2 business days.
      </p>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 mb-8 max-w-sm mx-auto text-left">
        <p className="font-semibold mb-3">If your situation becomes urgent, contact:</p>
        <div className="space-y-2">
          {CRISIS_ORGS.map(({ name, url, phone, tel }) => (
            <div key={name} className="flex items-center justify-between gap-4">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-amber-900 hover:underline inline-flex items-center gap-1"
              >
                {name}
                <ExternalLink size={11} />
              </a>
              <a
                href={`tel:${tel}`}
                className="text-amber-700 hover:text-amber-900 font-mono font-semibold hover:underline"
              >
                {phone}
              </a>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium text-amber-900">Emergency services</span>
            <a href="tel:000" className="text-amber-700 hover:text-amber-900 font-mono font-semibold hover:underline">
              000
            </a>
          </div>
        </div>
      </div>

      <button onClick={onClose} className="btn-primary mx-auto">
        <Heart size={16} fill="currentColor" />
        Done
      </button>
    </div>
  )
}

export default function IntakeForm({ onClose, onPrivacy }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const TOTAL_STEPS = 3

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const canAdvance = () => {
    if (step === 1) {
      return formData.firstName && formData.lastName && formData.dob &&
             formData.email && formData.phone && formData.suburb &&
             formData.seekerGroups.length > 0
    }
    if (step === 2) {
      return !!formData.urgency
    }
    if (step === 3) {
      return formData.consentData && formData.consentCrisis && formData.accessModes.length > 0
    }
    return true
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1)
    } else {
      apiPost('/intakes', formData).catch(err => console.error('Intake submit failed:', err))
      setStep('success')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="relative bg-slate-50 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up border-t-[3px] border-highlight"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <img src={carePath} alt="CarePath" className="w-8 h-8 rounded-lg object-contain" />
            <span className="font-semibold text-slate-900 text-sm">Seek support - CarePath</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step !== 'success' && <StepIndicator current={step} total={TOTAL_STEPS} />}
          {step === 1 && <Step1 data={formData} update={update} />}
          {step === 2 && <Step2 data={formData} update={update} />}
          {step === 3 && <Step3 data={formData} update={update} onPrivacy={onPrivacy} />}
          {step === 'success' && <SuccessScreen data={formData} onClose={onClose} />}
        </div>

        {/* Footer nav */}
        {step !== 'success' && (
          <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-100 flex-shrink-0">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <span className="text-xs text-slate-400">Step {step} of {TOTAL_STEPS}</span>
            <button
              onClick={handleNext}
              disabled={!canAdvance()}
              className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200"
            >
              {step === TOTAL_STEPS ? 'Submit' : 'Continue'}
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
