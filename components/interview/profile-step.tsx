"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type ProfileData = {
  nickname: string
  areaOfOperation: string
  role: "RMP" | "CHW"
  experienceMonths: number
}

export default function ProfileStep({
  defaultRole,
  onSubmit,
}: {
  defaultRole?: "RMP" | "CHW"
  onSubmit: (data: ProfileData) => void
}) {
  const [nickname, setNickname] = useState("")
  const [areaOfOperation, setAreaOfOperation] = useState("")
  const [role, setRole] = useState<"RMP" | "CHW" | undefined>(defaultRole)
  const [experienceMonths, setExperienceMonths] = useState<number | "">("")

  const canSubmit = nickname.trim() && areaOfOperation.trim() && role && typeof experienceMonths === "number"

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !role || typeof experienceMonths !== "number") return
    onSubmit({ nickname: nickname.trim(), areaOfOperation: areaOfOperation.trim(), role, experienceMonths })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="nickname">Nickname</Label>
        <Input id="nickname" placeholder="e.g., Alex" value={nickname} onChange={(e) => setNickname(e.target.value)} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="area">Area of Operation</Label>
        <Input
          id="area"
          placeholder="e.g., West District"
          value={areaOfOperation}
          onChange={(e) => setAreaOfOperation(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label>Role</Label>
        <Select value={role} onValueChange={(v) => setRole(v as "RMP" | "CHW")}>
          <SelectTrigger aria-label="Role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="RMP">RMP</SelectItem>
            <SelectItem value="CHW">CHW</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="exp">Experience (months)</Label>
        <Input
          id="exp"
          inputMode="numeric"
          type="number"
          min={0}
          placeholder="e.g., 36"
          value={experienceMonths}
          onChange={(e) => {
            const v = e.target.value
            setExperienceMonths(v === "" ? "" : Math.max(0, Number(v)))
          }}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!canSubmit}>
          Start Interview
        </Button>
      </div>
    </form>
  )
}
