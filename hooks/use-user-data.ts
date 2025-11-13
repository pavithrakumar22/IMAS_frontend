"use client"

import useSWR from "swr"

export type CaseItem = { 
  id: string
  patient: string
  condition: string
  complexity: "Low" | "Medium" | "High"
  status: "Resolved" | "Escalated" | "In Progress"
  time: string
  outcome: string
  age?: number
  gender?: string
  clerkUserId: string
  patientId: string
  diseaseIndex: number
}

export type HistoryRow = {
  date: string
  patient: string
  summary: string
  outcome: "Resolved" | "Follow-up" | "Escalated"
}

export type AgentStatus = {
  name: string
  status: string
}

export type PatientRow = {
  id: string
  name: string
  age: number
  lastVisit: string
  cases: number
  resolved: number
}

export type UserData = {
  stats: {
    patientsCured: number
    experienceYears: number
    successRate: number
  }
  recentCases: CaseItem[]
  overallHistory: HistoryRow[]
  agents: AgentStatus[]
  patients: PatientRow[]
}

const SAMPLE_DATA: UserData = {
  stats: {
    patientsCured: 248,
    experienceYears: 7,
    successRate: 94,
  },
  recentCases: [
    {
      id: "CASE-001",
      patient: "Patient A",
      condition: "Fever and headache",
      complexity: "Low",
      status: "Resolved",
      time: "2 hours ago",
      outcome: "cured",
      clerkUserId: "user_2sample1",
      patientId: "PAT1701234567890ABC123",
      diseaseIndex: 0
    },
    {
      id: "CASE-002",
      patient: "Patient B",
      condition: "Chest pain",
      complexity: "High",
      status: "Escalated",
      time: "4 hours ago",
      outcome: "referred",
      clerkUserId: "user_2sample1",
      patientId: "PAT1701234567890DEF456",
      diseaseIndex: 0
    },
    {
      id: "CASE-003",
      patient: "Patient C",
      condition: "Skin rash",
      complexity: "Medium",
      status: "In Progress",
      time: "6 hours ago",
      outcome: "ongoing",
      clerkUserId: "user_2sample1",
      patientId: "PAT1701234567890GHI789",
      diseaseIndex: 0
    },
  ],
  overallHistory: [
    { date: "2025-09-20", patient: "Patient D", summary: "Cough & cold — conservative care", outcome: "Resolved" },
    { date: "2025-09-19", patient: "Patient E", summary: "Hypertension review — meds adjusted", outcome: "Follow-up" },
    { date: "2025-09-18", patient: "Patient F", summary: "Acute chest pain — referred to ER", outcome: "Escalated" },
  ],
  agents: [
    { name: "Translation Agent", status: "Active" },
    { name: "Complexity Assessment", status: "Active" },
    { name: "Expert Network", status: "Active" },
    { name: "Advice Generation", status: "Active" },
    { name: "Response Simplification", status: "Active" },
  ],
  patients: [
    { id: "P-001", name: "Patient A", age: 34, lastVisit: "2025-09-20", cases: 3, resolved: 3 },
    { id: "P-002", name: "Patient B", age: 58, lastVisit: "2025-09-19", cases: 2, resolved: 1 },
    { id: "P-003", name: "Patient C", age: 26, lastVisit: "2025-09-18", cases: 1, resolved: 0 },
  ],
}

const fetcher = async (url: string): Promise<UserData> => {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  return res.json()
}

export function useUserData() {
  const { data, error, isLoading } = useSWR<UserData>("/userData", fetcher, {
    revalidateOnFocus: false,
  })

  const safeData = data && !error ? data : SAMPLE_DATA
  return {
    data: safeData,
    isLoading,
    isFallback: !!error || !data,
    error,
  }
}