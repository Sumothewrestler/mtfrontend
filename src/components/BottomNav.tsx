'use client'

import Link from 'next/link'
import { Calendar, FileText, Database, Home, Settings } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useDarkMode } from '@/contexts/DarkModeContext'

export default function BottomNav() {
  const pathname = usePathname()
  const { isDarkMode } = useDarkMode()

  const bottomNavItems = [
    { title: 'Home', href: '/', icon: Home },
    { title: 'Day Sheet', href: '/daysheet/daysheetmain', icon: Calendar },
    { title: 'Reports', href: '/reports', icon: FileText },
    { title: 'Masters', href: '/masters/mastermain', icon: Database },
    { title: 'Settings', href: '/settings', icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg md:hidden z-50`}>
      <div className="flex justify-around items-center h-16">
        {bottomNavItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                active
                  ? isDarkMode
                    ? 'text-blue-400 bg-gray-700/50'
                    : 'text-blue-600 bg-blue-50'
                  : isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <item.icon size={24} className="mb-1" />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 