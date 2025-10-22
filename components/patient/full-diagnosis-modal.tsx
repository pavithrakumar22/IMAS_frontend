"use client"

import { useState } from "react"
import { X, Calendar, User, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DiseaseData } from "./types"

interface FullDiagnosisModalProps {
  disease: DiseaseData
  patientName: string
  onClose: () => void
}

export function FullDiagnosisModal({ disease, patientName, onClose }: FullDiagnosisModalProps) {
  const [activeTab, setActiveTab] = useState<"diagnosis" | "simplified">("diagnosis")

  // EXACT SAME markdown rendering as ResultsModal
  const renderMarkdown = (content: string) => {
    if (!content) return { __html: '' }

    const lines = content.split('\n')
    let inList = false
    let html = ''

    for (const line of lines) {
      const trimmedLine = line.trim()

      if (trimmedLine.startsWith('##### ') || trimmedLine.startsWith('#### ')) {
        html += `<h5 class="text-md font-semibold mt-4 mb-2 text-gray-800">${trimmedLine.substring(5)}</h5>`
      } else if (trimmedLine.startsWith('### ')) {
        html += `<h4 class="text-lg font-semibold mt-6 mb-3 text-gray-800">${trimmedLine.substring(4)}</h4>`
      } else if (trimmedLine.startsWith('## ')) {
        html += `<h3 class="text-xl font-semibold mt-8 mb-4 text-gray-800 border-b pb-2">${trimmedLine.substring(3)}</h3>`
      } else if (trimmedLine.startsWith('# ')) {
        html += `<h2 class="text-2xl font-bold mt-10 mb-6 text-gray-800 border-b pb-3">${trimmedLine.substring(2)}</h2>`
      } else if (trimmedLine.startsWith('• ') || trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        if (!inList) {
          html += '<ul class="list-disc ml-6 space-y-2">'
          inList = true
        }
        const listItem = trimmedLine
          .substring(2)
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
        html += `<li class="text-gray-700 mb-2">${listItem}</li>`
      } else if (inList && trimmedLine === '') {
        html += '</ul>'
        inList = false
      } else if (trimmedLine) {
        if (inList) {
          html += '</ul>'
          inList = false
        }
        const processedLine = trimmedLine
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
        html += `<p class="text-gray-700 mb-3">${processedLine}</p>`
      } else {
        html += '<br>'
      }
    }

    if (inList) {
      html += '</ul>'
    }

    return { __html: `<div class="space-y-4">${html}</div>` }
  }

  // EXACT SAME content cleaning as ResultsModal
  const cleanSimplifiedContent = (content: string) => {
    if (!content) return ''

    return content
      .replace(/\$\$simple conversational version\$\$:\*\*\\\\n\\\\n/g, '')
      .replace(/\*\*\\\\n\\\\n/g, '\n\n')
      .replace(/\\\\n/g, '\n')
      .replace(/\*\*/g, '**')
      .replace(/\*/g, '*')
      .replace(/---\\\\n\\\\n\*\*2\./g, '')
      .replace(/\$\$formatted for easy reading\$\$:\*\*\\\\n\\\\n/g, '')
      .trim()
  }

  // Helper to check if content exists (same as ResultsModal)
  const hasContent = (content: any) => {
    return content && content.length > 0 && content !== "null" && content !== "undefined"
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'cured':
        return 'bg-green-100 text-green-800 border border-green-200'
      case 'improved':
        return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'referred':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'ongoing':
        return 'bg-gray-100 text-gray-800 border border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case 'high':
        return 'bg-red-100 text-red-800 border border-red-200'
      case 'medium':
        return 'bg-orange-100 text-orange-800 border border-orange-200'
      case 'low':
        return 'bg-green-100 text-green-800 border border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  // Check if it's an emergency case (same logic as ResultsModal)
  const isEmergency = () => {
    return disease.complexity === 'high'
  }

  // Get content for display (similar to ResultsModal)
  const getContent = () => {
    return {
      originalDiagnosis: cleanSimplifiedContent(disease.diagnosis || ""),
      simplifiedDiagnosis: cleanSimplifiedContent(disease.simplifiedDiagnosis || "")
    }
  }

  const content = getContent()
  const isEmergencyCase = isEmergency()
  const showSimplified = hasContent(content.simplifiedDiagnosis)
  const showOriginal = hasContent(content.originalDiagnosis)

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={handleBackdropClick}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header - Same style as ResultsModal */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between border-b">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">Full Medical Diagnosis</h2>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <div className="flex items-center gap-2 text-purple-100">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{patientName}</span>
                </div>
                <div className="flex items-center gap-2 text-purple-100">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{formatDate(disease.treatmentDate)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-purple-800 rounded-lg p-2 transition-colors flex-shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            {/* Emergency Alert - Same style as ResultsModal */}
            {isEmergencyCase && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-800 mb-2">MEDICAL EMERGENCY</h3>
                    <p className="text-red-700 text-lg font-semibold">
                      This condition requires immediate medical attention!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Disease Header */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800">{disease.name}</h3>
                <div className="flex gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getOutcomeColor(disease.outcome)}`}>
                    {disease.outcome}
                  </span>
                  {disease.complexity && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getComplexityColor(disease.complexity)}`}>
                      {disease.complexity} complexity
                    </span>
                  )}
                </div>
              </div>

              {/* Translated Disease Name */}
              {disease.nameTranslated && disease.nameTranslated !== disease.name && (
                <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-blue-700">
                    <span className="font-semibold">Translated Condition:</span> {disease.nameTranslated}
                  </p>
                </div>
              )}
            </div>

            {/* Tabs for diagnosis and simplified - EXACTLY like ResultsModal */}
            {showOriginal && showSimplified && (
              <div className="flex gap-2 border-b">
                <button
                  onClick={() => setActiveTab("diagnosis")}
                  className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                    activeTab === "diagnosis"
                      ? "border-purple-600 text-purple-600"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Medical Diagnosis
                </button>
                <button
                  onClick={() => setActiveTab("simplified")}
                  className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                    activeTab === "simplified"
                      ? "border-green-600 text-green-600"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Simplified Explanation
                </button>
              </div>
            )}

            {/* Diagnosis Tab - EXACTLY like ResultsModal */}
            {(activeTab === "diagnosis" || !showSimplified) && showOriginal && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                  <h3 className="text-2xl font-bold text-gray-800">Medical Diagnosis</h3>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    Professional Version
                  </span>
                </div>

                {hasContent(content.originalDiagnosis) ? (
                  <div className="p-6 bg-white border border-gray-200 rounded-lg">
                    <div
                      className="text-gray-700 leading-relaxed text-lg prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={renderMarkdown(content.originalDiagnosis)}
                    />
                  </div>
                ) : (
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700 text-lg">
                      Detailed medical analysis is not available for this diagnosis.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Simplified Tab - EXACTLY like ResultsModal */}
            {(activeTab === "simplified" || !showOriginal) && showSimplified && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                  <h3 className="text-2xl font-bold text-gray-800">Simplified Explanation</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Patient-Friendly Version
                  </span>
                </div>

                {hasContent(content.simplifiedDiagnosis) ? (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-lg mb-6">
                    <h4 className="font-bold text-green-800 text-xl mb-4">Simple Summary</h4>
                    <p className="text-green-700 text-lg leading-relaxed whitespace-pre-line">
                      {content.simplifiedDiagnosis}
                    </p>
                  </div>
                ) : (
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                    <p className="text-yellow-700 text-lg">
                      Simple summary is not available for this diagnosis.
                    </p>
                  </div>
                )}

                {/* Detailed Explanation Section - Same structure as ResultsModal */}
                {hasContent(content.simplifiedDiagnosis) ? (
                  <div className="p-6 bg-white border border-gray-200 rounded-lg">
                    <h4 className="font-bold text-gray-800 text-xl mb-6">Detailed Explanation</h4>
                    <div
                      className="text-gray-700 leading-relaxed text-lg prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={renderMarkdown(content.simplifiedDiagnosis)}
                    />
                  </div>
                ) : content.simplifiedDiagnosis ? (
                  <div className="p-6 bg-white border border-gray-200 rounded-lg">
                    <h4 className="font-bold text-gray-800 text-xl mb-6">Detailed Explanation</h4>
                    <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                      {content.simplifiedDiagnosis}
                    </p>
                  </div>
                ) : (
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700 text-lg">
                      Detailed explanation is not available for this diagnosis.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Show both sections if no tabs (when only one type is available) */}
            {(!showOriginal || !showSimplified) && (
              <>
                {/* Medical Diagnosis Section */}
                {showOriginal && (
                  <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                      <h3 className="text-2xl font-bold text-gray-800">Medical Diagnosis</h3>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        Professional Version
                      </span>
                    </div>

                    <div className="p-6 bg-white border border-gray-200 rounded-lg">
                      <div
                        className="text-gray-700 leading-relaxed text-lg prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={renderMarkdown(content.originalDiagnosis)}
                      />
                    </div>
                  </div>
                )}

                {/* Simplified Explanation Section */}
                {showSimplified && (
                  <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                      <h3 className="text-2xl font-bold text-gray-800">Simplified Explanation</h3>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Patient-Friendly Version
                      </span>
                    </div>

                    <div className="p-6 bg-green-50 border border-green-200 rounded-lg mb-6">
                      <h4 className="font-bold text-green-800 text-xl mb-4">Simple Summary</h4>
                      <p className="text-green-700 text-lg leading-relaxed whitespace-pre-line">
                        {content.simplifiedDiagnosis}
                      </p>
                    </div>

                    <div className="p-6 bg-white border border-gray-200 rounded-lg">
                      <h4 className="font-bold text-gray-800 text-xl mb-6">Detailed Explanation</h4>
                      <div
                        className="text-gray-700 leading-relaxed text-lg prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={renderMarkdown(content.simplifiedDiagnosis)}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Treatment Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Treatment Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Treatment Date</p>
                  <p className="font-medium text-gray-800">{formatDate(disease.treatmentDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Outcome Status</p>
                  <p className="font-medium text-gray-800 capitalize">{disease.outcome}</p>
                </div>
                {disease.complexity && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Case Complexity</p>
                    <p className="font-medium text-gray-800 capitalize">{disease.complexity}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer - Same style as ResultsModal */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end">
            <Button onClick={onClose} variant="outline" className="px-6 py-2">
              Close Diagnosis
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}