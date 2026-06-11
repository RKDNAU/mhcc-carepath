import { Phone, Mail, MapPin, Clock, ExternalLink, BadgeCheck } from 'lucide-react'

const VALUES = [
  { title: 'Respect', desc: 'Honouring the dignity and unique story of every person we walk alongside.' },
  { title: 'Creativity', desc: 'Finding new paths when the obvious ones are blocked.' },
  { title: 'Care', desc: 'Showing up with warmth, consistency, and genuine concern.' },
  { title: 'Enjoyment', desc: 'Finding moments of lightness and marking milestones that matter.' },
]

const ACCREDITATIONS = [
  'Demo provider profile',
  'CarePath portal sample',
  'Fictional organisation',
]

export default function MyOrganisation({ provider }) {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{provider.orgName}</h2>
            <p className="text-highlight font-medium mt-1 italic">"{provider.tagline}"</p>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-xl">
              {provider.description}
            </p>
          </div>
          <div className="flex-shrink-0 text-right space-y-1.5">
            {ACCREDITATIONS.map(a => (
              <div key={a} className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 justify-end">
                <BadgeCheck size={12} />
                {a}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Contact</h3>
          <div className="space-y-3 text-sm">
            <a href="tel:1800247553" className="flex items-center gap-3 text-slate-700 hover:text-brand-600 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Phone size={14} className="text-brand-600" />
              </div>
              1800 247 553
            </a>
            <a href="mailto:demo@greenerpastures.example" className="flex items-center gap-3 text-slate-700 hover:text-brand-600 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Mail size={14} className="text-brand-600" />
              </div>
              demo@greenerpastures.example
            </a>
            <div className="flex items-start gap-3 text-slate-600">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={14} className="text-brand-600" />
              </div>
              Demo office<br />Canberra ACT 2601
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Clock size={14} className="text-brand-600" />
              </div>
              Monday - Friday, 8:30 am - 4:30 pm
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">At a glance</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: 'Demo', label: 'Provider profile' },
              { value: '2', label: 'Controlled programs' },
              { value: 'ACT', label: 'Service territory' },
              { value: 'Mock', label: 'Data source' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-4">
                <p className="text-2xl font-extrabold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Our values</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {VALUES.map(({ title, desc }) => (
            <div key={title} className="bg-slate-50 rounded-xl p-4">
              <p className="font-bold text-brand-700 mb-1.5">{title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-800">CarePath demo organisation</p>
          <p className="text-xs text-brand-600 mt-0.5">
            {provider.orgName} is fictional and does not represent a real MHCC member organisation.
          </p>
        </div>
        <a
          href="https://mhccact.org.au"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 text-xs font-medium text-brand-600 hover:underline inline-flex items-center gap-1"
        >
          MHCC ACT
          <ExternalLink size={11} />
        </a>
      </div>
    </div>
  )
}
