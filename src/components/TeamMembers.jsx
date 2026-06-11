import { useState } from 'react'
import { avatarSrc, isAvatarFailed, isAvatarLoaded, markAvatarFailed, markAvatarLoaded } from '../utils/avatarPreload'

const initials = name =>
  name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('')

function Avatar({ name, highlight }) {
  const [imgLoaded, setImgLoaded] = useState(() => isAvatarLoaded(name))
  const [imgError, setImgError] = useState(() => isAvatarFailed(name))
  const src = avatarSrc(name)

  return (
    <div
      className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden border ${
        highlight ? 'text-highlight bg-highlight/10 border-highlight/20' : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}
    >
      {initials(name)}
      {!imgError && (
      <img
        src={src}
        alt=""
        onLoad={() => {
          markAvatarLoaded(name)
          setImgLoaded(true)
        }}
        onError={() => {
          markAvatarFailed(name)
          setImgError(true)
        }}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-150 ${
          imgLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      )}
    </div>
  )
}

function PersonRow({ name, orgRole, carePathRole, isCurrentUser }) {
  const isAdmin = carePathRole === 'Org Admin'
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
      <Avatar name={name} highlight={isAdmin} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-900 leading-none">{name}</p>
          {isCurrentUser && (
            <span className="text-[10px] bg-brand-50 text-brand-600 border border-brand-100 rounded-full px-1.5 py-0.5 font-medium">
              You
            </span>
          )}
        </div>
        {orgRole && <p className="text-xs text-slate-400 mt-0.5">{orgRole}</p>}
      </div>
      <span
        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 border ${
          isAdmin ? 'text-highlight bg-highlight/10 border-highlight/20' : 'bg-slate-100 text-slate-500 border-slate-200'
        }`}
      >
        {carePathRole}
      </span>
    </div>
  )
}

export default function TeamMembers({ user, provider }) {
  const members = [
    { name: user.username, orgRole: null, carePathRole: 'Member', isCurrentUser: true },
    ...provider.members,
  ]

  return (
    <div className="max-w-2xl space-y-5">

      {/* Administrators */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Administrator
          </p>
        </div>
        <PersonRow
          name={provider.admin.name}
          orgRole={provider.admin.orgRole}
          carePathRole={provider.admin.carePathRole}
        />
      </div>

      {/* Members */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Members
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {members.map(m => (
            <PersonRow key={m.name} {...m} />
          ))}
        </div>
      </div>

    </div>
  )
}
