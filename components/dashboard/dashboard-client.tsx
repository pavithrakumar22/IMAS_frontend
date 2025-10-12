"use client"

import { AppHeader } from "@/components/dashboard/app-header"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { RecentCases } from "@/components/dashboard/recent-cases"
import { AgentsStatus } from "@/components/dashboard/agents-status"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { HistoryTable } from "@/components/dashboard/history-table"
import { useUserData } from "@/hooks/use-user-data"

export function DashboardClient() {
  const { data } = useUserData()

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8">
          <h1 className="text-balance text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Track cases, outcomes, and agent activity</p>
        </section>

        <section className="mb-8">
          <StatsGrid
            patientsCured={data.stats.patientsCured}
            experienceYears={data.stats.experienceYears}
            successRate={data.stats.successRate}
          />
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <RecentCases cases={data.recentCases} />
            <HistoryTable rows={data.overallHistory} />
          </div>
          <div className="space-y-8">
            <AgentsStatus agents={data.agents} />
            <QuickActions />
          </div>
        </section>
      </main>
    </div>
  )
}
