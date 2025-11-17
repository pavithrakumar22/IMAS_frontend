"use client"

import { AppHeader } from "@/components/dashboard/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUserData } from "@/hooks/use-user-data"

export function PatientsClient() {
  const { data } = useUserData()
  const patients = data.patients

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-6">
          <h1 className="text-balance text-3xl font-semibold">Patient-wise History</h1>
          <p className="text-muted-foreground">Per-patient summary. Data is sample; will connect to MongoDB later.</p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Patients</CardTitle>
            <CardDescription>Overview of cases and outcomes per patient</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Age</th>
                    <th className="py-2 pr-4">Last Visit</th>
                    <th className="py-2 pr-4">Cases</th>
                    <th className="py-2 pr-0">Resolved</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">{p.id}</td>
                      <td className="py-3 pr-4">{p.name}</td>
                      <td className="py-3 pr-4">{p.age}</td>
                      <td className="py-3 pr-4">{p.lastVisit}</td>
                      <td className="py-3 pr-4">{p.cases}</td>
                      <td className="py-3 pr-0">{p.resolved}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
