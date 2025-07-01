'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, User, Truck, Users, Calendar, FileText, Database, Moon, Sun, DollarSign, Building2, PhoneCall, Plus, List } from 'lucide-react'

type MasterItem = {
  title: string
  icon: React.ElementType
  color: string
  href: string
  description?: string
  actions?: {
    label: string
    icon: React.ElementType
    href: string
  }[]
}

type MasterGroup = {
  title: string
  items: MasterItem[]
}

export default function Masters() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const masterGroups: MasterGroup[] = [
    {
      title: 'Outside',
      items: [
        { 
          title: 'Customers', 
          icon: User, 
          color: 'bg-blue-500', 
          description: 'Manage your customer records',
          href: '/masters/customers',
          actions: [
            { label: 'Create', icon: Plus, href: '/masters/createcustomer' },
            { label: 'View All', icon: List, href: '/masters/customers/view' }
          ]
        },
        { 
          title: 'Suppliers', 
          icon: Building2, 
          color: 'bg-orange-500', 
          description: 'Manage your supplier records',
          href: '/masters/suppliers',
          actions: [
            { label: 'Create', icon: Plus, href: '/masters/createsupplier' },
            { label: 'View All', icon: List, href: '/masters/suppliers' }
          ] 
        },
        { 
          title: 'Follow Up Customers', 
          icon: PhoneCall, 
          color: 'bg-green-500', 
          description: 'Manage customer follow-ups',
          href: '/masters/createfollowup',
          actions: [
            { label: 'Create', icon: Plus, href: '/masters/createfollowup' },
            { label: 'View All', icon: List, href: '/masters/followups' }
          ] 
        },
      ]
    },
    {
      title: 'Inside',
      items: [
        { 
          title: 'Expense Categories', 
          icon: DollarSign, 
          color: 'bg-purple-500', 
          description: 'Manage expense categories',
          href: '/masters/createexpensecategory',
          actions: [
            { label: 'Create', icon: Plus, href: '/masters/createexpensecategory' },
            { label: 'View All', icon: List, href: '/masters/expensecategories' }
          ] 
        },
        { 
          title: 'Employees', 
          icon: Users, 
          color: 'bg-yellow-500', 
          description: 'Manage your staff records',
          href: '/masters/employee/view',
          actions: [
            { label: 'Create', icon: Plus, href: '/masters/employee/create' },
            { label: 'View All', icon: List, href: '/masters/employee/view' }
          ] 
        },
        { 
          title: 'Tractors', 
          icon: Truck, 
          color: 'bg-red-500', 
          description: 'Manage your tractor fleet',
          href: '/masters/createtractor',
          actions: [
            { label: 'Create', icon: Plus, href: '/masters/createtractor' },
            { label: 'View All', icon: List, href: '/masters/tractors' }
          ] 
        },
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
      <main className="container mx-auto px-4 py-8">
        {masterGroups.map((group) => (
          <div key={group.title} className="mb-8">
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{group.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.items.map((item) => (
                <div 
                  key={item.title}
                  className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className={`${item.color} p-6 text-white`}>
                    <div className="flex items-center mb-2">
                      <item.icon className="h-8 w-8 mr-4" />
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                    </div>
                    {item.description && (
                      <p className="text-white text-opacity-90 text-sm">{item.description}</p>
                    )}
                  </div>
                  
                  {item.actions && (
                    <div className={`px-6 py-4 flex flex-col space-y-2 ${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-100'}`}>
                      {item.actions.map((action) => (
                        <Link 
                          key={action.label} 
                          href={action.href}
                          className={`flex items-center py-2 px-3 rounded-md transition-colors ${
                            isDarkMode 
                              ? 'hover:bg-gray-700 text-gray-300' 
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <action.icon className="h-4 w-4 mr-2" />
                          <span>{action.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
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