'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Menu, Home, Settings, LogOut } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Tetapan', href: '/dashboard/settings', icon: Settings },
  ]

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto">
          <div className="px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-500"
              >
                <Menu size={24} />
              </button>
              <span className="text-lg font-medium">
                {pathname === '/dashboard' ? 'Dashboard' : ''}
                {pathname.startsWith('/dashboard/settings') ? 'Tetapan ' : ''}
                {pathname.includes('/dashboard/') && !pathname.endsWith('/dashboard') ? 'Profile Anak' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-200 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <div 
          className={`fixed top-0 left-0 h-full w-64 bg-white transform transition-transform duration-200 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-500">Aset Anak</h1>
          </div>
          
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} />
                  <span className="ml-3">{item.name}</span>
                </Link>
              )
            })}
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 rounded-lg text-red-500 hover:bg-red-50"
            >
              <LogOut size={20} />
              <span className="ml-3">Log Keluar</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-4">
        {children}
      </div>
    </div>
  )
}