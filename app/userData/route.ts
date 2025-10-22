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

    // Sort patients by LasttreatmentDate (most recent first)
    const sortedPatients = user.patients?.sort((a, b) => 
      new Date(b.LasttreatmentDate || 0) - new Date(a.LasttreatmentDate || 0)
    ) || [];

    // Calculate stats from your actual data
    const totalPatients = sortedPatients.length;
    const successfulCases = user.successfulCases || 0;
    const successRate = user.successRate || 0;

    // Calculate complexity distribution
    let lowComplexityCases = 0;
    let mediumComplexityCases = 0;
    let highComplexityCases = 0;

    sortedPatients.forEach(patient => {
      // Check diseases array first, then fall back to Lastcomplexity
      if (patient.diseases && patient.diseases.length > 0) {
        patient.diseases.forEach(disease => {
          if (disease.complexity === 'low') lowComplexityCases++;
          else if (disease.complexity === 'medium') mediumComplexityCases++;
          else if (disease.complexity === 'high') highComplexityCases++;
        });
      } else {
        // Use legacy complexity field
        if (patient.Lastcomplexity === 'low') lowComplexityCases++;
        else if (patient.Lastcomplexity === 'medium') mediumComplexityCases++;
        else if (patient.Lastcomplexity === 'high') highComplexityCases++;
      }
    });

    // Calculate outcome distribution
    let patientsCured = 0;
    let patientsImproved = 0;
    let patientsReferred = 0;
    let patientsOngoing = 0;

    sortedPatients.forEach(patient => {
      // Check diseases array first, then fall back to Lastoutcome
      if (patient.diseases && patient.diseases.length > 0) {
        patient.diseases.forEach(disease => {
          if (disease.outcome === 'cured') patientsCured++;
          else if (disease.outcome === 'improved') patientsImproved++;
          else if (disease.outcome === 'referred') patientsReferred++;
          else if (disease.outcome === 'ongoing') patientsOngoing++;
        });
      } else {
        // Use legacy outcome field
        if (patient.Lastoutcome === 'cured') patientsCured++;
        else if (patient.Lastoutcome === 'improved') patientsImproved++;
        else if (patient.Lastoutcome === 'referred') patientsReferred++;
        else if (patient.Lastoutcome === 'ongoing') patientsOngoing++;
      }
    });

    // Recent Cases - using your actual patient data
    const recentCases = sortedPatients.slice(0, 5).map((patient, index) => {
      const primaryDisease = patient.diseases && patient.diseases.length > 0 
        ? patient.diseases[patient.diseases.length - 1] // Get most recent disease
        : {
            name: patient.Lastdisease,
            diagnosis: patient.Lastdiagnosis,
            outcome: patient.Lastoutcome,
            complexity: patient.Lastcomplexity,
            treatmentDate: patient.LasttreatmentDate
          };

      return {
        id: patient.patientId,
        patient: patient.name,
        condition: primaryDisease?.name || "Condition not specified",
        diagnosis: primaryDisease?.diagnosis || "Diagnosis pending",
        complexity: formatComplexity(primaryDisease?.complexity),
        status: getStatusFromOutcome(primaryDisease?.outcome),
        time: formatTimeAgo(primaryDisease?.treatmentDate || patient.LasttreatmentDate),
        outcome: formatOutcome(primaryDisease?.outcome),
        age: patient.age,
        treatmentDate: formatDate(primaryDisease?.treatmentDate || patient.LasttreatmentDate)
      };
    });

    // Overall History
    const overallHistory = sortedPatients.map(patient => {
      const primaryDisease = patient.diseases && patient.diseases.length > 0 
        ? patient.diseases[patient.diseases.length - 1]
        : {
            name: patient.Lastdisease,
            diagnosis: patient.Lastdiagnosis,
            outcome: patient.Lastoutcome,
            complexity: patient.Lastcomplexity,
            treatmentDate: patient.LasttreatmentDate
          };

      return {
        date: formatDate(primaryDisease?.treatmentDate || patient.LasttreatmentDate),
        patient: patient.name,
        summary: `${primaryDisease?.name || "Condition"} - ${primaryDisease?.diagnosis?.substring(0, 50) || "No diagnosis"}...`,
        outcome: formatOutcome(primaryDisease?.outcome),
        complexity: formatComplexity(primaryDisease?.complexity)
      };
    });

    // Build final payload
    const payload = {
      stats: {
        patientsCured: patientsCured,
        patientsImproved: patientsImproved,
        patientsReferred: patientsReferred,
        patientsOngoing: patientsOngoing,
        experienceYears: user.experienceYears || 0,
        successRate: Math.round(successRate),
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
        id: patient.patientId,
        name: patient.name,
        age: patient.age,
        disease: patient.Lastdisease || "Not specified",
        diagnosis: patient.Lastdiagnosis || "Pending",
        lastVisit: formatDate(patient.LasttreatmentDate),
        cases: patient.diseases?.length || 1,
        resolved: (patient.Lastoutcome === 'cured') ? 1 : 0,
        outcome: formatOutcome(patient.Lastoutcome),
        complexity: formatComplexity(patient.Lastcomplexity),
        treatmentDate: formatDate(patient.LasttreatmentDate),
        totalDiseases: patient.diseases?.length || 1
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

// Helper functions
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

function formatOutcome(outcome) {
  if (!outcome) return 'Ongoing';
  return outcome.charAt(0).toUpperCase() + outcome.slice(1);
}

function formatComplexity(complexity) {
  if (!complexity) return 'Not specified';
  return complexity.charAt(0).toUpperCase() + complexity.slice(1);
}

function formatTimeAgo(dateString) {
  if (!dateString) return "No treatment date";
  const date = new Date(dateString);
  const hours = Math.abs(Math.floor((new Date() - date) / (1000 * 60 * 60)));
  return `${hours} hours ago`;
}

function formatDate(dateString) {
  if (!dateString) return "Not specified";
  return new Date(dateString).toLocaleDateString();
}