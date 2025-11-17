// components/dashboard/dashboard-client.jsx
"use client"

import { AppHeader } from "@/components/dashboard/app-header"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { RecentCases } from "@/components/dashboard/recent-cases"
import { AgentsStatus } from "@/components/dashboard/agents-status"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { useUserData } from "@/hooks/use-user-data"

export function DashboardClient() {
  const { data, isLoading, error } = useUserData()

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-center">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-center text-destructive">Error loading dashboard: {error.message}</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-center">No data available</div>
      </div>
    )
  }
 
  return (
    <div className="min-h-dvh bg-background">
      <AppHeader userProfile={data.userProfile} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8">
          <h1 className="text-balance text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {data.userProfile?.displayName || data.userProfile?.firstName}! 
            Track your cases, outcomes, and agent activity
          </p>
        </section>

        <section className="mb-8">
          <StatsGrid {...data.stats} />
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <RecentCases cases={data.recentCases} />
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