import { useEffect, useMemo, useState } from 'react'
import { Inbox, ClipboardList, BarChart2, PieChart, Building2, Users, Settings, LogOut, Search } from 'lucide-react'
import carePath from '/img/CarePath.png'
import SharedIntake from './SharedIntake'
import IntakeData from './IntakeData'
import ProgramData from './ProgramData'
import SharedData from './SharedData'
import MyOrganisation from './MyOrganisation'
import TeamMembers from './TeamMembers'
import ProviderSettings from './ProviderSettings'
import ServicesDirectory from './ServicesDirectory'
import { DEMO_PROVIDER } from '../data/demoProvider'
import { avatarSrc, isAvatarFailed, isAvatarLoaded, markAvatarFailed, markAvatarLoaded, preloadAvatars } from '../utils/avatarPreload'

const NAV_ITEMS = [
  { id: 'intake',        label: 'Shared Intake',   icon: Inbox         },
  { id: 'intake-data',   label: 'Intake Data',     icon: ClipboardList },
  { id: 'program-data',  label: 'Program Data',    icon: BarChart2     },
  { id: 'sector-data',   label: 'Sector Data',     icon: PieChart      },
  { id: 'org',           label: 'My Organisation', icon: Building2     },
  { id: 'team',          label: 'Team Members',    icon: Users         },
  { id: 'services',      label: 'Services Discovery', icon: Search     },
  { id: 'settings',      label: 'Settings',        icon: Settings      },
]

const initials = name =>
  name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('')

export default function ProviderLayout({ user, onLogout }) {
  const [activeNav, setActiveNav] = useState('intake')
  const [avatarLoaded, setAvatarLoaded] = useState(() => isAvatarLoaded(user.username))
  const [avatarError, setAvatarError] = useState(() => isAvatarFailed(user.username))

  const activeItem = NAV_ITEMS.find(n => n.id === activeNav)
  const avatarNames = useMemo(() => [
    user.username,
    DEMO_PROVIDER.admin.name,
    ...DEMO_PROVIDER.members.map(member => member.name),
  ], [user.username])

  useEffect(() => {
    setAvatarLoaded(isAvatarLoaded(user.username))
    setAvatarError(isAvatarFailed(user.username))
    preloadAvatars(avatarNames).then(() => {
      setAvatarLoaded(isAvatarLoaded(user.username))
      setAvatarError(isAvatarFailed(user.username))
    })
  }, [avatarNames])

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

      {/* Left sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col select-none">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <img src={carePath} alt="CarePath" className="w-7 h-7 rounded-lg object-contain" />
            <div>
              <span className="text-sm font-bold text-slate-900 leading-none block">CarePath</span>
              <span className="text-[9px] text-brand-600 leading-none block mt-0.5">Provider Portal</span>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveNav(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left border-l-2 ${
                activeNav === id
                  ? 'border-highlight bg-brand-50 text-brand-700'
                  : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom: org badge + sign out */}
        <div className="px-3 py-3 border-t border-slate-100 space-y-2">
          <div className="px-3 py-2.5 bg-slate-50 rounded-xl space-y-2">
            <div>
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Organisation</p>
              <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-snug">{DEMO_PROVIDER.orgName}</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Role</p>
              <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-snug">{DEMO_PROVIDER.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
          <h1 className="text-base font-semibold text-slate-900">{activeItem?.label}</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 hidden sm:block">{DEMO_PROVIDER.orgName}</span>
            <div className="relative w-8 h-8 rounded-full border border-highlight/20 bg-highlight/10 flex items-center justify-center text-highlight font-bold text-xs flex-shrink-0 overflow-hidden">
              {initials(user.username)}
              {!avatarError && (
              <img
                src={avatarSrc(user.username)}
                alt=""
                onLoad={() => {
                  markAvatarLoaded(user.username)
                  setAvatarLoaded(true)
                }}
                onError={() => {
                  markAvatarFailed(user.username)
                  setAvatarError(true)
                }}
                className={`absolute inset-0 w-full h-full object-cover border-2 border-highlight/50 rounded-full transition-opacity duration-150 ${
                  avatarLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeNav === 'intake'       && <SharedIntake />}
          {activeNav === 'intake-data'  && <IntakeData />}
          {activeNav === 'program-data' && <ProgramData orgId={DEMO_PROVIDER.orgId} orgName={DEMO_PROVIDER.orgName} />}
          {activeNav === 'sector-data'  && <SharedData />}
          {activeNav === 'org'          && <MyOrganisation provider={DEMO_PROVIDER} />}
          {activeNav === 'team'         && <TeamMembers user={user} provider={DEMO_PROVIDER} />}
          {activeNav === 'services'     && <ServicesDirectory embedded />}
          {activeNav === 'settings'     && <ProviderSettings />}
        </div>
      </div>
    </div>
  )
}
