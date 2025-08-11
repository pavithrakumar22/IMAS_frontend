import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { getHeader } from '@/lib/headers';

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const csp = await getHeader('Content-Security-Policy');
  
  return {
    title: "IMAS - Intelligent Medical Assistant System",
    description: "Empowering rural healthcare providers with AI-driven medical guidance in local languages",
    other: csp ? { 'Content-Security-Policy': csp } : {},
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}