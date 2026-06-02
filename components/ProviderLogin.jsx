import { useState } from 'react'
import { X, Lock, User } from 'lucide-react'
import carePath from '/img/CarePath.png'

export default function ProviderLogin({ onLogin, onClose }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username.trim()) onLogin({ username: username.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up border-t-[3px] border-highlight"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <img src={carePath} alt="CarePath" className="w-8 h-8 rounded-lg object-contain" />
            <div>
              <span className="font-bold text-slate-900 text-sm block leading-none">Provider Portal</span>
              <span className="text-[10px] text-brand-600 mt-0.5 block">CarePath by MHCC ACT</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div>
            <label className="form-label">Username</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                className="form-input pl-9"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="password"
                className="form-input pl-9"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full btn-primary justify-center disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            Sign in to portal
          </button>
          <p className="text-[11px] text-slate-400 text-center">
            Prototype mode: any credentials are accepted
          </p>
        </form>
      </div>
    </div>
  )
}
