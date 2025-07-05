'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Moon, Sun, Banknote, Building2, X,} from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import Loading from '@/components/Loading'

type CashBankAccount = {
  id: number
  name: string
  account_type: string
  opening_balance: number
  opening_balance_type: string
  current_balance: number
  is_active: boolean
  created_at: string
}

type Transaction = {
  id: number
  account: number
  account_name: string
  date: string
  transaction_type: string
  amount: string
  description: string
  reference_type: string
  created_at: string
  running_balance: string
}

type NewAccount = {
  name: string
  account_type: string
  opening_balance: number
  opening_balance_type: string
}

export default function CashBanksManagement() {
  const [accounts, setAccounts] = useState<CashBankAccount[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  
  // Create account modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAccount, setNewAccount] = useState<NewAccount>({
    name: '',
    account_type: 'Cash',
    opening_balance: 0,
    opening_balance_type: 'Debit'
  })
  
  // Edit account modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<CashBankAccount | null>(null)
  
  // Add transaction modal
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [newTransaction, setNewTransaction] = useState({
    account_id: 0,
    date: new Date().toISOString().split('T')[0],
    transaction_type: 'Debit',
    amount: 0,
    description: ''
  })

  const [dateRange, setDateRange] = useState<'this-month' | 'last-month' | 'custom'>('this-month')
  const [customDateRange, setCustomDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  const [showDateRangePicker, setShowDateRangePicker] = useState(false)

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-accounts/`)
      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      setAccounts(data)
    } catch (error) {
      console.error('Error fetching accounts:', error)
      setError(`Failed to load accounts. Error: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchTransactions = useCallback(async (accountId?: number, range?: 'this-month' | 'last-month' | 'custom') => {
    try {
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-transactions/`
      const params = new URLSearchParams()
      
      if (accountId) {
        params.append('account_id', accountId.toString())
      }

      if (range) {
        const now = new Date()
        let startDate = now
        let endDate = now

        if (range === 'this-month') {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        } else if (range === 'last-month') {
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        } else if (range === 'custom') {
          startDate = new Date(customDateRange.start)
          endDate = new Date(customDateRange.end)
        }

        params.append('start_date', startDate.toISOString().split('T')[0])
        params.append('end_date', endDate.toISOString().split('T')[0])
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }, [customDateRange])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  useEffect(() => {
    fetchTransactions(selectedAccount ?? undefined)
  }, [selectedAccount, fetchTransactions])

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-accounts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAccount),
      })

      if (!response.ok) {
        throw new Error(`Failed to create account: ${response.status} ${response.statusText}`)
      }

      alert('Account created successfully!')
      setShowCreateModal(false)
      setNewAccount({
        name: '',
        account_type: 'Cash',
        opening_balance: 0,
        opening_balance_type: 'Debit'
      })
      fetchAccounts()
    } catch (error) {
      console.error('Error creating account:', error)
      alert(`Failed to create account. Error: ${(error as Error).message}`)
    }
  }

  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAccount) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-accounts/${editingAccount.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingAccount.name,
          account_type: editingAccount.account_type,
          opening_balance: editingAccount.opening_balance,
          opening_balance_type: editingAccount.opening_balance_type
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update account: ${response.status} ${response.statusText}`)
      }

      alert('Account updated successfully!')
      setShowEditModal(false)
      setEditingAccount(null)
      fetchAccounts()
    } catch (error) {
      console.error('Error updating account:', error)
      alert(`Failed to update account. Error: ${(error as Error).message}`)
    }
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-transactions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: newTransaction.account_id,
          date: newTransaction.date,
          transaction_type: newTransaction.transaction_type,
          amount: newTransaction.amount,
          description: newTransaction.description,
          reference_type: 'manual_entry'
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to add transaction: ${response.status} ${response.statusText}`)
      }

      alert('Transaction added successfully!')
      setShowTransactionModal(false)
      setNewTransaction({
        account_id: 0,
        date: new Date().toISOString().split('T')[0],
        transaction_type: 'Debit',
        amount: 0,
        description: ''
      })
      fetchAccounts()
      fetchTransactions(selectedAccount || undefined)
    } catch (error) {
      console.error('Error adding transaction:', error)
      alert(`Failed to add transaction. Error: ${(error as Error).message}`)
    }
  }

  // First, let's create a helper function to safely format currency values
  const formatCurrency = (value: number | string | null | undefined): string => {
    if (typeof value === 'string') {
      return parseFloat(value).toFixed(2)
    }
    const numValue = typeof value === 'number' ? value : 0
    return numValue.toFixed(2)
  }

  // Update the balance calculations
  const totalCashBalance = accounts
    .filter(acc => acc.account_type === 'Cash')
    .reduce((sum, acc) => {
      const balance = typeof acc.current_balance === 'number' ? acc.current_balance : 0
      return sum + balance
    }, 0)

  const totalBankBalance = accounts
    .filter(acc => acc.account_type === 'Bank')
    .reduce((sum, acc) => {
      const balance = typeof acc.current_balance === 'number' ? acc.current_balance : 0
      return sum + balance
    }, 0)

  const handleDateRangeChange = (range: 'this-month' | 'last-month' | 'custom') => {
    setDateRange(range)
    // Convert null to undefined using nullish coalescing operator
    fetchTransactions(selectedAccount ?? undefined, range)
  }

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/reports" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Cash & Banks</h1>
          </div>
          <div className="flex items-center space-x-2">
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
          <Loading message="Loading accounts and transactions..." size="lg" />
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Add Summary Section */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-8`}>
              <h2 className="text-lg font-semibold mb-4">Account Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="text-sm text-gray-500">Total Cash</h3>
                  <p className={`text-xl font-bold ${totalCashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{formatCurrency(totalCashBalance)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="text-sm text-gray-500">Total Bank</h3>
                  <p className={`text-xl font-bold ${totalBankBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{formatCurrency(totalBankBalance)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="text-sm text-gray-500">Grand Total</h3>
                  <p className={`text-xl font-bold ${(totalCashBalance + totalBankBalance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{formatCurrency(totalCashBalance + totalBankBalance)}
                  </p>
                </div>
              </div>
            </div>

            {/* Accounts List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                  <h2 className="text-lg font-semibold mb-4">Accounts</h2>
                  <div className="space-y-3">
                    {accounts.map(account => (
                      <div 
                        key={account.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedAccount === account.id
                            ? isDarkMode ? 'bg-blue-900 border-blue-500' : 'bg-blue-50 border-blue-500'
                            : isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedAccount(account.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              {account.account_type === 'Cash' ? 
                                <Banknote size={16} className="mr-2 text-green-500" /> : 
                                <Building2 size={16} className="mr-2 text-blue-500" />
                              }
                              <h3 className="font-medium">{account.name}</h3>
                            </div>
                            <p className="text-sm text-gray-500">{account.account_type}</p>
                            <p className={`text-lg font-semibold ${
                              account.current_balance >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ₹{formatCurrency(account.current_balance)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transactions */}
              <div className="lg:col-span-2">
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                      {selectedAccount ? 
                        `Transactions - ${accounts.find(acc => acc.id === selectedAccount)?.name}` : 
                        'All Transactions'
                      }
                    </h2>
                    <div className="flex space-x-2">
                      <button
                        className={`px-4 py-2 rounded-md ${
                          dateRange === 'this-month'
                            ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                            : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => handleDateRangeChange('this-month')}
                      >
                        This Month
                      </button>
                      <button
                        className={`px-4 py-2 rounded-md ${
                          dateRange === 'last-month'
                            ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                            : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => handleDateRangeChange('last-month')}
                      >
                        Last Month
                      </button>
                      <button
                        className={`px-4 py-2 rounded-md ${
                          dateRange === 'custom'
                            ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                            : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => setShowDateRangePicker(true)}
                      >
                        Custom Range
                      </button>
                    </div>
                  </div>

                  {transactions.length === 0 ? (
                    <div className={`p-8 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      No transactions found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Account
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Running Balance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                          </tr>
                        </thead>
                        <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y divide-gray-200`}>
                          {transactions.map((transaction) => (
                            <tr key={transaction.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {new Date(transaction.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {transaction.account_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  transaction.transaction_type === 'Debit' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {transaction.transaction_type}
                                </span>
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                transaction.transaction_type === 'Debit' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.transaction_type === 'Debit' ? '+' : '-'}₹{parseFloat(transaction.amount).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                ₹{parseFloat(transaction.running_balance).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {transaction.description}
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
          </>
        )}
      </main>

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Account</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`p-2 rounded ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateAccount}>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="e.g., Cash, Bank 1, SBI Account"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Account Type
                  </label>
                  <select
                    value={newAccount.account_type}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, account_type: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Opening Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAccount.opening_balance}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, opening_balance: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Opening Balance Type
                  </label>
                  <select
                    value={newAccount.opening_balance_type}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, opening_balance_type: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="Debit">Debit (Money In)</option>
                    <option value="Credit">Credit (Money Out)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {showEditModal && editingAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Account</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className={`p-2 rounded ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditAccount}>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={editingAccount.name}
                    onChange={(e) => setEditingAccount(prev => prev ? { ...prev, name: e.target.value } : null)}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Account Type
                  </label>
                  <select
                    value={editingAccount.account_type}
                    onChange={(e) => setEditingAccount(prev => prev ? { ...prev, account_type: e.target.value } : null)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Opening Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingAccount.opening_balance}
                    onChange={(e) => setEditingAccount(prev => prev ? { ...prev, opening_balance: parseFloat(e.target.value) || 0 } : null)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Opening Balance Type
                  </label>
                  <select
                    value={editingAccount.opening_balance_type}
                    onChange={(e) => setEditingAccount(prev => prev ? { ...prev, opening_balance_type: e.target.value } : null)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="Debit">Debit (Money In)</option>
                    <option value="Credit">Credit (Money Out)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Transaction</h3>
              <button
                onClick={() => setShowTransactionModal(false)}
                className={`p-2 rounded ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddTransaction}>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Account
                  </label>
                  <select
                    value={newTransaction.account_id}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, account_id: parseInt(e.target.value) }))}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="0">Select Account</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} (₹{formatCurrency(account.current_balance)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Transaction Type
                  </label>
                  <select
                    value={newTransaction.transaction_type}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, transaction_type: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="Debit">Debit (Money In)</option>
                    <option value="Credit">Credit (Money Out)</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows={3}
                    placeholder="Enter transaction description"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDateRangePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Date Range</h3>
              <button
                onClick={() => setShowDateRangePicker(false)}
                className={`p-2 rounded ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  End Date
                </label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDateRangePicker(false)}
                className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDateRangeChange('custom')
                  setShowDateRangePicker(false)
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}