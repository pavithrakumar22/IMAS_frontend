// types.ts
export interface DiseaseData {
  name: string
  nameTranslated?: string
  diagnosis: string
  simplifiedDiagnosis?: string
  treatmentDate: string
  outcome: string
  complexity?: string
  _id?: string
}

export interface PatientData {
  id: string
  patientId: string
  name: string
  age: number
  gender?: string
  lastVisit: string
  cases: number
  resolved: number
  outcome: string
  complexity: string
  treatmentDate: string
  totalDiseases: number
  diseases?: DiseaseData[]
  Lastdisease?: string
  LastdiseaseTranslated?: string
  Lastdiagnosis?: string
  LastdiagnosisSimplified?: string
  Lastoutcome?: string
  LasttreatmentDate?: string
  Lastcomplexity?: string
}

export interface CaseData {
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

export interface FilterCounts {
  status: {
    all: number
    cured: number
    improved: number
    ongoing: number
    referred: number
  }
  complexity: {
    all: number
    low: number
    medium: number
    high: number
  }
  diseases: {
    all: number
    [key: string]: number
  }
}