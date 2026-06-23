import { useState, useMemo } from 'react'
import { Search, ExternalLink, AlertCircle } from 'lucide-react'
import { ORGANISATIONS } from '../data/organisations'
import PageOverlay from './PageOverlay'

const sorted = [...ORGANISATIONS].sort((a, b) => a.name.localeCompare(b.name))

function OrgCard({ org }) {
  const domain = org.url ? new URL(org.url).hostname.replace(/^www\./, '') : null

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900 leading-snug">{org.name}</h3>
        {!org.url && (
          <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
            <AlertCircle size={10} />
            Verifying
          </span>
        )}
      </div>
      {org.url ? (
        <a
          href={org.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 hover:underline transition-colors mt-auto"
        >
          <ExternalLink size={12} />
          {domain}
        </a>
      ) : (
        <span className="text-xs text-slate-400 mt-auto">Website not yet confirmed</span>
      )}
    </div>
  )
}

export default function PartnerOrganisationsPage({ onClose }) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? sorted.filter(o => o.name.toLowerCase().includes(q)) : sorted
  }, [query])

  return (
    <PageOverlay
      title="Partner Organisations"
      subtitle={`${results.length} of ${ORGANISATIONS.length} MHCC ACT member organisations`}
      onClose={onClose}
      maxWidth="max-w-6xl"
    >
      <div className="space-y-6">
        <div>
          <p className="text-slate-600 leading-relaxed mb-5">
            CarePath is underpinned by the{' '}
            <strong>Mental Health Community Coalition of the ACT (MHCC ACT)</strong> and its network
            of member organisations. These 66 organisations collectively deliver mental health services,
            advocacy, peer support, workforce development, and community connection across Canberra
            and the ACT.
          </p>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              autoFocus
              type="search"
              placeholder="Search organisations..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Search size={28} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No organisations match "{query}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map(org => <OrgCard key={org.id} org={org} />)}
          </div>
        )}

        <p className="text-xs text-slate-400 text-center pt-2">
          Organisations marked "Verifying" are confirmed MHCC ACT members whose web presence is being updated.
        </p>
      </div>
    </PageOverlay>
  )
}
