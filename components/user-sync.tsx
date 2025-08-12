"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect } from "react"
import { api } from "@/lib/api"

export function UserSync() {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    const syncUserData = async () => {
      if (isLoaded && user) {
        try {
          await api.syncUser(user.id)
          console.log("User synced successfully")
        } catch (error) {
          console.error("Failed to sync user:", error)
        }
      }
    }

    syncUserData()
  }, [user, isLoaded])

  return null // This component doesn't render anything
}
