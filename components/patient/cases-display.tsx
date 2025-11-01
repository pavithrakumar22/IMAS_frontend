"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, User, AlertTriangle, FileText, Stethoscope } from "lucide-react"
import { FullDiagnosisModal } from "./full-diagnosis-modal"
import type { PatientData, DiseaseData } from "./types"

interface CasesDisplayProps {
  patients: PatientData[]
  statusFilter: string
  complexityFilter: string
  diseaseFilter: string
  patientFilter: string
}

export function CasesDisplay({
  patients,
  statusFilter,
  complexityFilter,
  diseaseFilter,
  patientFilter,
}: CasesDisplayProps) {
  const [selectedDisease, setSelectedDisease] = useState<{ disease: DiseaseData; patientName: string } | null>(null)
  const [visibleCases, setVisibleCases] = useState(5)
  const [allCases, setAllCases] = useState<Array<{
    disease: DiseaseData
    patientName: string
    patientId: string
    patientAge?: number
    patientGender?: string
  }>>([])

  const getAllCases = useCallback(() => {
    const cases: Array<{
      disease: DiseaseData
      patientName: string
      patientId: string
      patientAge?: number
      patientGender?: string
    }> = []

    patients.forEach((patient) => {
      // Filter by patient name if patient filter is set
      if (patientFilter !== "all" && patient.patientId !== patientFilter) {
        return
      }

      if (patient.diseases && patient.diseases.length > 0) {
        patient.diseases.forEach((disease) => {
          // Apply additional filters
          if (statusFilter !== "all" && disease.outcome !== statusFilter) return
          if (complexityFilter !== "all" && disease.complexity !== complexityFilter) return
          if (diseaseFilter !== "all" && !disease.name.toLowerCase().includes(diseaseFilter.toLowerCase())) return

          cases.push({
            disease,
            patientName: patient.name,
            patientId: patient.patientId,
            patientAge: patient.age,
            patientGender: patient.gender,
          })
        })
      }
    })

    // Sort by treatment date descending
    return cases.sort(
      (a, b) => new Date(b.disease.treatmentDate).getTime() - new Date(a.disease.treatmentDate).getTime(),
    )
  }, [patients, statusFilter, complexityFilter, diseaseFilter, patientFilter])

  // Update all cases when filters change
  useEffect(() => {
    const cases = getAllCases()
    setAllCases(cases)
    setVisibleCases(5) // Reset to first 5 when filters change
  }, [getAllCases])

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
        setVisibleCases(prev => Math.min(prev + 5, allCases.length))
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [allCases.length])

  const renderMarkdown = (content: string) => {
    if (!content) return { __html: "" }
    const lines = content.split("\n")
    let inList = false
    let html = ""

    for (const line of lines) {
      const trimmedLine = line.trim()

      if (trimmedLine.startsWith("##### ") || trimmedLine.startsWith("#### ")) {
        html += `<h5 class="text-md font-semibold mt-4 mb-2 text-gray-900">${trimmedLine.substring(5)}</h5>`
      } else if (trimmedLine.startsWith("### ")) {
        html += `<h4 class="text-lg font-semibold mt-6 mb-3 text-gray-900">${trimmedLine.substring(4)}</h4>`
      } else if (trimmedLine.startsWith("## ")) {
        html += `<h3 class="text-xl font-semibold mt-8 mb-4 text-gray-900 border-b border-gray-200 pb-2">${trimmedLine.substring(3)}</h3>`
      } else if (trimmedLine.startsWith("# ")) {
        html += `<h2 class="text-2xl font-bold mt-10 mb-6 text-gray-900 border-b border-gray-200 pb-3">${trimmedLine.substring(2)}</h2>`
      } else if (trimmedLine.startsWith("• ") || trimmedLine.startsWith("* ") || trimmedLine.startsWith("- ")) {
        if (!inList) {
          html += '<ul class="list-disc ml-6 space-y-2">'
          inList = true
        }
        const listItem = trimmedLine
          .substring(2)
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>')
        html += `<li class="text-gray-800 mb-2">${listItem}</li>`
      } else if (inList && trimmedLine === "") {
        html += "</ul>"
        inList = false
      } else if (trimmedLine) {
        if (inList) {
          html += "</ul>"
          inList = false
        }
        const processedLine = trimmedLine
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>')
        html += `<p class="text-gray-800 mb-3">${processedLine}</p>`
      } else {
        html += "<br>"
      }
    }

    if (inList) {
      html += "</ul>"
    }

    return { __html: `<div class="space-y-4">${html}</div>` }
  }

  const getDiagnosisPreview = (diagnosis: string) => {
    if (!diagnosis) return "No diagnosis available"
    const plainText = diagnosis.replace(/[#*\-•`]/g, "").replace(/\n/g, " ")
    if (plainText.length <= 150) return plainText
    return plainText.substring(0, 150) + "..."
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "cured":
        return "bg-gray-100 text-gray-800 border border-gray-300"
      case "improved":
        return "bg-gray-100 text-gray-800 border border-gray-300"
      case "referred":
        return "bg-gray-100 text-gray-800 border border-gray-300"
      case "ongoing":
        return "bg-gray-100 text-gray-800 border border-gray-300"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300"
    }
  }

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case "high":
        return "bg-gray-900 text-white border border-gray-900"
      case "medium":
        return "bg-gray-700 text-white border border-gray-700"
      case "low":
        return "bg-gray-500 text-white border border-gray-500"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const displayedCases = allCases.slice(0, visibleCases)
  const hasMoreCases = visibleCases < allCases.length

  if (allCases.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-700 text-lg font-medium">No cases found</p>
        <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {displayedCases.map((caseItem, index) => (
          <div 
            key={index} 
            className="border border-gray-300 rounded-lg bg-white hover:shadow-md transition-all hover:border-gray-400"
          >
            {/* Case Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-300 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-700" />
                    <h3 className="text-lg font-bold text-gray-900">{caseItem.patientName}</h3>
                  </div>
                  {caseItem.patientAge && (
                    <span className="text-sm text-gray-700 bg-white px-3 py-1 rounded-full border border-gray-300">
                      Age: {caseItem.patientAge}
                    </span>
                  )}
                  {caseItem.patientGender && (
                    <span className="text-sm text-gray-700 bg-white px-3 py-1 rounded-full border border-gray-300">
                      {caseItem.patientGender}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(caseItem.disease.treatmentDate)}</span>
                </div>
              </div>
            </div>

            {/* Case Details */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Condition Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-gray-700" />
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {caseItem.disease.name || "Unknown Condition"}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getOutcomeColor(caseItem.disease.outcome)}`}
                        >
                          {caseItem.disease.outcome}
                        </span>
                        {caseItem.disease.complexity && (
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getComplexityColor(caseItem.disease.complexity)}`}
                          >
                            {caseItem.disease.complexity} complexity
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Patient ID */}
                    <div className="flex items-center gap-4 text-sm text-gray-700 mb-4">
                      <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full border border-gray-300">
                        <User className="w-3 h-3" />
                        ID: {caseItem.patientId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Diagnosis Preview */}
                <div className="bg-white rounded-lg p-4 border border-gray-300">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-gray-700" />
                    <h5 className="font-semibold text-gray-900 text-sm">Diagnosis Preview</h5>
                  </div>
                  <div className="text-gray-800 text-sm leading-relaxed">
                    <p>{getDiagnosisPreview(caseItem.disease.diagnosis)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedDisease({ disease: caseItem.disease, patientName: caseItem.patientName })}
                    className="text-gray-900 hover:text-black text-sm font-medium mt-3 inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors border border-gray-300"
                  >
                    Read full diagnosis
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Translated Disease Name */}
                {caseItem.disease.nameTranslated && caseItem.disease.nameTranslated !== caseItem.disease.name && (
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-300">
                    <span className="font-medium text-gray-800">Translated Diagnosis:</span> {caseItem.disease.nameTranslated}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Indicator */}
      {hasMoreCases && (
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Loading more cases...</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Scroll down to load more cases ({visibleCases} of {allCases.length} shown)
          </p>
        </div>
      )}

      {/* Show message when all cases are loaded */}
      {!hasMoreCases && allCases.length > 5 && (
        <div className="text-center py-6">
          <p className="text-sm text-gray-600 font-medium">
            All {allCases.length} cases are displayed
          </p>
        </div>
      )}

      {/* Full Diagnosis Modal */}
      {selectedDisease && (
        <FullDiagnosisModal
          disease={selectedDisease.disease}
          patientName={selectedDisease.patientName}
          onClose={() => setSelectedDisease(null)}
        />
      )}
    </>
  )
}