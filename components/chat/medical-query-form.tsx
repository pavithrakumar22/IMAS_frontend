"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { ResultsModal } from "./results-modal"
import { PreviousCasesModal } from "./previous-cases-modal"

const API_BASE_URL = "http://localhost:5000/api/combined"
const APPEND_PATIENT_API = "append-patient"

const COMMON_SYMPTOMS = [
  "Fever",
  "Cough",
  "Headache",
  "Nausea or Vomiting",
  "Diarrhea",
  "Fatigue or Weakness",
  "Shortness of Breath",
  "Chest Pain",
  "Rash or Skin Changes",
  "Abdominal Pain",
  "None of the above",
]

export default function MedicalQueryForm() {
  const { user } = useUser()
  const [name, setName] = useState("")
  const [age, setAge] = useState<number | "">("")
  const [gender, setGender] = useState("")
  const [disease, setDisease] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [responseType, setResponseType] = useState<"simplified" | "original" | "both">("both")
  const [showModal, setShowModal] = useState(false)
  const [savedResults, setSavedResults] = useState<any>(null)
  const [showSavedResultsButton, setShowSavedResultsButton] = useState(false)

  const [previousPatientReport, setPreviousPatientReport] = useState<any>(null)
  const [previousPatientName, setPreviousPatientName] = useState<string>("")

  const [showPreviousCasesModal, setShowPreviousCasesModal] = useState(false)
  const [previousCases, setPreviousCases] = useState<any[]>([])
  const [allPatients, setAllPatients] = useState<any[]>([])
  const [showPatientSelector, setShowPatientSelector] = useState(false)
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")

  // Medical History Toggle State
  const [includeMedicalHistory, setIncludeMedicalHistory] = useState(false)

  // Medical History Fields
  const [bloodPressure, setBloodPressure] = useState("")
  const [diabetes, setDiabetes] = useState("")
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [medications, setMedications] = useState("")
  const [allergies, setAllergies] = useState("")
  const [smoking, setSmoking] = useState("")
  const [alcohol, setAlcohol] = useState("")
  const [familyHistory, setFamilyHistory] = useState("")

  const [showOutcomeForm, setShowOutcomeForm] = useState(false)
  const [patientOutcome, setPatientOutcome] = useState("ongoing")
  const [savingOutcome, setSavingOutcome] = useState(false)

  useEffect(() => {
    if (user) {
      loadAllPatients()
    }
  }, [user])

  const toggleSymptom = (symptom: string) => {
    setSymptoms((prev) => (prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]))
  }

  const loadAllPatients = async () => {
    if (!user) return

    setLoadingPatients(true)
    try {
      const response = await fetch(`http://localhost:5000/api/auth/get-all-patients?clerkUserId=${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      if (data.success && data.patients) {
        setAllPatients(data.patients)

        const formattedCases = data.patients.map((patient: any) => {
          // Get the latest disease with actual diagnosis
          const latestDiseaseWithDiagnosis = patient.diseases?.filter(d => d.diagnosis).pop()

          return {
            id: patient._id || patient.patientId || Math.random().toString(),
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            date: patient.LasttreatmentDate ? new Date(patient.LasttreatmentDate).toLocaleDateString() : "No date",
            diagnosis: latestDiseaseWithDiagnosis?.diagnosis || patient.Lastdiagnosis || "No diagnosis available",
            outcome: latestDiseaseWithDiagnosis?.outcome || patient.Lastoutcome || "pending",
            diseases: patient.diseases || []
          }
        })
        setPreviousCases(formattedCases)
      }
    } catch (error) {
      console.error("Error loading all patients:", error)
    } finally {
      setLoadingPatients(false)
    }
  }

  const selectPatient = (patient: any) => {
    setName(patient.name || "")
    setAge(patient.age || "")
    setGender(patient.gender || "")
    setSelectedPatientId(patient.patientId || patient._id || "")

    // Set the latest disease with actual diagnosis as current query
    if (patient.diseases && patient.diseases.length > 0) {
      const latestDiseaseWithDiagnosis = patient.diseases.filter((d: any) => d.name).pop()
      setDisease(latestDiseaseWithDiagnosis?.name || "")
    } else if (patient.Lastdisease) {
      setDisease(patient.Lastdisease)
    }

    setShowPatientSelector(false)
  }

  const clearForm = () => {
    setName("")
    setAge("")
    setGender("")
    setDisease("")
    setSelectedPatientId("")
    setIncludeMedicalHistory(false)
    // Reset medical history fields
    setBloodPressure("")
    setDiabetes("")
    setSymptoms([])
    setMedications("")
    setAllergies("")
    setSmoking("")
    setAlcohol("")
    setFamilyHistory("")
  }

  const loadPreviousPatientReport = async (patientId: string) => {
    if (!user) return

    try {
      const response = await fetch(`http://localhost:5000/api/auth/get-patient?clerkUserId=${user.id}&patientId=${patientId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      if (data.success && data.patient) {
        const patient = data.patient

        // Get the latest disease with actual diagnosis
        const latestDiseaseWithDiagnosis = patient.diseases?.filter((d: any) => d.diagnosis).pop()

        // Create a mock result object with BOTH versions
        const mockResult = {
          simplified: {
            simplified: latestDiseaseWithDiagnosis?.simplifiedDiagnosis || patient.LastdiagnosisSimplified || latestDiseaseWithDiagnosis?.diagnosis,
            simplifiedMarkdown: latestDiseaseWithDiagnosis?.simplifiedDiagnosis || patient.LastdiagnosisSimplified || latestDiseaseWithDiagnosis?.diagnosis,
            originalDiagnosisMarkdown: latestDiseaseWithDiagnosis?.diagnosis || patient.Lastdiagnosis
          },
          diagnosis: {
            recommendations: {
              condition: latestDiseaseWithDiagnosis?.name || patient.Lastdisease
            }
          },
          complexity: latestDiseaseWithDiagnosis?.complexity || patient.Lastcomplexity || "UNKNOWN"
        }

        setResult(mockResult)
        setShowModal(true)
        setShowOutcomeForm(false)
      } else {
        alert("Failed to load patient report")
      }
    } catch (error) {
      console.error("Error loading patient report:", error)
      alert("Error loading patient report")
    }
  }

  const viewAllCases = async () => {
    await loadAllPatients()
    setShowPreviousCasesModal(true)
  }

  const handleSelectCase = async (caseData: any) => {
    const patient = allPatients.find(p =>
      p.patientId === caseData.id || p._id === caseData.id || p.name === caseData.name
    )

    if (patient) {
      await loadPreviousPatientReport(patient.patientId || patient._id)
    }

    setShowPreviousCasesModal(false)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setShowModal(false)
    setShowOutcomeForm(false)

    if (!user) {
      setError("Please sign in to use this feature.")
      return
    }

    if (!name.trim() || age === "" || !gender.trim() || !disease.trim()) {
      setError("Please fill in name, age, gender, and disease/query.")
      return
    }

    let medicalHistory = ""
    if (includeMedicalHistory) {
      medicalHistory = [
        bloodPressure && `Blood Pressure: ${bloodPressure}`,
        diabetes && `Diabetes: ${diabetes}`,
        symptoms.length > 0 && `Symptoms: ${symptoms.join(", ")}`,
        medications && `Current Medications: ${medications}`,
        allergies && `Allergies: ${allergies}`,
        smoking && `Smoking: ${smoking}`,
        alcohol && `Alcohol: ${alcohol}`,
        familyHistory && `Family History: ${familyHistory}`,
      ]
        .filter(Boolean)
        .join(". ")
    }

    const text = `Patient name: ${name}. Age: ${age}. Gender: ${gender}. ${medicalHistory ? `Medical History: ${medicalHistory}.` : ""} Query: ${disease}`

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/translate-and-classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          src: "eng",
          tgt: "eng",
          simplify: true,
          audience: "general",
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Request failed with status ${res.status}`)
      }

      const data = await res.json()
      setResult(data)
      setSavedResults(data)
      setShowModal(true)
      setShowOutcomeForm(true)
      setShowSavedResultsButton(false)
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getTranslatedDisease = () => {
    if (!result) return null;

    if (result.translated && result.translated !== disease) {
      return result.translated;
    }

    if (result.original && result.original !== disease) {
      return `Translated from: ${result.original.substring(0, 100)}...`;
    }

    if (result.diagnosis?.recommendations?.condition) {
      return result.diagnosis.recommendations.condition;
    }

    return null;
  }

  const getComplexityLevel = () => {
    if (!result?.complexity) return "UNKNOWN"

    if (typeof result.complexity === "string") {
      return result.complexity
    }
    return result.complexity.complexity || result.complexity.level || "UNKNOWN"
  }

  const handleOutcomeSubmit = async () => {
    if (!patientOutcome.trim()) {
      alert("Please select the patient's outcome.")
      return
    }

    if (!user) {
      alert("Please sign in to save patient data.")
      return
    }

    setSavingOutcome(true)

    try {
      // CORRECTED: Get original diagnosis from the right place in API response
      const originalDiagnosis = result.simplified?.originalDiagnosisMarkdown ||
        result.diagnosis?.recommendations?.condition ||
        "Professional diagnosis not available"

      const simplifiedDiagnosis = result.simplified?.simplifiedMarkdown ||
        result.simplified?.simplified ||
        "Simplified explanation not available"

      const translatedDisease = getTranslatedDisease();
      const complexityLevel = getComplexityLevel();

      console.log("📋 DIAGNOSIS DATA FOR SAVING:", {
        originalDiagnosis: originalDiagnosis.substring(0, 100) + "...",
        simplifiedDiagnosis: simplifiedDiagnosis.substring(0, 100) + "...",
        hasOriginalDiagnosisMarkdown: !!result.simplified?.originalDiagnosisMarkdown,
        hasDiagnosisCondition: !!result.diagnosis?.recommendations?.condition,
        hasSimplifiedMarkdown: !!result.simplified?.simplifiedMarkdown,
        selectedPatientId: selectedPatientId,
        isExistingPatient: !!selectedPatientId
      });

      // Only proceed if we have actual diagnosis content
      if ((originalDiagnosis === "Professional diagnosis not available" &&
        simplifiedDiagnosis === "Simplified explanation not available")) {
        throw new Error("No diagnosis content available to save. Please try the analysis again.")
      }

      // Prepare patient data - CRITICAL: Include patientId for existing patients
      const patientData = {
        name: name.trim(),
        age: Number(age),
        gender: gender,
        patientId: selectedPatientId, // This tells backend it's an existing patient

        // For the new disease entry
        disease: disease.trim(),
        diseaseTranslated: translatedDisease,
        diagnosis: originalDiagnosis, // This should now be the proper original diagnosis
        simplifiedDiagnosis: simplifiedDiagnosis, // This is the simplified version
        treatmentDate: new Date().toISOString(),
        outcome: patientOutcome,
        complexity: complexityLevel.toLowerCase()
      }

      console.log("🚀 SENDING PATIENT DATA:", {
        clerkUserId: user.id,
        patientData: {
          ...patientData,
          diagnosis: patientData.diagnosis.substring(0, 200) + "...", // Truncated for logging
          simplifiedDiagnosis: patientData.simplifiedDiagnosis.substring(0, 200) + "..."
        }
      });

      const response = await fetch(`http://localhost:5000/api/auth/${APPEND_PATIENT_API}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkUserId: user.id,
          patientData,
        }),
      })

      const resultData = await response.json()

      if (!response.ok || !resultData.success) {
        throw new Error(resultData.message || `HTTP error! status: ${response.status}`)
      }

      const message = selectedPatientId
        ? `✅ New disease added to patient "${name}" successfully!`
        : `✅ New patient "${name}" created successfully!`

      alert(`${message}\nTotal Patients: ${resultData.userStats?.totalPatients || "N/A"}`)

      await loadAllPatients()

      // Reset form only if it's a new patient
      if (!selectedPatientId) {
        clearForm()
      } else {
        // Keep the patient selected but clear the disease field for next entry
        setDisease("")
      }

      setPatientOutcome("ongoing")
      setShowModal(false)
      setShowSavedResultsButton(false)

    } catch (error: any) {
      console.error("❌ Error saving patient outcome:", error)
      alert(`❌ Failed to save patient: ${error.message}`)
    } finally {
      setSavingOutcome(false)
    }
  }

  const navigateToChat = () => {
    if (result) {
      sessionStorage.setItem("medicalResult", JSON.stringify(result))
    }
    window.location.href = "/chat/doubts"
  }

  const reopenSavedResults = () => {
    if (savedResults) {
      setResult(savedResults)
      setShowModal(true)
      setShowOutcomeForm(true)
      setShowSavedResultsButton(false)
    }
  }

  const handleAutoSave = async () => {
    if (!user || !result) return

    try {
      // CORRECTED: Get original diagnosis from the right place
      const originalDiagnosis = result.simplified?.originalDiagnosisMarkdown ||
        result.diagnosis?.recommendations?.condition ||
        "Professional diagnosis not available"

      const simplifiedDiagnosis = result.simplified?.simplifiedMarkdown ||
        result.simplified?.simplified ||
        "Simplified explanation not available"

      const translatedDisease = getTranslatedDisease();
      const complexityLevel = getComplexityLevel();

      // Only proceed if we have actual diagnosis content
      if ((originalDiagnosis === "Professional diagnosis not available" &&
        simplifiedDiagnosis === "Simplified explanation not available")) {
        console.log("No diagnosis content available for auto-save")
        return
      }

      const patientData = {
        name: name.trim(),
        age: Number(age),
        gender: gender,
        patientId: selectedPatientId,

        // For the new disease entry
        disease: disease.trim(),
        diseaseTranslated: translatedDisease,
        diagnosis: originalDiagnosis,
        simplifiedDiagnosis: simplifiedDiagnosis,
        treatmentDate: new Date().toISOString(),
        outcome: "pending",
        complexity: complexityLevel.toLowerCase(),

        // For the diseases array
        diseases: [
          {
            name: disease.trim(),
            nameTranslated: translatedDisease,
            diagnosis: originalDiagnosis,
            simplifiedDiagnosis: simplifiedDiagnosis,
            treatmentDate: new Date().toISOString(),
            outcome: "pending",
            complexity: complexityLevel.toLowerCase()
          }
        ]
      }

      const response = await fetch(`http://localhost:5000/api/auth/${APPEND_PATIENT_API}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkUserId: user.id,
          patientData,
        }),
      })

      const resultData = await response.json()

      if (response.ok && resultData.success) {
        setSavedResults(result)
        setShowSavedResultsButton(true)
        await loadAllPatients()
      }
    } catch (error) {
      console.error("Auto-save error:", error)
    }
  }

  return (
    <div className="w-full px-4">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm w-full">

        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          <button
            type="button"
            onClick={() => setShowPatientSelector(true)} // Add this line
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Select Previous Patient
          </button>

          <button
            type="button"
            onClick={clearForm}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white font-semibold hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Form
          </button>

          <button
            type="button"
            onClick={viewAllCases}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View All Cases
          </button>
        </div>

        {selectedPatientId && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-700 font-medium">
                Working with existing patient: <strong>{name}</strong>
              </span>
              <button
                type="button"
                onClick={clearForm}
                className="ml-auto text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Start New Patient
              </button>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="grid gap-6 mb-8 max-w-4xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="grid gap-3">
              <label htmlFor="name" className="text-lg font-medium text-gray-700">
                Patient Name *
              </label>
              <input
                id="name"
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="age" className="text-lg font-medium text-gray-700">
                Age *
              </label>
              <input
                id="age"
                type="number"
                min={0}
                max={120}
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="30"
                value={age}
                onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                required
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="gender" className="text-lg font-medium text-gray-700">
                Gender *
              </label>
              <select
                id="gender"
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Medical History Toggle */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-blue-900">Medical History</h3>
                <p className="text-blue-700 text-sm mt-1">
                  Optional information that helps us provide more accurate analysis.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={includeMedicalHistory}
                  onChange={(e) => setIncludeMedicalHistory(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {includeMedicalHistory ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            {includeMedicalHistory && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="grid gap-3">
                    <label className="text-lg font-medium text-gray-700">Blood Pressure</label>
                    <select
                      className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={bloodPressure}
                      onChange={(e) => setBloodPressure(e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High (Hypertension)</option>
                      <option value="Low">Low (Hypotension)</option>
                      <option value="Controlled with medication">Controlled with medication</option>
                    </select>
                  </div>

                  <div className="grid gap-3">
                    <label className="text-lg font-medium text-gray-700">Diabetes</label>
                    <select
                      className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={diabetes}
                      onChange={(e) => setDiabetes(e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="No diabetes">No diabetes</option>
                      <option value="Type 1 diabetes">Type 1 diabetes</option>
                      <option value="Type 2 diabetes">Type 2 diabetes</option>
                      <option value="Pre-diabetes">Pre-diabetes</option>
                      <option value="Gestational diabetes">Gestational diabetes</option>
                      <option value="Controlled with medication">Controlled with medication</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-lg font-medium text-gray-700 mb-3 block">Common Symptoms</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-3 bg-white rounded-lg border border-gray-300">
                    {COMMON_SYMPTOMS.map((symptom) => (
                      <label
                        key={symptom}
                        className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={symptoms.includes(symptom)}
                          onChange={() => toggleSymptom(symptom)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{symptom}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="grid gap-3">
                    <label className="text-lg font-medium text-gray-700">Current Medications</label>
                    <input
                      type="text"
                      className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., Metformin, Lisinopril"
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-3">
                    <label className="text-lg font-medium text-gray-700">Allergies</label>
                    <input
                      type="text"
                      className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., Penicillin, Nuts"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-3">
                    <label className="text-lg font-medium text-gray-700">Smoking</label>
                    <select
                      className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={smoking}
                      onChange={(e) => setSmoking(e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="Never smoked">Never smoked</option>
                      <option value="Former smoker">Former smoker</option>
                      <option value="Current smoker">Current smoker</option>
                      <option value="Occasional smoker">Occasional smoker</option>
                    </select>
                  </div>

                  <div className="grid gap-3">
                    <label className="text-lg font-medium text-gray-700">Alcohol Consumption</label>
                    <select
                      className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={alcohol}
                      onChange={(e) => setAlcohol(e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="Never">Never</option>
                      <option value="Occasionally">Occasionally</option>
                      <option value="Socially">Socially</option>
                      <option value="Regularly">Regularly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-lg font-medium text-gray-700 mb-3 block">Family Medical History</label>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical transition-all"
                    placeholder="e.g., Father had heart disease, Mother has diabetes..."
                    rows={3}
                    value={familyHistory}
                    onChange={(e) => setFamilyHistory(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-3">
            <label htmlFor="disease" className="text-lg font-medium text-gray-700">
              Current Symptoms / Medical Query *
            </label>
            <textarea
              id="disease"
              className="min-h-40 rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-vertical transition-all"
              placeholder="Describe your current symptoms, concerns, or medical questions in detail... (e.g., persistent cough for 3 days, fever, chest pain, shortness of breath)"
              value={disease}
              onChange={(e) => setDisease(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-3">
            <label className="text-lg font-medium text-gray-700">Response Type</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="responseType"
                  value="both"
                  checked={responseType === "both"}
                  onChange={(e) => setResponseType(e.target.value as "simplified" | "original" | "both")}
                  className="w-5 h-5 text-purple-600"
                />
                <span className="text-lg text-gray-700">Both (Original + Simplified)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="responseType"
                  value="simplified"
                  checked={responseType === "simplified"}
                  onChange={(e) => setResponseType(e.target.value as "simplified" | "original" | "both")}
                  className="w-5 h-5 text-purple-600"
                />
                <span className="text-lg text-gray-700">Simplified Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="responseType"
                  value="original"
                  checked={responseType === "original"}
                  onChange={(e) => setResponseType(e.target.value as "simplified" | "original" | "both")}
                  className="w-5 h-5 text-purple-600"
                />
                <span className="text-lg text-gray-700">Original Diagnosis Only</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <button
              type="submit"
              disabled={loading || !user}
              className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-8 py-4 text-white font-semibold text-lg hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors min-w-64"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
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
                  Analyzing...
                </>
              ) : !user ? (
                "Please Sign In"
              ) : (
                "Analyze Medical Query"
              )}
            </button>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md w-full">
                <p className="text-red-600 font-medium text-center">{error}</p>
              </div>
            )}
          </div>
        </form>

        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          {showSavedResultsButton && savedResults && (
            <button
              onClick={reopenSavedResults}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              View Current Results
            </button>
          )}

          {previousPatientReport && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              View Previous Report ({previousPatientName})
            </button>
          )}
        </div>
      </div>

      {showPatientSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between border-b">
              <h2 className="text-2xl font-bold text-white">Select Previous Patient</h2>
              <button
                onClick={() => setShowPatientSelector(false)}
                className="text-white hover:bg-blue-800 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {loadingPatients ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading patients...</p>
                </div>
              ) : allPatients.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No previous patients found</p>
                  <p className="text-gray-400 text-sm mt-2">Start by adding your first patient</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allPatients.map((patient) => (
                    <button
                      key={patient.patientId || patient._id}
                      onClick={() => selectPatient(patient)}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800">{patient.name}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>Age: {patient.age || 'Not specified'}</span>
                            <span>Gender: {patient.gender || 'Not specified'}</span>
                          </div>
                          {patient.Lastdisease && (
                            <p className="text-gray-700 mt-2">
                              Last Condition: {patient.Lastdisease}
                            </p>
                          )}
                          {patient.LasttreatmentDate && (
                            <p className="text-gray-500 text-xs mt-1">
                              Last visit: {new Date(patient.LasttreatmentDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="ml-4">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowPatientSelector(false)}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {result && showModal && (
        <ResultsModal
          result={result}
          responseType={responseType}
          showOutcomeForm={showOutcomeForm}
          patientOutcome={patientOutcome}
          savingOutcome={savingOutcome}
          onOutcomeChange={setPatientOutcome}
          onOutcomeSubmit={handleOutcomeSubmit}
          onNavigateToChat={navigateToChat}
          onClose={() => setShowModal(false)}
          userName={user?.fullName || user?.primaryEmailAddress?.emailAddress || "User"}
          onAutoSave={handleAutoSave}
        />
      )}

      {showPreviousCasesModal && (
        <PreviousCasesModal
          cases={previousCases}
          onSelectCase={handleSelectCase}
          onClose={() => setShowPreviousCasesModal(false)}
        />
      )}
    </div>
  )
}