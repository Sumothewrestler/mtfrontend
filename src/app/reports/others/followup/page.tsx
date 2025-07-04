"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ArrowLeft,
  Calendar,
  Phone,
  Clock,
  Sun,
  Moon,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useDarkMode } from '@/contexts/DarkModeContext'

interface FollowUpLog {
  id: number
  customer: number
  customer_name: string
  customer_phone: string
  customer_group: string
  customer_tags: {
    id: string
    name: string
    color: string
  } | null
  followed_up_at: string
  followed_up_date: string
  notes: string
}

interface FollowUpReport {
  date: string
  total_followups: number
  customers: FollowUpLog[]
}

interface Stats {
  today: number
  this_week: number
  this_month: number
}

export default function FollowUpReportsPage() {
  const [reports, setReports] = useState<FollowUpReport[]>([])
  const [stats, setStats] = useState<Stats>({ today: 0, this_week: 0, this_month: 0 })
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [selectedGroup, setSelectedGroup] = useState("")
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        start_date: startDate,
        ...(endDate && { end_date: endDate })
      })
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}followup-reports/?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    if (startDate) {
      fetchReports()
    }
  }, [startDate, fetchReports])

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}followup-stats/`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const filteredReports = reports.map(report => ({
    ...report,
    customers: report.customers.filter(customer => {
      const matchesGroup = !selectedGroup || customer.customer_group === selectedGroup
      return matchesGroup
    })
  })).filter(report => report.customers.length > 0)

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Simple Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link 
              href="/reports" 
              className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Follow-up Reports</h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 text-center shadow-sm`}>
              <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Today</div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 text-center shadow-sm`}>
              <div className="text-2xl font-bold text-green-600">{stats.this_week}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>This Week</div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 text-center shadow-sm`}>
              <div className="text-2xl font-bold text-purple-600">{stats.this_month}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>This Month</div>
            </div>
          </div>

          {/* Compact Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                isDarkMode 
                  ? "bg-gray-700 border-gray-600 text-white" 
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                isDarkMode 
                  ? "bg-gray-700 border-gray-600 text-white" 
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />

            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                isDarkMode 
                  ? "bg-gray-700 border-gray-600 text-white" 
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">All Groups</option>
              <option value="Group 1">Group 1</option>
              <option value="Group 2">Group 2</option>
              <option value="Group 3">Group 3</option>
            </select>
          </div>

          {/* Reports List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div
                className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
                  isDarkMode ? "border-blue-400" : "border-blue-600"
                }`}
              ></div>
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <motion.div
                  key={report.date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className={`h-5 w-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                        <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          {formatDate(report.date)}
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isDarkMode ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"
                      }`}>
                        {report.customers.length} customers
                      </span>
                    </div>
                  </div>

                  {/* Compact List View */}
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {report.customers.map((customer, index) => (
                      <div
                        key={customer.id}
                        className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} min-w-[2rem]`}>
                            {index + 1}.
                          </span>
                          <div className="flex-1">
                            <h4 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                              {customer.customer_name}
                            </h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          {formatDateTime(customer.followed_up_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-12 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              <Phone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No follow-ups found</h3>
              <p className="text-sm">
                {selectedGroup
                  ? "Try adjusting your filters"
                  : "No follow-up activities for the selected date range"
                }
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}