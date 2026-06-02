import { ExternalLink, Building2, Users, CalendarDays, BadgeCheck } from 'lucide-react'

const STATS = [
  { icon: Building2, value: '56', label: 'Member organisations' },
  { icon: Users,     value: '72', label: 'Associate members'    },
  { icon: CalendarDays, value: '2004', label: 'Established'     },
  { icon: BadgeCheck,  value: 'ACT Gov', label: 'Funded by'     },
]

export default function AboutMHCC() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <span className="text-xs font-bold tracking-widest text-brand-600 uppercase mb-3 block">
              About the coalition
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 leading-tight">
              Making Canberra a mentally healthy community
            </h2>
            <p className="text-slate-600 leading-relaxed mb-5">
              The <strong>Mental Health Community Coalition of the ACT (MHCC ACT)</strong> is the peak
              body for the community-managed mental health sector in the Australian Capital Territory.
              Established in 2004 and funded by the ACT Government, MHCC ACT advocates for a mental
              health system built on prevention, early intervention, and recovery.
            </p>
            <p className="text-slate-600 leading-relaxed mb-5">
              We believe <em>"the best place to receive mental health care is where you are right now"</em>,
              grounded in community support rather than acute hospital settings. Through CarePath, MHCC ACT
              connects Canberrans with our network of member organisations to ensure services are
              accessible, adequately funded, and easy to navigate.
            </p>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Half of all Canberrans will experience mental ill-health during their lives, and more than
              one in four report feeling lonely or socially isolated. MHCC ACT works to change that by
              coordinating services, shaping policy, and supporting the workforce that delivers care
              every day.
            </p>
            <a
              href="https://mhccact.org.au"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-800 transition-colors"
            >
              Learn more about MHCC ACT
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-5">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <Icon size={20} className="text-brand-600" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900">{value}</div>
                  <div className="text-sm text-slate-500 mt-0.5">{label}</div>
                </div>
              </div>
            ))}

            {/* Accreditation note */}
            <div className="col-span-2 bg-brand-50 border border-brand-100 rounded-2xl px-6 py-4 text-sm text-brand-800">
              <strong>Accredited</strong> under Australian Service Excellence Standards (ASES) and
              Quality Innovation Performance (QIP). Registered charity with the ACNC.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
