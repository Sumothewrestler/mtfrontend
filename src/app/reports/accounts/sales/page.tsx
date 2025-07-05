'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'

type SalesData = {
  date: string
  customerName: string
  total_amount: number
}

type DateRange = 'this-month' | 'last-month' | 'custom'

export default function SalesReport() {
  const { isDarkMode } = useDarkMode()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeDateRange, setActiveDateRange] = useState<DateRange>('this-month')

  // Helper function to get the last day of a month
  const getLastDayOfMonth = (year: number, month: number) => {
    // month parameter should be 0-11
    return new Date(year, month + 1, 0).getDate()
  }

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const setThisMonth = useCallback(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth(), getLastDayOfMonth(now.getFullYear(), now.getMonth()))
    
    setFromDate(formatDate(firstDay))
    setToDate(formatDate(lastDay))
    setActiveDateRange('this-month')
  }, [])

  const setLastMonth = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
    
    setFromDate(formatDate(firstDay))
    setToDate(formatDate(lastDay))
    setActiveDateRange('last-month')
  }

  // Handle custom date changes
  const handleDateChange = (date: string, type: 'from' | 'to') => {
    if (type === 'from') {
      setFromDate(date)
    } else {
      setToDate(date)
    }
    setActiveDateRange('custom')
  }

  const generateReport = useCallback(async () => {
    if (!fromDate || !toDate) return
    setIsLoading(true) // Now using the isLoading state
    setError(null)

    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}sales-report/?fromDate=${fromDate}&toDate=${toDate}`
      const response = await fetch(url)
      const responseText = await response.text()

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`)
      }
    
      const data = JSON.parse(responseText)
      setSalesData(data)
    } catch (error) {
      console.error('Error fetching sales data:', error)
      if (error instanceof Error) {
        setError(`Failed to generate report. Error: ${error.message}`)
      } else {
        setError('Failed to generate report. An unknown error occurred.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [fromDate, toDate])

  // Set default dates to current month on component mount
  useEffect(() => {
    setThisMonth()
  }, [setThisMonth])

  // Generate report when dates change
  useEffect(() => {
    generateReport()
  }, [generateReport])

  const calculateTotal = () => {
    return salesData.reduce((sum, sale) => sum + sale.total_amount, 0)
  }

  const groupByDate = () => {
    const grouped = salesData.reduce((acc, sale) => {
      if (!acc[sale.date]) {
        acc[sale.date] = 0
      }
      acc[sale.date] += sale.total_amount
      return acc
    }, {} as { [date: string]: number })
    return grouped
  }

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link href="/reports" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold">Sales Report</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-wrap gap-4 mb-4">
              <button
                onClick={setThisMonth}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeDateRange === 'this-month'
                    ? isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                This Month
              </button>
              <button
                onClick={setLastMonth}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeDateRange === 'last-month'
                    ? isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Last Month
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3">
                <label htmlFor="fromDate" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  From Date
                </label>
                <input
                  type="date"
                  id="fromDate"
                  value={fromDate}
                  onChange={(e) => handleDateChange(e.target.value, 'from')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="w-full md:w-1/3">
                <label htmlFor="toDate" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  To Date
                </label>
                <input
                  type="date"
                  id="toDate"
                  value={toDate}
                  onChange={(e) => handleDateChange(e.target.value, 'to')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDarkMode ? 'border-blue-500' : 'border-blue-600'}`}></div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {salesData.length > 0 && (
                <>
                  <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Transactions</p>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{salesData.length}</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Revenue</p>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>₹{calculateTotal().toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Average per Transaction</p>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>₹{(calculateTotal() / salesData.length).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                          <th className={`py-2 px-4 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Date</th>
                          <th className={`py-2 px-4 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Customer Name</th>
                          <th className={`py-2 px-4 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Total Amount</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {salesData.map((sale, index) => (
                          <tr key={index} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                            <td className={`py-2 px-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{sale.date}</td>
                            <td className={`py-2 px-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{sale.customerName}</td>
                            <td className={`py-2 px-4 whitespace-nowrap text-sm text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{sale.total_amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                          <td colSpan={2} className={`py-2 px-4 whitespace-nowrap text-sm font-medium text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            Total:
                          </td>
                          <td className={`py-2 px-4 whitespace-nowrap text-sm text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {calculateTotal().toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="mt-8">
                    <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Date-wise Total</h2>
                    <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                          <th className={`py-2 px-4 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Date</th>
                          <th className={`py-2 px-4 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Total Amount</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {Object.entries(groupByDate()).map(([date, total]) => (
                          <tr key={date} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                            <td className={`py-2 px-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{date}</td>
                            <td className={`py-2 px-4 whitespace-nowrap text-sm text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}