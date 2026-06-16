import { ExternalLink, X } from 'lucide-react'
import PageOverlay from './PageOverlay'

const TERMS_SECTIONS = [
  {
    title: '1. Prototype purpose',
    content: 'CarePath is a prototype service navigation and intake wireframe. It is intended to demonstrate how people in the ACT could be connected with community-managed mental health services.',
  },
  {
    title: '2. Not crisis or clinical care',
    content: 'CarePath is not an emergency, crisis or clinical treatment service. If there is immediate danger, call 000. For urgent mental health support in the ACT, call Access Mental Health on 1800 629 354. Lifeline is available on 13 11 14.',
  },
  {
    title: '3. Information you provide',
    content: 'Information submitted through the intake form should be accurate to the best of your knowledge. Do not submit information about another person unless you have authority or consent to do so, or you are acting to help them access appropriate support.',
  },
  {
    title: '4. Provider portal',
    content: 'The provider portal in this prototype is for demonstration only. Login, routing, analytics and export features do not represent production authentication, authorisation or operational policy.',
  },
  {
    title: '5. External links',
    content: 'CarePath may link to MHCC ACT, government and service provider websites. Those sites are managed by their own operators and may have separate terms, privacy and accessibility arrangements.',
  },
  {
    title: '6. Changes',
    content: 'These prototype terms may change as the service model, governance arrangements and implementation requirements are refined.',
  },
]

export function TermsOfUseModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Terms of Use</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              CarePath prototype terms
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
            These terms are placeholder content for the CarePath wireframe and should be reviewed before any production use.
          </p>

          {TERMS_SECTIONS.map(({ title, content }) => (
            <div key={title}>
              <h3 className="text-sm font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{content}</p>
            </div>
          ))}
        </div>

        <div className="px-7 py-4 border-t border-slate-100 flex-shrink-0 flex justify-end">
          <button onClick={onClose} className="btn-primary text-sm py-2">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export function AccessibilityPage({ onClose }) {
  return (
    <PageOverlay title="Accessibility" subtitle="Prototype accessibility statement" onClose={onClose}>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Accessible by design</h1>
          <p className="text-sm text-slate-600 leading-relaxed mt-3">
            CarePath is intended to be usable by people seeking mental health support, carers, family members and provider teams. The prototype uses plain language, high-contrast interface elements, keyboard-friendly controls and responsive layouts.
          </p>
        </div>

        <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-3">Current prototype approach</h2>
          <ul className="space-y-2 text-sm text-slate-600 leading-relaxed">
            <li>Content is structured with headings, lists and short sections where possible.</li>
            <li>Core actions use visible labels and consistent button styling.</li>
            <li>Forms use labels, grouped choices and clear submit/error states.</li>
            <li>Crisis phone numbers are presented as direct phone links.</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-3">Known prototype limits</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            This is not a completed accessibility audit. Before production use, the app should be tested with keyboard navigation, screen readers, zoomed layouts, colour contrast tools and people with lived experience of access needs.
          </p>
        </section>

        <section className="bg-brand-50 border border-brand-100 rounded-2xl p-5">
          <h2 className="font-bold text-brand-900 mb-2">Feedback</h2>
          <p className="text-sm text-brand-800 leading-relaxed">
            For feedback about MHCC ACT or its public web presence, use the MHCC ACT contact page.
          </p>
          <a
            href="https://mhccact.org.au/contact/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900 hover:underline mt-3"
          >
            Contact MHCC ACT
            <ExternalLink size={13} />
          </a>
        </section>
      </div>
    </PageOverlay>
  )
}
