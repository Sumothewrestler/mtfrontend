'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, X, Clock, PlusCircle, Moon, Sun, Filter } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'

type Employee = {
  id: number
  name: string
  is_active: boolean // Added is_active property
}

type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'not-entered'  // Added 'not-entered'

type AttendanceRecord = {
  status: AttendanceStatus
  description: string
}

export default function Attendance() {
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [attendance, setAttendance] = useState<{ [key: number]: AttendanceRecord }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [showDescriptionFor, setShowDescriptionFor] = useState<number | null>(null)
  const [showInactiveEmployees, setShowInactiveEmployees] = useState(false)

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}employees/list/`)
      if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      setEmployees(data)
      // Default to showing only active employees
      const activeEmployees = data.filter((emp: Employee) => emp.is_active)
      setFilteredEmployees(activeEmployees)
      initializeAttendance(activeEmployees)
    } catch (error) {
      console.error('Error fetching employees:', error)
      setError(`Failed to load employees. Error: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchAttendanceByDate = useCallback(async (selectedDate: string) => {
    if (!selectedDate) return
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}attendance/by-date/?date=${selectedDate}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch attendance: ${response.status} ${response.statusText}`)
      }
      const existingAttendance = await response.json()
      
      // Reset all employees to 'not-entered' first, then update with existing data
      const updatedAttendance: { [key: number]: AttendanceRecord } = {}
      
      // First, initialize all filtered employees to 'not-entered'
      filteredEmployees.forEach(employee => {
        updatedAttendance[employee.id] = { 
          status: 'not-entered', 
          description: '' 
        }
      })
      
      // Then, update with existing data from the API
      Object.keys(existingAttendance).forEach(employeeId => {
        const id = parseInt(employeeId)
        // Only update if this employee is in our filtered list
        if (updatedAttendance[id]) {
          updatedAttendance[id] = {
            status: existingAttendance[employeeId].status as AttendanceStatus,
            description: existingAttendance[employeeId].description || ''
          }
        }
      })
      
      setAttendance(updatedAttendance)
    } catch (error) {
      console.error('Error fetching attendance by date:', error)
      // Reset to 'not-entered' for all employees if there's an error
      const resetAttendance: { [key: number]: AttendanceRecord } = {}
      filteredEmployees.forEach(employee => {
        resetAttendance[employee.id] = { 
          status: 'not-entered', 
          description: '' 
        }
      })
      setAttendance(resetAttendance)
    }
  }, [filteredEmployees])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // Fetch attendance data when date changes or employees are loaded
  useEffect(() => {
    if (date && filteredEmployees.length > 0) {
      fetchAttendanceByDate(date)
    }
  }, [date, fetchAttendanceByDate, filteredEmployees])

  useEffect(() => {
    // Filter employees when showInactiveEmployees toggle changes
    if (showInactiveEmployees) {
      setFilteredEmployees(employees)
    } else {
      const activeEmployees = employees.filter(emp => emp.is_active)
      setFilteredEmployees(activeEmployees)
      
      // Use functional update to handle attendance initialization
      setAttendance(prevAttendance => {
        const updatedAttendance = { ...prevAttendance }
        let hasChanges = false
        
        activeEmployees.forEach(emp => {
          if (!updatedAttendance[emp.id]) {
            hasChanges = true
            updatedAttendance[emp.id] = { status: 'not-entered', description: '' }
          }
        })
        
        return hasChanges ? updatedAttendance : prevAttendance
      })
    }
  }, [showInactiveEmployees, employees]) // Dependencies are correct now

  const initializeAttendance = (employeeList: Employee[]) => {
    console.log('Initializing attendance for:', employeeList)
    const initialAttendance: { [key: number]: AttendanceRecord } = {}
    employeeList.forEach(employee => {
      initialAttendance[employee.id] = { 
        status: 'not-entered', 
        description: '' 
      }
    })
    console.log('Initial attendance state:', initialAttendance)
    setAttendance(initialAttendance)
  }

  const handleAttendanceChange = (id: number, status: AttendanceStatus) => {
    console.log('Attempting to change attendance:', { employeeId: id, newStatus: status })
    console.log('Current attendance state:', attendance)
    
    setAttendance(prev => {
      const newState = {
        ...prev,
        [id]: { 
          ...prev[id],
          status,
          description: prev[id]?.description || '' 
        }
      }
      console.log('Updated attendance state:', newState)
      return newState
    })
  }

  const handleDescriptionChange = (id: number, description: string) => {
    setAttendance(prev => ({
      ...prev,
      [id]: { ...prev[id], description }
    }))
  }

  const toggleDescriptionInput = (id: number) => {
    setShowDescriptionFor(prev => prev === id ? null : id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with attendance:', attendance)
    
    if (new Date(date) > new Date()) {
      alert('You cannot submit attendance for a future date.')
      return
    }
    try {
      const submissionData = {
        date,
        attendances: Object.entries(attendance).map(([id, record]) => ({
          employee: id,
          date,
          status: record.status,
          description: record.description
        }))
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}attendance/submit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        throw new Error(`Failed to submit attendance: ${response.status} ${response.statusText}`);
      }

      const result = await response.json()
      console.log('Attendance submitted:', result)
      // Don't clear the form, so users can continue editing
      alert('Attendance submitted successfully!')
    } catch (error) {
      console.error('Error submitting attendance:', error)
      alert(`Failed to submit attendance. Error: ${(error as Error).message}`)
    }
  }

  useEffect(() => {
    console.log('Attendance state updated:', attendance)
  }, [attendance])

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Attendance</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowInactiveEmployees(!showInactiveEmployees)}
              className={`flex items-center p-2 rounded ${
                showInactiveEmployees
                  ? isDarkMode ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'
                  : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}
              title={showInactiveEmployees ? "Showing all employees" : "Showing only active employees"}
            >
              <Filter size={16} className="mr-1" />
              <span className="text-sm hidden sm:inline">
                {showInactiveEmployees ? "Show All" : "Active Only"}
              </span>
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
          <form onSubmit={handleSubmit} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-4 sm:p-8`}>
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
              
              {filteredEmployees.length === 0 ? (
                <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                  No active employees found.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEmployees.map(employee => (
                    <div 
                      key={employee.id} 
                      className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-md transition-all duration-300 hover:shadow-md ${
                        !employee.is_active ? 'border-l-4 border-yellow-500' : ''
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <div className="font-medium mb-2 sm:mb-0 flex items-center">
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {employee.name}
                          </span>
                          {!employee.is_active && (
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              console.log('Button clicked:', { employeeId: employee.id, status: 'present' })
                              handleAttendanceChange(employee.id, 'present')
                            }}
                            className={`px-3 py-1 rounded-md transition-colors duration-300 flex items-center justify-center ${
                              attendance[employee.id]?.status === 'present'
                                ? 'bg-green-500 text-white'
                                : isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            <Check size={16} className="mr-1" />
                            <span className="hidden sm:inline">Present</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAttendanceChange(employee.id, 'absent')}
                            className={`px-3 py-1 rounded-md transition-colors duration-300 flex items-center justify-center ${
                              attendance[employee.id]?.status === 'absent'
                                ? 'bg-red-500 text-white'
                                : isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            <X size={16} className="mr-1" />
                            <span className="hidden sm:inline">Absent</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAttendanceChange(employee.id, 'half-day')}
                            className={`px-3 py-1 rounded-md transition-colors duration-300 flex items-center justify-center ${
                              attendance[employee.id]?.status === 'half-day'
                                ? 'bg-yellow-500 text-white'
                                : isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            <Clock size={16} className="mr-1" />
                            <span className="hidden sm:inline">Half Day</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAttendanceChange(employee.id, 'not-entered')}
                            className={`px-3 py-1 rounded-md transition-colors duration-300 flex items-center justify-center ${
                              attendance[employee.id]?.status === 'not-entered'
                                ? 'bg-gray-500 text-white'
                                : isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            <span className="hidden sm:inline">Not Entered</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleDescriptionInput(employee.id)}
                            className={`px-3 py-1 rounded-md transition-colors duration-300 flex items-center justify-center ${
                              isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            aria-label="Toggle description input"
                          >
                            <PlusCircle size={16} />
                          </button>
                        </div>
                      </div>
                      {showDescriptionFor === employee.id && (
                        <div className="mt-2">
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
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || filteredEmployees.length === 0}
              className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                isLoading || filteredEmployees.length === 0
                  ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                  : isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Submit
            </button>
          </form>
        )}
      </main>


    </div>
  )
}