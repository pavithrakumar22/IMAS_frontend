"use client"

import type React from "react"

import { useState } from "react"
import { X, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FullDiagnosisModal } from "./full-diagnosis-modal"
import type { CaseData, DiseaseData } from "./type"

interface PreviousCasesModalProps {
  cases: CaseData[]
  onClose: () => void
}

export function PreviousCasesModal({ cases, onClose }: PreviousCasesModalProps) {
  const [selectedDisease, setSelectedDisease] = useState<{ disease: DiseaseData; patientName: string } | null>(null)

  const renderMarkdown = (content: string) => {
    if (!content) return { __html: "" }
    const lines = content.split("\n")
    let inList = false
    let html = ""

    for (const line of lines) {
      const trimmedLine = line.trim()

      if (trimmedLine.startsWith("##### ") || trimmedLine.startsWith("#### ")) {
        html += `<h5 class="text-md font-semibold mt-4 mb-2 text-gray-800">${trimmedLine.substring(5)}</h5>`
      } else if (trimmedLine.startsWith("### ")) {
        html += `<h4 class="text-lg font-semibold mt-6 mb-3 text-gray-800">${trimmedLine.substring(4)}</h4>`
      } else if (trimmedLine.startsWith("## ")) {
        html += `<h3 class="text-xl font-semibold mt-8 mb-4 text-gray-800 border-b pb-2">${trimmedLine.substring(3)}</h3>`
      } else if (trimmedLine.startsWith("# ")) {
        html += `<h2 class="text-2xl font-bold mt-10 mb-6 text-gray-800 border-b pb-3">${trimmedLine.substring(2)}</h2>`
      } else if (trimmedLine.startsWith("• ") || trimmedLine.startsWith("* ") || trimmedLine.startsWith("- ")) {
        if (!inList) {
          html += '<ul class="list-disc ml-6 space-y-2">'
          inList = true
        }
        const listItem = trimmedLine
          .substring(2)
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
        html += `<li class="text-gray-700 mb-2">${listItem}</li>`
      } else if (inList && trimmedLine === "") {
        html += "</ul>"
        inList = false
      } else if (trimmedLine) {
        if (inList) {
          html += "</ul>"
          inList = false
        }
        const processedLine = trimmedLine
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
        html += `<p class="text-gray-700 mb-3">${processedLine}</p>`
      } else {
        html += "<br>"
      }
    }

    if (inList) {
      html += "</ul>"
    }

    return { __html: `<div class="space-y-4">${html}</div>` }
  }

  const cleanSimplifiedContent = (content: string) => {
    if (!content) return ""
    return content
      .replace(/\$\$simple conversational version\$\$:\*\*\\\\n\\\\n/g, "")
      .replace(/\*\*\\\\n\\\\n/g, "\n\n")
      .replace(/\\\\n/g, "\n")
      .replace(/\*\*/g, "**")
      .replace(/\*/g, "*")
      .replace(/---\\\\n\\\\n\*\*2\./g, "")
      .replace(/\$\$formatted for easy reading\$\$:\*\*\\\\n\\\\n/g, "")
      .trim()
  }

  const hasContent = (content: any) => {
    return content && content.length > 0 && content !== "null" && content !== "undefined"
  }

  const getDiagnosisPreview = (diagnosis: string) => {
    if (!diagnosis) return "No diagnosis available"
    const cleaned = cleanSimplifiedContent(diagnosis)
    const plainText = cleaned.replace(/[#*\-•`]/g, "").replace(/\n/g, " ")
    if (plainText.length <= 150) return plainText
    return plainText.substring(0, 150) + "..."
  }

  const getAllDiseasesSorted = (caseData: CaseData): DiseaseData[] => {
    if (caseData.diseases && caseData.diseases.length > 0) {
      return [...caseData.diseases].sort(
        (a, b) => new Date(b.treatmentDate).getTime() - new Date(a.treatmentDate).getTime(),
      )
    }

    return [
      {
        name: caseData.Lastdisease || "Unknown Condition",
        nameTranslated: caseData.Lastdisease,
        diagnosis: caseData.diagnosis || caseData.Lastdiagnosis || "No diagnosis available",
        simplifiedDiagnosis: caseData.Lastdiagnosis,
        treatmentDate: caseData.LasttreatmentDate || caseData.date,
        outcome: caseData.outcome || caseData.Lastoutcome || "ongoing",
        complexity: caseData.outcome,
      },
    ]
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "cured":
        return "bg-green-100 text-green-800 border border-green-200"
      case "improved":
        return "bg-blue-100 text-blue-800 border border-blue-200"
      case "referred":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200"
      case "ongoing":
        return "bg-gray-100 text-gray-800 border border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleReadFullDiagnosis = (disease: DiseaseData, patientName: string) => {
    setSelectedDisease({ disease, patientName })
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleBackdropClick}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between border-b">
            <div>
              <h2 className="text-2xl font-bold text-white">Patient Medical History</h2>
              <p className="text-purple-100 text-sm mt-1">{cases.length} patient(s) found</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-purple-800 rounded-lg p-2 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6">
            {cases.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No medical history found</p>
                <p className="text-gray-400 text-sm mt-2">No patient records available</p>
              </div>
            ) : (
              <div className="space-y-8">
                {cases.map((caseData) => {
                  const allDiseases = getAllDiseasesSorted(caseData)
                  const totalDiseases = allDiseases.length

                  return (
                    <div
                      key={caseData.id}
                      className="border border-gray-200 rounded-lg bg-white hover:shadow-lg transition-all"
                    >
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <h3 className="text-xl font-bold text-gray-800">{caseData.name}</h3>
                            {caseData.age && (
                              <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                                Age: {caseData.age}
                              </span>
                            )}
                            {caseData.gender && (
                              <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                                {caseData.gender}
                              </span>
                            )}
                            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                              {totalDiseases} condition{totalDiseases !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="space-y-6">
                          {allDiseases.map((disease, index) => (
                            <div key={index} className="border-l-4 border-indigo-400 pl-4 py-2 bg-blue-50 rounded-r-lg">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h4 className="font-semibold text-gray-800 text-lg">
                                      {disease.name || "Unknown Condition"}
                                    </h4>
                                    <span
                                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getOutcomeColor(disease.outcome)}`}
                                    >
                                      {disease.outcome}
                                    </span>
                                    {disease.complexity && (
                                      <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getComplexityColor(disease.complexity)}`}
                                      >
                                        {disease.complexity} complexity
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {formatDate(disease.treatmentDate)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white rounded-lg p-4 border">
                                <h5 className="font-semibold text-gray-700 text-sm mb-2">Diagnosis Preview:</h5>
                                <div className="text-gray-600 text-sm leading-relaxed">
                                  {hasContent(disease.diagnosis) ? (
                                    <div
                                      className="prose prose-sm max-w-none"
                                      dangerouslySetInnerHTML={renderMarkdown(getDiagnosisPreview(disease.diagnosis))}
                                    />
                                  ) : (
                                    <p className="text-gray-500">No diagnosis preview available</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleReadFullDiagnosis(disease, caseData.name)}
                                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-2 inline-flex items-center gap-1"
                                >
                                  Read full diagnosis
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </button>
                              </div>

                              {disease.nameTranslated && disease.nameTranslated !== disease.name && (
                                <div className="mt-2 text-xs text-gray-500">
                                  <span className="font-medium">Translated:</span> {disease.nameTranslated}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Last updated: {formatDate(allDiseases[0].treatmentDate)}</span>
                            <span>Total medical visits: {totalDiseases}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {cases.length} patient{cases.length !== 1 ? "s" : ""} with complete medical history
            </div>
            <Button onClick={onClose} variant="outline">
              Close History
            </Button>
          </div>
        </div>
      </div>

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

