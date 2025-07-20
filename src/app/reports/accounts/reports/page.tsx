'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Moon, Sun, Building, FileText, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Link from 'next/link'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface Business {
  id: number
  name: string
}

interface Ledger {
  id: number
  business: number
  business_name: string
  name: string
  category: 'Expense' | 'Income' | 'Others'
  category_display: string
  created_at: string
  updated_at: string
}

export default function LedgerReportsPage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  // State for filters
  const [selectedBusiness, setSelectedBusiness] = useState<number | ''>('')
  const [selectedLedger, setSelectedLedger] = useState<string>('all')

  // State for data
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [ledgers, setLedgers] = useState<Ledger[]>([])
  const [filteredLedgers, setFilteredLedgers] = useState<Ledger[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // API Base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  // Wrap fetchBusinesses in useCallback
  const fetchBusinesses = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}businesses/`)
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data)
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
    }
  }, [API_BASE_URL])

  // Wrap fetchLedgers in useCallback
  const fetchLedgers = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}ledgers/`)
      if (response.ok) {
        const data = await response.json()
        setLedgers(data)
        setFilteredLedgers(data)
      }
    } catch (error) {
      console.error('Error fetching ledgers:', error)
    } finally {
      setIsLoading(false)
    }
  }, [API_BASE_URL])

  // Fetch data on component mount
  useEffect(() => {
    fetchBusinesses()
    fetchLedgers()
  }, [fetchBusinesses, fetchLedgers])

  // Apply filters when data or filters change
  useEffect(() => {
    let filtered = ledgers

    if (selectedBusiness) {
      filtered = filtered.filter(ledger => ledger.business === selectedBusiness)
    }

    if (selectedLedger !== 'all') {
      filtered = filtered.filter(ledger => ledger.name === selectedLedger)
    }

    // Sort ledgers A to Z
    filtered = filtered.sort((a, b) => a.name.localeCompare(b.name))

    setFilteredLedgers(filtered)
  }, [ledgers, selectedBusiness, selectedLedger])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Expense':
        return <TrendingDown size={16} className="text-red-500" />
      case 'Income':
        return <TrendingUp size={16} className="text-green-500" />
      case 'Others':
        return <Minus size={16} className="text-blue-500" />
      default:
        return <FileText size={16} />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Expense':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Income':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Others':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const groupedLedgers = filteredLedgers.reduce((acc, ledger) => {
    if (!acc[ledger.business_name]) {
      acc[ledger.business_name] = []
    }
    acc[ledger.business_name].push(ledger)
    return acc
  }, {} as Record<string, Ledger[]>)

  const clearFilters = () => {
    setSelectedBusiness('')
    setSelectedLedger('all')
  }

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-purple-900'}`}>
            Ledger Reports
          </h1>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">

        {/* Ledger Filter */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            {/* Business Filter */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <Building size={16} className="mr-1" />
                Business
              </label>
              <select
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(e.target.value ? parseInt(e.target.value) : '')}
                className={`w-full p-3 border rounded-lg ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                  }`}
              >
                <option value="">All Businesses</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ledger Filter */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <FileText size={16} className="mr-1" />
                Ledger
              </label>
              <select
                value={selectedLedger}
                onChange={(e) => setSelectedLedger(e.target.value)}
                className={`w-full p-3 border rounded-lg ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                  }`}
              >
                <option value="all">All Ledgers</option>
                {ledgers
                  .map(ledger => ledger.name)
                  .filter((name, index, array) => array.indexOf(name) === index)
                  .sort()
                  .map((ledgerName) => (
                    <option key={ledgerName} value={ledgerName}>
                      {ledgerName}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Showing {filteredLedgers.length} ledger{filteredLedgers.length !== 1 ? 's' : ''}
            {selectedBusiness || selectedLedger !== 'all' ? ' (filtered)' : ''}
          </p>
        </div>

        {/* Ledgers List */}
        {isLoading ? (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 text-center`}>
            <p>Loading ledgers...</p>
          </div>
        ) : filteredLedgers.length === 0 ? (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 text-center`}>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No ledgers found matching your filters.
            </p>
            {(selectedBusiness || selectedLedger !== 'all') && (
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 hover:text-blue-700 underline"
              >
                Clear filters to see all ledgers
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedLedgers).map(([businessName, businessLedgers]) => (
              <div key={businessName} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Building size={18} className="mr-2" />
                  {businessName}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    {businessLedgers.length} ledger{businessLedgers.length !== 1 ? 's' : ''}
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {businessLedgers.map((ledger) => (
                    <div
                      key={ledger.id}
                      className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            {getCategoryIcon(ledger.category)}
                            <h4 className="font-medium ml-2">{ledger.name}</h4>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(ledger.category)}`}>
                            {ledger.category_display}
                          </span>
                        </div>
                        <Link
                          href={`/reports/accounts/reports/ledger/${ledger.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors ml-3"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 