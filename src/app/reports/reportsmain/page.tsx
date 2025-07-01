'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, TrendingUp, Truck, Calendar, Database, Moon, Sun, DollarSign, Building2, PieChart, CreditCard, Book, Calculator, User } from 'lucide-react'

type SubItem = {
  title: string
  icon: React.ElementType
  href: string
  color: string
}

type ReportItem = {
  title: string
  icon: React.ElementType
  href?: string
  subItems?: SubItem[]
}

type ReportGroup = {
  title: string
  icon: React.ElementType
  color: string
  items: ReportItem[]
}

export default function Reports() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const reportGroups: ReportGroup[] = [
    {
      title: 'Outstanding',
      icon: CreditCard,
      color: 'bg-blue-500',
      items: [
        {
          title: 'Customer Outstanding',
          icon: User,
          subItems: [
            { title: 'Customer Ledger', icon: Book, href: '/reports/customerledger', color: 'bg-blue-100' },
            { title: 'Total Customer Outstanding', icon: Calculator, href: '/reports/totalcustomeroutstanding', color: 'bg-blue-200' },
          ]
        },
        {
          title: 'Supplier Outstanding',
          icon: Building2,
          subItems: [
            { title: 'Supplier Ledger', icon: Book, href: '/reports/supplierledger', color: 'bg-green-100' },
            { title: 'Total Supplier Outstanding', icon: Calculator, href: '/reports/totalsupplieroutstanding', color: 'bg-green-200' },
          ]
        },
      ]
    },
    {
      title: 'Financial Reports',
      icon: DollarSign,
      color: 'bg-green-500',
      items: [
        { title: 'Sales Report', icon: TrendingUp, href: '/reports/salesreport' },
        { title: 'Expense Report', icon: DollarSign, href: '/reports/expensereport' },
        { title: 'Expense Category Report', icon: FileText, href: '/reports/expensecategoryreport' },
        { title: 'Profit & Loss Report', icon: PieChart, href: '/reports/profitlossreport' },
      ]
    },
    {
      title: 'Other Reports',
      icon: FileText,
      color: 'bg-purple-500',
      items: [
        { title: 'Admin Reports', icon: FileText, href: '/reports/adminreport' },
        { title: 'Tractor Hours Report', icon: Truck, href: '/reports/tractorhoursreport' },
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
            <h1 className="text-2xl font-bold">Reports</h1>
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
        <div className="space-y-6">
          {reportGroups.map((group) => (
            <div key={group.title} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
              <div className={`${group.color} p-6`}>
                <div className="flex items-center">
                  <group.icon className="h-8 w-8 mr-4 text-white" />
                  <h2 className="text-xl font-semibold text-white">{group.title}</h2>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {group.items.map((item) => (
                  <div key={item.title}>
                    {item.href ? (
                      <Link href={item.href}>
                        <div className={`flex items-center p-3 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                        }`}>
                          <item.icon className="h-6 w-6 mr-3" />
                          <span>{item.title}</span>
                        </div>
                      </Link>
                    ) : (
                      <div>
                        <div className={`flex items-center p-3 rounded-lg ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          <item.icon className="h-6 w-6 mr-3" />
                          <span className="font-medium">{item.title}</span>
                        </div>
                        {item.subItems && (
                          <div className="ml-6 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {item.subItems.map((subItem) => (
                              <Link key={subItem.title} href={subItem.href}>
                                <div className={`${subItem.color} p-4 rounded-lg shadow-md transition-transform transform hover:scale-105`}>
                                  <div className="flex items-center text-gray-800">
                                    <subItem.icon className="h-6 w-6 mr-2" />
                                    <span className="font-medium text-gray-800">{subItem.title}</span>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

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