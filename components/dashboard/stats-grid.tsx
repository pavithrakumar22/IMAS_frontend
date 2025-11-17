// components/dashboard/stats-grid.jsx
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Award, TrendingUp, Activity, Target, Clock } from "lucide-react"

export type StatsProps = {
  patientsCured: number
  patientsImproved: number
  patientsReferred: number
  patientsOngoing: number
  experienceYears: number
  successRate: number
  totalPatients: number
  lowComplexityCases: number
  mediumComplexityCases: number
  highComplexityCases: number
}

export function StatsGrid(props: StatsProps) {
  const items = [
    { 
      title: "Total Patients", 
      value: String(props.totalPatients), 
      change: `${props.patientsOngoing} ongoing`, 
      icon: Users 
    },
    { 
      title: "Cases Cured", 
      value: String(props.patientsCured), 
      change: `${props.patientsImproved} improved`, 
      icon: Target 
    },
    { 
      title: "Success Rate", 
      value: `${props.successRate}%`, 
      change: `${props.experienceYears} yrs experience`, 
      icon: TrendingUp 
    },
    { 
      title: "Case Complexity", 
      value: `${props.lowComplexityCases}L/${props.mediumComplexityCases}M/${props.highComplexityCases}H`, 
      change: "Low/Medium/High", 
      icon: Activity 
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <Card key={s.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
              <s.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{s.value}</div>
            {s.change ? <p className="mt-1 text-xs text-muted-foreground">{s.change}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}