'use client'

import { useState, useEffect, useCallback } from 'react'
import { Moon, Sun, Calendar, Truck, Eye, TrendingUp, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface TractorData {
  tractor: {
    id: number
    name: string
    tractor_number: string
    is_active: boolean
  }
  opening_hours: number
  closing_hours: number
  total_difference: number
  days_worked: number
  daily_hours: Array<{
    date: string
    start_hour: number
    end_hour: number
    total_hours: number
  }>
}

interface ReportData {
  from_date: string
  to_date: string
  include_inactive: boolean
  tractor_data: TractorData[]
}

export default function TractorHoursReportPage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  
  // Get current month start and end dates
  const getCurrentMonthDates = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    return {
      from: firstDay.toISOString().split('T')[0],
      to: lastDay.toISOString().split('T')[0]
    }
  }

  const currentMonth = getCurrentMonthDates()
  
  // State management
  const [fromDate, setFromDate] = useState(currentMonth.from)
  const [toDate, setToDate] = useState(currentMonth.to)
  const [includeInactive, setIncludeInactive] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch report data
  const fetchReportData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        from_date: fromDate,
        to_date: toDate,
        include_inactive: includeInactive.toString()
      })
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tractor-hours/report-range/?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch tractor hours report')
      }
      
      const data: ReportData = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Error fetching report:', error)
      setError('Failed to load tractor hours report. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [fromDate, toDate, includeInactive])

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  // Quick date setters
  const setCurrentMonth = () => {
    const dates = getCurrentMonthDates()
    setFromDate(dates.from)
    setToDate(dates.to)
  }

  const setPreviousMonth = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
    
    setFromDate(firstDay.toISOString().split('T')[0])
    setToDate(lastDay.toISOString().split('T')[0])
  }

  // Calculate summary statistics
  const calculateSummary = () => {
    if (!reportData) return null
    
    const totalTractors = reportData.tractor_data.length
    const totalHours = reportData.tractor_data.reduce((sum, tractor) => sum + tractor.total_difference, 0)
    const activeTractors = reportData.tractor_data.filter(t => t.tractor.is_active).length
    const averageHours = totalTractors > 0 ? totalHours / totalTractors : 0
    
    return {
      totalTractors,
      activeTractors,
      totalHours,
      averageHours
    }
  }

  const summary = calculateSummary()

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/reports/reportsmain" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tractor Hours Report</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Comprehensive tractor usage analysis</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-yellow-300"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-3 md:p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Controls Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4">
            <div className="space-y-4">
              
              {/* Date Range Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <button
                    onClick={setCurrentMonth}
                    className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
                  >
                    This Month
                  </button>
                  <button
                    onClick={setPreviousMonth}
                    className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-md hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium"
                  >
                    Last Month
                  </button>
                </div>
                
                <button
                  onClick={() => setIncludeInactive(!includeInactive)}
                  className={`p-1.5 rounded-md transition-all duration-200 ${
                    includeInactive
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                  title={includeInactive ? "Hide inactive tractors" : "Show inactive tractors"}
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>

              {/* Custom Date Range */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From:</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To:</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
                <button
                  onClick={fetchReportData}
                  className="px-3 py-1 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-md hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium text-xs sm:text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4">
                <div className="flex items-center">
                  <Truck className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tractors</p>
                    <p className="text-2xl font-bold text-blue-600">{summary.totalTractors}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Tractors</p>
                    <p className="text-2xl font-bold text-green-600">{summary.activeTractors}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Hours</p>
                    <p className="text-2xl font-bold text-purple-600">{summary.totalHours.toFixed(1)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-orange-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Hours</p>
                    <p className="text-2xl font-bold text-orange-600">{summary.averageHours.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          {loading ? (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-600 rounded-full animate-spin"></div>
                  <div className="w-16 h-16 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-4 text-lg font-medium">Loading tractor hours report...</p>
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
              {reportData.tractor_data
                .filter((tractor) => includeInactive || tractor.tractor.is_active)
                .map((tractor) => (
                <div
                  key={tractor.tractor.id}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4"
                >
                  {/* Tractor Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{tractor.tractor.name}</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">#{tractor.tractor.tractor_number}</span>
                        {!tractor.tractor.is_active && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2 sm:mt-0 flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-blue-500"></div>
                        <span className="text-gray-600 dark:text-gray-300">Opening: </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{tractor.opening_hours.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-green-500"></div>
                        <span className="text-gray-600 dark:text-gray-300">Closing: </span>
                        <span className="font-semibold text-green-600 dark:text-green-400">{tractor.closing_hours.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-purple-500"></div>
                        <span className="text-gray-600 dark:text-gray-300">Total: </span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">{tractor.total_difference.toFixed(1)}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-orange-500"></div>
                        <span className="text-gray-600 dark:text-gray-300">Days: </span>
                        <span className="font-semibold text-orange-600 dark:text-orange-400">{tractor.days_worked}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hours Grid - Visual representation */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Daily Hours Worked</h4>
                    <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 xl:grid-cols-31 gap-1 sm:gap-2">
                      {tractor.daily_hours.map((day, index) => (
                        <div key={index} className="relative group">
                          <div
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 text-white transform transition-all duration-200 hover:scale-110 hover:z-10 cursor-pointer"
                          >
                            <span className="font-bold text-xs sm:text-sm">{day.total_hours.toFixed(0)}</span>
                          </div>

                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-20">
                            <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                              {new Date(day.date).toLocaleDateString()}<br/>
                              Start: {day.start_hour}h<br/>
                              End: {day.end_hour}h<br/>
                              Total: {day.total_hours}h
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg p-3">
                    <div className="text-center">
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {tractor.total_difference.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">hours total</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        ({tractor.days_worked} days worked)
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {reportData.tractor_data.length === 0 && (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Truck className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">No Data Available</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">No tractor hours data found for the selected date range.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Select Date Range</h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg">Choose dates to generate the tractor hours report.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 