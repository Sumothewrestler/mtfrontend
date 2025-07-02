'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, User, Truck, Users, Calendar, FileText, Database, Moon, Sun, Building2, Plus, List } from 'lucide-react'

type MasterItem = {
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

export default function Masters() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const masterItems: MasterItem[] = [
    { 
      title: 'Customers', 
      icon: User, 
      color: 'text-blue-600',
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      description: 'Manage your customer records',
      actions: [
        { label: 'Create', icon: Plus, href: '/masters/createcustomer' },
        { label: 'View All', icon: List, href: '/masters/customers/view' }
      ]
    },
    { 
      title: 'Cash & Bank', 
      icon: Building2, 
      color: 'text-emerald-600',
      gradient: 'from-emerald-500 via-teal-600 to-green-600',
      description: 'Manage cash and bank accounts',
      actions: [
        { label: 'Create', icon: Plus, href: '/masters/cash_bank/create' },
        { label: 'View All', icon: List, href: '/masters/cash_bank' }
      ]
    },
    { 
      title: 'Employees', 
      icon: Users, 
      color: 'text-orange-600',
      gradient: 'from-orange-500 via-amber-600 to-yellow-600',
      description: 'Manage your staff records',
      actions: [
        { label: 'Create', icon: Plus, href: '/masters/employee/create' },
        { label: 'View All', icon: List, href: '/masters/employee/view' }
      ]
    },
    { 
      title: 'Tractors', 
      icon: Truck, 
      color: 'text-purple-600',
      gradient: 'from-purple-500 via-violet-600 to-purple-700',
      description: 'Manage your tractor fleet',
      actions: [
        { label: 'Create', icon: Plus, href: '/masters/createtractor' },
        { label: 'View All', icon: List, href: '/masters/tractors' }
      ]
    }
  ]

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Masters</h1>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {masterItems.map((item) => (
            <div
              key={item.title}
              className={`bg-gradient-to-br ${item.gradient} rounded-2xl shadow-xl p-4 backdrop-blur-sm transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-2xl`}
            >
              {/* Header */}
              <div className="flex items-center mb-3 text-white">
                <item.icon className="h-6 w-6 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  {item.description && (
                    <p className="text-white/80 text-xs">{item.description}</p>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {item.actions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={`${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                        : 'bg-white/90 border-white/40 text-gray-800 hover:bg-white'
                    } border-2 rounded-xl shadow-md p-3 text-center transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm flex items-center justify-center`}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    <span className="text-sm font-semibold tracking-wide">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom navigation for mobile */}
      <nav className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg md:hidden`}>
        <div className="flex justify-around">
          <Link href="/daysheet/daysheetmain" className={`flex flex-col items-center py-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            <Calendar className="h-6 w-6 mb-1" />
            <span className="text-xs">Day Sheet</span>
          </Link>
          <Link href="/reports/reportsmain" className={`flex flex-col items-center py-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            <FileText className="h-6 w-6 mb-1" />
            <span className="text-xs">Reports</span>
          </Link>
          <Link href="/masters/mastermain" className={`flex flex-col items-center py-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            <Database className="h-6 w-6 mb-1" />
            <span className="text-xs">Masters</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}