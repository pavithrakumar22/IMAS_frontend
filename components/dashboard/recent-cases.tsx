"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Edit, X } from "lucide-react"
import type { CaseItem } from "@/hooks/use-user-data"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function RecentCases({ cases }: { cases: CaseItem[] }) {
  const [visibleCount, setVisibleCount] = useState(3)
  const [editingCase, setEditingCase] = useState<CaseItem | null>(null)
  const [selectedOutcome, setSelectedOutcome] = useState("")
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
    const params = new URLSearchParams({
      name: caseItem.patient || '',
      disease: caseItem.condition || '',
      ...(caseItem.age && { age: caseItem.age.toString() }),
      ...(caseItem.gender && { gender: caseItem.gender }),
      autoSubmit: 'false' 
    })

    router.push(`/chat?${params.toString()}`)
  }

  const handleSaveOutcome = async () => {
    if (!editingCase || !selectedOutcome) return

    try {
      const response = await fetch('http://localhost:5000/api/auth/update-disease-outcome', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkUserId: editingCase.clerkUserId,
          patientId: editingCase.patientId,
          diseaseIndex: editingCase.diseaseIndex,
          outcome: selectedOutcome,
        }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to update outcome. Please try again.')
      }
    } catch (error) {
      alert('Error updating outcome. Please try again.')
    } finally {
      setEditingCase(null)
      setSelectedOutcome("")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Resolved": return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "Escalated": return <AlertTriangle className="h-5 w-5 text-red-600" />
      case "In Progress": return <Clock className="h-5 w-5 text-yellow-600" />
      default: return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const outcomeOptions = [
    { value: "cured", label: "Cured", color: "text-green-600 bg-green-50 border-green-200" },
    { value: "improved", label: "Improved", color: "text-blue-600 bg-blue-50 border-blue-200" },
    { value: "ongoing", label: "Ongoing", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    { value: "referred", label: "Referred", color: "text-purple-600 bg-purple-50 border-purple-200" },
  ]

  const getOutcomeColor = (outcome: string) => {
    const option = outcomeOptions.find(opt => opt.value === outcome)
    return option ? option.color : "text-gray-600 bg-gray-50 border-gray-200"
  }

  return (
    <>
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
          <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30">
            <ul className="space-y-3">
              {visibleCases.map((c) => (
                <li 
                  key={c.id} 
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50 cursor-pointer group relative"
                  onClick={() => handlePatientClick(c)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
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
                    {getStatusIcon(c.status)}
                    <span className="text-sm font-medium text-center">{c.status}</span>
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getOutcomeColor(c.outcome || "")}`}
                      >
                        {c.outcome || "No outcome"}
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingCase(c)
                          setSelectedOutcome(c.outcome || "")
                        }}
                        title="Edit outcome"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
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

      {editingCase && (
        <div className="fixed inset-0 bg-background/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Select Outcome</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingCase(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-3 text-sm mb-4">
                <p className="font-medium">Patient: {editingCase.patient}</p>
                <p className="text-muted-foreground">Condition: {editingCase.condition}</p>
                <p className="text-muted-foreground">Current Status: {editingCase.status}</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium mb-3 text-center">
                  Select Treatment Outcome
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {outcomeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedOutcome(option.value)}
                      className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                        selectedOutcome === option.value
                          ? `${option.color} border-current scale-105`
                          : 'border-gray-200 bg-white hover:bg-gray-50 hover:scale-105'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <Button 
                variant="outline" 
                onClick={() => setEditingCase(null)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveOutcome} 
                disabled={!selectedOutcome}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Outcome
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}