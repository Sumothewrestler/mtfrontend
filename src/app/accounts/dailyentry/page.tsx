'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, Moon, Sun, Calendar, FileText, Database, DollarSign, } from 'lucide-react'

type DailyEntry = {
  id?: number
  employee_id: number
  employee_name: string
  employee_role: string
  daily_wage: number
  daily_beta: number
  incentive_amount: number
  total_amount: number
  attendance_status: string
  current_balance: number
}

type CashBankAccount = {
  id: number
  name: string
  account_type: string
  current_balance: number
}

type Payment = {
  employee_id: number
  amount: number
  payment_method: string
  account_id: number
  description: string
}

export default function EmployeeDailyAccounts() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [accounts, setAccounts] = useState<CashBankAccount[]>([])
  const [payments, setPayments] = useState<{ [key: number]: Payment }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showPaymentFor, setShowPaymentFor] = useState<number | null>(null)

  const fetchDailyEntries = useCallback(async (selectedDate: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}employee-daily-entries/?date=${selectedDate}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch daily entries: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      setEntries(data.entries || [])
    } catch (error) {
      console.error('Error fetching daily entries:', error)
      setError(`Failed to load daily entries. Error: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchCashBankAccounts = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-accounts/`)
      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      setAccounts(data)
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }, [])

  useEffect(() => {
    fetchCashBankAccounts()
  }, [fetchCashBankAccounts])

  useEffect(() => {
    if (date) {
      fetchDailyEntries(date)
    }
  }, [date, fetchDailyEntries])

  const handleEntryChange = (employeeId: number, field: string, value: number) => {
    setEntries(prev => prev.map(entry => {
      if (entry.employee_id === employeeId) {
        const updatedEntry = { ...entry, [field]: value }
        updatedEntry.total_amount = updatedEntry.daily_wage + updatedEntry.daily_beta + updatedEntry.incentive_amount
        return updatedEntry
      }
      return entry
    }))
  }

  const handlePaymentChange = (employeeId: number, field: string, value: string | number) => {
    setPayments(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        employee_id: employeeId,
        [field]: value,
        payment_method: field === 'account_id' ? 
          (accounts.find(acc => acc.id === Number(value))?.account_type || 'Cash') : 
          prev[employeeId]?.payment_method || 'Cash'
      }
    }))
  }

  const togglePaymentInput = (employeeId: number) => {
    setShowPaymentFor(prev => prev === employeeId ? null : employeeId)
    if (!payments[employeeId]) {
      setPayments(prev => ({
        ...prev,
        [employeeId]: {
          employee_id: employeeId,
          amount: 0,
          payment_method: 'Cash',
          account_id: accounts.find(acc => acc.account_type === 'Cash')?.id || 0,
          description: ''
        }
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (new Date(date) > new Date()) {
      alert('You cannot submit entries for a future date.')
      return
    }

    try {
      const submissionData = {
        date,
        entries: entries.map(entry => ({
          employee_id: entry.employee_id,
          daily_wage: entry.daily_wage,
          daily_beta: entry.daily_beta,
          incentive_amount: entry.incentive_amount
        })),
        payments: Object.values(payments).filter(payment => payment.amount > 0)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}employee-daily-entries/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        throw new Error(`Failed to submit entries: ${response.status} ${response.statusText}`)
      }

      alert('Daily entries and payments submitted successfully!')
      // Refresh the data
      fetchDailyEntries(date)
      setPayments({})
      setShowPaymentFor(null)
    } catch (error) {
      console.error('Error submitting entries:', error)
      alert(`Failed to submit entries. Error: ${(error as Error).message}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800'
      case 'absent': return 'bg-red-100 text-red-800'
      case 'half-day': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Employee Daily Accounts</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link 
              href="/employees/daily-accounts/view"
              className={`flex items-center p-2 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              <Eye size={16} className="mr-1" />
              <span className="text-sm hidden sm:inline">View History</span>
            </Link>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
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
              <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                Employee Daily Entries
              </h2>

              {entries.length === 0 ? (
                <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                  No active employees found for this date.
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map(entry => (
                    <div 
                      key={entry.employee_id} 
                      className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-md transition-all duration-300`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                        <div className="mb-4 lg:mb-0 lg:w-1/4">
                          <div className="font-medium flex items-center">
                            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {entry.employee_name}
                            </span>
                            <span className="ml-2 text-sm text-red-600 font-medium">
                              ₹{entry.current_balance.toFixed(0)}
                            </span>
                          </div>
                          <div className="flex items-center mt-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(entry.attendance_status)}`}>
                              {entry.attendance_status}
                            </span>
                          </div>
                        </div>

                        <div className="lg:w-2/3">
                          <div className="mb-3">
                            {/* Title row */}
                            <div className="flex gap-3 mb-2">
                              <div className="w-16 text-center">
                                <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Wage
                                </span>
                              </div>
                              <div className="w-16 text-center">
                                <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Beta
                                </span>
                              </div>
                              <div className="w-16 text-center">
                                <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Load
                                </span>
                              </div>
                            </div>
                            {/* Input row with subtle containers */}
                            <div className="flex gap-3">
                              <div className={`p-1 rounded border ${isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-50 border-gray-200'}`}>
                                <input
                                  type="number"
                                  step="1"
                                  value={Math.round(entry.daily_wage)}
                                  onChange={(e) => handleEntryChange(entry.employee_id, 'daily_wage', parseInt(e.target.value) || 0)}
                                  className={`w-16 px-2 py-1 border-0 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-center ${
                                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                                  }`}
                                />
                              </div>
                              <div className={`p-1 rounded border ${isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-50 border-gray-200'}`}>
                                <input
                                  type="number"
                                  step="1"
                                  value={Math.round(entry.daily_beta)}
                                  onChange={(e) => handleEntryChange(entry.employee_id, 'daily_beta', parseInt(e.target.value) || 0)}
                                  className={`w-16 px-2 py-1 border-0 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-center ${
                                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                                  }`}
                                />
                              </div>
                              <div className={`p-1 rounded border ${isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-50 border-gray-200'}`}>
                                <input
                                  type="number"
                                  step="1"
                                  value={Math.round(entry.incentive_amount)}
                                  onChange={(e) => handleEntryChange(entry.employee_id, 'incentive_amount', parseInt(e.target.value) || 0)}
                                  className={`w-16 px-2 py-1 border-0 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-center ${
                                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className={`text-sm font-medium mr-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Total: ₹{Math.round(entry.total_amount)}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePaymentInput(entry.employee_id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${
                                  showPaymentFor === entry.employee_id
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105'
                                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transform hover:scale-105'
                                }`}
                              >
                                <DollarSign size={16} className="mr-2" />
                                {showPaymentFor === entry.employee_id ? 'Hide Payment' : 'Make Payment'}
                              </button>
                            </div>
                            
                            {payments[entry.employee_id]?.amount > 0 && (
                              <span className="text-sm text-green-600 font-medium">
                                Payment: ₹{Math.round(payments[entry.employee_id].amount)} via {payments[entry.employee_id].payment_method}
                              </span>
                            )}
                          </div>

                          {showPaymentFor === entry.employee_id && (
                            <div className={`mt-3 p-3 border rounded-md ${isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-50 border-gray-200'}`}>
                              <div className="flex items-center gap-4 mb-3">
                                <div className="flex items-center gap-2">
                                  <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Amount:
                                  </label>
                                  <input
                                    type="number"
                                    step="1"
                                    value={Math.round(payments[entry.employee_id]?.amount || 0)}
                                    onChange={(e) => handlePaymentChange(entry.employee_id, 'amount', parseInt(e.target.value) || 0)}
                                    className={`w-20 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Account:
                                  </label>
                                  <select
                                    value={payments[entry.employee_id]?.account_id || ''}
                                    onChange={(e) => handlePaymentChange(entry.employee_id, 'account_id', parseInt(e.target.value))}
                                    className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                  >
                                    <option value="">Select Account</option>
                                    {accounts.map(account => (
                                      <option key={account.id} value={account.id}>
                                        {account.name} (₹{Math.round(account.current_balance)})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Description
                                </label>
                                <input
                                  type="text"
                                  value={payments[entry.employee_id]?.description || ''}
                                  onChange={(e) => handlePaymentChange(entry.employee_id, 'description', e.target.value)}
                                  placeholder="Payment description"
                                  className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || entries.length === 0}
              className={`w-full py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center ${
                isLoading || entries.length === 0
                  ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                  : isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Save size={20} className="mr-2" />
              Submit Daily Entries & Payments
            </button>
          </form>
        )}
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg md:hidden`}>
        <div className="flex justify-around">
          <Link href="/daysheet/daysheetmain" className={`flex flex-col items-center py-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            <Calendar className="h-6 w-6 mb-1" />
            <span className="text-xs">Day Sheet</span>
          </Link>
          <Link href="/reports/reportsmain" className={`flex flex-col items-center py-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            <FileText className="h-6 w-6 mb-1" />
            <span className="text-xs">Reports</span>
          </Link>
          <Link href="/masters/mastermain" className={`flex flex-col items-center py-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            <Database className="h-6 w-6 mb-1" />
            <span className="text-xs">Masters</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}