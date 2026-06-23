import { Heart, Shield, Users, BadgeCheck, ArrowRight, Phone } from 'lucide-react'
import PageOverlay from './PageOverlay'

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Submit your intake',
    body: 'Complete a short, confidential form describing your situation and the kind of support you\'re looking for. You do not need a referral, a diagnosis, or any prior experience with mental health services.',
  },
  {
    step: '02',
    title: 'We match you',
    body: 'The MHCC ACT team reviews your intake and identifies the most suitable registered service providers across Canberra and the ACT - taking into account your situation, preferences, and how you\'d like to access support.',
  },
  {
    step: '03',
    title: 'Connect and begin',
    body: 'A provider reaches out to arrange your first appointment. You\'re in control every step of the way and can update your preferences or withdraw at any time.',
  },
]

const COMMITMENTS = [
  { icon: Shield, title: 'Confidential',   body: 'Your information is held securely and shared only with providers who can genuinely help you. It will never be sold or used for marketing.' },
  { icon: BadgeCheck, title: 'Free to use', body: 'CarePath costs nothing to use. Some services in our network may have fees, but the platform itself is free for everyone.' },
  { icon: Users, title: 'Inclusive',        body: 'CarePath is designed for everyone in Canberra and the ACT - regardless of background, identity, age, or level of need.' },
  { icon: Heart, title: 'Compassionate',    body: 'We know reaching out is not easy. Every intake is read by a real person who understands the courage it takes to ask for help.' },
]

export default function AboutCarePathPage({ onClose }) {
  return (
    <PageOverlay title="About CarePath" subtitle="Connecting Canberrans with mental health support" onClose={onClose}>
      <div className="space-y-12">

        {/* Hero summary */}
        <div className="bg-gradient-to-br from-brand-800 to-brand-700 rounded-3xl p-8 text-white">
          <h1 className="text-3xl font-extrabold mb-4">Support is here for you</h1>
          <p className="text-brand-100 leading-relaxed text-lg max-w-2xl">
            CarePath is a free, confidential platform that connects people in Canberra and the ACT with
            local mental health services. We believe getting help should be simple - not a bureaucratic
            obstacle course. Whatever you're going through, CarePath is here to help you find the right support.
          </p>
        </div>

        {/* What is CarePath */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">What is CarePath?</h2>
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-4">
            <p>
              CarePath is a referral and matching platform operated by the Mental Health Community Coalition
              of the ACT (MHCC ACT). It exists because finding the right mental health support in Canberra
              can be confusing, time-consuming, and discouraging - particularly when you're already struggling.
            </p>
            <p>
              Through CarePath, individuals can submit a single intake form describing their needs and
              circumstances. A real person from the MHCC ACT team reads every intake and works to identify
              the most appropriate services from our network of over 56 member organisations.
            </p>
            <p>
              CarePath is not a crisis service. If you are in immediate danger, please call <strong>000</strong>{' '}
              or Lifeline on <strong>13 11 14</strong>. For urgent but non-emergency mental health support in
              the ACT, the Mental Health Triage line is available on <strong>1800 629 354</strong>.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">How it works</h2>
          <div className="space-y-4">
            {HOW_IT_WORKS.map(({ step, title, body }) => (
              <div key={step} className="flex gap-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {step}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Who it's for */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Who is CarePath for?</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            CarePath is for any person in Canberra or the ACT who is seeking mental health support for themselves
            or someone they care for. You do not need a referral from a GP, a formal diagnosis, or any prior
            experience with the mental health system to use CarePath.
          </p>
          <p className="text-slate-600 leading-relaxed">
            We have services in our network for adults, young people, carers, families, people with psychosocial
            disability, Aboriginal and Torres Strait Islander people, Culturally and Linguistically Diverse
            communities, LGBTQIA+ individuals, people who are justice-involved, and more. If you're not sure
            whether CarePath can help you, submit an intake and we'll do our best to connect you.
          </p>
        </div>

        {/* Our commitments */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Our commitments to you</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COMMITMENTS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                    <Icon size={18} className="text-brand-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">{title}</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Operated by */}
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6">
          <h3 className="font-bold text-brand-900 mb-2">Operated by MHCC ACT</h3>
          <p className="text-sm text-brand-700 leading-relaxed">
            CarePath is a service of the Mental Health Community Coalition of the ACT - the peak body
            for community-managed mental health in the ACT, established in 2004 and funded by the
            ACT Government. MHCC ACT coordinates a network of over 56 member organisations committed
            to making Canberra a mentally healthy community.
          </p>
        </div>

        {/* Crisis numbers */}
        <div className="bg-slate-100 rounded-2xl p-5 flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-slate-500" />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Lifeline</p>
              <a href="tel:131114" className="font-bold text-slate-800 hover:text-brand-600 transition-colors">13 11 14</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-slate-500" />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">ACT Mental Health Triage</p>
              <a href="tel:1800629354" className="font-bold text-slate-800 hover:text-brand-600 transition-colors">1800 629 354</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-slate-500" />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Emergency</p>
              <a href="tel:000" className="font-bold text-slate-800 hover:text-brand-600 transition-colors">000</a>
            </div>
          </div>
        </div>

      </div>
    </PageOverlay>
  )
}
