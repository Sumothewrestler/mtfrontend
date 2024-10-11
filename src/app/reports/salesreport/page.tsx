"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Home, Database, FileText, Calendar, Moon, Sun, ZoomIn, ZoomOut } from 'lucide-react'

type SalesData = {
  date: string
  customerName: string
  total_amount: number
}

export default function SalesReport() {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [zoom, setZoom] = useState(100)

  const generateReport = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const url = `http://localhost:8000/api/sales-report/?fromDate=${fromDate}&toDate=${toDate}`;
      console.log('Fetching report from:', url);
      
      const response = await fetch(url);
      
      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`);
      }
    
      const data = JSON.parse(responseText);
      console.log('Parsed data:', data);
      setSalesData(data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError(`Failed to generate report. Error: ${error.message}`);
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50))

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`} style={{ fontSize: `${zoom}%` }}>
      {/* Sidebar */}
      <div className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">METRO TRANSPORTS</h2>
          <h3 className="text-xl font-semibold mb-6">Dashboard</h3>
          <nav>
            <Link href="/" className={`flex items-center py-3 px-4 rounded transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`}>
              <Home className="mr-3" size={20} />
              Homepage
            </Link>
            <Link href="/masters/mastermain" className={`flex items-center py-3 px-4 rounded transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`}>
              <Database className="mr-3" size={20} />
              Masters
            </Link>
            <Link href="/reports/reportsmain" className={`flex items-center py-3 px-4 rounded transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`}>
              <FileText className="mr-3" size={20} />
              Reports
            </Link>
            <Link href="/daysheet/daysheetmain" className={`flex items-center py-3 px-4 rounded transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`}>
              <Calendar className="mr-3" size={20} />
              Day Sheet
            </Link>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm flex justify-between items-center px-6 py-4`}>
          <div className="flex items-center">
            <Link href="/reports/reportsmain" className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-semibold">Sales Report</h1>
          </div>
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
          <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex space-x-4 mb-6">
              <div className="w-1/3">
                <label htmlFor="fromDate" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  From Date
                </label>
                <input
                  type="date"
                  id="fromDate"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="w-1/3">
                <label htmlFor="toDate" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  To Date
                </label>
                <input
                  type="date"
                  id="toDate"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="w-1/3 flex items-end">
                <button
                  onClick={generateReport}
                  className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            {salesData.length > 0 && (
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
            )}
            {salesData.length > 0 && (
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
            )}
          </div>
        </main>
      </div>
    </div>
  )
}