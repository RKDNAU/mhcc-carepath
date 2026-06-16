import { BadgeCheck, BookOpen, GraduationCap, Network, Users } from 'lucide-react'
import PageOverlay from './PageOverlay'

const PROVIDER_PAGES = {
  'provider:join-network': {
    title: 'Join Our Network',
    subtitle: 'Provider participation in CarePath',
    icon: Network,
    intro: 'CarePath is designed as a shared intake and service matching prototype for the ACT community-managed mental health sector.',
    sections: [
      {
        title: 'What this would support',
        items: [
          'A clearer pathway for people seeking mental health support in the ACT.',
          'A shared view of intake needs, service fit and provider availability.',
          'Referral decisions that consider support type, access mode, target group and current capacity.',
        ],
      },
      {
        title: 'Indicative provider requirements',
        items: [
          'Current service information that can be kept up to date.',
          'A nominated team contact for referral and intake follow-up.',
          'Agreement on how intake information is handled and when referrals are accepted or declined.',
        ],
      },
    ],
  },
  'provider:resources': {
    title: 'Provider Resources',
    subtitle: 'Tools for registered providers',
    icon: BookOpen,
    intro: 'This prototype page outlines the kind of practical guidance a provider workspace would include.',
    sections: [
      {
        title: 'Common resources',
        items: [
          'Service profile guidance for keeping program details useful and searchable.',
          'Referral handling guidance for reviewing, routing and updating shared intake records.',
          'Data export notes for understanding intake queue, intake volume and sector CSV downloads.',
        ],
      },
      {
        title: 'Operational notes',
        items: [
          'CarePath is not a crisis service and should direct urgent needs to crisis pathways.',
          'Provider login in this wireframe is prototype-only and does not represent a production access model.',
          'Shared data views are indicative analytics for planning and demonstration purposes.',
        ],
      },
    ],
  },
  'provider:training': {
    title: 'Training & Development',
    subtitle: 'Sector learning and capability',
    icon: GraduationCap,
    intro: 'Provider training content would point teams toward sector capability, referral practice and safe use of shared intake workflows.',
    sections: [
      {
        title: 'Suggested learning areas',
        items: [
          'Using CarePath intake information consistently and respectfully.',
          'Understanding service matching, routed care plans and referral notes.',
          'Reading program, intake and sector analytics without overstating what prototype data can prove.',
        ],
      },
      {
        title: 'Sector alignment',
        items: [
          'Training links should align with MHCC ACT and ACT sector development material where available.',
          'Crisis, suicide prevention and safety planning content should link to current authoritative training or guidance.',
          'Provider onboarding should include privacy, consent and information sharing expectations.',
        ],
      },
    ],
  },
}

function ProviderInfoPage({ page, onClose }) {
  const content = PROVIDER_PAGES[page] || PROVIDER_PAGES['provider:join-network']
  const Icon = content.icon

  return (
    <PageOverlay title={content.title} subtitle={content.subtitle} onClose={onClose}>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
              <Icon size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{content.title}</h1>
              <p className="text-sm text-slate-500 leading-relaxed mt-2">{content.intro}</p>
            </div>
          </div>
        </div>

        {content.sections.map(section => (
          <section key={section.title} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-4">{section.title}</h2>
            <div className="space-y-3">
              {section.items.map(item => (
                <div key={item} className="flex items-start gap-3">
                  <BadgeCheck size={17} className="text-brand-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-600 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 flex items-start gap-3">
          <Users size={18} className="text-brand-700 mt-0.5 shrink-0" />
          <p className="text-sm text-brand-800 leading-relaxed">
            In a production version, these pages would link to live onboarding, policy and training documents maintained by MHCC ACT or the relevant program owner.
          </p>
        </div>
      </div>
    </PageOverlay>
  )
}

export default ProviderInfoPage
