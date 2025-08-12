const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface User {
  _id: string
  clerkUserId: string
  email: string
  firstName?: string
  lastName?: string
  lastSignInAt?: Date
  createdAt: Date
}

export const api = {
  // Sync user data from Clerk to backend
  syncUser: async (userId: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/sync-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    })

    if (!response.ok) {
      throw new Error("Failed to sync user")
    }

    return response.json()
  },

  // Get user details from backend
  getUser: async (userId: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/user/${userId}`)

    if (!response.ok) {
      throw new Error("Failed to fetch user")
    }

    return response.json()
  },

  // Logout user
  logout: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Failed to logout")
    }
  },
}
