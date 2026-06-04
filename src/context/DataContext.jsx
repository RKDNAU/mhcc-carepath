import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost } from '../api/client'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [intakeQueue,     setIntakeQueue]     = useState([])
  const [intakeVolume,    setIntakeVolume]    = useState([])
  const [memberSharedData, setMemberSharedData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    Promise.all([
      apiGet('/intakes'),
      apiGet('/intake-volume'),
      apiGet('/program-metrics'),
    ])
      .then(([intakes, volume, metrics]) => {
        if (cancelled) return
        setIntakeQueue(intakes)
        setIntakeVolume(volume)
        if (metrics.length > 0) {
          const map = {}
          for (const m of metrics) map[`${m.programId}_${m.gender}`] = m
          setMemberSharedData(map)
        } else {
          setMemberSharedData(null)
        }
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        console.error('DataContext fetch error:', err)
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [refreshKey])

  async function submitIntake(formData) {
    await apiPost('/intakes', formData)
    refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
        Loading…
      </div>
    )
  }

  return (
    <DataContext.Provider value={{
      intakeQueue,
      intakeVolume,
      memberSharedData,
      submitIntake,
      refresh,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within a DataProvider')
  return ctx
}
