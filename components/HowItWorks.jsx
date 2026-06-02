import { ClipboardList, GitMerge, Handshake } from 'lucide-react'

const STEPS = [
  {
    step: '01',
    icon: ClipboardList,
    title: 'Submit your intake',
    desc: 'Complete a short, confidential form describing your situation and the kind of support you\'re looking for.',
  },
  {
    step: '02',
    icon: GitMerge,
    title: 'We match you',
    desc: 'Our team reviews your intake and identifies the most suitable registered service providers in Canberra.',
  },
  {
    step: '03',
    icon: Handshake,
    title: 'Connect & begin',
    desc: 'A provider reaches out to arrange your first appointment. You\'re in control every step of the way.',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            How it works
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Getting connected to support is simple, private, and free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200 z-0" />

          {STEPS.map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="relative flex flex-col items-center text-center z-10">
              <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg mb-5">
                <Icon size={24} className="text-white" />
              </div>
              <span className="text-xs font-bold tracking-widest text-brand-500 uppercase mb-2">
                Step {step}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
              <p className="text-slate-500 leading-relaxed max-w-xs">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
