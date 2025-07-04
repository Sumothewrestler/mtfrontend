'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, User, Users, FileText, Calendar, Calculator, BookOpen, TrendingUp, DollarSign, Clock, ClipboardList, ShoppingCart, Receipt, Moon, Sun } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'

type ReportItem = {
  title: string
  icon: React.ElementType
  color: string
  gradient: string
  description?: string
  actions: {
    label: string
    icon: React.ElementType
    href: string
  }[]
}

export default function Reports() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const reportItems: ReportItem[] = [
    { 
      title: 'Customers', 
      icon: User, 
      color: 'text-blue-600',
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      description: 'Customer reports and analytics',
      actions: [
        { label: 'Total Summary', icon: FileText, href: '/reports/customers/summary' },
        { label: 'Ledger', icon: BookOpen, href: '/reports/customers/ledger' }
      ]
    },
    { 
      title: 'Employees', 
      icon: Users, 
      color: 'text-orange-600',
      gradient: 'from-orange-500 via-amber-600 to-yellow-600',
      description: 'Employee reports and tracking',
      actions: [
        { label: 'Attendance', icon: Calendar, href: '/reports/employees/attendance' },
        { label: 'Ledger', icon: BookOpen, href: '/reports/employees/ledger' }
      ]
    },
    { 
      title: 'Others', 
      icon: ClipboardList, 
      color: 'text-purple-600',
      gradient: 'from-purple-500 via-violet-600 to-purple-700',
      description: 'Miscellaneous operational reports',
      actions: [
        { label: 'Tractor Hours', icon: Clock, href: '/reports/others/tractor-hours' },
        { label: 'Tasks', icon: ClipboardList, href: '/reports/others/tasks' },
        { label: 'Booking', icon: ShoppingCart, href: '/reports/others/booking' },
        { label: 'Demand', icon: TrendingUp, href: '/reports/others/demand' }
      ]
    },
    { 
      title: 'Accounts', 
      icon: Calculator, 
      color: 'text-emerald-600',
      gradient: 'from-emerald-500 via-teal-600 to-green-600',
      description: 'Financial reports and statements',
      actions: [
        { label: 'Sales', icon: TrendingUp, href: '/reports/accounts/sales' },
        { label: 'Expense', icon: Receipt, href: '/reports/accounts/expense' },
        { label: 'Cash Book', icon: BookOpen, href: '/reports/accounts/cash-book' },
        { label: 'EMI', icon: DollarSign, href: '/reports/accounts/emi' }
      ]
    }
  ]

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Reports</h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-2 pb-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 max-w-4xl mx-auto">
          {reportItems.map((item) => (
            <div
              key={item.title}
              className={`bg-gradient-to-br ${item.gradient} rounded-xl shadow-lg p-3 backdrop-blur-sm transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg`}
            >
              {/* Header */}
              <div className="flex items-center mb-2 text-white">
                <item.icon className="h-5 w-5 mr-2" />
                <div>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  {item.description && (
                    <p className="text-white/80 text-xs hidden sm:block">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className={`grid gap-2 ${item.actions.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                {item.actions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={`${
                      isDarkMode 
                        ? 'bg-black/60 border-gray-600 text-white hover:bg-black/80' 
                        : 'bg-white/90 border-white/40 text-gray-800 hover:bg-white'
                    } border-2 rounded-lg shadow-md p-2.5 text-center transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm flex items-center justify-center`}
                  >
                    <action.icon className="h-4 w-4 mr-1" />
                    <span className="text-xs font-semibold tracking-wide">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}