import { createContext, useContext, useState } from 'react'
import { SAMPLE_INTAKES } from '../data/sampleIntakes'

// Default intake volume — also the source of truth for carepath-intake-data.csv
export const INTAKE_VOLUME_DEFAULT = [
  { week: 'Apr 7',  count: 3 },
  { week: 'Apr 14', count: 5 },
  { week: 'Apr 21', count: 4 },
  { week: 'Apr 28', count: 6 },
  { week: 'May 5',  count: 3 },
  { week: 'May 12', count: 1 },
  { week: 'May 19', count: 4 },
  { week: 'May 26', count: 5 },
]

const DataContext = createContext(null)

export function DataProvider({ children }) {
  // Shared Intake Queue — array of intake records
  const [intakeQueue, setIntakeQueue] = useState(SAMPLE_INTAKES)

  // CarePath intake volume — array of { week, count } weekly bars
  const [intakeVolume, setIntakeVolume] = useState(INTAKE_VOLUME_DEFAULT)

  // Member Shared Data — map of "programId_gender" → metrics object.
  // null means "use generated (seeded) data". Set to a populated object after upload.
  const [memberSharedData, setMemberSharedData] = useState(null)

  return (
    <DataContext.Provider value={{
      intakeQueue, setIntakeQueue,
      intakeVolume, setIntakeVolume,
      memberSharedData, setMemberSharedData,
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
