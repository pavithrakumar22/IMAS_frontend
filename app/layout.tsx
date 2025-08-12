import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { UserSync } from "@/components/user-sync"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "IMAS - Intelligent Medical Assistant System",
  description: "Empowering rural healthcare providers with AI-driven medical guidance in local languages",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <UserSync />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
