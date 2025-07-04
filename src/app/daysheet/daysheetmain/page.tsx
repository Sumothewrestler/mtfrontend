"use client"

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Briefcase, Receipt, Moon, Sun, DollarSign, CreditCard, BookOpen, PhoneCall, Plus, Eye, FileText } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'

export default function DaySheet() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const groups = [
    {
      title: 'Income',
      items: [
        {
          title: 'Add Job',
          icon: Briefcase,
          color: 'bg-green-500',
          options: [
            { title: 'New', icon: Plus, href: '/daysheet/jobsubmit' },
            { title: 'View', icon: Eye, href: '/daysheet/jobsubmit/view' }
          ]
        },
        {
          title: 'Receipt Entry',
          icon: Receipt,
          color: 'bg-blue-500',
          options: [
            { title: 'New', icon: Plus, href: '/daysheet/receiptentry' },
            { title: 'View', icon: Eye, href: '/daysheet/receiptentry/view' }
          ]
        },
      ]
    },
    {
      title: 'Expense',
      items: [
        {
          title: 'Add Expense',
          icon: DollarSign,
          color: 'bg-yellow-400',
          options: [
            { title: 'New', icon: Plus, href: '/daysheet/addexpense' },
            { title: 'View', icon: Eye, href: '/daysheet/addexpense/view' }
          ]
        },
        {
          title: 'Payment Entry',
          icon: CreditCard,
          color: 'bg-red-500',
          options: [
            { title: 'New', icon: Plus, href: '/daysheet/paymententry' },
            { title: 'View', icon: Eye, href: '/daysheet/paymententry/view' }
          ]
        },
      ]
    },
    {
      title: 'Others',
      items: [
        {
          title: 'Material Demand',
          icon: Users,
          color: 'bg-purple-400',
          options: [
            { title: 'New', icon: Plus, href: '/daysheet/materials/entry' },
            { title: 'View', icon: Eye, href: '/daysheet/materials/view' }
          ]
        },
        {
          title: 'Booking',
          icon: BookOpen,
          color: 'bg-purple-500',
          options: [
            { title: 'New', icon: Plus, href: '/daysheet/advancebooking' },
            { title: 'View', icon: Eye, href: '/daysheet/advancebooking/view' }
          ]
        },
        {
          title: 'Follow Up',
          icon: PhoneCall,
          color: 'bg-purple-600',
          options: [
            { title: 'Follow', icon: PhoneCall, href: '/daysheet/tractors' },
            { title: 'Reports', icon: Eye, href: '/daysheet/followup/view' }
          ]
        },
        {
          title: 'Sales Bill',
          icon: FileText,
          color: 'bg-purple-700',
          options: [
            { title: 'New', icon: Plus, href: '/daysheet/salesbill' }
          ]
        },
      ]
    }
  ]



  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Day Sheet</h1>
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
      <main className="container mx-auto px-4 py-8 pb-20">
        {groups.map((group) => (
          <div key={group.title} className="mb-8">
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{group.title}</h2>
            <div className="grid grid-cols-2 gap-4">
              {group.items.map((item) => (
                <div key={item.title} className={`${item.color} rounded-lg shadow-md overflow-hidden`}>
                  <div className="p-4">
                    <div className="flex items-center justify-center mb-2">
                      <item.icon className="h-6 w-6 text-white" />
                      <h3 className="text-sm font-medium ml-2 text-white">{item.title}</h3>
                    </div>
                  </div>
                  <div className={`flex ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                    {item.options.map((option, index) => (
                      <Link key={option.title} href={option.href} className="flex-1">
                        <div className={`flex items-center justify-center py-2 px-3 text-sm font-medium transition-colors duration-200 ${
                          isDarkMode 
                            ? 'text-gray-200 hover:bg-gray-800' 
                            : 'text-gray-700 hover:bg-gray-100'
                        } ${index === 0 && item.options.length > 1 ? `border-r ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}` : ''}`}>
                          <option.icon className="h-4 w-4 mr-1" />
                          {option.title}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

    </div>
  )
}