import { useRef, useState } from 'react'
import { Download, Upload, CheckCircle, AlertCircle, X, FileText } from 'lucide-react'
import { useData } from '../context/DataContext'
import { apiGetText } from '../api/client'
import {
  downloadCsv, detectCsvType,
  CSV_TYPES, CSV_FILENAMES, CSV_LABELS,
} from '../utils/csvUtils'

const DOWNLOAD_ORDER = [
  CSV_TYPES.INTAKE_QUEUE,
  CSV_TYPES.INTAKE_VOLUME,
  CSV_TYPES.MEMBER_SHARED,
]

const DATA_DESCRIPTIONS = {
  [CSV_TYPES.INTAKE_QUEUE]:  'Intake records from the Shared Intake Queue — one row per submission.',
  [CSV_TYPES.INTAKE_VOLUME]: 'Weekly intake volume bars shown in the CarePath Intake Data chart.',
  [CSV_TYPES.MEMBER_SHARED]: 'Program capacity, outcomes and demographics — one row per program × gender.',
}

export default function ProviderSettings() {
  const { refresh } = useData()
  const fileInputRef = useRef(null)
  const [uploadState, setUploadState] = useState(null)
  // uploadState shape:
  //   null
  //   { status: 'preview', type, filename, text, rowCount }
  //   { status: 'success', type, filename }
  //   { status: 'error',   message }

  // ── Downloads ─────────────────────────────────────────────────────────────

  async function handleDownload(type) {
    try {
      const content = await apiGetText(`/admin/export-csv?type=${type}`)
      downloadCsv(content, CSV_FILENAMES[type])
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  // ── File selection ────────────────────────────────────────────────────────

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const type = detectCsvType(file.name)
    if (!type) {
      setUploadState({
        status: 'error',
        message: `Cannot identify data type from "${file.name}". ` +
          `Expected filename starting with: shared-intake-queue, carepath-intake-data, or member-shared-data.`,
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target.result
      const nonEmptyLines = text.trim().split('\n').filter(Boolean)
      const rowCount = Math.max(0, nonEmptyLines.length - 1) // subtract header
      setUploadState({ status: 'preview', type, filename: file.name, text, rowCount })
    }
    reader.onerror = () => setUploadState({ status: 'error', message: 'Could not read file.' })
    reader.readAsText(file)
  }

  // ── Confirm import ────────────────────────────────────────────────────────

  async function handleConfirmUpload() {
    if (uploadState?.status !== 'preview') return
    const { type, text, filename } = uploadState
    try {
      const res = await fetch(`/api/admin/import-csv?type=${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      if (!res.ok) throw new Error(await res.text())
      refresh()
      setUploadState({ status: 'success', type, filename })
    } catch (err) {
      setUploadState({ status: 'error', message: `Import error: ${err.message}` })
    }
  }

  function handleCancel() { setUploadState(null) }
  function handleReset()  { setUploadState(null); fileInputRef.current?.click() }

  return (
    <div className="max-w-2xl space-y-10">

      {/* ── Download Data ──────────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-slate-800 mb-1">Download Data</h2>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Export current session data as structured CSV files. Modify the data offline,
          then upload the same file (keeping the filename prefix unchanged) to update the app.
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

      {/* ── Upload Data ────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-slate-800 mb-1">Upload Data</h2>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Upload a modified CSV to overwrite the matching data source for the current session.
          The filename must start with the same prefix as the downloaded file so the app can
          identify which data to replace. Once connected to Supabase, uploading will empty and
          repopulate the corresponding table.
        </p>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Drop zone — shown when no upload in progress */}
        {!uploadState && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center gap-2 px-6 py-8 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:border-brand-400 hover:text-brand-500 hover:bg-brand-50 transition-all"
          >
            <Upload size={22} />
            <span className="text-sm font-medium">Choose a CSV file to upload</span>
            <span className="text-xs">shared-intake-queue · carepath-intake-data · member-shared-data</span>
          </button>
        )}

        {/* Preview / confirm */}
        {uploadState?.status === 'preview' && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-blue-900">Ready to import</p>
                <p className="text-xs text-blue-600 font-mono mt-0.5">{uploadState.filename}</p>
              </div>
              <button onClick={handleCancel} className="text-blue-300 hover:text-blue-600 transition-colors">
                <X size={15} />
              </button>
            </div>

            <div className="bg-white rounded-lg border border-blue-100 px-4 py-3 text-xs text-slate-700 space-y-1">
              <p>
                <span className="font-semibold">Data source:</span>{' '}
                {CSV_LABELS[uploadState.type]}
              </p>
              <p>
                <span className="font-semibold">Records detected:</span>{' '}
                {uploadState.rowCount} row{uploadState.rowCount !== 1 ? 's' : ''}
              </p>
              <p className="text-slate-400 pt-1">
                This will overwrite the current session data for this source. The change is
                session-only until Supabase is connected.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleConfirmUpload}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white hover:bg-brand-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <Upload size={12} />
                Confirm import
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Success */}
        {uploadState?.status === 'success' && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 flex items-start gap-3">
            <CheckCircle size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-900">Import successful</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                <span className="font-medium">{CSV_LABELS[uploadState.type]}</span> has been updated
                for this session from <span className="font-mono">{uploadState.filename}</span>.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleReset}
                className="text-xs text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
              >
                Upload another
              </button>
              <button onClick={handleCancel} className="text-emerald-300 hover:text-emerald-600">
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {uploadState?.status === 'error' && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 flex items-start gap-3">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">Import failed</p>
              <p className="text-xs text-red-700 mt-0.5">{uploadState.message}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleReset}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Try again
              </button>
              <button onClick={handleCancel} className="text-red-300 hover:text-red-500">
                <X size={15} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
