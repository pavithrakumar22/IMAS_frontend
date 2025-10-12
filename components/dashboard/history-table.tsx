import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { HistoryRow } from "@/hooks/use-user-data"

const outcomeColor: Record<HistoryRow["outcome"], string> = {
  Resolved: "text-green-600",
  "Follow-up": "text-amber-600",
  Escalated: "text-red-600",
}

export function HistoryTable({ rows }: { rows: HistoryRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall History</CardTitle>
        <CardDescription>Recent activity across all cases</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Patient</th>
                <th className="py-2 pr-4">Summary</th>
                <th className="py-2 pr-0">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-3 pr-4">{r.date}</td>
                  <td className="py-3 pr-4">{r.patient}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{r.summary}</td>
                  <td className={`py-3 pr-0 font-medium ${outcomeColor[r.outcome]}`}>{r.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
