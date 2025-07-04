"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ArrowLeft,
  Calendar,
  Phone,
  Users,
  Search,
  Clock,
  Tag as TagIcon,
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
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("")
  const { isDarkMode } = useDarkMode()

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
      const matchesSearch = !searchTerm || 
        customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_phone.includes(searchTerm)
      
      const matchesGroup = !selectedGroup || customer.customer_group === selectedGroup
      
      return matchesSearch && matchesGroup
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
    <div
      className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div
          className={`rounded-2xl shadow-xl overflow-hidden ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } border border-indigo-200`}
        >
          {/* Header section */}
          <div className="relative h-48">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl"></div>
            
            {/* Decorative shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-indigo-400 opacity-20 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-blue-300 opacity-30 translate-x-1/3 -translate-y-1/3"></div>

            <div className="relative z-10 h-full px-6 py-8 sm:p-10 flex flex-col justify-center">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <Link
                      href="/reports/reportsmain"
                      className="mr-3 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                    >
                      <ArrowLeft className="h-5 w-5 text-white" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white drop-shadow-md">Follow-up Reports</h1>
                  </div>
                  <p className="text-blue-100 text-sm">Track customer follow-up activities</p>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">{stats.today}</div>
                    <div className="text-xs text-blue-100">Today</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">{stats.this_week}</div>
                    <div className="text-xs text-blue-100">This Week</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">{stats.this_month}</div>
                    <div className="text-xs text-blue-100">This Month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="px-6 pb-8 sm:px-10 sm:pb-10 pt-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Search Customer
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Group Filter
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
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
            </div>

            {/* Reports List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div
                  className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
                    isDarkMode ? "border-indigo-400" : "border-indigo-600"
                  }`}
                ></div>
              </div>
            ) : filteredReports.length > 0 ? (
              <div className="space-y-6">
                {filteredReports.map((report) => (
                  <motion.div
                    key={report.date}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-6 ${
                      isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                    } border ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Calendar className={`h-5 w-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                        <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          {formatDate(report.date)}
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isDarkMode ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"
                      }`}>
                        {report.customers.length} follow-ups
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {report.customers.map((customer) => (
                        <div
                          key={customer.id}
                          className={`p-4 rounded-lg ${
                            isDarkMode ? "bg-gray-800" : "bg-white"
                          } border ${isDarkMode ? "border-gray-600" : "border-gray-200"} shadow-sm`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                              {customer.customer_name}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {formatDateTime(customer.followed_up_at)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                              {customer.customer_phone}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            {customer.customer_group && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-gray-400" />
                                <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                  {customer.customer_group}
                                </span>
                              </div>
                            )}

                            {customer.customer_tags && (
                              <div 
                                className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                                style={{ 
                                  backgroundColor: `${customer.customer_tags.color}20`,
                                  color: customer.customer_tags.color,
                                  border: `1px solid ${customer.customer_tags.color}40`
                                }}
                              >
                                <TagIcon className="w-3 h-3" />
                                {customer.customer_tags.name}
                              </div>
                            )}
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
                  {searchTerm || selectedGroup
                    ? "Try adjusting your filters"
                    : "No follow-up activities for the selected date range"
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}