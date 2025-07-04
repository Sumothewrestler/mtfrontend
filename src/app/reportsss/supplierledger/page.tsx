'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, FileText, Database, Moon, Sun, ZoomIn, ZoomOut } from 'lucide-react'
import Select from 'react-select'

type Supplier = {
  id: number
  name: string
}

type LedgerEntry = {
  date: string
  description: string
  amount_dr: number
  amount_cr: number
}

interface SupplierOption {
  value: string;
  label: string;
}

export default function SupplierLedger() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([])
  const [openingBalance, setOpeningBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}suppliers/list/`)
      if (!response.ok) {
        throw new Error('Failed to fetch suppliers')
      }
      const data = await response.json()
      setSuppliers(data.sort((a: Supplier, b: Supplier) => a.name.localeCompare(b.name)))
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      setError('Failed to load suppliers. Please try again later.')
    }
  }

  const generateReport = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}suppliers/ledger/?supplierId=${selectedSupplier}&fromDate=${fromDate}&toDate=${toDate}`
      console.log('Fetching report from:', url)
      
      const response = await fetch(url)
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
    
      const data = await response.json()
      console.log('Received data:', data)
      setLedgerData(data.ledger)
      setOpeningBalance(data.openingBalance)
    } catch (error) {
      console.error('Error fetching supplier ledger:', error)
      if (error instanceof Error) {
        setError(`Failed to generate report. Error: ${error.message}`)
      } else {
        setError('Failed to generate report. An unknown error occurred.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const calculateClosingBalance = () => {
    const totalDr = ledgerData.reduce((sum, entry) => sum + entry.amount_dr, openingBalance)
    const totalCr = ledgerData.reduce((sum, entry) => sum + entry.amount_cr, 0)
    return totalDr - totalCr
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50))

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`} style={{ fontSize: `${zoom}%` }}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/reports/reportsmain" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Supplier Ledger</h1>
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label htmlFor="supplier" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Supplier
              </label>
              <Select<SupplierOption>
                id="supplier"
                options={suppliers.map(supplier => ({ value: supplier.id.toString(), label: supplier.name }))}
                value={suppliers.find(supplier => supplier.id.toString() === selectedSupplier) 
                  ? { value: selectedSupplier, label: suppliers.find(supplier => supplier.id.toString() === selectedSupplier)!.name }
                  : null}
                onChange={(selected) => setSelectedSupplier(selected ? selected.value : '')}
                placeholder="Search or select a supplier..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: isDarkMode ? '#374151' : 'white',
                    borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: isDarkMode ? '#374151' : 'white',
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: isDarkMode
                      ? state.isFocused
                        ? '#4B5563'
                        : '#374151'
                      : state.isFocused
                        ? '#F3F4F6'
                        : 'white',
                    color: isDarkMode ? 'white' : 'black',
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: isDarkMode ? 'white' : 'black',
                  }),
                  input: (provided) => ({
                    ...provided,
                    color: isDarkMode ? 'white' : 'black',
                  }),
                }}
              />
            </div>
            <div>
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
            <div>
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
            <div className="flex items-end">
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
          {ledgerData.length > 0 && (
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`py-2 px-4 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Date</th>
                    <th className={`py-2 px-4 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Description</th>
                    <th className={`py-2 px-4 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Amount Cr</th>
                    <th className={`py-2 px-4 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Amount Dr</th>
                    <th className={`py-2 px-4 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Balance</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <tr>
                    <td className={`py-2 px-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`} colSpan={4}>
                      Opening Balance
                    </td>
                    <td className={`py-2 px-4 whitespace-nowrap text-sm text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {openingBalance.toFixed(2)} Dr
                    </td>
                  </tr>
                  {ledgerData.map((entry, index) => {
                    const runningBalance =
                      openingBalance +
                      ledgerData.slice(0, index + 1).reduce((sum, e) => sum + e.amount_dr - e.amount_cr, 0)
                    return (
                      <tr key={index} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className={`py-2 px-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{entry.date}</td>
                        <td className={`py-2 px-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{entry.description}</td>
                        <td className={`py-2 px-4 whitespace-nowrap text-sm text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{entry.amount_cr.toFixed(2)}</td>
                        <td className={`py-2 px-4 whitespace-nowrap text-sm text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{entry.amount_dr.toFixed(2)}</td>
                        <td className={`py-2 px-4 whitespace-nowrap text-sm text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {Math.abs(runningBalance).toFixed(2)} {runningBalance >= 0 ? 'Dr' : 'Cr'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <td colSpan={4} className={`py-2 px-4 whitespace-nowrap text-sm font-medium text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      Closing Balance:
                    </td>
                    <td className={`py-2 px-4 whitespace-nowrap text-sm text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {Math.abs(calculateClosingBalance()).toFixed(2)} {calculateClosingBalance() >= 0 ? 'Dr' : 'Cr'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
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