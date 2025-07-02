'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, User, Truck, Users, Building2, Plus, List, Moon, Sun, ToggleLeft, ToggleRight, Package, Ruler } from 'lucide-react'

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

  // Toggle cells functionality
  const [expandedCells, setExpandedCells] = useState<Record<string, boolean>>({})

  const toggleCell = (cellKey: string) => {
    setExpandedCells(prev => ({
      ...prev,
      [cellKey]: !prev[cellKey]
    }))
  }

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
    },
    { 
      title: 'Materials', 
      icon: Package, 
      color: 'text-pink-600',
      gradient: 'from-pink-500 via-rose-600 to-red-600',
      description: 'Manage materials and units',
      actions: [
        { label: 'Material', icon: Package, href: '/masters/materials' },
        { label: 'Unit', icon: Ruler, href: '/masters/units' }
      ]
    }
  ]

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Masters</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleCell('masters')}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}
              title="Toggle view"
            >
              {expandedCells['masters'] ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 pb-6">
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto transition-all duration-200 ${
          expandedCells['masters'] ? 'scale-105' : 'scale-100'
        }`}>
          {masterItems.map((item) => (
            <div
              key={item.title}
              className={`bg-gradient-to-br ${item.gradient} rounded-2xl shadow-xl p-4 backdrop-blur-sm transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-2xl ${
                expandedCells['masters'] ? 'h-auto' : 'h-44'
              }`}
            >
              {/* Header */}
              <div className="flex items-center mb-3 text-white">
                <item.icon className="h-6 w-6 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  {item.description && (
                    <p className={`text-white/80 text-xs transition-all duration-200 ${
                      expandedCells['masters'] ? 'block' : 'hidden sm:block'
                    }`}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className={`grid grid-cols-2 gap-3 transition-all duration-200 ${
                expandedCells['masters'] ? 'mt-6' : 'mt-2'
              }`}>
                {item.actions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={`${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                        : 'bg-white/90 border-white/40 text-gray-800 hover:bg-white'
                    } border-2 rounded-xl shadow-md p-3 text-center transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm flex items-center justify-center ${
                      expandedCells['masters'] ? 'py-4' : 'py-2'
                    }`}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    <span className="text-sm font-semibold tracking-wide">{action.label}</span>
                  </Link>
                ))}
              </div>

              {/* Additional info when expanded */}
              {expandedCells['masters'] && (
                <div className="mt-4 p-3 bg-white/10 rounded-lg text-white text-xs">
                  <p>Quick access to {item.title.toLowerCase()} management features</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Additional section when expanded */}
        {expandedCells['masters'] && (
          <div className={`mt-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h3 className="text-lg font-semibold mb-4">Master Data Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Customer Management</h4>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Create and manage customer profiles, track contact information, and maintain customer relationships.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Employee Management</h4>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Manage staff records, track wages, and handle employee status and roles within the organization.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Financial Accounts</h4>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Manage cash and bank accounts for financial tracking and transaction management.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Fleet Management</h4>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Track and manage your tractor fleet, including maintenance schedules and operational status.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Material Management</h4>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Manage materials inventory and measurement units for accurate tracking and reporting.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}