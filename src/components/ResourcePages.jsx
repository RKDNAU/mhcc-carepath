import { BookOpen, ExternalLink, HelpCircle, Phone, ShieldAlert } from 'lucide-react'
import PageOverlay from './PageOverlay'

const SOURCE_LINKS = {
  mhccCrisis: 'https://mhccact.org.au/mental-health-services/',
  mhccAbout: 'https://mhccact.org.au/about/',
  mhccCwp: 'https://mhccact.org.au/cwp/',
  mhccTraining: 'https://mhccact.org.au/training/',
  healthContacts: 'https://www.health.gov.au/topics/mental-health-and-suicide-prevention/mental-health-and-suicide-prevention-contacts',
  healthAustralia: 'https://www.health.gov.au/topics/mental-health-and-suicide-prevention/mental-health-in-australia',
  medicareMentalHealth: 'https://www.health.gov.au/our-work/medicare-mental-health',
  medicareCheckIn: 'https://www.health.gov.au/news/medicare-mental-health-check-in-launches-self-guided-service',
  navigatingServices: 'https://www.medicarementalhealth.gov.au/finding-help/navigating-mental-health-services',
  betterAccess: 'https://www.health.gov.au/our-work/better-access-initiative',
}

const CRISIS_CONTACTS = [
  {
    name: 'Emergency',
    number: '000',
    href: 'tel:000',
    descriptor: 'Police, fire or ambulance. Use now if someone is in immediate danger.',
    source: 'Australian Government',
    sourceUrl: SOURCE_LINKS.healthAustralia,
    urgent: true,
  },
  {
    name: 'Access Mental Health ACT',
    number: '1800 629 354',
    href: 'tel:1800629354',
    descriptor: 'ACT mental health triage and immediate help, available 24 hours.',
    source: 'MHCC ACT',
    sourceUrl: SOURCE_LINKS.mhccCrisis,
    urgent: true,
  },
  {
    name: 'Lifeline Australia',
    number: '13 11 14',
    href: 'tel:131114',
    descriptor: '24-hour crisis support for people overwhelmed, unsafe or thinking about suicide.',
    source: 'MHCC ACT / Australian Government',
    sourceUrl: SOURCE_LINKS.mhccCrisis,
    urgent: true,
  },
  {
    name: 'Suicide Call Back Service',
    number: '1300 659 467',
    href: 'tel:1300659467',
    descriptor: '24/7 phone and online counselling for people affected by suicide.',
    source: 'Australian Government',
    sourceUrl: SOURCE_LINKS.healthContacts,
  },
  {
    name: '13YARN',
    number: '13 92 76',
    href: 'tel:139276',
    descriptor: '24/7 crisis support for Aboriginal and Torres Strait Islander peoples.',
    source: 'Australian Government',
    sourceUrl: SOURCE_LINKS.healthContacts,
  },
  {
    name: 'Kids Helpline',
    number: '1800 551 800',
    href: 'tel:1800551800',
    descriptor: 'Free private counselling for young people aged 5 to 25, available 24 hours.',
    source: 'Australian Government',
    sourceUrl: SOURCE_LINKS.healthContacts,
  },
  {
    name: 'Beyond Blue',
    number: '1300 224 636',
    href: 'tel:1300224636',
    descriptor: 'Mental health information and support for people across Australia.',
    source: 'Australian Government',
    sourceUrl: SOURCE_LINKS.healthContacts,
  },
  {
    name: 'MensLine Australia',
    number: '1300 789 978',
    href: 'tel:1300789978',
    descriptor: '24/7 counselling for men with emotional health or relationship concerns.',
    source: 'Australian Government',
    sourceUrl: SOURCE_LINKS.healthContacts,
  },
  {
    name: 'Open Arms',
    number: '1800 011 046',
    href: 'tel:1800011046',
    descriptor: '24-hour mental health and wellbeing support for veterans and families.',
    source: 'Australian Government',
    sourceUrl: SOURCE_LINKS.healthContacts,
  },
  {
    name: 'QLife',
    number: '1800 184 527',
    href: 'tel:1800184527',
    descriptor: 'LGBTI peer support and referral, every day 3 pm to 9 pm local time.',
    source: 'Australian Government',
    sourceUrl: SOURCE_LINKS.healthContacts,
  },
]

const SELF_HELP_GUIDES = [
  {
    title: 'Start with early, community-based support',
    body: 'MHCC ACT describes the community as the right place for holistic, recovery-focused, person-centred and human rights-informed care, with a focus on prevention, early intervention and recovery.',
    source: 'MHCC ACT: About us',
    url: SOURCE_LINKS.mhccAbout,
  },
  {
    title: "Use MHCC ACT's crisis and service directory page",
    body: 'MHCC ACT keeps a public list of ACT crisis helplines, general supports, youth supports and eating disorder supports. It also states MHCC ACT is a peak body, not a direct service provider.',
    source: 'MHCC ACT: Crisis help and services',
    url: SOURCE_LINKS.mhccCrisis,
  },
  {
    title: 'Look for practical early support online',
    body: 'Medicare Mental Health Check In offers free online support to build practical skills for stress, low mood, anxiety and feeling overwhelmed. It is for people aged 16 and over in Australia.',
    source: 'Australian Government: Medicare Mental Health Check In',
    url: SOURCE_LINKS.medicareCheckIn,
  },
  {
    title: 'Use factsheets, guides and digital tools carefully',
    body: 'Medicare Mental Health describes online tools as including factsheets, self-help guides, quizzes and apps. These can help people find information and start taking action for wellbeing.',
    source: 'Medicare Mental Health: Navigating services',
    url: SOURCE_LINKS.navigatingServices,
  },
  {
    title: 'Learn about compassionate safety planning',
    body: "MHCC ACT's Connecting with People program describes compassion-based, evidence-informed suicide prevention training, including co-produced safety plans to promote hope and safety.",
    source: 'MHCC ACT: Connecting with People',
    url: SOURCE_LINKS.mhccCwp,
  },
  {
    title: 'Check MHCC ACT training and sector resources',
    body: "MHCC ACT publishes training opportunities intended to strengthen Canberra's capacity to address mental ill-health. Some items are for workers and community members rather than direct clinical care.",
    source: 'MHCC ACT: Training',
    url: SOURCE_LINKS.mhccTraining,
  },
]

const FAQS = [
  {
    question: 'What should I do if someone is in immediate danger?',
    answer: 'Call 000. Australian Government mental health pages list 000 for emergencies before crisis support options.',
    source: 'Australian Government',
    url: SOURCE_LINKS.healthAustralia,
  },
  {
    question: 'Who can I call in the ACT for urgent mental health support?',
    answer: 'MHCC ACT lists Access Mental Health on 1800 629 354 as the ACT central point of entry for 24-hour immediate help and mental health triage.',
    source: 'MHCC ACT',
    url: SOURCE_LINKS.mhccCrisis,
  },
  {
    question: 'Do I need a referral to start with Medicare Mental Health?',
    answer: 'No. Australian Government information says Medicare Mental Health services are free for anyone in Australia and do not need an appointment or referral.',
    source: 'Australian Government',
    url: SOURCE_LINKS.medicareMentalHealth,
  },
  {
    question: 'Can online self-help tools be useful?',
    answer: 'Medicare Mental Health describes online resources such as factsheets, self-help guides, quizzes and wellbeing apps as useful for finding information and starting action to improve wellbeing.',
    source: 'Medicare Mental Health',
    url: SOURCE_LINKS.navigatingServices,
  },
  {
    question: 'What is the Better Access initiative?',
    answer: 'Better Access lets eligible patients claim Medicare benefits for up to 10 individual and 10 group therapy mental health treatment services per calendar year.',
    source: 'Australian Government',
    url: SOURCE_LINKS.betterAccess,
  },
  {
    question: 'Why does CarePath emphasise community-based support?',
    answer: 'MHCC ACT advocates for prevention, early intervention and recovery, and says community organisations should be adequately funded, accessible and easy to navigate for every Canberran.',
    source: 'MHCC ACT',
    url: SOURCE_LINKS.mhccAbout,
  },
]

function SourceLink({ source, url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-800 hover:underline"
    >
      {source}
      <ExternalLink size={11} />
    </a>
  )
}

function CrisisContactCard({ contact }) {
  return (
    <article className={`bg-white rounded-2xl border p-5 shadow-sm ${contact.urgent ? 'border-highlight/30' : 'border-slate-100'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-bold text-slate-900">{contact.name}</h2>
          <p className="text-sm text-slate-500 leading-relaxed mt-1">{contact.descriptor}</p>
        </div>
        {contact.urgent && (
          <span className="text-[11px] font-bold uppercase tracking-wide text-highlight bg-highlight/10 px-2 py-1 rounded-full">
            Urgent
          </span>
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href={contact.href}
          className="inline-flex items-center gap-2 rounded-xl bg-highlight px-4 py-2.5 text-sm font-bold text-white hover:brightness-90 transition-colors"
        >
          <Phone size={16} />
          {contact.number}
        </a>
        <SourceLink source={contact.source} url={contact.sourceUrl} />
      </div>
    </article>
  )
}

export function CrisisHelplinesPage({ onClose }) {
  return (
    <PageOverlay title="Crisis Helplines" subtitle="Short crisis contacts for Australia and the ACT" onClose={onClose} maxWidth="max-w-5xl">
      <div className="space-y-6">
        <div className="rounded-2xl bg-slate-900 p-6 text-white">
          <div className="flex items-start gap-3">
            <ShieldAlert size={22} className="text-highlight mt-0.5" />
            <div>
              <h1 className="text-xl font-bold">If there is immediate danger, call 000.</h1>
              <p className="text-sm text-slate-300 mt-2 max-w-2xl">
                If you are in the ACT and need urgent mental health support, call Access Mental Health on 1800 629 354.
                If you are overwhelmed or unsafe, Lifeline is available on 13 11 14.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CRISIS_CONTACTS.map(contact => (
            <CrisisContactCard key={contact.name} contact={contact} />
          ))}
        </div>
      </div>
    </PageOverlay>
  )
}

export function SelfHelpGuidesPage({ onClose }) {
  return (
    <PageOverlay title="Self-Help Guides" subtitle="Prototype links based on MHCC ACT and Australian Government sources" onClose={onClose} maxWidth="max-w-5xl">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <BookOpen size={22} className="text-brand-600 mt-0.5" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">Start here, then seek direct support when needed.</h1>
              <p className="text-sm text-slate-500 leading-relaxed mt-2 max-w-3xl">
                These are indicative guide cards for a prototype. They point to public MHCC ACT material where it fits,
                and to Australian Government mental health resources for self-guided digital support.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SELF_HELP_GUIDES.map(guide => (
            <article key={guide.title} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h2 className="font-bold text-slate-900">{guide.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed mt-2">{guide.body}</p>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <SourceLink source={guide.source} url={guide.url} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </PageOverlay>
  )
}

export function FAQPage({ onClose }) {
  return (
    <PageOverlay title="FAQ" subtitle="Answers sourced from MHCC ACT and Australian Government information" onClose={onClose}>
      <div className="space-y-5">
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <HelpCircle size={20} className="text-brand-700 mt-0.5" />
            <p className="text-sm text-brand-800 leading-relaxed">
              This FAQ is an indicative prototype. Each answer is deliberately short and linked to the public source it is based on.
            </p>
          </div>
        </div>

        {FAQS.map(item => (
          <article key={item.question} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">{item.question}</h2>
            <p className="text-sm text-slate-600 leading-relaxed mt-2">{item.answer}</p>
            <div className="mt-4">
              <SourceLink source={item.source} url={item.url} />
            </div>
          </article>
        ))}
      </div>
    </PageOverlay>
  )
}
