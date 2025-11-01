"use client"

import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { PatientData } from "./types"

interface PatientsFiltersProps {
  searchTerm: string
  statusFilter: string
  complexityFilter: string
  diseaseFilter: string
  patientFilter: string
  patients: PatientData[]
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onComplexityFilterChange: (value: string) => void
  onDiseaseFilterChange: (value: string) => void
  onPatientFilterChange: (value: string) => void
  filteredCount: number
}

export function PatientsFilters({
  searchTerm,
  statusFilter,
  complexityFilter,
  diseaseFilter,
  patientFilter,
  patients,
  onSearchChange,
  onStatusFilterChange,
  onComplexityFilterChange,
  onDiseaseFilterChange,
  onPatientFilterChange,
  filteredCount,
}: PatientsFiltersProps) {
  const truncateDiseaseName = (disease: string, maxLength: number = 30) => {
    if (disease.length <= maxLength) return disease
    return disease.substring(0, maxLength) + '...'
  }

  const getAllDiseases = () => {
    const diseases = new Set<string>()
    patients.forEach((patient) => {
      if (patient.diseases && patient.diseases.length > 0) {
        patient.diseases.forEach((disease) => {
          if (disease.name) diseases.add(disease.name)
        })
      }
      if (patient.Lastdisease) diseases.add(patient.Lastdisease)
    })
    return Array.from(diseases).sort()
  }

  const getUniquePatients = () => {
    const seen = new Set<string>()
    return patients.filter((patient) => {
      if (seen.has(patient.patientId)) return false
      seen.add(patient.patientId)
      return true
    })
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="flex flex-1 items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-gray-300 bg-white text-black placeholder-gray-500"
          />
        </div>

        <select
          value={patientFilter}
          onChange={(e) => onPatientFilterChange(e.target.value)}
          className="h-10 rounded-md border border-gray-300 bg-white text-black px-3 py-2 text-sm font-medium"
        >
          <option value="all">All Patients</option>
          {getUniquePatients().map((patient) => (
            <option key={patient.patientId} value={patient.patientId}>
              {patient.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="h-10 rounded-md border border-gray-300 bg-white text-black px-3 py-2 text-sm font-medium"
        >
          <option value="all">All Status</option>
          <option value="cured">Cured</option>
          <option value="improved">Improved</option>
          <option value="ongoing">Ongoing</option>
          <option value="referred">Referred</option>
        </select>

        <select
          value={complexityFilter}
          onChange={(e) => onComplexityFilterChange(e.target.value)}
          className="h-10 rounded-md border border-gray-300 bg-white text-black px-3 py-2 text-sm font-medium"
        >
          <option value="all">All Complexity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          value={diseaseFilter}
          onChange={(e) => onDiseaseFilterChange(e.target.value)}
          className="h-10 rounded-md border border-gray-300 bg-white text-black px-3 py-2 text-sm font-medium max-w-xs"
        >
          <option value="all">All Diseases</option>
          {getAllDiseases().map((disease) => (
            <option key={disease} value={disease} title={disease}>
              {truncateDiseaseName(disease)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
        <Filter className="h-4 w-4" />
        <span>{filteredCount} cases</span>
      </div>
    </div>
  )
}
