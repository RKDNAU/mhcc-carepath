import { Heart, Phone, Mail, MapPin } from 'lucide-react'
import { SERVICE_OVERVIEWS } from '../data/serviceOverviews'
const carePath = '/img/CarePath.png'

const PLATFORM_LINKS = [
  { label: 'About CarePath', nav: 'about-carepath' },
  { label: 'About MHCC ACT', nav: 'about-mhcc' },
  { label: 'For Providers', nav: 'provider:join-network' },
  { label: 'Partner Organisations', nav: 'partners' },
  { label: 'News & Updates', nav: 'news' },
]

const SERVICE_LINKS = SERVICE_OVERVIEWS.map(({ slug, title }) => ({
  label: title,
  nav: `service:${slug}`,
}))

const RESOURCE_LINKS = [
  { label: 'Self-Help Guides', nav: 'resource:self-help' },
  { label: 'Crisis Helplines', nav: 'resource:crisis-helplines' },
  { label: 'FAQ', nav: 'resource:faq' },
]

const LEGAL_LINKS = [
  { label: 'Terms of Use', action: 'terms' },
  { label: 'Accessibility', nav: 'accessibility' },
  { label: 'Feedback', href: 'https://mhccact.org.au/contact/' },
]

function handleFooterLink(link, { onNavigate, onTermsClick }) {
  if (link.href) {
    window.location.href = link.href
    return
  }
  if (link.action === 'terms') {
    onTermsClick()
    return
  }
  if (link.nav) onNavigate(link.nav)
}

export default function Footer({ onNavigate, onPrivacyClick, onTermsClick }) {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src={carePath} alt="CarePath" className="w-9 h-9 rounded-xl object-contain" />
              <div>
                <span className="text-sm font-bold text-white leading-none block">CarePath</span>
                <span className="text-[10px] text-brand-400 leading-none tracking-wide uppercase">
                  by MHCC ACT
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-2">
              A service of the{' '}
              <a
                href="https://mhccact.org.au"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-400 hover:text-brand-300 transition-colors"
              >
                Mental Health Community Coalition of the ACT
              </a>
              .
            </p>
            <p className="text-sm leading-relaxed mb-6">
              Connecting Canberrans with the mental health support they need, when they need it.
            </p>
            <div className="space-y-2 text-sm">
              <a href="tel:0251047710" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={14} className="text-brand-500" />
                (02) 5104 7710
              </a>
              <a href="mailto:admin@mhccact.org.au" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={14} className="text-brand-500" />
                admin@mhccact.org.au
              </a>
              <span className="flex items-start gap-2">
                <MapPin size={14} className="text-brand-500 flex-shrink-0 mt-0.5" />
                Room 1.06, The Griffin Centre,<br />Canberra City ACT 2601
              </span>
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Platform', links: PLATFORM_LINKS },
            { title: 'Services', links: SERVICE_LINKS },
            { title: 'Resources', links: RESOURCE_LINKS },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleFooterLink(link, { onNavigate, onTermsClick })}
                      className="text-sm hover:text-white transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={onPrivacyClick}
                  className="text-sm hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              {LEGAL_LINKS.map(link => (
                <li key={link.label}>
                  <button
                    onClick={() => handleFooterLink(link, { onNavigate, onTermsClick })}
                    className="text-sm hover:text-white transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© 2026 Mental Health Community Coalition of the ACT. All rights reserved.</p>
          <p>
            Built for our community, with{' '}
            <Heart size={11} className="inline text-highlight" fill="currentColor" /> in Canberra, by RKDN.
          </p>
        </div>
      </div>
    </footer>
  )
}
