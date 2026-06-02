const ADMIN = {
  name: 'Lisa McPherson',
  orgRole: 'Chief Executive Officer',
  carePathRole: 'Org Admin',
}

const initials = name =>
  name.split(' ').map(p => p[0].toUpperCase()).join('')

function Avatar({ name, highlight }) {
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border ${
        highlight ? 'text-highlight' : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}
      style={highlight ? { backgroundColor: 'rgba(200,51,109,0.1)', borderColor: 'rgba(200,51,109,0.2)' } : {}}
    >
      {initials(name)}
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
          isAdmin ? 'text-highlight' : 'bg-slate-100 text-slate-500 border-slate-200'
        }`}
        style={isAdmin ? { backgroundColor: 'rgba(200,51,109,0.1)', borderColor: 'rgba(200,51,109,0.2)' } : {}}
      >
        {carePathRole}
      </span>
    </div>
  )
}

export default function TeamMembers({ user }) {
  const members = [
    { name: user.username, orgRole: null, carePathRole: 'Member', isCurrentUser: true },
    { name: 'Katarina Baloska', orgRole: 'Compliance Manager', carePathRole: 'Member' },
    { name: 'Adrian Sturt', orgRole: 'Chief Operating Officer', carePathRole: 'Member' },
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
          name={ADMIN.name}
          orgRole={ADMIN.orgRole}
          carePathRole={ADMIN.carePathRole}
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
