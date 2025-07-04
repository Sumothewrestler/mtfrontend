'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Moon, Sun, ZoomIn, ZoomOut, ToggleLeft, ToggleRight } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import Loading from '@/components/Loading'

type TractorHoursData = {
  [date: string]: {
    [tractorId: number]: number
  }
}

type Tractor = {
  id: number
  name: string
}

export default function TractorHoursReport() {
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [tractorHoursData, setTractorHoursData] = useState<TractorHoursData>({})
  const [tractors, setTractors] = useState<Tractor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [expandedCells, setExpandedCells] = useState<{ [key: string]: boolean }>({})
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const toggleCell = (cellKey: string) => {
    setExpandedCells(prev => ({
      ...prev,
      [cellKey]: !prev[cellKey]
    }))
  }

  const generateReport = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}tractor-hours-report/?month=${month}&year=${year}`
      console.log('Fetching report from:', url)
      
      const response = await fetch(url)
      
      console.log('Response status:', response.status)
      
      const responseText = await response.text()
      console.log('Response text:', responseText)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`)
      }
    
      const data = JSON.parse(responseText)
      console.log('Parsed data:', data)
      setTractorHoursData(data.tractorHours)
      setTractors(data.tractors)
    } catch (error) {
      console.error('Error fetching tractor hours report:', error)
      if (error instanceof Error) {
        setError(`Failed to generate report. Error: ${error.message}`)
      } else {
        setError('Failed to generate report. An unknown error occurred.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getDaysInMonth = (month: string, year: string) => {
    return new Date(parseInt(year), parseInt(month), 0).getDate()
  }

  const calculateTotalHours = (tractorId: number) => {
    return Object.values(tractorHoursData).reduce((sum, dayData) => sum + (dayData[tractorId] || 0), 0)
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50))

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`} style={{ fontSize: `${zoom}%` }}>
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/reports/reportsmain" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white mr-4">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tractor Hours Report</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => toggleCell('header')}
              className="p-2 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            >
              {expandedCells['header'] ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            </button>
            <button onClick={handleZoomOut} className="p-2 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              <ZoomOut size={20} />
            </button>
            <button onClick={handleZoomIn} className="p-2 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              <ZoomIn size={20} />
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-yellow-300"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {expandedCells['header'] && (
          <div className="mb-6 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Tractor Hours Report Overview
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Generate monthly reports showing daily tractor usage hours with totals for each tractor.
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <button
              onClick={() => toggleCell('filters')}
              className="p-2 rounded-full mr-4 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            >
              {expandedCells['filters'] ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            </button>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
              Report Filters
            </h3>
          </div>

          <div className={`${expandedCells['filters'] ? 'block' : 'hidden'} mb-6`}>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="w-full md:w-1/3">
                <label htmlFor="month" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Month
                </label>
                <select
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                >
                  <option value="">Select Month</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m.toString().padStart(2, '0')}>
                      {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-1/3">
                <label htmlFor="year" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Year
                </label>
                <select
                  id="year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y.toString()}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-1/3 flex items-end">
                <button
                  onClick={generateReport}
                  className="w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                  disabled={isLoading || !month || !year}
                >
                  {isLoading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="mb-6">
              <Loading message="Generating tractor hours report..." size="lg" />
            </div>
          )}

          {!isLoading && Object.keys(tractorHoursData).length > 0 && (
            <>
              <div className="flex items-center mb-4">
                <button
                  onClick={() => toggleCell('summary')}
                  className="p-2 rounded-full mr-4 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                >
                  {expandedCells['summary'] ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  Hours Summary
                </h3>
              </div>

              {expandedCells['summary'] && (
                <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Days</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{getDaysInMonth(month, year)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Active Tractors</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{tractors.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Hours</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {tractors.reduce((sum, tractor) => sum + calculateTotalHours(tractor.id), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="py-2 px-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Date</th>
                      {tractors.map((tractor) => (
                        <th key={tractor.id} className="py-2 px-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                          {tractor.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {Array.from({ length: getDaysInMonth(month, year) }, (_, i) => i + 1).map((day) => (
                      <tr key={day} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{day}</td>
                        {tractors.map((tractor) => (
                          <td key={tractor.id} className="py-2 px-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">
                            {tractorHoursData[`${year}-${month}-${day.toString().padStart(2, '0')}`]?.[tractor.id] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <td className="py-2 px-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">Total Hours</td>
                      {tractors.map((tractor) => (
                        <td key={tractor.id} className="py-2 px-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">
                          {calculateTotalHours(tractor.id).toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}