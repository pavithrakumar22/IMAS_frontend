"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { CasesDisplay } from "@/components/patient/cases-display"
import { PatientsFilters } from "@/components/patient/patients-filter"
import type { PatientData } from "@/components/patient/type"

export default function PatientsPage() {
  const { user, isLoaded } = useUser()
  const [patients, setPatients] = useState<PatientData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [complexityFilter, setComplexityFilter] = useState<string>("all")
  const [diseaseFilter, setDiseaseFilter] = useState<string>("all")
  const [patientFilter, setPatientFilter] = useState<string>("all")

  useEffect(() => {
    const fetchPatients = async () => {
      if (!isLoaded || !user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const clerkUserId = user.id

        const response = await fetch(`http://localhost:5000/api/auth/get-all-patients?clerkUserId=${clerkUserId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch patients")
        }

        const data = await response.json()

        if (data.success && data.patients) {
          const transformedPatients: PatientData[] = data.patients.map((patient: any) => ({
            id: patient.patientId,
            patientId: patient.patientId,
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            lastVisit: patient.LasttreatmentDate ? new Date(patient.LasttreatmentDate).toLocaleDateString() : "Never",
            cases: patient.diseases?.length || 1,
            resolved: patient.diseases?.filter((d: any) => d.outcome === "cured").length || 0,
            outcome: patient.Lastoutcome || "ongoing",
            complexity: patient.Lastcomplexity || "Not specified",
            treatmentDate: patient.LasttreatmentDate,
            totalDiseases: patient.diseases?.length || 1,
            diseases: patient.diseases,
            Lastdisease: patient.Lastdisease,
            Lastdiagnosis: patient.Lastdiagnosis,
            Lastoutcome: patient.Lastoutcome,
            LasttreatmentDate: patient.LasttreatmentDate,
            Lastcomplexity: patient.Lastcomplexity,
          }))

          setPatients(transformedPatients)
        } else {
          throw new Error("Invalid response format")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load patients")
        console.error("Error fetching patients:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [user, isLoaded])

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      searchTerm === "" ||
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPatientFilter = patientFilter === "all" || patient.patientId === patientFilter

    return matchesSearch && matchesPatientFilter
  })

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading authentication...</span>
        </div>
      </div>
    )
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-destructive">Authentication Required</p>
          <p className="text-sm text-muted-foreground mt-2">Please sign in to view patient records</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading patients...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-destructive">
          <p className="text-lg font-medium">Error loading patients</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Medical Cases</h1>
          <p className="text-muted-foreground mt-2">View and manage all patient medical cases and diagnoses</p>
          <div className="mt-2 text-sm text-muted-foreground">Welcome, {user.firstName || user.username}</div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <PatientsFilters
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              complexityFilter={complexityFilter}
              diseaseFilter={diseaseFilter}
              patientFilter={patientFilter}
              patients={filteredPatients}
              onSearchChange={setSearchTerm}
              onStatusFilterChange={setStatusFilter}
              onComplexityFilterChange={setComplexityFilter}
              onDiseaseFilterChange={setDiseaseFilter}
              onPatientFilterChange={setPatientFilter}
              filteredCount={0}
            />
          </CardContent>
        </Card>

        {/* Cases Display */}
        <Card>
          <CardHeader>
            <CardTitle>All Cases</CardTitle>
            <CardDescription>Complete medical cases with diagnosis, outcomes, and complexity levels</CardDescription>
          </CardHeader>
          <CardContent>
            <CasesDisplay
              patients={filteredPatients}
              statusFilter={statusFilter}
              complexityFilter={complexityFilter}
              diseaseFilter={diseaseFilter}
              patientFilter={patientFilter}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
