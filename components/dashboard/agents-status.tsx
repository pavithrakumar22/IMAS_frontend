import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { AgentStatus } from "@/hooks/use-user-data"

export function AgentsStatus({ agents }: { agents: AgentStatus[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Agents Status</CardTitle>
        <CardDescription>Current status of all AI agents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {agents.map((a) => (
          <div key={a.name} className="flex items-center justify-between">
            <span className="text-sm font-medium">{a.name}</span>
            <div className="flex items-center gap-2">
              <span aria-hidden className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">{a.status}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
