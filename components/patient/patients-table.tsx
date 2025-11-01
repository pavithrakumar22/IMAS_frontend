"use client"

import type React from "react"

import { User, Calendar, Stethoscope, ArrowUpDown, Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PatientData } from "./type"

interface PatientsTableProps {
  patients: PatientData[]
  loadingPatient: boolean
  selectedPatient: PatientData | null
  sortBy: "name" | "lastVisit" | "cases" | "age"
  sortOrder: "asc" | "desc"
  onSort: (column: "name" | "lastVisit" | "cases" | "age") => void
  onViewHistory: (patient: PatientData) => void
}

export function PatientsTable({
  patients,
  loadingPatient,
  selectedPatient,
  sortBy,
  sortOrder,
  onSort,
  onViewHistory,
}: PatientsTableProps) {
  const getOutcomeColor = (outcome: string) => {
    switch (outcome.toLowerCase()) {
      case "cured":
        return "bg-green-100 text-green-800 border border-green-200"
      case "improved":
        return "bg-blue-100 text-blue-800 border border-blue-200"
      case "ongoing":
        return "bg-gray-100 text-gray-800 border border-gray-200"
      case "referred":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border border-red-200"
      case "medium":
        return "bg-orange-100 text-orange-800 border border-orange-200"
      case "low":
        return "bg-green-100 text-green-800 border border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  const SortButton = ({ column, children }: { column: typeof sortBy; children: React.ReactNode }) => (
    <Button variant="ghost" size="sm" onClick={() => onSort(column)} className="flex items-center gap-1 h-8 px-2">
      {children}
      <ArrowUpDown className={`h-3 w-3 ${sortBy === column ? "text-primary" : "text-muted-foreground"}`} />
    </Button>
  )

  if (patients.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium text-muted-foreground">No patients found</p>
        <p className="text-sm text-muted-foreground mt-2">No patient records match your filters</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b font-medium text-sm">
        <div className="col-span-3">
          <SortButton column="name">Patient</SortButton>
        </div>
        <div className="col-span-1 text-center">
          <SortButton column="age">Age</SortButton>
        </div>
        <div className="col-span-2 text-center">Status</div>
        <div className="col-span-2 text-center">Complexity</div>
        <div className="col-span-2 text-center">
          <SortButton column="lastVisit">Last Visit</SortButton>
        </div>
        <div className="col-span-1 text-center">
          <SortButton column="cases">Cases</SortButton>
        </div>
        <div className="col-span-1 text-center">Actions</div>
      </div>

      <div className="divide-y">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors"
          >
            <div className="col-span-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">{patient.id}</p>
                </div>
              </div>
            </div>

            <div className="col-span-1 text-center">
              <span className="font-medium">{patient.age}</span>
            </div>

            <div className="col-span-2 text-center">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize inline-block ${getOutcomeColor(patient.outcome)}`}
              >
                {patient.outcome}
              </span>
            </div>

            <div className="col-span-2 text-center">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize inline-block ${getComplexityColor(patient.complexity)}`}
              >
                {patient.complexity}
              </span>
            </div>

            <div className="col-span-2 text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {patient.lastVisit}
              </div>
            </div>

            <div className="col-span-1 text-center">
              <div className="flex items-center justify-center gap-1">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{patient.cases}</span>
              </div>
              <div className="text-xs text-muted-foreground">{patient.resolved} resolved</div>
            </div>

            <div className="col-span-1 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewHistory(patient)}
                className="flex items-center gap-1"
                disabled={loadingPatient && selectedPatient?.id === patient.id}
              >
                {loadingPatient && selectedPatient?.id === patient.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                View
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}