import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Menu, X, Phone } from 'lucide-react'
import { SERVICE_OVERVIEWS } from '../data/serviceOverviews'
import { SERVICE_META } from './ServicesGrid'
const carePath = '/img/CarePath.png'

const SERVICE_MENU_ITEMS = SERVICE_OVERVIEWS.map(({ slug, title }) => {
  const meta = SERVICE_META[slug]
  return {
    label: title,
    desc: meta?.desc,
    nav: `service:${slug}`,
    icon: meta?.icon,
    color: meta?.color,
  }
})

const NAV_ITEMS = [
  {
    label: 'About',
    items: [
      { label: 'About CarePath',         desc: 'How we connect Canberrans with mental health support',          nav: 'about-carepath' },
      { label: 'About MHCC ACT',         desc: "ACT's peak body for community-managed mental health, est. 2004", nav: 'about-mhcc'      },
      { label: 'Partner Organisations',  desc: '56 member organisations delivering services across the ACT',    nav: 'partners'       },
      { label: 'News & Updates',         desc: 'Latest advocacy, events and sector news from MHCC ACT',         nav: 'news'           },
    ],
  },
  {
    label: 'Services',
    items: SERVICE_MENU_ITEMS,
  },
  {
    label: 'Resources',
    items: [
      { label: 'Self-Help Guides', desc: 'Sourced wellbeing guides and tools', nav: 'resource:self-help' },
      { label: 'Crisis Helplines', desc: 'Immediate phone and online support', nav: 'resource:crisis-helplines' },
      { label: 'Support Pathways', desc: 'Inclusive pathway links', nav: 'resource:pathways' },
      { label: 'For Carers And Family', desc: 'Support for carers and kin', nav: 'resource:carers-family' },
      { label: 'How Matching Works', desc: 'How CarePath suggests services', nav: 'resource:matching' },
      { label: 'FAQ', desc: 'Sourced answers to common questions', nav: 'resource:faq' },
    ],
  },
  {
    label: 'For Providers',
    items: [
      { label: 'Join Our Network', desc: 'Register your organisation', nav: 'provider:join-network' },
      { label: 'Provider Resources', desc: 'Tools for registered providers', nav: 'provider:resources' },
      { label: 'Training & Development', desc: 'Upskill your team', nav: 'provider:training' },
    ],
  },
  {
    label: 'Community',
    items: [
      { label: 'Volunteer', desc: 'Community and sector participation', href: 'https://mhccact.org.au/membership/become-a-member/' },
      { label: 'Donate', desc: 'Contact MHCC ACT about support', href: 'https://mhccact.org.au/contact/' },
      { label: 'Community Events', desc: 'Workshops, talks, and more', href: 'https://mhccact.org.au/community-notice-board/' },
    ],
  },
]

function handleItemClick(item, onNavigate) {
  if (item.href) {
    window.location.href = item.href
    return
  }
  if (item.nav) onNavigate(item.nav)
}

function DropdownMenu({ items, isOpen, onNavigate }) {
  if (!isOpen) return null
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-80 z-50">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-fade-in">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              handleItemClick(item, onNavigate)
            }}
            className="w-full text-left px-4 py-3 hover:bg-brand-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              {item.icon && (
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon size={18} />
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-slate-800 group-hover:text-brand-700">
                  {item.label}
                </div>
                {item.desc && <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Navbar({ onSeekSupport, onProviderLogin, onNavigate }) {
  const [openMenu, setOpenMenu] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <nav ref={navRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <img src={carePath} alt="CarePath" className="w-9 h-9 rounded-xl object-contain" />
            <div>
              <span className="text-base font-bold text-slate-900 leading-none block">CarePath</span>
              <a
                href="https://mhccact.org.au/"
                className="text-[10px] font-medium text-brand-600 leading-none tracking-wide hover:text-brand-800 hover:underline"
              >
                Mental Health Community Coalition of the ACT
              </a>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((nav) => (
              <div
                key={nav.label}
                className="relative"
                onMouseEnter={() => setOpenMenu(nav.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button
                  className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    openMenu === nav.label
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  onClick={() => setOpenMenu(openMenu === nav.label ? null : nav.label)}
                >
                  {nav.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${openMenu === nav.label ? 'rotate-180' : ''}`}
                  />
                </button>
                <DropdownMenu
                  items={nav.items}
                  isOpen={openMenu === nav.label}
                  onNavigate={onNavigate}
                />
              </div>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:131114"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors"
              title="Lifeline: 24/7 crisis support"
            >
              <Phone size={14} />
              13 11 14
            </a>
            <button
              onClick={onProviderLogin}
              className="text-sm font-medium text-slate-600 hover:text-brand-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Provider login
            </button>
            <button
              onClick={onSeekSupport}
              className="inline-flex items-center gap-2 bg-highlight text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 hover:brightness-90"
            >
              Seek support
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 animate-fade-in">
            {NAV_ITEMS.map((nav) => (
              <div key={nav.label}>
                <button
                  className="flex items-center justify-between w-full px-2 py-3 text-sm font-semibold text-slate-700"
                  onClick={() => setOpenMenu(openMenu === nav.label ? null : nav.label)}
                >
                  {nav.label}
                  <ChevronDown size={14} className={`transition-transform ${openMenu === nav.label ? 'rotate-180' : ''}`} />
                </button>
                {openMenu === nav.label && (
                  <div className="pl-4 pb-2 space-y-1">
                    {nav.items.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          setMobileOpen(false)
                          handleItemClick(item, onNavigate)
                        }}
                        className="flex w-full items-center gap-3 text-left px-3 py-2 text-sm text-slate-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        {item.icon && (
                          <span className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${item.color}`}>
                            <item.icon size={16} />
                          </span>
                        )}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 border-t border-slate-100 mt-2 flex flex-col gap-2">
              <button onClick={onProviderLogin} className="text-sm font-medium text-slate-600 py-2 hover:text-brand-700">Provider login</button>
              <button
                onClick={onSeekSupport}
                className="w-full inline-flex justify-center items-center gap-2 bg-highlight text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all hover:brightness-90"
              >
                Seek support
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
