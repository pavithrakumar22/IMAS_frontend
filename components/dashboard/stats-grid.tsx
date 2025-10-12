import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Award, TrendingUp } from "lucide-react"

export type StatsProps = {
  patientsCured: number
  experienceYears: number
  successRate: number
}

export function StatsGrid(props: StatsProps) {
  const items: { title: string; value: string; change?: string; icon: React.ElementType }[] = [
    { title: "Patients Cured", value: String(props.patientsCured), change: "+15 this week", icon: Users },
    { title: "Experience", value: `${props.experienceYears} yrs`, change: "RMP tenure", icon: Award },
    { title: "Success Rate", value: `${props.successRate}%`, change: "+2% this month", icon: TrendingUp },
  ]
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {items.map((s) => (
        <Card key={s.title}>
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
