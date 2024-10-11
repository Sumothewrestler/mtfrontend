"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Home, Database, FileText, Calendar, Moon, Sun, ZoomIn, ZoomOut, Check, X } from 'lucide-react'

type Employee = {
  id: number
  name: string
}

type AttendanceRecord = {
  present: boolean
  description: string
}

export default function Attendance() {
  const [date, setDate] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendance, setAttendance] = useState<{[key: number]: AttendanceRecord}>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setIsLoading(true)
    try {
      console.log('Fetching employees...')
      const response = await fetch('http://localhost:8000/api/employees/list/')
      console.log('Response status:', response.status)
      if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      console.log('Fetched data:', data)
      setEmployees(data)
      initializeAttendance(data)
    } catch (error) {
      console.error('Error fetching employees:', error)
      setError(`Failed to load employees. Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const initializeAttendance = (employeeList: Employee[]) => {
    const initialAttendance: {[key: number]: AttendanceRecord} = {}
    employeeList.forEach(employee => {
      initialAttendance[employee.id] = { present: false, description: '' }
    })
    setAttendance(initialAttendance)
  }

  const handleAttendanceChange = (id: number, present: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [id]: { ...prev[id], present }
    }))
  }

  const handleDescriptionChange = (id: number, description: string) => {
    setAttendance(prev => ({
      ...prev,
      [id]: { ...prev[id], description }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const submissionData = {
        date,
        attendances: Object.entries(attendance).reduce((acc, [id, record]) => {
          acc[id] = {
            present: record.present,
            description: record.description
          }
          return acc
        }, {} as Record<string, { present: boolean; description: string }>)
      };
      console.log('Submitting attendance:', JSON.stringify(submissionData, null, 2))
      const response = await fetch('http://localhost:8000/api/attendance/submit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })
  
      console.log('Response status:', response.status)
  
      if (!response.ok) {
        const responseText = await response.text();
        console.error('Error response text:', responseText);
        throw new Error(`Failed to submit attendance: ${response.status} ${response.statusText}`);
      }
  
      const result = await response.json()
      console.log('Attendance submitted:', result)
      setDate('')
      setAttendance({})
      alert('Attendance submitted successfully!')
    } catch (error) {
      console.error('Error submitting attendance:', error)
      alert(`Failed to submit attendance. Error: ${error.message}`)
    }
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
            <Link href="/daysheet/daysheetmain" className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-semibold">Attendance</h1>
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
          {isLoading ? (
            <div className={`flex justify-center items-center h-64 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-8`}>
              <div className="mb-6">
                <label htmlFor="date" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="mb-6">
                <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Employee Attendance</h2>
                <div className="space-y-4">
                  {employees.map(employee => (
                    <div key={employee.id} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-md transition-all duration-300 hover:shadow-md`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{employee.name}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleAttendanceChange(employee.id, true)}
                            className={`px-3 py-1 rounded-md transition-colors duration-300 flex items-center ${
                              attendance[employee.id]?.present
                                ? 'bg-green-500 text-white'
                                : isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            <Check size={16} className="mr-1" />
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAttendanceChange(employee.id, false)}
                            className={`px-3 py-1 rounded-md transition-colors duration-300 flex items-center ${
                              attendance[employee.id]?.present === false
                                ? 'bg-red-500 text-white'
                                : isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            <X size={16} className="mr-1" />
                            Absent
                          </button>
                        </div>
                      </div>
                      <textarea
                        placeholder="Description (optional)"
                        value={attendance[employee.id]?.description || ''}
                        onChange={(e) => handleDescriptionChange(employee.id, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Submit Attendance
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  )
}