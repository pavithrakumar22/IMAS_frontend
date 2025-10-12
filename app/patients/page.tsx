import { PatientsClient } from "@/components/dashboard/patients-client"

type PatientRow = {
  id: string
  name: string
  age: number
  lastVisit: string
  cases: number
  resolved: number
}

const patients: PatientRow[] = [
  { id: "P-001", name: "Patient A", age: 34, lastVisit: "2025-09-20", cases: 3, resolved: 3 },
  { id: "P-002", name: "Patient B", age: 58, lastVisit: "2025-09-19", cases: 2, resolved: 1 },
  { id: "P-003", name: "Patient C", age: 26, lastVisit: "2025-09-18", cases: 1, resolved: 0 },
]

export default function PatientsPage() {
  return <PatientsClient />
}
