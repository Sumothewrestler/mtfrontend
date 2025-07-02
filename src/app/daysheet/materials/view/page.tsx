'use client'

import { useState, useEffect, useCallback } from 'react'
import { Moon, Sun, Filter, Search, Trash2, Calendar, FileText, Database, Eye, CheckCircle, Clock, XCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface MaterialTransaction {
  id: number
  customer_name: string
  material_name: string
  unit_name: string
  quantity: string
  type: 'need' | 'offer'
  type_display: string
  status: 'pending' | 'done' | 'cancelled'
  status_display: string
  date: string
  remarks: string
  created_at: string
}

export default function MaterialTransactionsViewPage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [transactions, setTransactions] = useState<MaterialTransaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<MaterialTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'need' | 'offer'>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'done' | 'cancelled'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}material-transactions/`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTransactions = useCallback(() => {
    let filtered = transactions

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.remarks?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === selectedType)
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === selectedStatus)
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, selectedType, selectedStatus])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, selectedType, selectedStatus, filterTransactions])

  const updateTransactionStatus = async (transactionId: number, newStatus: 'pending' | 'done' | 'cancelled') => {
    try {
      setStatusUpdating(transactionId)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}material-transactions/${transactionId}/status/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setSuccessMessage('Status updated successfully!')
        fetchTransactions()
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setStatusUpdating(null)
    }
  }

  const deleteTransaction = async (transactionId: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}material-transactions/${transactionId}/`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccessMessage('Transaction deleted successfully!')
        fetchTransactions()
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'need' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
  }

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-purple-900'}`}>
                Material Transactions
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                View and manage material needs and offers
              </p>
            </div>
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

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Filters and Search */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                }`}
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Type Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Transaction Type
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedType('all')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        selectedType === 'all'
                          ? 'bg-blue-600 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedType('need')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        selectedType === 'need'
                          ? 'bg-blue-600 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Need
                    </button>
                    <button
                      onClick={() => setSelectedType('offer')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        selectedType === 'offer'
                          ? 'bg-green-600 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Offer
                    </button>
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedStatus('all')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        selectedStatus === 'all'
                          ? 'bg-blue-600 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedStatus('pending')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        selectedStatus === 'pending'
                          ? 'bg-yellow-600 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setSelectedStatus('done')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        selectedStatus === 'done'
                          ? 'bg-green-600 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Done
                    </button>
                    <button
                      onClick={() => setSelectedStatus('cancelled')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        selectedStatus === 'cancelled'
                          ? 'bg-red-600 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Cancelled
                    </button>
                  </div>
                </div>

                {/* Results Count */}
                <div className="flex items-end">
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Showing {filteredTransactions.length} of {transactions.length} transactions
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transactions List */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                No transactions found
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Try adjusting your filters or add new transactions
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Material
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{transaction.customer_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{transaction.material_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {transaction.quantity} {transaction.unit_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                          {transaction.type_display}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(transaction.status)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status_display}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {/* Status Update Buttons */}
                          {transaction.status !== 'done' && (
                            <button
                              onClick={() => updateTransactionStatus(transaction.id, 'done')}
                              disabled={statusUpdating === transaction.id}
                              className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                              title="Mark as Done"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {transaction.status !== 'pending' && (
                            <button
                              onClick={() => updateTransactionStatus(transaction.id, 'pending')}
                              disabled={statusUpdating === transaction.id}
                              className="p-1 text-yellow-600 hover:text-yellow-700 disabled:opacity-50"
                              title="Mark as Pending"
                            >
                              <Clock className="h-4 w-4" />
                            </button>
                          )}
                          {transaction.status !== 'cancelled' && (
                            <button
                              onClick={() => updateTransactionStatus(transaction.id, 'cancelled')}
                              disabled={statusUpdating === transaction.id}
                              className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                              title="Mark as Cancelled"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="p-1 text-red-600 hover:text-red-700"
                            title="Delete Transaction"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mt-6`}>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              href="/materials/entry"
              className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} text-center`}
            >
              <Plus className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">New Entry</span>
            </Link>
            <Link
              href="/materials/reports"
              className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} text-center`}
            >
              <FileText className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Reports</span>
            </Link>
            <Link
              href="/materials"
              className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} text-center`}
            >
              <Database className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Manage Materials</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
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