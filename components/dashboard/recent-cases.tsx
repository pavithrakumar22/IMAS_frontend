import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, AlertTriangle } from "lucide-react"
import type { CaseItem } from "@/hooks/use-user-data"

export function RecentCases({ cases }: { cases: CaseItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Cases</CardTitle>
        <CardDescription>Latest consultations and their status</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {cases.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-md border p-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-3">
                  <span className="font-medium">{c.id}</span>
                  <Badge
                    variant={
                      c.complexity === "High" ? "destructive" : c.complexity === "Medium" ? "default" : "secondary"
                    }
                  >
                    {c.complexity}
                  </Badge>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {c.patient} — {c.condition}
                </p>
                <p className="text-xs text-muted-foreground">{c.time}</p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                {c.status === "Resolved" && <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden />}
                {c.status === "Escalated" && <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden />}
                {c.status === "In Progress" && <Clock className="h-5 w-5 text-yellow-600" aria-hidden />}
                <span className="text-sm font-medium">{c.status}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
