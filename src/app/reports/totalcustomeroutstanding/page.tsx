"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Home, Database, FileText, Calendar, Moon, Sun } from 'lucide-react'

type CustomerOutstanding = {
  customerName: string
  totalAmountDr: number
  totalAmountCr: number
}

export default function TotalCustomerOutstanding() {
  const [asOnDate, setAsOnDate] = useState('')
  const [outstandingData, setOutstandingData] = useState<CustomerOutstanding[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  const generateReport = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}total-customer-outstanding/?asOnDate=${asOnDate}`;
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
      setOutstandingData(data);
    } catch (error) {
      console.error('Error fetching total customer outstanding:', error);
      if (error instanceof Error) {
        setError(`Failed to generate report. Error: ${error.message}`);
      } else {
        setError('Failed to generate report. An unknown error occurred.');
      }
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotals = () => {
    return outstandingData.reduce(
      (totals, customer) => ({
        dr: totals.dr + customer.totalAmountDr,
        cr: totals.cr + customer.totalAmountCr,
      }),
      { dr: 0, cr: 0 }
    )
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2)); // Max zoom level of 2
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5)); // Min zoom level of 0.5
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Sidebar */}
      <div className={`w-64 ${isDarkMode ? 'bg-black-1200' : 'bg-gradient-to-b from-rose-400 to-blue-400'} shadow-lg`}>
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
      <div className="flex-1 overflow-auto" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}>
        <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm flex justify-between items-center px-6 py-4`}>
          <div className="flex items-center">
            <Link href="/reports/reportsmain" className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-semibold">Total Customer Outstanding</h1>
          </div>
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </header>

        <main className="p-6">
          <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex space-x-4 mb-6">
              <div className="w-1/2">
                <label htmlFor="asOnDate" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  As on Date
                </label>
                <input
                  type="date"
                  id="asOnDate"
                  value={asOnDate}
                  onChange={(e) => setAsOnDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="w-1/2 flex items-end">
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
            {outstandingData.length > 0 && (
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Customer Name
                      </th>
                      <th scope="col" className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Total Amount Dr
                      </th>
                      <th scope="col" className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Total Amount Cr
                      </th>
                      <th scope="col" className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Net Outstanding
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {outstandingData.map((customer, index) => (
                      <tr key={index} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {customer.customerName}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {customer.totalAmountDr.toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {customer.totalAmountCr.toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {(customer.totalAmountDr - customer.totalAmountCr).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className={`px-6 py-4 font-bold text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`} colSpan={1}>Total:</td>
                      <td className={`px-6 py-4 font-bold text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {calculateTotals().dr.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 font-bold text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {calculateTotals().cr.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 font-bold text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {(calculateTotals().dr - calculateTotals().cr).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Zoom Controls */}
          <div className="flex justify-center mt-4">
            <button onClick={handleZoomOut} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
              Zoom Out
            </button>
            <button onClick={handleZoomIn} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition ml-2">
              Zoom In
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}