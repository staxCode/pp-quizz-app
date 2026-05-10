import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface NavbarProps {
  userEmail?: string
  onLogout?: () => void
}

export function Navbar({ userEmail, onLogout }: NavbarProps) {
  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            Q
          </div>
          <span className="font-bold text-xl hidden sm:inline">Quiz Master</span>
        </Link>

        <nav className="flex items-center gap-4">
          {userEmail && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {userEmail}
            </span>
          )}
          {onLogout && (
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
              <span className="ml-2 hidden sm:inline">Salir</span>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
