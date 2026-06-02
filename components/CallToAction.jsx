import { ArrowRight, Phone } from 'lucide-react'

export default function CallToAction({ onSeekSupport }) {
  return (
    <section className="bg-gradient-to-br from-brand-800 to-brand-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
          Ready to take the first step?
        </h2>
        <p className="text-lg text-brand-200 mb-10 max-w-2xl mx-auto leading-relaxed">
          You don't need to have all the answers. Submit your intake today and we'll help
          connect you with the right support in Canberra.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onSeekSupport}
            className="group inline-flex items-center justify-center gap-3 bg-white hover:bg-brand-50 font-bold text-base px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-0.5"
          style={{ color: '#c8336d' }}
          >
            Submit your intake form
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
          </button>
          <a
            href="tel:131114"
            className="inline-flex items-center justify-center gap-3 text-white border-2 border-white/30 hover:border-white/60 hover:bg-white/10 font-semibold text-base px-8 py-4 rounded-2xl transition-all duration-200"
          >
            <Phone size={18} />
            Lifeline 13 11 14
          </a>
        </div>
        <p className="text-brand-300 text-sm mt-8">
          ACT Mental Health Triage: <strong className="text-white">1800 629 354</strong> &nbsp;·&nbsp;
          Emergency: <strong className="text-white">000</strong>
        </p>
      </div>
    </section>
  )
}
