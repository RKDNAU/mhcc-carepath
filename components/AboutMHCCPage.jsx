import { ExternalLink, BadgeCheck, Building2, Users, CalendarDays, Phone, Mail, MapPin } from 'lucide-react'
import PageOverlay from './PageOverlay'

const FOCUS_AREAS = [
  {
    title: 'Loneliness & Social Isolation',
    body: 'More than one in four Canberrans report feeling lonely often. MHCC ACT advocates for systemic approaches — improving community design, work-life balance, and reducing technology-driven isolation — to address the mental health impacts of social disconnection.',
  },
  {
    title: 'Perinatal Mental Health',
    body: 'The coalition champions community-based support for expecting and new parents through peer connection, counselling, and practical resources. Through the ACT Perinatal Mental Health Alliance, MHCC ACT works to integrate and strengthen the perinatal service system.',
  },
  {
    title: 'Justice and Mental Health',
    body: 'MHCC ACT supports health-centred approaches in the justice system, including drug decriminalization and raising the age of criminal responsibility — advocating for humane, evidence-based service delivery at the intersection of mental health and justice.',
  },
  {
    title: 'Climate Change and Mental Wellbeing',
    body: 'The coalition recognises the mental health impacts of climate change, from trauma caused by natural disasters to anxiety from prolonged heatwaves. MHCC ACT positions climate action as essential to long-term psychological resilience in our community.',
  },
  {
    title: 'Alcohol, Tobacco & Other Drugs',
    body: 'Through the ATOD-Mental Health Alliance — co-established with ATODA — MHCC ACT addresses fragmentation between alcohol and other drug services and mental health services, supporting integrated, coordinated responses for people with co-occurring needs.',
  },
]

const ACCREDITATIONS = [
  'Australian Service Excellence Standards (ASES) – Certificate Level',
  'Quality Innovation Performance (QIP) accredited',
  'Registered charity with the ACNC',
  'ACT Government funded',
]

export default function AboutMHCCPage({ onClose }) {
  return (
    <PageOverlay title="About MHCC ACT" subtitle="Mental Health Community Coalition of the ACT" onClose={onClose}>
      <div className="space-y-10">

        {/* Hero */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
            Making Canberra a mentally healthy community
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
            The Mental Health Community Coalition of the ACT (MHCC ACT) is the peak body for the
            community-managed mental health sector in the Australian Capital Territory, established in
            2004 and funded by the ACT Government.
          </p>
        </div>

        {/* Quick facts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: CalendarDays, value: '2004', label: 'Established' },
            { icon: Building2,    value: '56',   label: 'Member organisations' },
            { icon: Users,        value: '72',   label: 'Associate members' },
            { icon: BadgeCheck,   value: 'ACT Gov', label: 'Funded by' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
              <Icon size={20} className="text-brand-600 mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6">
          <h2 className="font-bold text-brand-900 mb-3">Our mission</h2>
          <blockquote className="text-brand-800 text-lg italic leading-relaxed border-l-4 border-brand-400 pl-4">
            "The best place to receive mental health care is where you are right now."
          </blockquote>
          <p className="text-brand-700 text-sm mt-4 leading-relaxed">
            MHCC ACT advocates for a mental health system built on prevention, early intervention, and
            recovery — grounded in community support rather than acute hospital settings. We work to
            ensure organisations delivering mental health services are adequately funded, accessible,
            and easy to navigate for every Canberran.
          </p>
        </div>

        {/* What we do */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-5">What we do</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Advocacy & Policy', body: 'We represent the community-managed mental health sector in government and advisory forums, influencing policy through evidence and lived experience.' },
              { title: 'Workforce Development', body: 'We deliver training, resources, practitioner forums, and educational materials that build a skilled, resilient mental health workforce across the ACT.' },
              { title: 'Sector Coordination', body: 'We facilitate collaboration across our 56 member organisations, reducing fragmentation and improving integrated responses for people with complex needs.' },
              { title: 'Community Awareness', body: 'Each year, MHCC ACT coordinates Mental Health Week ACT — an annual celebration bringing together the sector, lived experience advocates, and the broader community.' },
            ].map(({ title, body }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Focus areas */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-5">Key focus areas</h2>
          <div className="space-y-3">
            {FOCUS_AREAS.map(({ title, body }) => (
              <details key={title} className="bg-white rounded-2xl border border-slate-100 shadow-sm group">
                <summary className="px-5 py-4 cursor-pointer font-semibold text-slate-900 hover:text-brand-700 transition-colors list-none flex items-center justify-between">
                  {title}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform duration-200 text-lg leading-none">▾</span>
                </summary>
                <p className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">{body}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Partners */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Key partnerships</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            MHCC ACT works closely with Carers ACT and the ACT Mental Health Consumer Network (ACT MHCN)
            to ensure its advocacy and programs reflect the needs of both consumers and carers. These
            partnerships are central to MHCC ACT's commitment to lived experience leadership.
          </p>
          <div className="flex flex-wrap gap-3">
            {['Carers ACT', 'ACT Mental Health Consumer Network'].map(p => (
              <span key={p} className="text-sm bg-brand-50 text-brand-700 border border-brand-100 px-3 py-1.5 rounded-full">{p}</span>
            ))}
          </div>
        </div>

        {/* Accreditations */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Accreditations</h2>
          <ul className="space-y-2">
            {ACCREDITATIONS.map(a => (
              <li key={a} className="flex items-center gap-2.5 text-sm text-slate-600">
                <BadgeCheck size={16} className="text-emerald-500 flex-shrink-0" />
                {a}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="bg-slate-100 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Contact MHCC ACT</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Phone size={15} className="text-slate-500" />
              <a href="tel:0251047710" className="text-slate-700 hover:text-brand-600 transition-colors">(02) 5104 7710</a>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={15} className="text-slate-500" />
              <a href="mailto:admin@mhccact.org.au" className="text-slate-700 hover:text-brand-600 transition-colors">admin@mhccact.org.au</a>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={15} className="text-slate-500 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700">Room 1.06, The Griffin Centre, Canberra City ACT 2601</span>
            </div>
            <div className="flex items-center gap-3">
              <ExternalLink size={15} className="text-slate-500" />
              <a href="https://mhccact.org.au" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">mhccact.org.au</a>
            </div>
          </div>
        </div>

      </div>
    </PageOverlay>
  )
}
