import { Phone, Mail, MapPin, Clock, ExternalLink, BadgeCheck } from 'lucide-react'

const VALUES = [
  {
    title: 'Respect',
    desc: 'Valuing every person and ensuring they feel seen, heard, and treated fairly.',
  },
  {
    title: 'Creativity',
    desc: 'Believing there is always a way forward through innovative solutions.',
  },
  {
    title: 'Care',
    desc: 'Creating a supportive, safe, and understanding environment.',
  },
  {
    title: 'Enjoyment',
    desc: 'Celebrating progress and learning together.',
  },
]

const ACCREDITATIONS = [
  'NDIS Registered Provider',
  'ACT Platinum Recognised Healthier Workplace',
  'Canberra Business Chamber – Disability Action Pledge',
]

export default function MyOrganisation() {
  return (
    <div className="max-w-4xl space-y-6">

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Nexus Human Services</h2>
            <p className="text-highlight font-medium mt-1 italic">"Your Journey. Our Support."</p>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-xl">
              A community-based organisation supporting people with disability and psychosocial
              wellbeing across Canberra and Queanbeyan for over 30 years. Nexus delivers NDIS
              supports focused on employment, life skills, personal care, community participation,
              and life transitions.
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

        {/* Contact details */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Contact</h3>
          <div className="space-y-3 text-sm">
            <a
              href="tel:1800163987"
              className="flex items-center gap-3 text-slate-700 hover:text-brand-600 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Phone size={14} className="text-brand-600" />
              </div>
              1800 163 987
            </a>
            <a
              href="mailto:enquiries@nexushumanservices.com.au"
              className="flex items-center gap-3 text-slate-700 hover:text-brand-600 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Mail size={14} className="text-brand-600" />
              </div>
              enquiries@nexushumanservices.com.au
            </a>
            <div className="flex items-start gap-3 text-slate-600">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={14} className="text-brand-600" />
              </div>
              Level 01, Unit 67-68<br />10 Lonsdale Street, Braddon ACT 2612
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Clock size={14} className="text-brand-600" />
              </div>
              Monday - Friday, 9:00 am - 5:00 pm
            </div>
            <a
              href="https://nexushumanservices.com.au"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-brand-600 hover:text-brand-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                <ExternalLink size={14} className="text-brand-600" />
              </div>
              nexushumanservices.com.au
            </a>
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">At a glance</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '30+', label: 'Years in the community' },
              { value: '35',  label: 'Staff members'          },
              { value: 'ACT', label: 'Service territory'      },
              { value: 'NDIS', label: 'Registered provider'  },
            ].map(({ value, label }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-4">
                <p className="text-2xl font-extrabold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
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

      {/* CarePath membership */}
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-800">CarePath member organisation</p>
          <p className="text-xs text-brand-600 mt-0.5">
            Nexus Human Services is a registered member of the Mental Health Community Coalition of the ACT.
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
