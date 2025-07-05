'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit2, Trash2, Filter, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import { format } from 'date-fns'

type CashBankAccount = {
  id: number
  name: string
  account_type: 'Cash' | 'Bank'
  current_balance: number
}

type Transaction = {
  id: number
  account: number
  account_name: string
  date: string
  transaction_type: 'Debit' | 'Credit'
  amount: number
  description: string
  reference_type: string
  reference_id: number
  created_at: string
  running_balance: number
}

type EditModalProps = {
  transaction?: Partial<Transaction>
  onClose: () => void
  onSave: (data: Partial<Transaction>) => void
  accounts: CashBankAccount[]
  isDarkMode: boolean
}

function EditModal({ transaction, onClose, onSave, accounts, isDarkMode }: EditModalProps) {
  const [formData, setFormData] = useState<Partial<Transaction>>({
    ...transaction,
    amount: Number(transaction?.amount) || 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-96`}>
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {transaction ? 'Edit Transaction' : 'New Transaction'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Account
            </label>
            <select
              value={formData.account || ''}
              onChange={(e) => setFormData({ ...formData, account: Number(e.target.value) })}
              className={`w-full px-3 py-2 border rounded-md ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            >
              <option value="">Select Account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Date
            </label>
            <input
              type="date"
              value={formData.date || ''}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            />
          </div>
          <div className="mb-4">
            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Transaction Type
            </label>
            <select
              value={formData.transaction_type || ''}
              onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value as 'Debit' | 'Credit' })}
              className={`w-full px-3 py-2 border rounded-md ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            >
              <option value="">Select Type</option>
              <option value="Debit">Debit (Money In)</option>
              <option value="Credit">Credit (Money Out)</option>
            </select>
          </div>
          <div className="mb-4">
            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Amount
            </label>
            <input
              type="number"
              value={formData.amount || 0}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) || 0 })}
              className={`w-full px-3 py-2 border rounded-md ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            />
          </div>
          <div className="mb-4">
            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${
                isDarkMode
                  ? 'bg-gray-600 text-white hover:bg-gray-500'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CashBankTransactions() {
  const { isDarkMode } = useDarkMode()
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<CashBankAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>()

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-accounts/`)
      if (!response.ok) throw new Error('Failed to fetch accounts')
      const data = await response.json()
      setAccounts(data)
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }, [])

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true)
    try {
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-transactions/`
      const params = new URLSearchParams()
      
      if (selectedAccount) params.append('account_id', selectedAccount)
      if (dateFrom) params.append('start_date', dateFrom)
      if (dateTo) params.append('end_date', dateTo)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch transactions')
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedAccount, dateFrom, dateTo])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleSaveTransaction = async (data: Partial<Transaction>) => {
    try {
      const url = editingTransaction
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-transactions/${editingTransaction.id}/`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-transactions/`
      
      const response = await fetch(url, {
        method: editingTransaction ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to save transaction')
      
      setEditingTransaction(undefined)
      fetchTransactions()
    } catch (error) {
      console.error('Error saving transaction:', error)
    }
  }

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-transactions/${id}/`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) throw new Error('Failed to delete transaction')
      
      fetchTransactions()
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  return (
    <div className={isDarkMode ? 'bg-gray-900 min-h-screen text-white' : 'bg-gray-50 min-h-screen'}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/reports" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Cash & Bank Transactions
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-2 rounded-md ${
              isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {showFilters ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </button>
          <button
            onClick={() => setEditingTransaction(undefined)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
          >
            New Transaction
          </button>
        </div>
      </div>

      {showFilters && (
        <div className={`container mx-auto px-4 py-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow mb-4`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Account
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="">All Accounts</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedAccount('')
                  setDateFrom('')
                  setDateTo('')
                }}
                className={`px-4 py-2 rounded-md ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-4">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-x-auto`}>
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
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Running Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {format(new Date(transaction.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {transaction.account_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          transaction.transaction_type === 'Debit'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.transaction_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      ₹{(Number(transaction.amount) || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      ₹{(Number(transaction.running_balance) || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingTransaction(transaction)}
                          className={`p-1 rounded-md ${
                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Edit2 className="h-4 w-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className={`p-1 rounded-md ${
                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingTransaction !== undefined && (
        <EditModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(undefined)}
          onSave={handleSaveTransaction}
          accounts={accounts}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  )
}