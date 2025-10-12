"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function RoleSelectPage() {
  const router = useRouter()
  const [role, setRole] = useState<"RMP" | "CHW" | "GUEST" | null>(null)

  function handleContinue() {
    if (!role) return
    if (role === "GUEST") {
      router.push("/dashboard")
    } else {
      router.push(`/interview?role=${role}`)
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-balance">Choose how you want to continue</CardTitle>
          <CardDescription>Select your role to proceed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-sm">Role</Label>
            <RadioGroup
              value={role ?? undefined}
              onValueChange={(v) => setRole(v as any)}
              className="grid grid-cols-1 gap-3"
            >
              <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <RadioGroupItem id="rmp" value="RMP" />
                <Label htmlFor="rmp" className="cursor-pointer">
                  RMP
                </Label>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <RadioGroupItem id="chw" value="CHW" />
                <Label htmlFor="chw" className="cursor-pointer">
                  CHW
                </Label>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <RadioGroupItem id="guest" value="GUEST" />
                <Label htmlFor="guest" className="cursor-pointer">
                  Guest
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={handleContinue} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
