'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Moon, Sun, Eye, Calendar, User, List, Grid} from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import Loading from '@/components/Loading'

type Employee = {
  id: number
  name: string
  role: string
  current_balance: number
  phone_number: string
  date_of_joining: string
  is_active: boolean
}

type LedgerEntry = {
  id: number
  date: string
  description: string
  debit: number
  credit: number
  transaction_type: string
  balance: number
  reference_id?: number
}

type EmployeeLedgerData = {
  employee: Employee
  from_date?: string
  to_date?: string
  opening_balance?: number
  closing_balance?: number
  ledger_entries: LedgerEntry[]
}

type DailyTransactionSummary = {
  date: string
  total_debit: number
  total_credit: number
  transactions: LedgerEntry[]
}

export default function EmployeeLedgerReport() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [totalOutstanding, setTotalOutstanding] = useState<number>(0)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [ledgerData, setLedgerData] = useState<EmployeeLedgerData | null>(null)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLedgerLoading, setIsLedgerLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [showInactive, setShowInactive] = useState(false)
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('compact')
  const [selectedDayTransactions, setSelectedDayTransactions] = useState<LedgerEntry[] | null>(null)
  const [showModal, setShowModal] = useState(false)

  const fetchEmployeesSummary = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}employee-ledger/`)
      if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      setEmployees(data.employees || [])
      setTotalOutstanding(data.total_outstanding || 0)
    } catch (error) {
      console.error('Error fetching employees:', error)
      setError(`Failed to load employees. Error: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployeesSummary()
  }, [fetchEmployeesSummary])

  useEffect(() => {
    const filtered = employees.filter(emp => showInactive || emp.is_active)
    setFilteredEmployees(filtered)
    const total = filtered.reduce((sum, emp) => sum + emp.current_balance, 0)
    setTotalOutstanding(total)
  }, [employees, showInactive])

  const fetchEmployeeLedger = useCallback(async (employeeId: number, from: string, to: string) => {
    if (!from || !to) {
      alert('Please select both from and to dates')
      return
    }
    
    setIsLedgerLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}employee-ledger/?employee_id=${employeeId}&from_date=${from}&to_date=${to}`
      )
      if (!response.ok) {
        throw new Error(`Failed to fetch ledger: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      setLedgerData(data)
    } catch (error) {
      console.error('Error fetching ledger:', error)
      alert(`Failed to load ledger. Error: ${(error as Error).message}`)
    } finally {
      setIsLedgerLoading(false)
    }
  }, [])

  const handleViewLedger = (employee: Employee) => {
    setSelectedEmployee(employee)
    setLedgerData(null)
    
    // Set default date range to current month
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    const fromDateStr = firstDay.toISOString().split('T')[0]
    const toDateStr = lastDay.toISOString().split('T')[0]
    
    setFromDate(fromDateStr)
    setToDate(toDateStr)
  }

  const handleGenerateLedger = () => {
    if (selectedEmployee) {
      fetchEmployeeLedger(selectedEmployee.id, fromDate, toDate)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'daily_entry': return 'bg-blue-100 text-blue-800'
      case 'payment': return 'bg-green-100 text-green-800'
      case 'adjustment': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-red-600' // Employee is owed money
    if (balance < 0) return 'text-green-600' // Employee owes money
    return 'text-gray-600'
  }

  const groupTransactionsByDate = (entries: LedgerEntry[]): DailyTransactionSummary[] => {
    const grouped = entries.reduce((acc, entry) => {
      const date = entry.date
      if (!acc[date]) {
        acc[date] = {
          date,
          total_debit: 0,
          total_credit: 0,
          transactions: []
        }
      }
      acc[date].total_debit += entry.debit
      acc[date].total_credit += entry.credit
      acc[date].transactions.push(entry)
      return acc
    }, {} as Record<string, DailyTransactionSummary>)

    return Object.values(grouped).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const handleDayClick = (transactions: LedgerEntry[]) => {
    setSelectedDayTransactions(transactions)
    setShowModal(true)
  }

  const formatCompactDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold text-blue-600">Employee Ledger Reports</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`p-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title={showInactive ? 'Hide Inactive' : 'Show Inactive'}
            >
              <Eye size={20} className={showInactive ? 'text-blue-500' : ''} />
              <span className="hidden md:inline ml-2">{showInactive ? 'Hide Inactive' : 'Show Inactive'}</span>
            </button>
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

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <Loading message="Loading employee data..." size="lg" />
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Employee Summary Section */}
            {!selectedEmployee && (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <User className="mr-2" size={24} />
                    <span className="text-sm font-medium">Total Outstanding: </span>
                    <span className={`ml-2 text-lg font-bold ${getBalanceColor(totalOutstanding)}`}>
                      {formatCurrency(totalOutstanding)}
                    </span>
                  </div>
                </div>

                {filteredEmployees.length === 0 ? (
                  <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                    No {showInactive ? '' : 'active '}employees found.
                  </div>
                ) : (
                  <>
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className={`w-full text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">Employee</th>
                            <th className="px-4 py-3 text-right font-medium">Current Balance</th>
                            <th className="px-4 py-3 text-center font-medium w-24">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredEmployees.map(employee => (
                            <tr key={employee.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                              <td className="px-4 py-3">
                                <div className="font-medium">{employee.name}</div>
                              </td>
                              <td className={`px-4 py-3 text-right font-medium ${getBalanceColor(employee.current_balance)}`}>
                                {formatCurrency(employee.current_balance)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => handleViewLedger(employee)}
                                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-2">
                      {filteredEmployees.map(employee => (
                        <div 
                          key={employee.id} 
                          className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3 flex items-center justify-between`}
                        >
                          <div className="flex items-center gap-4">
                            <span className="font-medium">{employee.name}</span>
                            <span className={`font-medium ${getBalanceColor(employee.current_balance)}`}>
                              {formatCurrency(employee.current_balance)}
                            </span>
                          </div>
                          <button
                            onClick={() => handleViewLedger(employee)}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Date Selection Section */}
            {selectedEmployee && (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold">{selectedEmployee.name}</h2>
                    <span className={`font-medium ${getBalanceColor(selectedEmployee.current_balance)}`}>
                      {formatCurrency(selectedEmployee.current_balance)}
                    </span>
                  </div>
                  <button
                    onClick={() => {setSelectedEmployee(null); setLedgerData(null)}}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } transition-colors`}
                  >
                    ← Back
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label htmlFor="fromDate" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      From Date
                    </label>
                    <input
                      type="date"
                      id="fromDate"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="toDate" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      To Date
                    </label>
                    <input
                      type="date"
                      id="toDate"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-2 items-end">
                    <button
                      onClick={handleGenerateLedger}
                      disabled={isLedgerLoading || !fromDate || !toDate}
                      className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center ${
                        isLedgerLoading || !fromDate || !toDate
                          ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                          : 'bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                      }`}
                    >
                      <Calendar className="mr-2" size={16} />
                      {isLedgerLoading ? 'Generating...' : 'Generate Ledger'}
                    </button>
                  </div>
                </div>

                {/* View Mode Toggle */}
                {ledgerData && (
                  <div className="mb-4 flex justify-center">
                    <div className={`inline-flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <button
                        onClick={() => setViewMode('compact')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${
                          viewMode === 'compact'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Grid className="mr-2" size={16} />
                        Compact
                      </button>
                      <button
                        onClick={() => setViewMode('detailed')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${
                          viewMode === 'detailed'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <List className="mr-2" size={16} />
                        Detailed
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ledger Details Section */}
            {ledgerData && (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-6`}>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Ledger Details</h3>
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} flex justify-between items-center`}>
                    <div>
                      <p className="text-sm font-medium">Opening Balance</p>
                      <p className={`text-lg font-bold ${getBalanceColor(ledgerData.opening_balance || 0)}`}>
                        {formatCurrency(ledgerData.opening_balance || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Closing Balance</p>
                      <p className={`text-lg font-bold ${getBalanceColor(ledgerData.closing_balance || 0)}`}>
                        {formatCurrency(ledgerData.closing_balance || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {ledgerData.ledger_entries.length === 0 ? (
                  <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                    No transactions found for the selected date range.
                  </div>
                ) : (
                  <>
                    {/* Compact View */}
                    {viewMode === 'compact' && (
                      <div className="space-y-2">
                        {groupTransactionsByDate(ledgerData.ledger_entries).map((dailySummary, index) => (
                          <div
                            key={index}
                            onClick={() => handleDayClick(dailySummary.transactions)}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <span className="font-medium text-sm">
                              {formatCompactDate(dailySummary.date)}
                            </span>
                            <div className="flex items-center gap-4 text-sm">
                              {dailySummary.total_debit > 0 && (
                                <span className="text-red-600 font-medium">
                                  {Math.round(dailySummary.total_debit)}
                                </span>
                              )}
                              {dailySummary.total_credit > 0 && (
                                <span className="text-green-600 font-medium">
                                  {Math.round(dailySummary.total_credit)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Detailed View */}
                    {viewMode === 'detailed' && (
                      <>
                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className={`w-full text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                              <tr>
                                <th className="px-4 py-3 text-left font-medium">Date</th>
                                <th className="px-4 py-3 text-left font-medium">Description</th>
                                <th className="px-4 py-3 text-left font-medium">Type</th>
                                <th className="px-4 py-3 text-right font-medium">Debit</th>
                                <th className="px-4 py-3 text-right font-medium">Credit</th>
                                <th className="px-4 py-3 text-right font-medium">Balance</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {ledgerData.ledger_entries.map(entry => (
                                <tr key={entry.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                                  <td className="px-4 py-3">{formatDate(entry.date)}</td>
                                  <td className="px-4 py-3 max-w-md">
                                    <div className="truncate" title={entry.description}>
                                      {entry.description}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${getTransactionTypeColor(entry.transaction_type)}`}>
                                      {entry.transaction_type.replace('_', ' ')}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    {entry.debit > 0 && (
                                      <span className="text-red-600 font-medium">
                                        {formatCurrency(entry.debit)}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    {entry.credit > 0 && (
                                      <span className="text-green-600 font-medium">
                                        {formatCurrency(entry.credit)}
                                      </span>
                                    )}
                                  </td>
                                  <td className={`px-4 py-3 text-right font-medium ${getBalanceColor(entry.balance)}`}>
                                    {formatCurrency(entry.balance)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile View - Card Layout */}
                        <div className="md:hidden space-y-2">
                          {ledgerData.ledger_entries.map(entry => (
                            <div 
                              key={entry.id} 
                              className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-sm">{formatDate(entry.date)}</span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${getTransactionTypeColor(entry.transaction_type)}`}>
                                  {entry.transaction_type.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-sm mb-2 line-clamp-2">{entry.description}</p>
                              <div className="flex justify-between items-center text-sm">
                                <div>
                                  {entry.debit > 0 && (
                                    <span className="text-red-600 font-medium">Dr: {formatCurrency(entry.debit)}</span>
                                  )}
                                  {entry.credit > 0 && (
                                    <span className="text-green-600 font-medium">Cr: {formatCurrency(entry.credit)}</span>
                                  )}
                                </div>
                                <span className={`font-medium ${getBalanceColor(entry.balance)}`}>
                                  {formatCurrency(entry.balance)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal for Transaction Breakup */}
      {showModal && selectedDayTransactions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden`}>
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
              <h3 className="text-lg font-semibold">
                Transaction Details - {formatCompactDate(selectedDayTransactions[0].date)}
              </h3>
              <button
                onClick={() => {setShowModal(false); setSelectedDayTransactions(null)}}
                className={`text-2xl font-bold ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
              {selectedDayTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTransactionTypeColor(transaction.transaction_type)}`}>
                      {transaction.transaction_type.replace('_', ' ')}
                    </span>
                    <div className="text-sm font-medium">
                      {transaction.debit > 0 && (
                        <span className="text-red-600">Dr: ₹{Math.round(transaction.debit)}</span>
                      )}
                      {transaction.credit > 0 && (
                        <span className="text-green-600">Cr: ₹{Math.round(transaction.credit)}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {transaction.description}
                  </p>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${getBalanceColor(transaction.balance)}`}>
                      Balance: {formatCurrency(transaction.balance)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
              <div className="text-sm">
                <span className="font-medium">Total: </span>
                <span className="text-red-600 mr-3">
                  Dr: ₹{Math.round(selectedDayTransactions.reduce((sum, t) => sum + t.debit, 0))}
                </span>
                <span className="text-green-600">
                  Cr: ₹{Math.round(selectedDayTransactions.reduce((sum, t) => sum + t.credit, 0))}
                </span>
              </div>
              <button
                onClick={() => {setShowModal(false); setSelectedDayTransactions(null)}}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } transition-colors`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
