import Link from "next/link"
import { Stethoscope } from "lucide-react"

export function AppHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2" aria-label="IMAS Home">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="text-balance text-xl font-semibold">IMAS</span>
          </Link>

          <nav className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link className="hover:text-foreground" href="/dashboard">
              Dashboard
            </Link>
            <Link className="hover:text-foreground" href="/patients">
              Patients
            </Link>
            <Link className="hover:text-foreground" href="/chat">
              New Case
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
