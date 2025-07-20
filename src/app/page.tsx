'use client'

import React, { useState, useEffect } from 'react'
import { DollarSign, Moon, Sun, Circle, Clock, Plus, X, Tag as TagIcon, Filter, BellRing, BellOff } from 'lucide-react'
import Link from 'next/link'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface DashboardData {
  previous_day_sales: number
  last_7_days_avg_sales: number
}

interface TaskTag {
  id: number
  name: string
  created_at: string
  updated_at: string
}

interface Task {
  id: number
  task_name: string
  status: 'Pending' | 'Done'
  due_date: string
  task_tag?: number
  task_tag_name?: string
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
  const [taskTags, setTaskTags] = useState<TaskTag[]>([])
  const [showNewTagForm, setShowNewTagForm] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTask, setNewTask] = useState({
    task_name: '',
    task_tag: undefined as number | undefined,
    due_date: new Date().toISOString().split('T')[0]
  })
  const [tagFilter, setTagFilter] = useState<number | null>(null)
  const [showTagFilter, setShowTagFilter] = useState(false)
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null)

  const generalButtonContainers = [
    {
      title: 'Daily Tasks',
      gradient: 'from-blue-500 via-purple-500 to-purple-600',
      buttons: [
        { title: 'Attendance', href: '/daysheet/attendance' },
        { title: 'Labour A/c', href: '/daysheet/employee' },
      ]
    },
    {
      title: 'Operations',
      gradient: 'from-emerald-400 via-teal-500 to-green-600',
      buttons: [
        { title: 'General Accounts', href: '/daysheet/accounts' },
        { title: 'Receipt & Payment', href: '/daysheet/accounts/payments' },
      ]
    },
    {
      title: 'Management',
      gradient: 'from-orange-400 via-amber-500 to-yellow-500',
      buttons: [
        { title: 'Follow Up', href: '/daysheet/followup' },
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
        { title: 'Hour Reading', href: '/daysheet/tractor-hour' },
        { title: 'Booking', href: '/daysheet/advancebooking' },
      ]
    },
    {
      title: 'Financial Operations',
      gradient: 'from-orange-400 via-amber-500 to-yellow-500',
      buttons: [
        { title: 'Demand', href: '/daysheet/demand' },
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

    const fetchTaskTags = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}task-tags/`)
        if (response.ok) {
          const data = await response.json()
          setTaskTags(data)
        }
      } catch (error) {
        console.error('Error fetching task tags:', error)
      }
    }

    const fetchVapidPublicKey = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}vapid-public-key/`);
        if (!response.ok) {
          throw new Error('Failed to fetch VAPID public key');
        }
        const data = await response.json();
        setVapidPublicKey(data.publicKey);
      } catch (error) {
        console.error('Error fetching VAPID public key:', error);
      }
    };

    fetchDashboardData();
    fetchTaskData();
    fetchCashBankAccounts();
    fetchTaskTags();
    fetchVapidPublicKey();

    // Check initial notification permission status
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const refreshTaskTags = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}task-tags/`)
      if (response.ok) {
        const data = await response.json()
        setTaskTags(data)
      }
    } catch (error) {
      console.error('Error fetching task tags:', error)
    }
  }

  useEffect(() => {
    if (showTaskModal) {
      refreshTaskTags();
    }
  }, [showTaskModal]);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}task-tags/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() })
      })

      if (response.ok) {
        const newTagData = await response.json()
        setTaskTags([...taskTags, newTagData])
        setNewTask({ ...newTask, task_tag: newTagData.id })
        setNewTagName('')
        setShowNewTagForm(false)
      }
    } catch (error) {
      console.error('Error creating tag:', error)
    }
  }

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
        task_tag: undefined,
        due_date: new Date().toISOString().split('T')[0]
      });
      setShowTaskModal(false);
      setShowNewTagForm(false);
      setNewTagName('');

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
    let tasks = []

    if (currentTaskView === 'today') {
      tasks = taskData?.today_tasks.filter(task => task.status !== 'Done') || []
    } else {
      // Filter out today's tasks from pending and sort old to new
      const today = new Date().toISOString().split('T')[0]
      tasks = taskData?.pending_tasks
        .filter(task => task.due_date !== today)
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()) || []
    }

    // Apply tag filter if selected
    if (tagFilter !== null) {
      tasks = tasks.filter(task => task.task_tag === tagFilter)
    }

    return tasks
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTagFilter) {
        const target = event.target as Element
        if (!target.closest('.relative')) {
          setShowTagFilter(false)
        }
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showTagFilter])

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !vapidPublicKey) {
      console.warn('Push notifications not supported or VAPID key not available.');
      return;
    }

    try {
      const permissionResult = await Notification.requestPermission();
      setNotificationPermission(permissionResult); // Update permission state
      if (permissionResult !== 'granted') {
        console.warn('Notification permission not granted.');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to your backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}subscriptions/push/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // You'll need an Authorization header here for authenticated users
          // 'Authorization': `Bearer YOUR_AUTH_TOKEN_HERE` // Removed as per previous instruction for anonymous
        },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (response.ok) {
        console.log('Push subscription sent to backend successfully!');
      } else {
        console.error('Failed to send push subscription to backend.');
      }

    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  };

  // Helper function for VAPID key conversion
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-purple-900'}`}>
            METRO TRANSPORTS
          </h1>
          <div className="flex items-center space-x-2">
            {/* Notification Subscription Button */}
            {notificationPermission === 'granted' ? (
              <button
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-green-300' : 'bg-gray-200 text-green-800'}`}
                aria-label="Notifications enabled"
                title="Notifications Enabled"
              >
                <BellRing size={20} />
              </button>
            ) : (
              <button
                onClick={subscribeToPush}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-red-300' : 'bg-gray-200 text-red-800'}`}
                aria-label="Enable notifications"
                title="Enable Notifications"
                disabled={!vapidPublicKey} // Disable if VAPID key is not loaded yet
              >
                <BellOff size={20} />
              </button>
            )}

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

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">

        {/* Main Tab Navigation */}
        <div className="mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveMainTab('today')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeMainTab === 'today'
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
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeMainTab === 'cash-bank'
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
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeMainTab === 'accounts'
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
                <div className="flex space-x-2 items-center">
                  <button
                    onClick={() => setCurrentTaskView('today')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentTaskView === 'today'
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
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentTaskView === 'pending'
                        ? 'bg-orange-600 text-white'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    Pending ({taskData?.pending_tasks.filter(task => task.due_date !== new Date().toISOString().split('T')[0]).length || 0})
                  </button>

                  {/* Tag Filter Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowTagFilter(!showTagFilter)}
                      className={`p-1.5 rounded-lg transition-colors ${tagFilter !== null
                          ? 'bg-purple-600 text-white'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                      <Filter size={16} />
                    </button>

                    {/* Tag Filter Dropdown */}
                    {showTagFilter && (
                      <div className={`absolute top-full left-0 mt-1 z-20 rounded-lg shadow-lg border min-w-[120px] ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                        }`}>
                        <div className="p-2 space-y-1">
                          <button
                            onClick={() => {
                              setTagFilter(null)
                              setShowTagFilter(false)
                            }}
                            className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${tagFilter === null
                                ? 'bg-blue-600 text-white'
                                : isDarkMode
                                  ? 'hover:bg-gray-600'
                                  : 'hover:bg-gray-100'
                              }`}
                          >
                            All Tags
                          </button>
                          {taskTags.map((tag) => (
                            <button
                              key={tag.id}
                              onClick={() => {
                                setTagFilter(tag.id)
                                setShowTagFilter(false)
                              }}
                              className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${tagFilter === tag.id
                                  ? 'bg-blue-600 text-white'
                                  : isDarkMode
                                    ? 'hover:bg-gray-600'
                                    : 'hover:bg-gray-100'
                                }`}
                            >
                              {tag.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Updated New Button - Remove Plus icon */}
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
                >
                  New
                </button>
              </div>

              {/* Scrollable Task List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getDisplayTasks().length ? (
                  getDisplayTasks().map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
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
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-sm">{task.task_name}</h4>
                            {task.task_tag_name && (
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                {task.task_tag_name}
                              </span>
                            )}
                          </div>
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
                      className={`flex items-center justify-between p-3 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                        }`}
                    >
                      <div>
                        <h4 className="font-medium text-sm">{account.name}</h4>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          {account.account_type}
                        </p>
                      </div>
                      <div className={`text-right ${account.current_balance >= 0
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
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeSalesTab === 'today'
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
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeSalesTab === 'weekly'
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'general'
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'accounts'
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

      {/* New Task Modal with Tags */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">New Task</h3>
              <button
                onClick={() => {
                  setShowTaskModal(false)
                  setShowNewTagForm(false)
                  setNewTagName('')
                }}
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
                  onChange={(e) => setNewTask({ ...newTask, task_name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                    }`}
                  placeholder="Enter task name..."
                />
              </div>

              {/* Task Tags Section */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <TagIcon size={16} className="mr-1" />
                  Task Tag (Optional)
                </label>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {/* No Tag Option */}
                    <button
                      type="button"
                      onClick={() => setNewTask({ ...newTask, task_tag: undefined })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${newTask.task_tag === undefined
                          ? 'bg-gray-500 text-white'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                      No Tag
                    </button>

                    {/* Existing Tags */}
                    {taskTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => setNewTask({ ...newTask, task_tag: tag.id })}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${newTask.task_tag === tag.id
                            ? 'bg-blue-600 text-white'
                            : isDarkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                      >
                        {tag.name}
                      </button>
                    ))}

                    {/* Add New Tag Button */}
                    <button
                      type="button"
                      onClick={() => setShowNewTagForm(!showNewTagForm)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showNewTagForm
                          ? 'bg-green-600 text-white'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-dashed border-gray-500'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-dashed border-gray-400'
                        } flex items-center`}
                    >
                      <Plus size={14} className="mr-1" />
                      Add New
                    </button>
                  </div>

                  {/* New Tag Creation Form */}
                  {showNewTagForm && (
                    <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          placeholder="Enter tag name"
                          className={`flex-1 px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} text-sm`}
                        />
                        <button
                          type="button"
                          onClick={handleCreateTag}
                          disabled={!newTagName.trim()}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm"
                        >
                          Create
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewTagForm(false)
                            setNewTagName('')
                          }}
                          className={`px-3 py-2 rounded text-sm ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'}`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                    }`}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowTaskModal(false)
                  setShowNewTagForm(false)
                  setNewTagName('')
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium ${isDarkMode
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
                className={`w-full px-3 py-2 border rounded-lg ${isDarkMode
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
              className={`w-full py-2 px-4 rounded-lg font-medium ${isDarkMode
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