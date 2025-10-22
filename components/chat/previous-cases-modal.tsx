"use client"

import type React from "react"

interface DiseaseData {
  name: string
  nameTranslated?: string
  diagnosis: string
  simplifiedDiagnosis?: string
  treatmentDate: string
  outcome: string
  complexity?: string
}

interface CaseData {
  id: string
  name: string
  date: string
  diagnosis: string
  outcome: string
  age?: number
  gender?: string
  diseases?: DiseaseData[]
  Lastdisease?: string
  Lastdiagnosis?: string
  Lastoutcome?: string
  LasttreatmentDate?: string
  patientId?: string
}

interface PreviousCasesModalProps {
  cases: CaseData[]
  onSelectCase: (caseData: CaseData) => void
  onClose: () => void
}

export function PreviousCasesModal({ cases, onSelectCase, onClose }: PreviousCasesModalProps) {
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

  // Get limited diagnosis preview (first 150 characters)
  const getDiagnosisPreview = (diagnosis: string) => {
    if (!diagnosis) return "No diagnosis available"
    
    const cleaned = cleanSimplifiedContent(diagnosis)
    const plainText = cleaned.replace(/[#*\-•`]/g, '').replace(/\n/g, ' ')
    
    if (plainText.length <= 150) return plainText
    
    return plainText.substring(0, 150) + '...'
  }

  // Get all diseases sorted by date (newest first)
  const getAllDiseasesSorted = (caseData: CaseData): DiseaseData[] => {
    if (caseData.diseases && caseData.diseases.length > 0) {
      return [...caseData.diseases].sort((a, b) => 
        new Date(b.treatmentDate).getTime() - new Date(a.treatmentDate).getTime()
      )
    }
    
    // Fallback to legacy fields as a single disease entry
    return [{
      name: caseData.Lastdisease || 'Unknown Condition',
      diagnosis: caseData.diagnosis || caseData.Lastdiagnosis || 'No diagnosis available',
      treatmentDate: caseData.LasttreatmentDate || caseData.date,
      outcome: caseData.outcome || caseData.Lastoutcome || 'ongoing'
    }]
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
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

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleBackdropClick}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between border-b">
            <div>
              <h2 className="text-2xl font-bold text-white">Patient Medical History</h2>
              <p className="text-indigo-100 text-sm mt-1">{cases.length} patient(s) found</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-indigo-800 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6">
            {cases.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-lg">No previous cases found</p>
                <p className="text-gray-400 text-sm mt-2">Start by analyzing your first medical query</p>
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
                      {/* Patient Header */}
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
                              {totalDiseases} condition{totalDiseases !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <button
                            onClick={() => onSelectCase(caseData)}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </button>
                        </div>
                      </div>

                      {/* Diseases List */}
                      <div className="p-6">
                        <div className="space-y-6">
                          {allDiseases.map((disease, index) => (
                            <div key={index} className="border-l-4 border-indigo-400 pl-4 py-2 bg-blue-50 rounded-r-lg">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h4 className="font-semibold text-gray-800 text-lg">
                                      {disease.name || 'Unknown Condition'}
                                    </h4>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getOutcomeColor(disease.outcome)}`}>
                                      {disease.outcome}
                                    </span>
                                    {disease.complexity && (
                                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getComplexityColor(disease.complexity)}`}>
                                        {disease.complexity} complexity
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                    <span className="flex items-center gap-1">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      {formatDate(disease.treatmentDate)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Diagnosis Preview */}
                              <div className="bg-white rounded-lg p-4 border">
                                <h5 className="font-semibold text-gray-700 text-sm mb-2">Diagnosis:</h5>
                                <div className="text-gray-600 text-sm leading-relaxed">
                                  <div 
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={renderMarkdown(getDiagnosisPreview(disease.diagnosis))}
                                  />
                                </div>
                                {disease.diagnosis.length > 150 && (
                                  <button 
                                    onClick={() => onSelectCase(caseData)}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-2 inline-flex items-center gap-1"
                                  >
                                    Read full diagnosis
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                )}
                              </div>

                              {/* Translated Disease Name (if available) */}
                              {disease.nameTranslated && disease.nameTranslated !== disease.name && (
                                <div className="mt-2 text-xs text-gray-500">
                                  <span className="font-medium">Translated:</span> {disease.nameTranslated}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Patient Summary */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>
                              Last updated: {formatDate(allDiseases[0].treatmentDate)}
                            </span>
                            <span>
                              Total medical visits: {totalDiseases}
                            </span>
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
              Showing {cases.length} patient{cases.length !== 1 ? 's' : ''} with complete medical history
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}