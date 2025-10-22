"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Users } from "lucide-react"
import { useRouter } from "next/navigation"

export function QuickActions() {
  const router = useRouter()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          className="w-full justify-start bg-transparent"
          variant="outline"
          onClick={() => router.push("/chat")}
          aria-label="Start a new case"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          New Case
        </Button>
        <Button
          className="w-full justify-start bg-transparent"
          variant="outline"
          onClick={() => router.push("/patients")}
          aria-label="Go to patient-wise history"
        >
          <Users className="mr-2 h-4 w-4" />
          Patient-wise History
        </Button>
      </CardContent>
    </Card>
  )
}
