import { X } from 'lucide-react'
import carePath from '/img/CarePath.png'

export default function PageOverlay({ title, subtitle, onClose, children, maxWidth = 'max-w-4xl' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 shadow-sm flex-shrink-0">
        <div className={`${maxWidth} mx-auto px-4 sm:px-6 py-4 flex items-center gap-4`}>
          <div className="flex items-center gap-2.5 flex-1">
            <img src={carePath} alt="CarePath" className="w-7 h-7 rounded-lg object-contain flex-shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-none">{title}</h2>
              {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className={`${maxWidth} mx-auto px-4 sm:px-6 py-8`}>
          {children}
        </div>
      </div>
    </div>
  )
}
