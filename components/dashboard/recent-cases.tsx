"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import type { CaseItem } from "@/hooks/use-user-data"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function RecentCases({ cases }: { cases: CaseItem[] }) {
  const [visibleCount, setVisibleCount] = useState(3)
  const router = useRouter()
  
  const visibleCases = cases.slice(0, visibleCount)
  const hasMoreCases = cases.length > visibleCount
  const canShowLess = visibleCount > 3

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 3, cases.length))
  }

  const showLess = () => {
    setVisibleCount(3)
  }

  const handlePatientClick = (caseItem: CaseItem) => {
    console.log('Patient clicked:', caseItem)
    const params = new URLSearchParams({
      name: caseItem.patient || '',
      disease: caseItem.condition || '',
      ...(caseItem.age && { age: caseItem.age.toString() }),
      ...(caseItem.gender && { gender: caseItem.gender }),
      autoSubmit: 'false' 
    })

    router.push(`/chat?${params.toString()}`)
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Cases</CardTitle>
            <CardDescription>
              Latest consultations and their status
              <span className="ml-2 text-xs font-medium text-muted-foreground">
                ({cases.length} total)
              </span>
            </CardDescription>
          </div>
          {cases.length > 3 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              Showing {visibleCases.length} of {cases.length}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Scrollable container */}
        <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30">
          <ul className="space-y-3">
            {visibleCases.map((c) => (
              <li 
                key={c.id} 
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50 cursor-pointer"
                onClick={() => handlePatientClick(c)}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation() // Prevent triggering the parent click
                        handlePatientClick(c)
                      }}
                      className="font-medium text-sm truncate max-w-[120px] hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 py-0.5 transition-colors"
                      title="Click to chat with this patient"
                    >
                      {c.id}
                    </button>
                    <Badge
                      variant={
                        c.complexity === "High" ? "destructive" : 
                        c.complexity === "Medium" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {c.complexity}
                    </Badge>
                  </div>
                  <p className="truncate text-sm font-medium mb-1">
                    {c.patient}
                  </p>
                  <p className="truncate text-sm text-muted-foreground mb-2">
                    {c.condition}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{c.time}</span>
                    <div className="flex items-center gap-2">
                      {c.age && (
                        <span>Age: {c.age}</span>
                      )}
                      {c.gender && (
                        <span>Gender: {c.gender}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex flex-col items-center gap-2 min-w-[100px]">
                  {c.status === "Resolved" && <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden />}
                  {c.status === "Escalated" && <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden />}
                  {c.status === "In Progress" && <Clock className="h-5 w-5 text-yellow-600" aria-hidden />}
                  <span className="text-sm font-medium text-center">{c.status}</span>
                  {c.outcome && (
                    <Badge variant="outline" className="text-xs">
                      {c.outcome}
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {(hasMoreCases || canShowLess) && (
          <div className="mt-4 flex justify-center border-t pt-4">
            <div className="flex gap-2">
              {hasMoreCases && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadMore}
                  className="flex items-center gap-1"
                >
                  <ChevronDown className="h-4 w-4" />
                  Load More ({cases.length - visibleCount} remaining)
                </Button>
              )}
              {canShowLess && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={showLess}
                  className="flex items-center gap-1"
                >
                  <ChevronUp className="h-4 w-4" />
                  Show Less
                </Button>
              )}
            </div>
          </div>
        )}

        {cases.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">No recent cases</p>
            <p className="text-xs text-muted-foreground">New consultations will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}