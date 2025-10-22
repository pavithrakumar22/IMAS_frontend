"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface ResultsModalProps {
  result: any
  responseType: "simplified" | "original" | "both"
  showOutcomeForm: boolean
  patientOutcome: string
  savingOutcome: boolean
  onOutcomeChange: (value: string) => void
  onOutcomeSubmit: () => void
  onNavigateToChat: () => void
  onClose: () => void
  userName: string
  onAutoSave?: () => void
}

export function ResultsModal({
  result,
  responseType,
  showOutcomeForm,
  patientOutcome,
  savingOutcome,
  onOutcomeChange,
  onOutcomeSubmit,
  onNavigateToChat,
  onClose,
  userName,
  onAutoSave,
}: ResultsModalProps) {
  const [activeTab, setActiveTab] = useState<"diagnosis" | "simplified">("diagnosis")

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  // Helper to check if content exists
  const hasContent = (content: any) => {
    return content && content.length > 0 && content !== "null" && content !== "undefined"
  }

  // Simple markdown rendering
  const renderMarkdown = (content: string) => {
    if (!content) return null

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

  // Get simplified content
  const getSimplifiedContent = () => {
    if (!result) return { simplified: "", simplifiedMarkdown: "", originalDiagnosisMarkdown: "" }

    if (result.simplified && typeof result.simplified === "object") {
      return {
        simplified: cleanSimplifiedContent(result.simplified.simplified || ""),
        simplifiedMarkdown: cleanSimplifiedContent(result.simplified.simplifiedMarkdown || ""),
        originalDiagnosisMarkdown: result.simplified.originalDiagnosisMarkdown || "",
      }
    }

    return {
      simplified: cleanSimplifiedContent(result.simplified || ""),
      simplifiedMarkdown: "",
      originalDiagnosisMarkdown: "",
    }
  }

  // Clean simplified content
  const cleanSimplifiedContent = (content: string) => {
    if (!content) return ""

    return content
      .replace(/$$simple conversational version$$:\*\*\\n\\n/g, "")
      .replace(/\*\*\\n\\n/g, "\n\n")
      .replace(/\\n/g, "\n")
      .replace(/\*\*/g, "**")
      .replace(/\*/g, "*")
      .replace(/---\\n\\n\*\*2\./g, "")
      .replace(/$$formatted for easy reading$$:\*\*\\n\\n/g, "")
      .trim()
  }

  // Get complexity level
  const getComplexityLevel = () => {
    if (!result?.complexity) return "UNKNOWN"

    if (typeof result.complexity === "string") {
      return result.complexity
    }
    return result.complexity.complexity || result.complexity.level || "UNKNOWN"
  }

  // Get complexity reason
  const getComplexityReason = () => {
    if (!result?.complexity) return ""

    if (typeof result.complexity === "string") {
      return ""
    }
    return result.complexity.reason || ""
  }

  // Get complexity color
  const getComplexityColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case "HIGH":
        return "bg-red-100 text-red-800 border border-red-200"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200"
      case "LOW":
        return "bg-green-100 text-green-800 border border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  // Check if emergency
  const isEmergency = () => {
    return result?.diagnosis?.isEmergency || result?.complexity?.complexity === "HIGH"
  }

  // Get immediate actions
  const getImmediateActions = () => {
    return result?.diagnosis?.immediateActions || ""
  }

  const simplifiedContent = getSimplifiedContent()
  const complexityLevel = getComplexityLevel()
  const complexityReason = getComplexityReason()
  const isEmergencyCase = isEmergency()
  const immediateActions = getImmediateActions()
  const showSimplified = responseType === "simplified" || responseType === "both"
  const showOriginal = responseType === "original" || responseType === "both"

  // FIX: Prevent modal close when clicking inside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleClose = () => {
    if (onAutoSave) {
      onAutoSave()
    }
    document.body.style.overflow = "unset"
    onClose()
  }

  // FIX: Prevent event propagation for outcome buttons
  const handleOutcomeClick = (e: React.MouseEvent, outcome: string) => {
    e.stopPropagation()
    e.preventDefault()
    onOutcomeChange(outcome)
  }

  // FIX: Handle outcome submit properly
  const handleOutcomeSubmit = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onOutcomeSubmit()
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleBackdropClick}
        style={{ overscrollBehavior: "contain" }}
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
        style={{ overscrollBehavior: "contain" }}
      >
        <div
          className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()} // FIX: Prevent click propagation
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between border-b flex-shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-white">Medical Analysis Results</h2>
              <p className="text-purple-100 text-sm mt-1">Analysis for {userName}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-purple-800 rounded-lg p-2 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="overflow-y-auto flex-1 p-6 space-y-6" style={{ overscrollBehavior: "contain" }}>
            {/* Emergency Alert */}
            {isEmergencyCase && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-800 mb-2">MEDICAL EMERGENCY</h3>
                    <p className="text-red-700 text-lg font-semibold mb-3">
                      This condition requires immediate medical attention!
                    </p>
                    {immediateActions && (
                      <div className="bg-white p-4 rounded border border-red-200">
                        <p className="text-red-800 font-medium">Immediate Actions:</p>
                        <p className="text-red-700 mt-1">{immediateActions}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Complexity Badge */}
            {complexityLevel && !isEmergencyCase && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded-full text-lg font-bold ${getComplexityColor(complexityLevel)}`}>
                    {complexityLevel} COMPLEXITY
                  </div>
                  {complexityReason && (
                    <div className="flex-1">
                      <p className="text-blue-800 text-lg">{complexityReason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tabs for diagnosis and simplified */}
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

            {/* Diagnosis Tab */}
            {(activeTab === "diagnosis" || !showSimplified) && showOriginal && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                  <h3 className="text-2xl font-bold text-gray-800">Medical Diagnosis</h3>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    Professional Version
                  </span>
                </div>

                {hasContent(simplifiedContent.originalDiagnosisMarkdown) ? (
                  <div className="p-6 bg-white border border-gray-200 rounded-lg">
                    <div
                      className="text-gray-700 leading-relaxed text-lg prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={renderMarkdown(simplifiedContent.originalDiagnosisMarkdown)}
                    />
                  </div>
                ) : (
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700 text-lg">
                      Detailed medical analysis is being prepared. Please check back shortly.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Simplified Tab */}
            {(activeTab === "simplified" || !showOriginal) && showSimplified && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                  <h3 className="text-2xl font-bold text-gray-800">Simplified Explanation</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Patient-Friendly Version
                  </span>
                </div>

                {hasContent(simplifiedContent.simplified) ? (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-lg mb-6">
                    <h4 className="font-bold text-green-800 text-xl mb-4">Simple Summary</h4>
                    <p className="text-green-700 text-lg leading-relaxed whitespace-pre-line">
                      {simplifiedContent.simplified}
                    </p>
                  </div>
                ) : (
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                    <p className="text-yellow-700 text-lg">
                      Simple summary is being prepared. Please check back shortly.
                    </p>
                  </div>
                )}

                {hasContent(simplifiedContent.simplifiedMarkdown) ? (
                  <div className="p-6 bg-white border border-gray-200 rounded-lg">
                    <h4 className="font-bold text-gray-800 text-xl mb-6">Detailed Explanation</h4>
                    <div
                      className="text-gray-700 leading-relaxed text-lg prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={renderMarkdown(simplifiedContent.simplifiedMarkdown)}
                    />
                  </div>
                ) : simplifiedContent.simplified ? (
                  <div className="p-6 bg-white border border-gray-200 rounded-lg">
                    <h4 className="font-bold text-gray-800 text-xl mb-6">Detailed Explanation</h4>
                    <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                      {simplifiedContent.simplified}
                    </p>
                  </div>
                ) : (
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700 text-lg">
                      Detailed explanation is being prepared. Please check back shortly.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Patient Outcome Form */}
            {showOutcomeForm && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-green-800 mb-4">Patient Outcome Record</h3>
                <p className="text-green-700 mb-4">
                  Please select the patient's outcome based on the diagnosis and treatment:
                </p>
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {["cured", "improved", "referred", "ongoing"].map((outcome) => (
                      <label
                        key={outcome}
                        className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors has-[:checked]:bg-green-100 has-[:checked]:border-green-500"
                        onClick={(e) => handleOutcomeClick(e, outcome)}
                      >
                        <input
                          type="radio"
                          name="outcome"
                          value={outcome}
                          checked={patientOutcome === outcome}
                          onChange={(e) => {
                            e.stopPropagation()
                            onOutcomeChange(e.target.value)
                          }}
                          className="sr-only"
                        />
                        <div className="w-6 h-6 rounded-full border-2 border-gray-400 mb-2 flex items-center justify-center">
                          {patientOutcome === outcome && <div className="w-3 h-3 rounded-full bg-green-600"></div>}
                        </div>
                        <span className="font-semibold text-gray-800 capitalize">{outcome}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleOutcomeSubmit}
                      disabled={savingOutcome}
                      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {savingOutcome ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Patient Outcome
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer with action buttons */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-3 justify-end flex-shrink-0">
            <button
              onClick={handleClose}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onNavigateToChat}
              className="inline-flex items-center gap-3 rounded-lg bg-green-600 px-6 py-2 text-white font-semibold hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Chat with Assistant
            </button>
          </div>
        </div>
      </div>
    </>
  )
}