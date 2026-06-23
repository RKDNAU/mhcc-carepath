import { ArrowLeft, ArrowRight, CheckCircle, ExternalLink, HeartHandshake, MapPin, Users } from 'lucide-react'
import PageOverlay from './PageOverlay'
import { SERVICE_OVERVIEWS, getServiceOverview } from '../data/serviceOverviews'

const PATHWAY_SOURCES = [
  { label: 'MHCC ACT crisis and services', url: 'https://mhccact.org.au/mental-health-services/' },
  { label: 'Medicare Mental Health', url: 'https://www.headtohealth.gov.au/' },
  { label: 'Healthdirect mental health information', url: 'https://www.healthdirect.gov.au/mental-illness' },
]

const SERVICE_PATHWAY_META = {
  'anxiety-depression': {
    connectedWith: ['Counselling or coaching', 'Low-intensity wellbeing support', 'Service navigation'],
    pathways: ['Self-referral where available', 'GP or Medicare Mental Health navigation', 'Phone or online support'],
  },
  'trauma-ptsd': {
    connectedWith: ['Trauma-informed counselling', 'Stabilisation support', 'Care coordination'],
    pathways: ['Warm referral from a support worker', 'GP or clinical referral where needed', 'Planned follow-up support'],
  },
  'support-groups': {
    connectedWith: ['Peer groups', 'Facilitated group programs', 'Community participation supports'],
    pathways: ['Self-referral', 'Community organisation intake', 'Provider recommendation'],
  },
  'youth-services': {
    connectedWith: ['Youth-focused supports', 'Family-inclusive services', 'Kids Hub or age-appropriate pathways'],
    pathways: ['Family or carer enquiry', 'School or GP support pathway', 'Youth-friendly phone or online support'],
  },
  'relationships-family': {
    connectedWith: ['Family support', 'Carer support', 'Relationship or parenting assistance'],
    pathways: ['Carer or family intake', 'Referral from another service', 'Community-based support'],
  },
  'substance-use': {
    connectedWith: ['Coordinated mental health support', 'Alcohol and other drug-aware services', 'Navigation support'],
    pathways: ['Service navigation', 'Referral from health or community provider', 'Coordinated care planning'],
  },
  'aged-care-support': {
    connectedWith: ['Older-person wellbeing support', 'Community connection', 'Navigation and continuity support'],
    pathways: ['Self or family enquiry', 'GP or community referral', 'Phone or outreach support'],
  },
  'eating-disorders': {
    connectedWith: ['Care planning', 'Referral navigation', 'Recovery-oriented mental health support'],
    pathways: ['GP or mental health care pathway', 'Specialist referral where needed', 'Support while finding appropriate care'],
  },
}

function SummaryList({ title, items }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-3">{title}</h3>
      <ul className="space-y-2.5">
        {items.map(item => (
          <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-slate-600">
            <CheckCircle size={15} className="text-brand-600 flex-shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SourceLinks() {
  return (
    <div className="flex flex-wrap gap-3">
      {PATHWAY_SOURCES.map(source => (
        <a
          key={source.url}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-900 hover:underline"
        >
          {source.label}
          <ExternalLink size={11} />
        </a>
      ))}
    </div>
  )
}

function ServiceNav({ service, onNavigate, onClose }) {
  const index = SERVICE_OVERVIEWS.findIndex(item => item.slug === service.slug)
  const previous = SERVICE_OVERVIEWS[(index + SERVICE_OVERVIEWS.length - 1) % SERVICE_OVERVIEWS.length]
  const next = SERVICE_OVERVIEWS[(index + 1) % SERVICE_OVERVIEWS.length]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <button
        onClick={() => onNavigate(previous.slug)}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} />
        {previous.title}
      </button>
      <button
        onClick={onClose}
        className="text-sm font-semibold text-brand-700 hover:text-brand-900 transition-colors"
      >
        Back to services
      </button>
      <button
        onClick={() => onNavigate(next.slug)}
        className="inline-flex items-center justify-end gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
      >
        {next.title}
        <ArrowRight size={16} />
      </button>
    </div>
  )
}

export default function ServiceOverviewPage({ slug, onClose, onNavigate, onSeekSupport }) {
  const service = getServiceOverview(slug) || SERVICE_OVERVIEWS[0]
  const hasSpecificMatches = service.programCount > 0
  const pathwayMeta = SERVICE_PATHWAY_META[service.slug] || SERVICE_PATHWAY_META['anxiety-depression']

  return (
    <PageOverlay
      title={service.title}
      subtitle="Services available across the ACT mental health sector"
      onClose={onClose}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-8">
        <ServiceNav service={service} onNavigate={onNavigate} onClose={onClose} />

        <section className="rounded-3xl bg-gradient-to-br from-brand-800 to-brand-700 p-6 sm:p-8 text-white">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-100 mb-3">Service overview</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">{service.title}</h1>
            <p className="text-brand-50 text-lg leading-relaxed">{service.intro}</p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() => onSeekSupport(service.supportTypes)}
              className="inline-flex items-center gap-2 rounded-xl bg-highlight px-5 py-3 text-sm font-bold text-white shadow-md hover:brightness-90 transition-all"
            >
              <HeartHandshake size={17} />
              Seek support
            </button>
            <div className="rounded-xl bg-white/10 px-4 py-3 text-sm text-brand-50">
              {hasSpecificMatches
                ? `${service.programCount} relevant program${service.programCount === 1 ? '' : 's'} across ${service.organisationCount} organisation${service.organisationCount === 1 ? '' : 's'}`
                : 'Broader sector services may still be relevant'}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-4">
              <Users size={18} />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{service.organisationCount}</p>
            <p className="text-sm text-slate-500 mt-1">organisations represented in this view</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-4">
              <MapPin size={18} />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{service.accessModes.length}</p>
            <p className="text-sm text-slate-500 mt-1">common ways services can be accessed</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-4">
              <CheckCircle size={18} />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">
              {service.shortestWait ? `${service.shortestWait}+` : 'Varied'}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {service.shortestWait ? 'days is the shortest listed wait' : 'wait times depend on the service'}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">What this can include</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SummaryList title="Support styles" items={service.supportStyles} />
            <SummaryList title="Who services commonly support" items={service.demographics} />
            <SummaryList title="How support may be accessed" items={service.accessModes} />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Common pathways</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SummaryList title="You might be connected with" items={pathwayMeta.connectedWith} />
            <SummaryList title="Common access pathways" items={pathwayMeta.pathways} />
            <SummaryList title="When to seek urgent help" items={['Call 000 if anyone is in immediate danger', 'Call Access Mental Health ACT on 1800 629 354 for urgent ACT mental health support', 'Call Lifeline on 13 11 14 if overwhelmed or unsafe']} />
          </div>
          <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-800 mb-2">Source links</p>
            <SourceLinks />
          </div>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-brand-50 p-6">
          <h2 className="text-xl font-bold text-brand-950 mb-2">Not sure whether this fits?</h2>
          <p className="text-sm leading-relaxed text-brand-800 max-w-3xl">
            You do not need to know the exact service type before asking for help. The intake form lets
            you choose more than one need, describe what is happening in your own words, and change the
            pre-selected option before you submit anything.
          </p>
          <button
            onClick={() => onSeekSupport(service.supportTypes)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-highlight px-5 py-3 text-sm font-bold text-white shadow-md hover:brightness-90 transition-all"
          >
            <HeartHandshake size={17} />
            Seek support
          </button>
        </section>

        <ServiceNav service={service} onNavigate={onNavigate} onClose={onClose} />
      </div>
    </PageOverlay>
  )
}
