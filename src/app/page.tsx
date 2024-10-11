"use client"

import React, { useState, useEffect } from 'react'
import { ArrowRight, HomeIcon, Database, FileText, Calendar, Moon, Sun, ZoomIn, ZoomOut, DollarSign, CreditCard } from 'lucide-react'
import Link from 'next/link'

interface SalesData {
  date: string
  amount: number
}

interface Section {
  title: string
  href: string
  color: string
  icon: React.ElementType
}

export default function Dashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [totalSales, setTotalSales] = useState(0)
  const [totalOutstanding, setTotalOutstanding] = useState(0)

  const sections: Section[] = [
    { title: 'Day Sheet', href: '/daysheet/daysheetmain', color: 'bg-emerald-500', icon: Calendar },
    { title: 'Reports', href: '/reports/reportsmain', color: 'bg-blue-500', icon: FileText },
    { title: 'Masters', href: '/masters/mastermain', color: 'bg-purple-500', icon: Database },
  ]

  useEffect(() => {
    // Placeholder for data fetching
    // You can implement the actual data fetching logic here when the backend is ready
    const mockFetchData = () => {
      setSalesData([
        { date: '2023-05-01', amount: 1000 },
        { date: '2023-05-02', amount: 1200 },
        { date: '2023-05-03', amount: 800 },
        { date: '2023-05-04', amount: 1500 },
        { date: '2023-05-05', amount: 1100 },
        { date: '2023-05-06', amount: 900 },
        { date: '2023-05-07', amount: 1300 },
      ])
      setTotalSales(7800)
      setTotalOutstanding(2500)
    }

    mockFetchData()
  }, [])

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50))

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`} style={{ fontSize: `${zoom}%` }}>
      {/* Sidebar */}
      <div className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="p-6">
          <h1 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-yellow-400' : 'text-purple-900'}`}>Metro Transports</h1>
          <nav>
            <Link href="/" className={`flex items-center py-3 px-4 rounded transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`}>
              <HomeIcon className="mr-3" size={20} />
              Homepage
            </Link>
            {sections.map((section) => (
              <Link 
                key={section.title}
                href={section.href} 
                className={`flex items-center py-3 px-4 rounded transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`}
              >
                <section.icon className="mr-3" size={20} />
                {section.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm flex justify-end items-center px-6 py-4`}>
          <div className="flex items-center space-x-4">
            <button onClick={handleZoomOut} className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}>
              <ZoomOut size={20} />
            </button>
            <button onClick={handleZoomIn} className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}>
              <ZoomIn size={20} />
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <main className="p-6">
          <h2 className={`text-2xl font-semibold mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'} text-center`}>Dashboard</h2>
          
          {/* Day Sheet, Reports, Masters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {sections.map((section) => (
              <Link
                key={section.title}
                href={section.href}
                className={`${section.color} rounded-xl shadow-lg p-6 text-white transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl`}
              >
                <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                <div className="flex items-center mt-4">
                  <span className="text-sm">View details</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>

          {/* Total Sales and Total Outstanding */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className={`rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Total Sales (Current Month)</h3>
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
            </div>
            <div className={`rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Total Outstanding</h3>
                <CreditCard className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold">${totalOutstanding.toFixed(2)}</p>
            </div>
          </div>

          {/* Sales Chart */}
          <div className={`mb-8 rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold mb-4">Last 7 Days Sales</h3>
            <div className="h-[300px] w-full">
              <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none">
                {/* X and Y axes */}
                <line x1="50" y1="250" x2="750" y2="250" stroke={isDarkMode ? "#4B5563" : "#E5E7EB"} strokeWidth="2" />
                <line x1="50" y1="250" x2="50" y2="50" stroke={isDarkMode ? "#4B5563" : "#E5E7EB"} strokeWidth="2" />

                {/* Sales data line */}
                {salesData.length > 0 && (
                  <polyline
                    points={salesData.map((data, index) => {
                      const x = 50 + (index * 700) / (salesData.length - 1);
                      const y = 250 - (data.amount / Math.max(...salesData.map(d => d.amount))) * 200;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                  />
                )}

                {/* Data points */}
                {salesData.map((data, index) => {
                  const x = 50 + (index * 700) / (salesData.length - 1);
                  const y = 250 - (data.amount / Math.max(...salesData.map(d => d.amount))) * 200;
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#8B5CF6"
                    />
                  );
                })}

                {/* X-axis labels */}
                {salesData.map((data, index) => {
                  const x = 50 + (index * 700) / (salesData.length - 1);
                  return (
                    <text
                      key={index}
                      x={x}
                      y="270"
                      textAnchor="middle"
                      fontSize="12"
                      fill={isDarkMode ? "#9CA3AF" : "#4B5563"}
                    >
                      {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </text>
                  );
                })}

                {/* Y-axis labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                  const y = 250 - ratio * 200;
                  const value = Math.max(...salesData.map(d => d.amount)) * ratio;
                  return (
                    <text
                      key={index}
                      x="40"
                      y={y}
                      textAnchor="end"
                      alignmentBaseline="middle"
                      fontSize="12"
                      fill={isDarkMode ? "#9CA3AF" : "#4B5563"}
                    >
                      ${value.toFixed(0)}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}