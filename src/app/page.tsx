'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, FileText, Database, Moon, Sun, DollarSign, TrendingUp, Home } from 'lucide-react'
import Link from 'next/link'

interface Section {
  title: string
  href: string
  color: string
  icon: React.ElementType
}

interface DashboardData {
  previous_day_sales: number
  last_7_days_avg_sales: number
}

export default function Dashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  const bottomNavSections: Section[] = [
    { title: 'Home', href: '/', color: 'bg-gray-500', icon: Home },
    { title: 'Day Sheet', href: '/daysheet/daysheetmain', color: 'bg-emerald-500', icon: Calendar },
    { title: 'Reports', href: '/reports/reportsmain', color: 'bg-blue-500', icon: FileText },
    { title: 'Masters', href: '/masters/mastermain', color: 'bg-purple-500', icon: Database },
  ]

  const buttonContainers = [
    {
      title: 'Daily Tasks',
      gradient: 'from-blue-500 via-purple-500 to-purple-600',
      buttons: [
        { title: 'Attendance', href: '/daysheet/attendance' },
        { title: 'Follow Up', href: '/daysheet/followup/view' },
      ]
    },
    {
      title: 'Job Management',
      gradient: 'from-emerald-400 via-teal-500 to-green-600',
      buttons: [
        { title: 'Add Job', href: '/daysheet/jobsubmit' },
        { title: 'Receipt', href: '/daysheet/receiptentry' },
      ]
    },
    {
      title: 'Financial',
      gradient: 'from-orange-400 via-amber-500 to-yellow-500',
      buttons: [
        { title: 'Expense', href: '/daysheet/addexpense' },
        { title: 'Payment', href: '/daysheet/paymententry' },
      ]
    }
  ]

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}dashboard/`);
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error fetching dashboard data:', error.message);
        } else {
          console.error('Unexpected error:', error);
        }
      }
    };
  
    fetchDashboardData();
  }, []);

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-purple-900'}`}>
            METRO TRANSPORTS
          </h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <DollarSign className="mr-2" />
              Previous Day Sales
            </h3>
            <p className="text-3xl font-bold">
              ₹{dashboardData?.previous_day_sales.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <TrendingUp className="mr-2" />
              Last 7 Days Avg Sales
            </h3>
            <p className="text-3xl font-bold">
              ₹{dashboardData?.last_7_days_avg_sales.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 max-w-lg mx-auto">
          {buttonContainers.map((container, containerIndex) => (
            <div
              key={container.title}
              className={`bg-gradient-to-br ${container.gradient} rounded-2xl shadow-xl p-4 backdrop-blur-sm`}
            >
              <div className="grid grid-cols-2 gap-3">
                {container.buttons.map((button, buttonIndex) => (
                  <Link
                    key={button.title}
                    href={button.href}
                    className={`${isDarkMode ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white/90 border-white/40 text-gray-800 hover:bg-white'} border-2 rounded-xl shadow-md p-3 text-center transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm`}
                  >
                    <span className="text-sm font-semibold tracking-wide">{button.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <nav className={`md:hidden fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex justify-around items-center h-16">
          {bottomNavSections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="relative flex flex-col items-center justify-center w-full h-full"
            >
              <div className={`absolute inset-0 ${section.color} opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-10`}></div>
              <section.icon size={24} className={`mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} group-hover:text-opacity-100`} />
              <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} group-hover:text-opacity-100`}>{section.title}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}