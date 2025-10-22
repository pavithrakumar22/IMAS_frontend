"use client"

import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PatientData } from "./type"

interface PatientsFiltersProps {
  searchTerm: string
  statusFilter: string
  complexityFilter: string
  diseaseFilter: string
  patients: PatientData[]
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onComplexityFilterChange: (value: string) => void
  onDiseaseFilterChange: (value: string) => void
  filteredCount: number
}

export function PatientsFilters({
  searchTerm,
  statusFilter,
  complexityFilter,
  diseaseFilter,
  patients,
  onSearchChange,
  onStatusFilterChange,
  onComplexityFilterChange,
  onDiseaseFilterChange,
  filteredCount
}: PatientsFiltersProps) {

  const getAllDiseases = () => {
    const diseases = new Set<string>()
    patients.forEach(patient => {
      if (patient.diseases && patient.diseases.length > 0) {
        patient.diseases.forEach(disease => {
          if (disease.name) diseases.add(disease.name)
        })
      }
      if (patient.Lastdisease) diseases.add(patient.Lastdisease)
    })
    return Array.from(diseases).sort()
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
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
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Complexity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>{filteredCount} patients</span>
      </div>
    </div>
  )
}