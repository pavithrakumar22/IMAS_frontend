import PatientsPage from "@/components/patient/patients-page"

export default function Page() {
  return <PatientsPage />
}

















// "use client"

// import { useState, useEffect } from "react"
// import { useUser } from "@clerk/nextjs"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Loader2 } from "lucide-react"
// import { PreviousCasesModal } from "@/components/patient/previous-cases-modal"
// import { PatientsTable } from "@/components/patient/patients-table"
// import { PatientsFilters } from "@/components/patient/patients-filter"
// import { PatientData, CaseData } from "@/components/patient/type"

// export default function PatientsPage() {
//   const { user, isLoaded } = useUser()
//   const [patients, setPatients] = useState<PatientData[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [statusFilter, setStatusFilter] = useState<string>("all")
//   const [complexityFilter, setComplexityFilter] = useState<string>("all")
//   const [diseaseFilter, setDiseaseFilter] = useState<string>("all")
//   const [sortBy, setSortBy] = useState<"name" | "lastVisit" | "cases" | "age">("lastVisit")
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
//   const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null)
//   const [showHistoryModal, setShowHistoryModal] = useState(false)
//   const [loadingPatient, setLoadingPatient] = useState(false)

//   // Fetch all patients from /get-all-patients endpoint
//   useEffect(() => {
//     const fetchPatients = async () => {
//       // Wait for Clerk to load and ensure user is authenticated
//       if (!isLoaded || !user) {
//         setLoading(false)
//         return
//       }

//       try {
//         setLoading(true)
//         const clerkUserId = user.id
        
//         const response = await fetch(`http://localhost:5000/api/auth/get-all-patients?clerkUserId=${clerkUserId}`)
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch patients')
//         }
        
//         const data = await response.json()
        
//         if (data.success && data.patients) {
//           const transformedPatients: PatientData[] = data.patients.map((patient: any) => ({
//             id: patient.patientId,
//             patientId: patient.patientId,
//             name: patient.name,
//             age: patient.age,
//             gender: patient.gender,
//             lastVisit: patient.LasttreatmentDate ? new Date(patient.LasttreatmentDate).toLocaleDateString() : 'Never',
//             cases: patient.diseases?.length || 1,
//             resolved: patient.diseases?.filter((d: any) => d.outcome === 'cured').length || 0,
//             outcome: patient.Lastoutcome || 'ongoing',
//             complexity: patient.Lastcomplexity || 'Not specified',
//             treatmentDate: patient.LasttreatmentDate,
//             totalDiseases: patient.diseases?.length || 1,
//             diseases: patient.diseases,
//             Lastdisease: patient.Lastdisease,
//             Lastdiagnosis: patient.Lastdiagnosis,
//             Lastoutcome: patient.Lastoutcome,
//             LasttreatmentDate: patient.LasttreatmentDate,
//             Lastcomplexity: patient.Lastcomplexity
//           }))
          
//           setPatients(transformedPatients)
//         } else {
//           throw new Error('Invalid response format')
//         }
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'Failed to load patients')
//         console.error('Error fetching patients:', err)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchPatients()
//   }, [user, isLoaded])

//   const handleViewHistory = async (patient: PatientData) => {
//     if (!user) {
//       setError('User not authenticated')
//       return
//     }

//     setSelectedPatient(patient)
//     setLoadingPatient(true)
//     try {
//       const clerkUserId = user.id
//       const response = await fetch(`http://localhost:5000/api/auth/get-patient?clerkUserId=${clerkUserId}&patientId=${patient.patientId}`)
      
//       if (response.ok) {
//         const data = await response.json()
//         if (data.success && data.patient) {
//           console.log('Patient details loaded:', data.patient)
//         }
//       }
//     } catch (err) {
//       console.error('Error fetching patient details:', err)
//     } finally {
//       setLoadingPatient(false)
//       setShowHistoryModal(true)
//     }
//   }

//   const handleSort = (column: typeof sortBy) => {
//     if (sortBy === column) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc")
//     } else {
//       setSortBy(column)
//       setSortOrder("desc")
//     }
//   }

//   // Filter patients based on search, status, complexity, and disease
//   const filteredPatients = patients
//     .filter(patient => {
//       // Search filter
//       const matchesSearch = searchTerm === "" || 
//         patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         patient.id.toLowerCase().includes(searchTerm.toLowerCase())
      
//       // Status filter - check all diseases
//       const matchesStatus = statusFilter === "all" || 
//         (patient.diseases && patient.diseases.some(d => d.outcome === statusFilter)) ||
//         patient.Lastoutcome === statusFilter
      
//       // Complexity filter - check all diseases
//       const matchesComplexity = complexityFilter === "all" || 
//         (patient.diseases && patient.diseases.some(d => d.complexity === complexityFilter)) ||
//         patient.Lastcomplexity === complexityFilter
      
//       // Disease filter - check all diseases
//       const matchesDisease = diseaseFilter === "all" || 
//         (patient.diseases && patient.diseases.some(d => 
//           d.name.toLowerCase().includes(diseaseFilter.toLowerCase())
//         )) ||
//         (patient.Lastdisease && patient.Lastdisease.toLowerCase().includes(diseaseFilter.toLowerCase()))
      
//       return matchesSearch && matchesStatus && matchesComplexity && matchesDisease
//     })
//     .sort((a, b) => {
//       let aValue: any, bValue: any
      
//       switch (sortBy) {
//         case "name":
//           aValue = a.name
//           bValue = b.name
//           break
//         case "lastVisit":
//           aValue = new Date(a.lastVisit)
//           bValue = new Date(b.lastVisit)
//           break
//         case "cases":
//           aValue = a.cases
//           bValue = b.cases
//           break
//         case "age":
//           aValue = a.age
//           bValue = b.age
//           break
//         default:
//           return 0
//       }
      
//       if (sortOrder === "asc") {
//         return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
//       } else {
//         return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
//       }
//     })

//   // Prepare data for the modal
//   const getModalCases = (): CaseData[] => {
//     if (!selectedPatient) return []
    
//     return [{
//       id: selectedPatient.id,
//       name: selectedPatient.name,
//       date: selectedPatient.lastVisit,
//       diagnosis: selectedPatient.Lastdiagnosis || "No diagnosis available",
//       outcome: selectedPatient.outcome,
//       age: selectedPatient.age,
//       gender: selectedPatient.gender,
//       diseases: selectedPatient.diseases,
//       Lastdisease: selectedPatient.Lastdisease,
//       Lastdiagnosis: selectedPatient.Lastdiagnosis,
//       Lastoutcome: selectedPatient.Lastoutcome,
//       LasttreatmentDate: selectedPatient.LasttreatmentDate,
//       patientId: selectedPatient.patientId
//     }]
//   }

//   // Show loading while Clerk is initializing
//   if (!isLoaded) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="flex items-center gap-2">
//           <Loader2 className="h-6 w-6 animate-spin" />
//           <span>Loading authentication...</span>
//         </div>
//       </div>
//     )
//   }

//   // Show error if user is not authenticated
//   if (!user) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-lg font-medium text-destructive">Authentication Required</p>
//           <p className="text-sm text-muted-foreground mt-2">Please sign in to view patient records</p>
//         </div>
//       </div>
//     )
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="flex items-center gap-2">
//           <Loader2 className="h-6 w-6 animate-spin" />
//           <span>Loading patients...</span>
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="text-center text-destructive">
//           <p className="text-lg font-medium">Error loading patients</p>
//           <p className="text-sm mt-2">{error}</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <>
//       <div className="min-h-screen bg-background p-6">
//         <div className="mx-auto max-w-7xl">
//           {/* Header */}
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
//             <p className="text-muted-foreground mt-2">
//               Manage and view patient medical histories and treatment outcomes
//             </p>
//             <div className="mt-2 text-sm text-muted-foreground">
//               Welcome, {user.firstName || user.username}
//             </div>
//           </div>

//           {/* Filters and Search */}
//           <Card className="mb-6">
//             <CardContent className="p-6">
//               <PatientsFilters
//                 searchTerm={searchTerm}
//                 statusFilter={statusFilter}
//                 complexityFilter={complexityFilter}
//                 diseaseFilter={diseaseFilter}
//                 patients={patients}
//                 onSearchChange={setSearchTerm}
//                 onStatusFilterChange={setStatusFilter}
//                 onComplexityFilterChange={setComplexityFilter}
//                 onDiseaseFilterChange={setDiseaseFilter}
//                 filteredCount={filteredPatients.length}
//               />
//             </CardContent>
//           </Card>

//           {/* Patients Table */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Patient Records</CardTitle>
//               <CardDescription>
//                 Comprehensive view of all patient cases and medical history
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <PatientsTable
//                 patients={filteredPatients}
//                 loadingPatient={loadingPatient}
//                 selectedPatient={selectedPatient}
//                 sortBy={sortBy}
//                 sortOrder={sortOrder}
//                 onSort={handleSort}
//                 onViewHistory={handleViewHistory}
//               />
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* History Modal */}
//       {showHistoryModal && selectedPatient && (
//         <PreviousCasesModal
//           cases={getModalCases()}
//           onClose={() => {
//             setShowHistoryModal(false)
//             setSelectedPatient(null)
//           }}
//         />
//       )}
//     </>
//   )
// }