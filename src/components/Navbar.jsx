import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Menu, X, Phone } from 'lucide-react'
import carePath from '/img/CarePath.png'

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
    items: [
      { label: 'Counselling & Therapy', desc: 'One-on-one professional support' },
      { label: 'Crisis Support',        desc: 'Immediate help when you need it most' },
      { label: 'Support Groups',        desc: 'Community-based peer support' },
      { label: 'Youth Services',        desc: 'Tailored support for young people' },
      { label: 'Aged Care Support',     desc: 'Mental wellness for older Canberrans' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Self-Help Guides',    desc: 'Tools and techniques for everyday wellbeing' },
      { label: 'Crisis Helplines',    desc: 'Immediate phone and online support' },
      { label: 'Services Directory',  desc: 'Browse all Canberra services',              action: 'browse' },
      { label: 'FAQ',                 desc: 'Common questions answered' },
    ],
  },
  {
    label: 'For Providers',
    items: [
      { label: 'Join Our Network',     desc: 'Register your organisation' },
      { label: 'Provider Resources',   desc: 'Tools for registered providers' },
      { label: 'Training & Development', desc: 'Upskill your team' },
    ],
  },
  {
    label: 'Community',
    items: [
      { label: 'Volunteer',        desc: 'Give your time to those in need' },
      { label: 'Donate',           desc: 'Support the platform financially' },
      { label: 'Community Events', desc: 'Workshops, talks, and more' },
    ],
  },
]

function DropdownMenu({ items, isOpen, onNavigate, onBrowse }) {
  if (!isOpen) return null
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-72 z-50">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-fade-in">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              if (item.nav) onNavigate(item.nav)
              else if (item.action === 'browse') onBrowse()
            }}
            className="w-full text-left px-4 py-3 hover:bg-brand-50 transition-colors group"
          >
            <div className="text-sm font-semibold text-slate-800 group-hover:text-brand-700">
              {item.label}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Navbar({ onSeekSupport, onBrowse, onProviderLogin, onNavigate }) {
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
              <span className="text-[10px] font-medium text-brand-600 leading-none tracking-wide">
                Mental Health Community Coalition of the ACT
              </span>
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
                  onBrowse={onBrowse}
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
              className="inline-flex items-center gap-2 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 hover:brightness-90"
              style={{ backgroundColor: '#c8336d' }}
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
                          if (item.nav) onNavigate(item.nav)
                          else if (item.action === 'browse') onBrowse()
                        }}
                        className="block w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 border-t border-slate-100 mt-2 flex flex-col gap-2">
              <button onClick={onBrowse} className="btn-outline w-full justify-center text-sm">Browse services</button>
              <button onClick={onProviderLogin} className="text-sm font-medium text-slate-600 py-2 hover:text-brand-700">Provider login</button>
              <button
                onClick={onSeekSupport}
                className="w-full inline-flex justify-center items-center gap-2 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all hover:brightness-90"
                style={{ backgroundColor: '#c8336d' }}
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
