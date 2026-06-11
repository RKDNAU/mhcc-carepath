import { useState } from 'react'
import { Download, RefreshCcw, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import { useData } from '../context/DataContext'
import { apiGetText, apiPost } from '../api/client'
import {
  downloadCsv,
  CSV_TYPES,
  CSV_FILENAMES,
  CSV_LABELS,
} from '../utils/csvUtils'

const DOWNLOAD_ORDER = [
  CSV_TYPES.INTAKE_QUEUE,
  CSV_TYPES.INTAKE_VOLUME,
  CSV_TYPES.MEMBER_SHARED,
]

const DATA_DESCRIPTIONS = {
  [CSV_TYPES.INTAKE_QUEUE]: 'Intake records from the Shared Intake Queue - one row per submission.',
  [CSV_TYPES.INTAKE_VOLUME]: 'Weekly intake volume bars shown in the Intake Data chart.',
  [CSV_TYPES.MEMBER_SHARED]: 'Sector Data for program capacity, outcomes and demographics - one row per program and gender.',
}

export default function ProviderSettings() {
  const { refresh } = useData()
  const [refreshState, setRefreshState] = useState(null)

  async function handleDownload(type) {
    try {
      const content = await apiGetText(`/admin/export-csv?type=${type}`)
      downloadCsv(content, CSV_FILENAMES[type])
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  async function handleRefreshMockData() {
    setRefreshState({ status: 'loading' })
    try {
      const result = await apiPost('/admin/refresh-mock-data', {})
      refresh()
      setRefreshState({ status: 'success', result })
    } catch (err) {
      setRefreshState({ status: 'error', message: err.message })
    }
  }

  return (
    <div className="max-w-2xl space-y-10">
      <section>
        <h2 className="text-sm font-semibold text-slate-800 mb-1">Download Data</h2>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Export current data as structured CSV files for review or offline analysis.
        </p>

        <div className="space-y-2.5">
          {DOWNLOAD_ORDER.map(type => (
            <div
              key={type}
              className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4"
            >
              <FileText size={16} className="text-brand-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{CSV_LABELS[type]}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{DATA_DESCRIPTIONS[type]}</p>
                <p className="text-[11px] text-brand-500 font-mono mt-1">{CSV_FILENAMES[type]}</p>
              </div>
              <button
                onClick={() => handleDownload(type)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg text-xs font-medium transition-colors border border-brand-100"
              >
                <Download size={12} />
                Download
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-800 mb-1">Refresh Mock Data</h2>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Clear and recreate demo intakes, intake volume, and program metrics in SQLite with dates close to today.
        </p>

        <button
          onClick={handleRefreshMockData}
          disabled={refreshState?.status === 'loading'}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 text-white hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-colors"
        >
          <RefreshCcw size={16} className={refreshState?.status === 'loading' ? 'animate-spin' : ''} />
          {refreshState?.status === 'loading' ? 'Refreshing...' : 'Refresh mock data'}
        </button>

        {refreshState?.status === 'success' && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
            <CheckCircle size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">Mock data refreshed</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                {refreshState.result.intakes} intakes, {refreshState.result.intakeVolumeWeeks} intake weeks,
                and {refreshState.result.programMetrics} program metric rows were recreated.
              </p>
            </div>
          </div>
        )}

        {refreshState?.status === 'error' && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">Refresh failed</p>
              <p className="text-xs text-red-700 mt-0.5">{refreshState.message}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
