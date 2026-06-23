import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost, apiPatch } from '../api/client'
import { PROGRAMS } from '../data/programs'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [intakeQueue,     setIntakeQueue]     = useState([])
  const [intakeVolume,    setIntakeVolume]    = useState([])
  const [memberSharedData, setMemberSharedData] = useState(null)
  const [providerPrograms, setProviderPrograms] = useState(PROGRAMS)
  const [dataErrors, setDataErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    Promise.allSettled([
      apiGet('/intakes'),
      apiGet('/intake-volume'),
      apiGet('/program-metrics'),
      apiGet('/provider/programs'),
    ])
      .then(([intakesResult, volumeResult, metricsResult, programsResult]) => {
        if (cancelled) return

        const nextErrors = {}

        if (intakesResult.status === 'fulfilled') {
          setIntakeQueue(intakesResult.value)
        } else {
          console.error('DataContext intakes fetch error:', intakesResult.reason)
          setIntakeQueue([])
          nextErrors.intakes = intakesResult.reason
        }

        if (volumeResult.status === 'fulfilled') {
          setIntakeVolume(volumeResult.value)
        } else {
          console.error('DataContext intake volume fetch error:', volumeResult.reason)
          setIntakeVolume([])
          nextErrors.intakeVolume = volumeResult.reason
        }

        if (metricsResult.status === 'fulfilled' && metricsResult.value.length > 0) {
          const map = {}
          for (const m of metricsResult.value) map[`${m.programId}_${m.gender}`] = m
          setMemberSharedData(map)
        } else {
          if (metricsResult.status === 'rejected') {
            console.error('DataContext program metrics fetch error:', metricsResult.reason)
            nextErrors.programMetrics = metricsResult.reason
          }
          setMemberSharedData(null)
        }

        if (programsResult.status === 'fulfilled' && programsResult.value.length > 0) {
          setProviderPrograms(programsResult.value)
        } else {
          if (programsResult.status === 'rejected') {
            console.error('DataContext provider programs fetch error:', programsResult.reason)
            nextErrors.providerPrograms = programsResult.reason
          }
          setProviderPrograms(PROGRAMS)
        }

        setDataErrors(nextErrors)
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

  async function updateIntakeWorkflow(intakeId, updates) {
    const updated = await apiPatch(`/intakes/${intakeId}`, updates)
    setIntakeQueue(prev => prev.map(i => i.id === intakeId ? updated : i))
    return updated
  }

  async function routeIntake(intakeId, program, workflow = {}) {
    const serverResponse = await apiPatch(`/intakes/${intakeId}`, {
      status:            'routed',
      assignedOrgId:     program.orgId,
      routedProgramId:   program.id,
      routedOrgName:     program.orgName,
      routedProgramName: program.name,
      ...workflow,
    })
    // Merge local values in so the UI reflects the routing immediately,
    // regardless of whether the server response includes the new fields yet.
    const updated = {
      ...serverResponse,
      status:            'routed',
      routedProgramId:   program.id,
      routedAt:          serverResponse.routedAt ?? new Date().toISOString(),
      routedOrgName:     program.orgName,
      routedProgramName: program.name,
    }
    setIntakeQueue(prev => prev.map(i => i.id === intakeId ? updated : i))
    return updated
  }

  async function routeCarePlan(intakeId, planItems, workflow = {}) {
    const routes = planItems.flatMap(item => {
      const supportTypes = item.supportTypes?.length ? item.supportTypes : [item.supportType]
      return supportTypes.map(supportType => ({
        programId: item.program.id,
        orgId: item.program.orgId,
        orgName: item.program.orgName,
        programName: item.program.name,
        supportType,
      }))
    })
    const serverResponse = await apiPatch(`/intakes/${intakeId}`, {
      routes,
      ...workflow,
    })
    const updated = {
      ...serverResponse,
      status: 'routed',
      routedPrograms: serverResponse.routedPrograms?.length
        ? serverResponse.routedPrograms
        : routes.map(route => ({ ...route, routedAt: new Date().toISOString() })),
    }
    setIntakeQueue(prev => prev.map(i => i.id === intakeId ? updated : i))
    return updated
  }

  const getIntakeEvents = useCallback(async function getIntakeEvents(intakeId) {
    return apiGet(`/intakes/${intakeId}/events`)
  }, [])

  const addIntakeNote = useCallback(async function addIntakeNote(intakeId, body, createdBy = 'Provider user') {
    return apiPost(`/intakes/${intakeId}/events`, { body, createdBy })
  }, [])

  async function updateProviderProgram(programId, payload) {
    const updated = await apiPatch(`/provider/programs/${programId}`, payload)
    setProviderPrograms(prev => prev.map(program => program.id === programId ? updated : program))
    return updated
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
        Loading...
      </div>
    )
  }

  return (
    <DataContext.Provider value={{
      intakeQueue,
      intakeVolume,
      memberSharedData,
      providerPrograms,
      dataErrors,
      submitIntake,
      routeIntake,
      routeCarePlan,
      updateIntakeWorkflow,
      getIntakeEvents,
      addIntakeNote,
      updateProviderProgram,
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
