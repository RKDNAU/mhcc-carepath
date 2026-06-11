import { ArrowRight, BadgeCheck, Shield, Users } from 'lucide-react'
import { COLORS } from '../constants/theme'

const TRUST_BADGES = [
  { icon: Shield, text: 'Confidential & safe' },
  { icon: Users, text: '56 member organisations' },
  { icon: BadgeCheck, text: 'Free to use' },
]

export default function Hero({ onSeekSupport }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 -left-32 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-brand-500/20 rounded-full blur-2xl" />
        <svg
          className="absolute bottom-0 left-0 right-0 text-slate-50"
          viewBox="0 0 1440 60"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path d="M0,60 C360,0 1080,60 1440,20 L1440,60 Z" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-brand-100 mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            A service of the Mental Health Community Coalition of the ACT
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            Support is{' '}
            <span
              className="text-white"
              style={{ WebkitTextStroke: `3px ${COLORS.highlight}`, paintOrder: 'stroke fill' }}
            >
              here
            </span>{' '}
            for you
          </h1>

          <p className="text-lg sm:text-xl text-brand-100 leading-relaxed mb-10 max-w-2xl mx-auto">
            CarePath connects Canberrans seeking mental health support with the right local services,
            quickly, confidentially, and at no cost.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={onSeekSupport}
              className="group inline-flex items-center gap-3 bg-white text-brand-700 hover:bg-brand-50 font-bold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-1"
            >
              Seek support now
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform duration-200"
              />
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {TRUST_BADGES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-brand-200 text-sm">
                <Icon size={16} className="text-brand-300" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
