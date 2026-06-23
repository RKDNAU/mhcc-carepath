import { ExternalLink, Calendar } from 'lucide-react'
import { NEWS_ARTICLES } from '../data/news'
import PageOverlay from './PageOverlay'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function ArticleCard({ article }) {
  return (
    <article className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h2 className="text-base font-bold text-slate-900 leading-snug">{article.title}</h2>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
        <Calendar size={12} />
        {formatDate(article.date)}
        <span className="mx-1">-</span>
        <span>{article.source}</span>
      </div>
      <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
        {article.body}
      </div>
      <div className="mt-5 pt-4 border-t border-slate-100">
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 hover:underline transition-colors font-medium"
        >
          Read on mhccact.org.au
          <ExternalLink size={11} />
        </a>
      </div>
    </article>
  )
}

export default function NewsUpdatesPage({ onClose }) {
  return (
    <PageOverlay
      title="News & Updates"
      subtitle={`Latest ${NEWS_ARTICLES.length} posts from MHCC ACT`}
      onClose={onClose}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Content sourced from{' '}
            <a
              href="https://mhccact.org.au/news/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline"
            >
              mhccact.org.au
            </a>.
          </p>
        </div>

        <div className="space-y-5">
          {NEWS_ARTICLES.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </PageOverlay>
  )
}
