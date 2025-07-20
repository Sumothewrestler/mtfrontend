'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Moon, Sun, ArrowLeft, FileText, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface Ledger {
  id: number
  business: number
  business_name: string
  name: string
  category: 'Expense' | 'Income' | 'Others'
  category_display: string
  created_at: string
  updated_at: string
}

interface Transaction {
  id: number
  date: string
  business: number
  business_name: string
  ledger: number
  ledger_name: string
  amount: string
  status: 'Paid' | 'Partially Paid' | 'Unpaid'
  paid_amount: string | null
  payment_account: number | null
  payment_account_name: string | null
  note: string
  created_at: string
}

interface TransactionEntry {
  date: string
  description: string
  debit: number
  credit: number
  balance: number
  reference: string
}

export default function LedgerDetailReportPage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const params = useParams()
  const ledgerId = params.id as string

  // State for filters
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // State for data
  const [ledger, setLedger] = useState<Ledger | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [entries, setEntries] = useState<TransactionEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openingBalance] = useState(0)
  const [closingBalance, setClosingBalance] = useState(0)

  // API Base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  // Set default date range (current month)
  useEffect(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    setFromDate(firstDay.toISOString().split('T')[0])
    setToDate(lastDay.toISOString().split('T')[0])
  }, [])

  // Memoize fetch functions to prevent unnecessary re-renders
  const fetchLedgerDetails = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}ledgers/${ledgerId}/`)
      if (response.ok) {
        const data = await response.json()
        setLedger(data)
      }
    } catch (error) {
      console.error('Error fetching ledger details:', error)
    }
  }, [API_BASE_URL, ledgerId])

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `${API_BASE_URL}transactions/?ledger=${ledgerId}&date_from=${fromDate}&date_to=${toDate}`
      )
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [API_BASE_URL, ledgerId, fromDate, toDate])

  const processTransactions = useCallback(() => {
    if (!ledger) return

    const processedEntries: TransactionEntry[] = []
    let runningBalance = openingBalance

    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    sortedTransactions.forEach((transaction) => {
      let debit = 0
      let credit = 0

      // Parse amounts as numbers
      const transactionAmount = parseFloat(transaction.amount) || 0
      const paidAmount = parseFloat(transaction.paid_amount || "0") || 0

      // Determine Dr/Cr based on ledger category and transaction nature
      if (ledger.category === 'Expense') {
        // For expense ledgers: Debit increases expense, Credit decreases
        debit = transactionAmount
        runningBalance += transactionAmount
      } else if (ledger.category === 'Income') {
        // For income ledgers: Credit increases income, Debit decreases
        credit = transactionAmount
        runningBalance += transactionAmount
      } else {
        // For Others (Assets/Liabilities): Depends on context
        // For simplicity, treating as debit for now
        debit = transactionAmount
        runningBalance += transactionAmount
      }

      processedEntries.push({
        date: transaction.date,
        description: `${transaction.note} - ${transaction.status}`,
        debit,
        credit,
        balance: runningBalance,
        reference: `TXN-${transaction.id}`
      })

      // If there's a payment, show the cash/bank movement as well
      if (paidAmount > 0 && transaction.payment_account_name) {
        if (ledger.category === 'Expense') {
          // Payment reduces the outstanding (credit to expense)
          credit = paidAmount
          runningBalance -= paidAmount
        } else if (ledger.category === 'Income') {
          // Payment received (debit to clear receivable)
          debit = paidAmount
          runningBalance -= paidAmount
        }

        processedEntries.push({
          date: transaction.date,
          description: `Payment via ${transaction.payment_account_name}`,
          debit: ledger.category === 'Income' ? paidAmount : 0,
          credit: ledger.category === 'Expense' ? paidAmount : 0,
          balance: runningBalance,
          reference: `PAY-${transaction.id}`
        })
      }
    })

    setEntries(processedEntries)
    setClosingBalance(runningBalance)
  }, [ledger, transactions, openingBalance])

  // Fetch data when component mounts or date range changes
  useEffect(() => {
    if (ledgerId && fromDate && toDate) {
      fetchLedgerDetails()
      fetchTransactions()
    }
  }, [ledgerId, fromDate, toDate, fetchLedgerDetails, fetchTransactions])

  // Process transactions into entries when transactions change
  useEffect(() => {
    if (transactions.length > 0 && ledger) {
      processTransactions()
    }
  }, [transactions, ledger, processTransactions])



  const getTotalDebits = () => {
    if (!entries || entries.length === 0) return 0
    return entries.reduce((sum, entry) => sum + (entry.debit || 0), 0)
  }

  const getTotalCredits = () => {
    if (!entries || entries.length === 0) return 0
    return entries.reduce((sum, entry) => sum + (entry.credit || 0), 0)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Expense':
        return <TrendingDown size={20} className="text-red-500" />
      case 'Income':
        return <TrendingUp size={20} className="text-green-500" />
      default:
        return <FileText size={20} className="text-blue-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Expense':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Income':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Others':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!ledger) {
    return (
      <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className="flex-grow flex items-center justify-center">
          <p>Loading ledger details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link
              href="/accounts/reports"
              className={`mr-4 p-2 rounded-full hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-purple-900'}`}>
              Ledger Report
            </h1>
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

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">

        {/* Ledger Info */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
          <div className="flex items-center">
            {getCategoryIcon(ledger.category)}
            <div className="ml-3">
              <h2 className="text-xl font-semibold">{ledger.name}</h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {ledger.business_name}
              </p>
            </div>
            <span className={`ml-4 px-3 py-1 rounded-full text-sm border ${getCategoryColor(ledger.category)}`}>
              {ledger.category_display}
            </span>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 mb-6`}>
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={`p-2 border rounded text-sm ${isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
                }`}
            />
            <span className="text-sm">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={`p-2 border rounded text-sm ${isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
                }`}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="overflow-x-auto mb-6">
          <div className="flex gap-3 min-w-max">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-3 min-w-[140px]`}>
              <h4 className="text-xs font-medium text-gray-500 mb-1">Opening Bal</h4>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{openingBalance.toFixed(2)}</p>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-3 min-w-[140px]`}>
              <h4 className="text-xs font-medium text-gray-500 mb-1">Total Debits</h4>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{getTotalDebits().toFixed(2)}</p>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-3 min-w-[140px]`}>
              <h4 className="text-xs font-medium text-gray-500 mb-1">Total Credits</h4>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{getTotalCredits().toFixed(2)}</p>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-3 min-w-[140px]`}>
              <h4 className="text-xs font-medium text-gray-500 mb-1">Closing Bal</h4>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{closingBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <h3 className="text-lg font-semibold mb-4">Transaction Details</h3>

          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading transactions...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8">
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                No transactions found for the selected date range.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {entries.map((entry, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium">{new Date(entry.date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{entry.reference}</div>
                    </div>
                    <div className="text-sm mb-2">{entry.description}</div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-500">Dr: </span>
                        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          {entry.debit > 0 ? `₹${entry.debit.toFixed(2)}` : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Cr: </span>
                        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          {entry.credit > 0 ? `₹${entry.credit.toFixed(2)}` : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Bal: </span>
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ₹{entry.balance.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Description</th>
                      <th className="text-right py-3 px-4 font-medium">Debit (₹)</th>
                      <th className="text-right py-3 px-4 font-medium">Credit (₹)</th>
                      <th className="text-right py-3 px-4 font-medium">Balance (₹)</th>
                      <th className="text-left py-3 px-4 font-medium">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, index) => (
                      <tr
                        key={index}
                        className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} hover:bg-gray-50 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                          }`}
                      >
                        <td className="py-3 px-4">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{entry.description}</td>
                        <td className={`py-3 px-4 text-right ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {entry.debit > 0 ? entry.debit.toFixed(2) : '-'}
                        </td>
                        <td className={`py-3 px-4 text-right ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {entry.credit > 0 ? entry.credit.toFixed(2) : '-'}
                        </td>
                        <td className={`py-3 px-4 text-right font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {entry.balance.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">{entry.reference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
} 