'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, Moon, Sun, X } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import Loading from '@/components/Loading'

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

type PaymentModalProps = {
  isOpen: boolean
  onClose: () => void
  employeeId: number
  accounts: CashBankAccount[]
  payment: Payment
  onPaymentChange: (employeeId: number, field: string, value: string | number) => void
}

const PaymentModal = ({ isOpen, onClose, employeeId, accounts, payment, onPaymentChange }: PaymentModalProps) => {
  const { isDarkMode } = useDarkMode()
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-96 relative`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'}`}
        >
          <X size={20} />
        </button>
        
        <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          Make Payment
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Amount
            </label>
            <input
              type="number"
              value={payment?.amount || ''}
              onChange={(e) => onPaymentChange(employeeId, 'amount', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Enter amount"
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Account
            </label>
            <select
              value={payment?.account_id || ''}
              onChange={(e) => onPaymentChange(employeeId, 'account_id', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Description
            </label>
            <input
              type="text"
              value={payment?.description || ''}
              onChange={(e) => onPaymentChange(employeeId, 'description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Payment description"
            />
          </div>
          
          <button
            onClick={onClose}
            className={`w-full py-2 px-4 rounded-md ${
              isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            } text-white font-medium`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EmployeeDailyAccounts() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [accounts, setAccounts] = useState<CashBankAccount[]>([])
  const [payments, setPayments] = useState<{ [key: number]: Payment }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [modalEmployeeId, setModalEmployeeId] = useState<number | null>(null)

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
    setModalEmployeeId(prev => prev === employeeId ? null : employeeId)
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
      setModalEmployeeId(null)
    } catch (error) {
      console.error('Error submitting entries:', error)
      alert(`Failed to submit entries. Error: ${(error as Error).message}`)
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
              onClick={() => toggleDarkMode()}
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
          <Loading message="Loading employee entries..." size="lg" />
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
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {entry.employee_name}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Total: ₹{Math.round(entry.total_amount)}
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => togglePaymentInput(entry.employee_id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                              isDarkMode 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-green-500 hover:bg-green-600'
                            } text-white`}
                          >
                            Payment
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex gap-3">
                          <div className={`p-1 rounded border ${isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-50 border-gray-200'}`}>
                            <input
                              type="number"
                              step="1"
                              value={entry.daily_wage || ''}
                              onChange={(e) => handleEntryChange(entry.employee_id, 'daily_wage', parseInt(e.target.value) || 0)}
                              className={`w-16 px-2 py-1 border-0 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-center ${
                                isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                              }`}
                              placeholder="Wage"
                            />
                          </div>
                          <div className={`p-1 rounded border ${isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-50 border-gray-200'}`}>
                            <input
                              type="number"
                              step="1"
                              value={entry.daily_beta || ''}
                              onChange={(e) => handleEntryChange(entry.employee_id, 'daily_beta', parseInt(e.target.value) || 0)}
                              className={`w-16 px-2 py-1 border-0 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-center ${
                                isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                              }`}
                              placeholder="Beta"
                            />
                          </div>
                          <div className={`p-1 rounded border ${isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-50 border-gray-200'}`}>
                            <input
                              type="number"
                              step="1"
                              value={entry.incentive_amount || ''}
                              onChange={(e) => handleEntryChange(entry.employee_id, 'incentive_amount', parseInt(e.target.value) || 0)}
                              className={`w-16 px-2 py-1 border-0 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-center ${
                                isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                              }`}
                              placeholder="Load"
                            />
                          </div>
                        </div>
                      </div>

                      {payments[entry.employee_id]?.amount > 0 && (
                        <div className="mt-2 text-sm text-green-600 font-medium">
                          Payment: ₹{Math.round(payments[entry.employee_id].amount)} via {payments[entry.employee_id].payment_method}
                        </div>
                      )}
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

      <PaymentModal
        isOpen={modalEmployeeId !== null}
        onClose={() => setModalEmployeeId(null)}
        employeeId={modalEmployeeId || 0}
        accounts={accounts}
        payment={payments[modalEmployeeId || 0] || {}}
        onPaymentChange={handlePaymentChange}
      />
    </div>
  )
}