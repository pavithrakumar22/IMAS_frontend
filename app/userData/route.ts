// app/api/dashboard/route.js
import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"

export async function GET() {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user data from your Express backend
    const userResponse = await fetch(`http://localhost:5000/api/auth/me`, {
      headers: {
        'x-clerk-user-id': clerkUser.id
      }
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data from backend')
    }

    const userData = await userResponse.json()
    const user = userData.user

    // Sort patients by treatmentDate (most recent first)
    const sortedPatients = user.patients?.sort((a, b) => 
      new Date(b.treatmentDate || 0) - new Date(a.treatmentDate || 0)
    ) || [];

    // Recent Cases = Most recent patients (using patients array)
    const recentCases = sortedPatients.slice(0, 5).map((patient, index) => ({
      id: patient.patientId || `CASE-${String(index + 1).padStart(3, '0')}`,
      patient: patient.name || `Patient ${String.fromCharCode(65 + index)}`,
      condition: patient.disease || "Condition not specified",
      diagnosis: patient.diagnosis || "Diagnosis pending",
      complexity: patient.complexity ? patient.complexity.charAt(0).toUpperCase() + patient.complexity.slice(1) : 'Not specified',
      status: getStatusFromOutcome(patient.outcome),
      time: patient.treatmentDate ? 
        `${Math.abs(Math.floor((new Date() - new Date(patient.treatmentDate)) / (1000 * 60 * 60)))} hours ago` 
        : "No treatment date",
      outcome: patient.outcome ? patient.outcome.charAt(0).toUpperCase() + patient.outcome.slice(1) : 'Ongoing',
      age: patient.age || 'Not specified',
      treatmentDate: patient.treatmentDate ? new Date(patient.treatmentDate).toLocaleDateString() : 'Not specified'
    }));

    // Overall History = All patients formatted for history view
    const overallHistory = sortedPatients.map(patient => ({
      date: patient.treatmentDate ? new Date(patient.treatmentDate).toISOString().split('T')[0] : "Unknown date",
      patient: patient.name || "Unknown Patient",
      summary: `${patient.disease || "Condition"} - ${patient.diagnosis || "No diagnosis"}`,
      outcome: patient.outcome ? patient.outcome.charAt(0).toUpperCase() + patient.outcome.slice(1) : "Ongoing",
      complexity: patient.complexity ? patient.complexity.charAt(0).toUpperCase() + patient.complexity.slice(1) : 'Not specified'
    }));

    // Calculate real stats from patient data
    const totalPatients = sortedPatients.length;
    const successfulCases = sortedPatients.filter(p => p.outcome === 'cured').length;
    const improvedCases = sortedPatients.filter(p => p.outcome === 'improved').length;
    const referredCases = sortedPatients.filter(p => p.outcome === 'referred').length;
    const ongoingCases = sortedPatients.filter(p => p.outcome === 'ongoing').length;
    
    // Calculate complexity distribution
    const lowComplexityCases = sortedPatients.filter(p => p.complexity === 'low').length;
    const mediumComplexityCases = sortedPatients.filter(p => p.complexity === 'medium').length;
    const highComplexityCases = sortedPatients.filter(p => p.complexity === 'high').length;

    const successRate = totalPatients > 0 ? Math.round((successfulCases / totalPatients) * 100) : 0;

    // Build payload using ONLY data from MongoDB patients array
    const payload = {
      stats: {
        patientsCured: successfulCases,
        patientsImproved: improvedCases,
        patientsReferred: referredCases,
        patientsOngoing: ongoingCases,
        experienceYears: user.experienceYears || 0,
        successRate: successRate,
        totalPatients: totalPatients,
        lowComplexityCases: lowComplexityCases,
        mediumComplexityCases: mediumComplexityCases,
        highComplexityCases: highComplexityCases,
      },
      recentCases: recentCases,
      overallHistory: overallHistory,
      agents: [
        { name: "Translation Agent", status: "Active" },
        { name: "Complexity Assessment", status: "Active" },
        { name: "Expert Network", status: "Active" },
        { name: "Advice Generation", status: "Active" },
        { name: "Response Simplification", status: "Active" },
      ],
      patients: sortedPatients.map(patient => ({
        id: patient.patientId || `P-${Math.random().toString(36).substr(2, 9)}`,
        name: patient.name || "Unknown",
        age: patient.age || null,
        disease: patient.disease || "Not specified",
        diagnosis: patient.diagnosis || "Pending",
        lastVisit: patient.treatmentDate ? new Date(patient.treatmentDate).toISOString().split('T')[0] : "Never",
        cases: 1,
        resolved: patient.outcome === 'cured' ? 1 : 0,
        outcome: patient.outcome ? patient.outcome.charAt(0).toUpperCase() + patient.outcome.slice(1) : "Ongoing",
        complexity: patient.complexity ? patient.complexity.charAt(0).toUpperCase() + patient.complexity.slice(1) : 'Not specified',
        treatmentDate: patient.treatmentDate ? new Date(patient.treatmentDate).toLocaleDateString() : 'Not specified'
      })),
      userProfile: {
        displayName: user.displayName,
        role: user.role,
        experienceYears: user.experienceYears,
        areaOfOperation: user.areaOfOperation,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        totalPatients: totalPatients,
        successfulCases: successfulCases,
        successRate: successRate,
        lastSignInAt: user.lastSignInAt,
        createdAt: user.createdAt
      }
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 })
  }
}

// Helper function to convert outcome to status
function getStatusFromOutcome(outcome) {
  switch (outcome) {
    case 'cured':
      return 'Resolved';
    case 'improved':
      return 'Improved';
    case 'referred':
      return 'Escalated';
    case 'ongoing':
    default:
      return 'In Progress';
  }
}





