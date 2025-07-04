'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Users, Moon, Sun, ZoomIn, ZoomOut, ToggleLeft, ToggleRight } from 'lucide-react'

export default function CustomerOutstandingReport() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [expandedCells, setExpandedCells] = useState<{ [key: string]: boolean }>({})

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50))

  const toggleCell = (cellKey: string) => {
    setExpandedCells(prev => ({
      ...prev,
      [cellKey]: !prev[cellKey]
    }))
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`} style={{ fontSize: `${zoom}%` }}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/reports/reportsmain" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Customer Outstanding Reports</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => toggleCell('header')}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}
            >
              {expandedCells['header'] ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            </button>
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {expandedCells['header'] && (
          <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Outstanding Reports Overview
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Access customer ledger and total outstanding reports to track financial relationships and balances.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Ledger Card */}
          <Link href="/reports/customerledger" className="block">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300 transform hover:scale-105`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Customer Ledger</h2>
                <FileText className="h-10 w-10 text-blue-500" />
              </div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                View detailed customer ledger reports
              </p>
              <div className="mt-4 flex items-center">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    toggleCell('customerLedger')
                  }}
                  className={`p-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}
                >
                  {expandedCells['customerLedger'] ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                </button>
                {expandedCells['customerLedger'] && (
                  <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Track individual customer transactions and balances
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* Total Customer Outstanding Card */}
          <Link href="/reports/totalcustomeroutstanding" className="block">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300 transform hover:scale-105`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Total Customer Outstanding</h2>
                <Users className="h-10 w-10 text-green-500" />
              </div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                View total outstanding amounts for all customers
              </p>
              <div className="mt-4 flex items-center">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    toggleCell('totalOutstanding')
                  }}
                  className={`p-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}
                >
                  {expandedCells['totalOutstanding'] ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                </button>
                {expandedCells['totalOutstanding'] && (
                  <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Comprehensive overview of all customer outstanding balances
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}