'use client'

import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Moon, Sun, CheckCircle, Circle, Clock, AlertTriangle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface DashboardData {
  previous_day_sales: number
  last_7_days_avg_sales: number
}

interface Task {
  id: number
  task_name: string
  status: 'Pending' | 'Done'
  due_date: string
  created_at: string
  completion_date: string | null
}

interface TaskData {
  today_tasks: Task[]
  pending_tasks: Task[]
}

export default function Dashboard() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [taskData, setTaskData] = useState<TaskData | null>(null)
  const [currentTaskView, setCurrentTaskView] = useState<'today' | 'pending'>('today')

  const buttonContainers = [
    {
      title: 'Daily Tasks',
      gradient: 'from-blue-500 via-purple-500 to-purple-600',
      buttons: [
        { title: 'Attendance', href: '/daysheet/attendance' },
        { title: 'Follow Up', href: '/daysheet/followup' },
      ]
    },
    {
      title: 'Job Management',
      gradient: 'from-emerald-400 via-teal-500 to-green-600',
      buttons: [
        { title: 'Add Job', href: '/daysheet/jobsubmit' },
        { title: 'Receipt', href: '/daysheet/receiptentry' },
      ]
    },
    {
      title: 'Financial',
      gradient: 'from-orange-400 via-amber-500 to-yellow-500',
      buttons: [
        { title: 'Expense', href: '/accounts/dailyentry' },
        { title: 'Payment', href: '/daysheet/paymententry' },
      ]
    }
  ]

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}dashboard/`);
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error fetching dashboard data:', error.message);
        } else {
          console.error('Unexpected error:', error);
        }
      }
    };

    const fetchTaskData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tasks/today/`);
        if (!response.ok) {
          throw new Error('Failed to fetch task data');
        }
        const data = await response.json();
        setTaskData(data);
      } catch (error) {
        console.error('Error fetching task data:', error);
      }
    };
  
    fetchDashboardData();
    fetchTaskData();
  }, []);

  const handleToggleTaskStatus = async (taskId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tasks/${taskId}/toggle-status/`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to toggle task status');
      
      // Refresh task data
      const taskResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tasks/today/`);
      if (taskResponse.ok) {
        const data = await taskResponse.json();
        setTaskData(data);
      }
    } catch (error) {
      console.error('Error toggling task status:', error);
    }
  };

  const getTaskStatusColor = (status: string, dueDate: string) => {
    if (status === 'Done') return 'text-green-600'
    const today = new Date().toISOString().split('T')[0]
    if (dueDate < today) return 'text-red-600'
    if (dueDate === today) return 'text-orange-600'
    return 'text-blue-600'
  };

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-purple-900'}`}>
            METRO TRANSPORTS
          </h1>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        
        {/* Sales Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <DollarSign className="mr-2" />
              Previous Day Sales
            </h3>
            <p className="text-3xl font-bold">
              ₹{dashboardData?.previous_day_sales.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <TrendingUp className="mr-2" />
              Last 7 Days Avg Sales
            </h3>
            <p className="text-3xl font-bold">
              ₹{dashboardData?.last_7_days_avg_sales.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>

        {/* Task Management Cards */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <CheckCircle className="mr-2" />
              Task Management
            </h3>
            <Link
              href="/tasks"
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>

          {/* Task View Toggle */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setCurrentTaskView('today')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentTaskView === 'today'
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Today&apos;s Tasks ({taskData?.today_tasks.length || 0})
            </button>
            <button
              onClick={() => setCurrentTaskView('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentTaskView === 'pending'
                  ? 'bg-orange-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pending Tasks ({taskData?.pending_tasks.length || 0})
            </button>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {currentTaskView === 'today' ? (
              taskData?.today_tasks.length ? (
                taskData.today_tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggleTaskStatus(task.id)}
                        className={`${getTaskStatusColor(task.status, task.due_date)} hover:scale-110 transition-transform`}
                      >
                        {task.status === 'Done' ? <CheckCircle size={20} /> : <Circle size={20} />}
                      </button>
                      <div>
                        <h4 className={`font-medium ${task.status === 'Done' ? 'line-through opacity-60' : ''}`}>
                          {task.task_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {task.status === 'Pending' && task.due_date === new Date().toISOString().split('T')[0] && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          Due Today
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.status === 'Done'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No tasks scheduled for today</p>
                </div>
              )
            ) : (
              taskData?.pending_tasks.length ? (
                taskData.pending_tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggleTaskStatus(task.id)}
                        className={`${getTaskStatusColor(task.status, task.due_date)} hover:scale-110 transition-transform`}
                      >
                        <Circle size={20} />
                      </button>
                      <div>
                        <h4 className="font-medium">{task.task_name}</h4>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {task.due_date < new Date().toISOString().split('T')[0] && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
                          <AlertTriangle size={12} className="mr-1" />
                          Overdue
                        </span>
                      )}
                      {task.due_date === new Date().toISOString().split('T')[0] && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          Due Today
                        </span>
                      )}
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Pending
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No pending tasks</p>
                </div>
              )
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-3">
              <Link
                href="/tasks"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center font-medium"
              >
                Manage Tasks
              </Link>
              <Link
                href="/tasks/reports"
                className={`flex-1 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} py-2 px-4 rounded-lg text-center font-medium`}
              >
                View Reports
              </Link>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 max-w-lg mx-auto">
          {buttonContainers.map((container) => (
            <div
              key={container.title}
              className={`bg-gradient-to-br ${container.gradient} rounded-2xl shadow-xl p-4 backdrop-blur-sm`}
            >
              <div className="grid grid-cols-2 gap-3">
                {container.buttons.map((button) => (
                  <Link
                    key={button.title}
                    href={button.href}
                    className={`${isDarkMode ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white/90 border-white/40 text-gray-800 hover:bg-white'} border-2 rounded-xl shadow-md p-3 text-center transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm`}
                  >
                    <span className="text-sm font-semibold tracking-wide">{button.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}