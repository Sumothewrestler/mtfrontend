'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Calendar, Filter, CheckCircle, Clock, AlertTriangle, ListTodo, Target, ArrowLeft } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import Link from 'next/link'

interface Task {
  id: number
  task_name: string
  status: 'Pending' | 'Done'
  due_date: string
  created_at: string
  completion_date: string | null
}

interface TaskSummary {
  total_tasks: number
  pending_tasks: number
  completed_tasks: number
  overdue_tasks: number
  tasks_due_today: number
}

interface TaskReportData {
  summary: TaskSummary
  tasks: Task[]
}

export default function TaskReportsPage() {
  const { isDarkMode } = useDarkMode()
  const [reportData, setReportData] = useState<TaskReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    status: 'All',
    search: ''
  })

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true)
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}tasks/report/`
      const params = new URLSearchParams()
      
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)
      if (filters.status !== 'All') params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)
      
      if (params.toString()) url += `?${params.toString()}`
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch report data')
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  const handleToggleStatus = async (taskId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tasks/${taskId}/toggle-status/`, {
        method: 'PATCH'
      })
      if (!response.ok) throw new Error('Failed to toggle task status')
      await fetchReportData()
    } catch (error) {
      console.error('Error toggling task status:', error)
    }
  }

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === 'Done') return 'text-green-600'
    const today = new Date().toISOString().split('T')[0]
    if (dueDate < today) return 'text-red-600'
    if (dueDate === today) return 'text-orange-600'
    return 'text-blue-600'
  }

  const getStatusBgColor = (status: string, dueDate: string) => {
    if (status === 'Done') return 'bg-green-100'
    const today = new Date().toISOString().split('T')[0]
    if (dueDate < today) return 'bg-red-100'
    if (dueDate === today) return 'bg-orange-100'
    return 'bg-blue-100'
  }

  const statusTabs = [
    { value: 'All', label: 'All', color: 'bg-blue-500 hover:bg-blue-600' },
    { value: 'Pending', label: 'Pending', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { value: 'Done', label: 'Done', color: 'bg-green-500 hover:bg-green-600' }
  ]

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} pb-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link href="/reports" className="mr-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-bold">Task Reports</h1>
          </div>
        </div>

        {/* Compact Summary Card */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <ListTodo className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm text-gray-500">Total</span>
              </div>
              <p className="text-xl font-bold text-blue-600">{reportData?.summary.total_tasks || 0}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-sm text-gray-500">Pending</span>
              </div>
              <p className="text-xl font-bold text-yellow-600">{reportData?.summary.pending_tasks || 0}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-gray-500">Completed</span>
              </div>
              <p className="text-xl font-bold text-green-600">{reportData?.summary.completed_tasks || 0}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm text-gray-500">Overdue</span>
              </div>
              <p className="text-xl font-bold text-red-600">{reportData?.summary.overdue_tasks || 0}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-5 h-5 text-orange-600 mr-2" />
                <span className="text-sm text-gray-500">Today</span>
              </div>
              <p className="text-xl font-bold text-orange-600">{reportData?.summary.tasks_due_today || 0}</p>
            </div>
          </div>
        </div>

        {/* Compact Filters */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
          <div className="flex items-center mb-4">
            <Filter size={20} className="mr-2" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Date Range */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                  className={`w-32 pl-8 pr-2 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <span className="text-gray-500">to</span>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                  className={`w-32 pl-8 pr-2 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex space-x-2">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilters({ ...filters, status: tab.value })}
                  className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                    filters.status === tab.value ? tab.color : 'bg-gray-400 hover:bg-gray-500'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">Task Details</h2>
            <p className="text-gray-500 text-sm">
              {reportData?.tasks.length || 0} tasks found
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">Loading report data...</div>
          ) : !reportData?.tasks.length ? (
            <div className="p-8 text-center text-gray-500">
              No tasks found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {reportData.tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${task.status === 'Done' ? 'line-through opacity-60' : ''}`}>
                          {task.task_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(task.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(task.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.completion_date ? new Date(task.completion_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBgColor(task.status, task.due_date)} ${getStatusColor(task.status, task.due_date)}`}>
                          {task.status === 'Done' ? <CheckCircle size={14} className="mr-1" /> : <Clock size={14} className="mr-1" />}
                          {task.status}
                          {task.status === 'Pending' && task.due_date < new Date().toISOString().split('T')[0] && ' (Overdue)'}
                          {task.status === 'Pending' && task.due_date === new Date().toISOString().split('T')[0] && ' (Due Today)'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleToggleStatus(task.id)}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                            task.status === 'Done' 
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {task.status === 'Done' ? 'Mark Pending' : 'Mark Done'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 