'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sun, Moon, ToggleLeft, ToggleRight } from 'lucide-react'

type Employee = {
  id: number
  name: string
}

type AttendanceStatus = 'present' | 'absent' | 'half-day'

type AttendanceRecord = {
  date: string
  status: AttendanceStatus
}

type EmployeeAttendance = {
  employee: Employee
  totalDays: number
  presentDays: number
  absentDays: number
  halfDays: number
  attendancePercentage: number
  records: AttendanceRecord[]
}

export default function AttendanceReport() {
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [attendanceData, setAttendanceData] = useState<EmployeeAttendance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Toggle cells functionality
  const [expandedCells, setExpandedCells] = useState<Record<string, boolean>>({})

  const toggleCell = (cellKey: string) => {
    setExpandedCells(prev => ({
      ...prev,
      [cellKey]: !prev[cellKey]
    }))
  }

  useEffect(() => {
    const darkModePreference = localStorage.getItem('darkMode')
    if (darkModePreference) {
      setIsDarkMode(darkModePreference === 'true')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString())
    if (isDarkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [isDarkMode])

  const generateReport = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}attendance/report/?month=${month}&year=${year}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setAttendanceData(data)
    } catch (error) {
      console.error('Error fetching attendance report:', error)
      setError('Failed to generate report. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <span className="text-green-500 bg-green-100 rounded-full p-1">✓</span>
      case 'absent':
        return <span className="text-red-500 bg-red-100 rounded-full p-1">✗</span>
      case 'half-day':
        return <span className="text-yellow-500 bg-yellow-100 rounded-full p-1">½</span>
    }
  }

  const getDaysInMonth = (month: string, year: string) => {
    return new Date(parseInt(year), parseInt(month), 0).getDate()
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/reports/reportsmain" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white mr-4">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Report</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleCell('filters')}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}
              title="Toggle filters"
            >
              {expandedCells['filters'] ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-yellow-300"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Report Filters</h2>
            <button
              onClick={() => toggleCell('filters')}
              className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              {expandedCells['filters'] ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            </button>
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 transition-all duration-200 ${
            expandedCells['filters'] ? 'max-h-96' : 'max-h-20 overflow-hidden'
          }`}>
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Month
              </label>
              <select
                id="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white ${
                  expandedCells['filters'] ? 'h-10' : 'h-8'
                }`}
              >
                <option value="">Select Month</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m.toString().padStart(2, '0')}>
                    {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Year
              </label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white ${
                  expandedCells['filters'] ? 'h-10' : 'h-8'
                }`}
              >
                <option value="">Select Year</option>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <option key={y} value={y.toString()}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={generateReport}
                disabled={isLoading || !month || !year}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  expandedCells['filters'] ? 'h-10' : 'h-8'
                }`}
              >
                {isLoading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
          
          {expandedCells['filters'] && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium mb-2">Instructions:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Select both month and year to generate the attendance report</li>
                <li>• The report will show detailed attendance for all employees</li>
                <li>• Summary statistics will be displayed for each employee</li>
              </ul>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {attendanceData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Attendance Summary</h2>
                <button
                  onClick={() => toggleCell('summary')}
                  className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  {expandedCells['summary'] ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                </button>
              </div>
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-200 ${
                expandedCells['summary'] ? 'max-h-none' : 'max-h-64 overflow-y-auto'
              }`}>
                {attendanceData.map((employee) => (
                  <div key={employee.employee.id} className={`bg-gray-50 dark:bg-gray-700 p-4 rounded-lg ${
                    expandedCells['summary'] ? 'transform scale-105' : ''
                  } transition-transform duration-200`}>
                    <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">{employee.employee.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-600 dark:text-gray-300">Present Days:</div>
                      <div className="text-gray-900 dark:text-white font-semibold">{employee.presentDays}</div>
                      <div className="text-gray-600 dark:text-gray-300">Absent Days:</div>
                      <div className="text-gray-900 dark:text-white font-semibold">{employee.absentDays}</div>
                      <div className="text-gray-600 dark:text-gray-300">Half Days:</div>
                      <div className="text-gray-900 dark:text-white font-semibold">{employee.halfDays}</div>
                      <div className="text-gray-600 dark:text-gray-300">Total Days:</div>
                      <div className="text-gray-900 dark:text-white font-semibold">{employee.totalDays}</div>
                      <div className="text-gray-600 dark:text-gray-300">Attendance %:</div>
                      <div className={`font-semibold ${employee.attendancePercentage >= 80 ? 'text-green-600' : employee.attendancePercentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {employee.attendancePercentage.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Detailed Attendance Report</h2>
                <button
                  onClick={() => toggleCell('detailed')}
                  className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  {expandedCells['detailed'] ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                </button>
              </div>
              <div className={`overflow-x-auto transition-all duration-200 ${
                expandedCells['detailed'] ? 'max-h-screen' : 'max-h-96 overflow-y-auto'
              }`}>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Employee Name
                      </th>
                      {Array.from({ length: getDaysInMonth(month, year) }, (_, i) => i + 1).map((day) => (
                        <th key={day} className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {attendanceData.map((employee) => (
                      <tr key={employee.employee.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {`${year}-${month}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {employee.employee.name}
                        </td>
                        {Array.from({ length: getDaysInMonth(month, year) }, (_, i) => i + 1).map((day) => {
                          const record = employee.records.find((r) => new Date(r.date).getDate() === day)
                          return (
                            <td key={day} className="px-2 py-4 whitespace-nowrap text-sm text-center">
                              {record ? getStatusIcon(record.status) : '-'}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}