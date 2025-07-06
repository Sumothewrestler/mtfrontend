'use client'

import React, { useState, useEffect } from 'react'
import { DollarSign, Moon, Sun, Circle, Clock, Plus, X } from 'lucide-react'
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

interface CashBankAccount {
  id: number
  name: string
  account_type: string
  current_balance: number
  is_active: boolean
}

export default function Dashboard() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [taskData, setTaskData] = useState<TaskData | null>(null)
  const [cashBankAccounts, setCashBankAccounts] = useState<CashBankAccount[]>([])
  const [currentTaskView, setCurrentTaskView] = useState<'today' | 'pending'>('today')
  const [activeMainTab, setActiveMainTab] = useState<'today' | 'cash-bank' | 'accounts'>('today')
  const [activeSalesTab, setActiveSalesTab] = useState<'today' | 'weekly'>('today')
  const [activeTab, setActiveTab] = useState<'general' | 'accounts'>('general')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState({
    task_name: '',
    due_date: new Date().toISOString().split('T')[0]
  })

  const generalButtonContainers = [
    {
      title: 'Daily Tasks',
      gradient: 'from-blue-500 via-purple-500 to-purple-600',
      buttons: [
        { title: 'Attendance', href: '/daysheet/attendance' },
        { title: 'Follow Up', href: '/daysheet/followup' },
      ]
    },
    {
      title: 'Operations',
      gradient: 'from-emerald-400 via-teal-500 to-green-600',
      buttons: [
        { title: 'Hour Reading', href: '/daysheet/tractor-hour' },
        { title: 'Booking', href: '/daysheet/advancebooking' },
      ]
    },
    {
      title: 'Management',
      gradient: 'from-orange-400 via-amber-500 to-yellow-500',
      buttons: [
        { title: 'Demand', href: '/daysheet/demand' },
        { title: 'Daily Reports', href: '/reports/daily_reports' },
      ]
    }
  ]

  const accountsButtonContainers = [
    {
      title: 'Job Management',
      gradient: 'from-blue-500 via-purple-500 to-purple-600',
      buttons: [
        { title: 'Add Job', href: '/daysheet/jobsubmit' },
        { title: 'Sales Receipt', href: '/daysheet/receiptentry' },
      ]
    },
    {
      title: 'Account Management',
      gradient: 'from-emerald-400 via-teal-500 to-green-600',
      buttons: [
        { title: 'Labour A/c', href: '/daysheet/employee' },
        { title: 'Accounts', href: '/daysheet/accounts' },
      ]
    },
    {
      title: 'Financial Operations',
      gradient: 'from-orange-400 via-amber-500 to-yellow-500',
      buttons: [
        { title: 'Receipt & Payment', href: '/daysheet/accounts/payments' },
        { title: 'Cash & Bank', href: '/daysheet/accounts/cash-bank' },
      ]
    },
    {
      title: 'Finance & Reports',
      gradient: 'from-purple-500 via-pink-500 to-red-500',
      buttons: [
        { title: 'EMI', href: '/accounts/emi' },
        { title: 'Reports', href: '/accounts/reports' },
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

    const fetchCashBankAccounts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-accounts/`);
        if (!response.ok) throw new Error('Failed to fetch cash bank accounts');
        const data = await response.json();
        setCashBankAccounts(data);
      } catch (error) {
        console.error('Error fetching cash bank accounts:', error);
      }
    };
  
    fetchDashboardData();
    fetchTaskData();
    fetchCashBankAccounts();
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

  const handleCreateTask = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });
      
      if (!response.ok) throw new Error('Failed to create task');
      
      // Reset form and close modal
      setNewTask({
        task_name: '',
        due_date: new Date().toISOString().split('T')[0]
      });
      setShowTaskModal(false);
      
      // Refresh task data
      const taskResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tasks/today/`);
      if (taskResponse.ok) {
        const data = await taskResponse.json();
        setTaskData(data);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDateChange = async (newDate: string) => {
    if (!selectedTask) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tasks/${selectedTask.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ due_date: newDate }),
      });
      
      if (!response.ok) throw new Error('Failed to update task date');
      
      setShowDateModal(false);
      setSelectedTask(null);
      
      // Refresh task data
      const taskResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tasks/today/`);
      if (taskResponse.ok) {
        const data = await taskResponse.json();
        setTaskData(data);
      }
    } catch (error) {
      console.error('Error updating task date:', error);
    }
  };

  const getTaskStatusColor = (status: string, dueDate: string) => {
    if (status === 'Done') return 'text-green-600'
    const today = new Date().toISOString().split('T')[0]
    if (dueDate < today) return 'text-red-600'
    if (dueDate === today) return 'text-orange-600'
    return 'text-blue-600'
  };

  const getDisplayTasks = () => {
    if (currentTaskView === 'today') {
      return taskData?.today_tasks.filter(task => task.status !== 'Done') || []
    }
    // Filter out today's tasks from pending and sort old to new
    const today = new Date().toISOString().split('T')[0]
    return taskData?.pending_tasks
      .filter(task => task.due_date !== today)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()) || []
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
        
        {/* Main Tab Navigation */}
        <div className="mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveMainTab('today')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeMainTab === 'today'
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setActiveMainTab('cash-bank')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeMainTab === 'cash-bank'
                  ? 'bg-green-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cash Bank
            </button>
            <button
              onClick={() => setActiveMainTab('accounts')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeMainTab === 'accounts'
                  ? 'bg-purple-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Accounts
            </button>
          </div>
        </div>

        {/* Today Tab Content */}
        {activeMainTab === 'today' && (
          <>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 mb-6`}>
              <div className="flex justify-between items-center mb-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentTaskView('today')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentTaskView === 'today'
                        ? 'bg-blue-600 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Today ({taskData?.today_tasks.filter(task => task.status !== 'Done').length || 0})
                  </button>
                  <button
                    onClick={() => setCurrentTaskView('pending')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentTaskView === 'pending'
                        ? 'bg-orange-600 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Pending ({taskData?.pending_tasks.filter(task => task.due_date !== new Date().toISOString().split('T')[0]).length || 0})
                  </button>
                </div>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  New
                </button>
              </div>

              {/* Scrollable Task List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getDisplayTasks().length ? (
                  getDisplayTasks().map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
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
                          <h4 className="font-medium text-sm">{task.task_name}</h4>
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowDateModal(true);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {new Date(task.due_date).toLocaleDateString()}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Clock size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{currentTaskView === 'today' ? 'No tasks for today' : 'No pending tasks'}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Cash Bank Tab Content */}
        {activeMainTab === 'cash-bank' && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 mb-6`}>
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {cashBankAccounts.length ? (
                cashBankAccounts
                  .filter(account => account.account_type === 'Cash' || account.account_type === 'Bank')
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((account) => (
                    <div
                      key={account.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div>
                        <h4 className="font-medium text-sm">{account.name}</h4>
                        <p className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {account.account_type}
                        </p>
                      </div>
                      <div className={`text-right ${
                        account.current_balance >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        <p className="font-semibold">
                          ₹ {Math.abs(account.current_balance).toFixed(2)}
                        </p>
                        <p className="text-xs opacity-75">
                          {account.current_balance >= 0 ? 'CR' : 'DR'}
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <DollarSign size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No accounts available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Accounts Tab Content */}
        {activeMainTab === 'accounts' && (
          <>
            {/* Combined Sales Card with Tabs */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 mb-6`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <DollarSign className="mr-2" size={20} />
                  Sales Overview
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveSalesTab('today')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeSalesTab === 'today'
                        ? 'bg-blue-600 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setActiveSalesTab('weekly')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeSalesTab === 'weekly'
                        ? 'bg-green-600 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Weekly
                  </button>
                </div>
              </div>
              
              <div className="text-center">
                {activeSalesTab === 'today' ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Previous Day Sales</p>
                    <p className="text-2xl font-bold">
                      ₹{dashboardData?.previous_day_sales.toFixed(2) || '0.00'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last 7 Days Average</p>
                    <p className="text-2xl font-bold">
                      ₹{dashboardData?.last_7_days_avg_sales.toFixed(2) || '0.00'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Tab Navigation for Actions */}
        <div className="mb-6">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4`}>
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'general'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab('accounts')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'accounts'
                    ? 'bg-green-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Accounts
              </button>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 gap-4 max-w-lg mx-auto">
              {activeTab === 'general' ? (
                generalButtonContainers.map((container) => (
                  <div
                    key={container.title}
                    className={`bg-gradient-to-br ${container.gradient} rounded-xl shadow-lg p-3 backdrop-blur-sm`}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {container.buttons.map((button) => (
                        <Link
                          key={button.title}
                          href={button.href}
                          className={`${isDarkMode ? 'bg-black/60 border-gray-600 text-white hover:bg-black/80' : 'bg-white/90 border-white/40 text-gray-800 hover:bg-white'} border-2 rounded-lg shadow-md p-2.5 text-center transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm`}
                        >
                          <span className="text-xs font-semibold tracking-wide">{button.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                accountsButtonContainers.map((container) => (
                  <div
                    key={container.title}
                    className={`bg-gradient-to-br ${container.gradient} rounded-xl shadow-lg p-3 backdrop-blur-sm`}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {container.buttons.map((button) => (
                        <Link
                          key={button.title}
                          href={button.href}
                          className={`${isDarkMode ? 'bg-black/60 border-gray-600 text-white hover:bg-black/80' : 'bg-white/90 border-white/40 text-gray-800 hover:bg-white'} border-2 rounded-lg shadow-md p-2.5 text-center transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm`}
                        >
                          <span className="text-xs font-semibold tracking-wide">{button.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* New Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-6 w-full max-w-md`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">New Task</h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Task Name</label>
                <input
                  type="text"
                  value={newTask.task_name}
                  onChange={(e) => setNewTask({...newTask, task_name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter task name..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowTaskModal(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTask.task_name.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Change Modal */}
      {showDateModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-6 w-full max-w-sm`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Change Due Date</h3>
              <button
                onClick={() => {
                  setShowDateModal(false);
                  setSelectedTask(null);
                }}
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Task: {selectedTask.task_name}</p>
              <p className="text-xs text-gray-400 mb-4">
                Current: {new Date(selectedTask.due_date).toLocaleDateString()}
              </p>
              <input
                type="date"
                defaultValue={selectedTask.due_date}
                onChange={(e) => {
                  if (e.target.value) {
                    handleDateChange(e.target.value);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
            
            <button
              onClick={() => {
                setShowDateModal(false);
                setSelectedTask(null);
              }}
              className={`w-full py-2 px-4 rounded-lg font-medium ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}