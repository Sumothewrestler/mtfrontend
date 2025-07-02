"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar } from "lucide-react"
import Link from "next/link"
import { useDarkMode } from '@/contexts/DarkModeContext'

type AttendanceRecord = {
  date: string
  status: 'present' | 'absent' | 'half-day'
}

type EmployeeAttendance = {
  employee: {
    id: number
    name: string
    is_active?: boolean
  }
  totalDays: number
  presentDays: number
  absentDays: number
  halfDays: number
  attendancePercentage: number
  records: AttendanceRecord[]
}

type DailyStatus = {
  day: number
  status: string
}

type EmployeeMonthData = {
  daily_status: DailyStatus[]
  summary: {
    total_days: number
    present_days: number
    absent_days: number
    half_days: number
    not_marked_days: number
    attendance_percentage: number
  }
}

type EmployeeData = {
  employee_id: number
  name: string
  is_active: boolean
  month_data: EmployeeMonthData
}

type MonthlyReportData = {
  year: number
  month: number
  days_in_month: number
  employees_data: EmployeeData[]
}

export default function AttendanceGridReport() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [showInactiveEmployees, setShowInactiveEmployees] = useState(false)

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]



  const fetchMonthlyReport = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}attendance/report/?month=${selectedMonth.toString().padStart(2, '0')}&year=${selectedYear}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch monthly report")
      }

      const data: EmployeeAttendance[] = await response.json()
      
      // Transform the data to match the grid component's expected format
      const transformedData = transformApiDataToGridFormat(data, selectedMonth, selectedYear)
      setReportData(transformedData)
    } catch (err) {
      console.error("Error fetching monthly report:", err)
      setError("Failed to load monthly report. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [selectedMonth, selectedYear])

  useEffect(() => {
    fetchMonthlyReport()
  }, [fetchMonthlyReport])

  const transformApiDataToGridFormat = (apiData: EmployeeAttendance[], month: number, year: number): MonthlyReportData => {
    const daysInMonth = new Date(year, month, 0).getDate()
    
    const employees_data: EmployeeData[] = apiData.map(employeeData => {
      // Create a map of date to status
      const recordsMap = new Map<string, string>()
      employeeData.records.forEach(record => {
        const recordDate = new Date(record.date)
        const day = recordDate.getDate()
        recordsMap.set(day.toString(), record.status)
      })

      // Build daily status array for all days in month
      const daily_status: DailyStatus[] = []
      for (let day = 1; day <= daysInMonth; day++) {
        const status = recordsMap.get(day.toString()) || 'not_marked'
        let displayStatus = 'Not Marked'
        
        switch (status) {
          case 'present':
            displayStatus = 'Present'
            break
          case 'absent':
            displayStatus = 'Absent'
            break
          case 'half-day':
            displayStatus = 'Half Day'
            break
          default:
            displayStatus = 'Not Marked'
        }

        daily_status.push({
          day,
          status: displayStatus
        })
      }

      return {
        employee_id: employeeData.employee.id,
        name: employeeData.employee.name,
        is_active: employeeData.employee.is_active ?? true,
        month_data: {
          daily_status,
          summary: {
            total_days: employeeData.totalDays,
            present_days: employeeData.presentDays,
            absent_days: employeeData.absentDays,
            half_days: employeeData.halfDays,
            not_marked_days: employeeData.totalDays - (employeeData.presentDays + employeeData.absentDays + employeeData.halfDays),
            attendance_percentage: employeeData.attendancePercentage
          }
        }
      }
    })

    return {
      year,
      month,
      days_in_month: daysInMonth,
      employees_data
    }
  }

  const onMonthYearChange = (month: number, year: number) => {
    setSelectedMonth(month)
    setSelectedYear(year)
  }

  const onCurrentMonth = () => {
    const now = new Date()
    setSelectedMonth(now.getMonth() + 1)
    setSelectedYear(now.getFullYear())
  }

  const onPreviousMonth = () => {
    let newMonth = selectedMonth - 1
    let newYear = selectedYear

    if (newMonth < 1) {
      newMonth = 12
      newYear -= 1
    }

    setSelectedMonth(newMonth)
    setSelectedYear(newYear)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg"
      case "Absent":
        return "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg"
      case "Half Day":
        return "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg"
      default:
        return "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700"
    }
  }



  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/reports/reportsmain" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Grid Report</h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-yellow-300"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-3 md:p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4">
            <div className="space-y-4">
              {/* Compact Controls - All in one line */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <button
                    onClick={onCurrentMonth}
                    className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
                  >
                    This
                  </button>
                  <button
                    onClick={onPreviousMonth}
                    className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-md hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium"
                  >
                    Prev
                  </button>
                  <select
                    value={selectedMonth}
                    onChange={(e) => onMonthYearChange(Number.parseInt(e.target.value), selectedYear)}
                    className="border border-gray-200 dark:border-gray-600 rounded-md px-1 py-1 sm:px-2 sm:py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index + 1}>
                        {month.substring(0, 3)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => onMonthYearChange(selectedMonth, Number.parseInt(e.target.value))}
                    className="border border-gray-200 dark:border-gray-600 rounded-md px-1 py-1 sm:px-2 sm:py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowInactiveEmployees(!showInactiveEmployees)}
                  className={`p-1.5 rounded-md transition-all duration-200 ${
                    showInactiveEmployees
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                  title={showInactiveEmployees ? "Hide inactive employees" : "Show inactive employees"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                </button>
              </div>
            </div>
          </div>



          {/* Main Content */}
          {isLoading ? (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-600 rounded-full animate-spin"></div>
                  <div className="w-16 h-16 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-4 text-lg font-medium">Loading monthly report...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-2 border-red-200 dark:border-red-700 rounded-xl p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-xl">!</span>
                </div>
                <div>
                  <h4 className="text-red-800 dark:text-red-200 font-semibold text-lg">Error Loading Data</h4>
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          ) : reportData ? (
            <div className="space-y-4">
              {reportData.employees_data
                .filter((employee) => showInactiveEmployees || employee.is_active)
                .map((employee) => (
                <div
                  key={employee.employee_id}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4"
                >
                  {/* Employee Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{employee.name}</h3>
                        {!employee.is_active && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Employee ID: {employee.employee_id}</p>
                    </div>
                    <div className="mt-2 sm:mt-0 flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-emerald-500"></div>
                        <span className="text-gray-600 dark:text-gray-300">Present: </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{employee.month_data.summary.present_days}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-red-500"></div>
                        <span className="text-gray-600 dark:text-gray-300">Absent: </span>
                        <span className="font-semibold text-red-600 dark:text-red-400">{employee.month_data.summary.absent_days}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-orange-500"></div>
                        <span className="text-gray-600 dark:text-gray-300">Half Day: </span>
                        <span className="font-semibold text-orange-600 dark:text-orange-400">{employee.month_data.summary.half_days}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-blue-500"></div>
                        <span className="text-gray-600 dark:text-gray-300">Rate: </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {employee.month_data.summary.attendance_percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compact Calendar Grid */}
                  <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 xl:grid-cols-31 gap-1 sm:gap-2">
                    {employee.month_data.daily_status.map((day) => (
                      <div key={day.day} className="relative group">
                        <div
                          className={`
                            h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center
                            ${getStatusColor(day.status)}
                            transform transition-all duration-200 hover:scale-110 hover:z-10
                            cursor-pointer
                          `}
                        >
                          <span className="font-bold text-xs sm:text-sm">{day.day}</span>
                        </div>

                        {/* Compact Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-20">
                          <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                            Day {day.day}: {day.status}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Legend:</h4>
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-gradient-to-br from-emerald-500 to-emerald-600"></div>
                    <span className="text-gray-600 dark:text-gray-300">Present</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-gradient-to-br from-red-500 to-red-600"></div>
                    <span className="text-gray-600 dark:text-gray-300">Absent</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-gradient-to-br from-orange-500 to-orange-600"></div>
                    <span className="text-gray-600 dark:text-gray-300">Half Day</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-gradient-to-br from-gray-300 to-gray-400"></div>
                    <span className="text-gray-600 dark:text-gray-300">Not Marked</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">No Data Available</h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg">No attendance data found for the selected month.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

