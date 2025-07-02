'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Edit2, Trash2, Moon, Sun, Banknote, Building2, Eye, Search } from 'lucide-react'

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

export default function CashBankAccountsList() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<CashBankAccount[]>([])
  const [filteredAccounts, setFilteredAccounts] = useState<CashBankAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('All')

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-accounts/`)
      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      setAccounts(data)
      setFilteredAccounts(data)
    } catch (error) {
      console.error('Error fetching accounts:', error)
      setError(`Failed to load accounts. Error: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  useEffect(() => {
    let filtered = accounts
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(account =>
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.account_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filter by type
    if (filterType !== 'All') {
      filtered = filtered.filter(account => account.account_type === filterType)
    }
    
    setFilteredAccounts(filtered)
  }, [accounts, searchTerm, filterType])

  const handleDeleteAccount = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-accounts/${id}/`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete account: ${response.status} ${response.statusText}`)
      }

      alert('Account deleted successfully!')
      fetchAccounts()
    } catch (error) {
      console.error('Error deleting account:', error)
      alert(`Failed to delete account. Error: ${(error as Error).message}`)
    }
  }

  const handleEditAccount = (id: number) => {
    router.push(`/masters/cash_bank/edit/${id}`)
  }

  const totalCashBalance = accounts.filter(acc => acc.account_type === 'Cash').reduce((sum, acc) => sum + Number(acc.current_balance), 0)
  const totalBankBalance = accounts.filter(acc => acc.account_type === 'Bank').reduce((sum, acc) => sum + Number(acc.current_balance), 0)
  const grandTotal = totalCashBalance + totalBankBalance

  const totalCashOpening = accounts.filter(acc => acc.account_type === 'Cash').reduce((sum, acc) => 
    sum + (acc.opening_balance_type === 'Debit' ? Number(acc.opening_balance) : -Number(acc.opening_balance)), 0)
  const totalBankOpening = accounts.filter(acc => acc.account_type === 'Bank').reduce((sum, acc) => 
    sum + (acc.opening_balance_type === 'Debit' ? Number(acc.opening_balance) : -Number(acc.opening_balance)), 0)
  const grandTotalOpening = totalCashOpening + totalBankOpening

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/masters/mastermain" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Cash & Bank Accounts</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href="/masters/cash_bank/create"
              className={`flex items-center px-4 py-2 rounded-lg ${isDarkMode ? 'bg-green-700 text-white hover:bg-green-600' : 'bg-green-500 text-white hover:bg-green-600'} transition-colors duration-200`}
            >
              <Plus size={16} className="mr-2" />
              <span className="hidden sm:inline">Add Account</span>
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
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
                <div className="flex items-center">
                  <Banknote className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Cash</p>
                    <p className="text-2xl font-bold text-green-600">₹{totalCashBalance.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">Opening: ₹{totalCashOpening.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Bank</p>
                    <p className="text-2xl font-bold text-blue-600">₹{totalBankBalance.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">Opening: ₹{totalBankOpening.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Grand Total</p>
                    <p className="text-2xl font-bold text-purple-600">₹{grandTotal.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">Opening: ₹{grandTotalOpening.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Search Accounts
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or type..."
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="md:w-48">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Filter by Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="All">All Types</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Accounts Table */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">
                  Accounts ({filteredAccounts.length} of {accounts.length})
                </h2>
              </div>

              {filteredAccounts.length === 0 ? (
                <div className={`p-8 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  {searchTerm || filterType !== 'All' ? 'No accounts match your filters.' : 'No accounts found. Create your first account!'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Account Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Opening Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y divide-gray-200`}>
                      {filteredAccounts.map((account) => (
                        <tr key={account.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {account.account_type === 'Cash' ? 
                                <Banknote size={20} className="mr-3 text-green-500" /> : 
                                <Building2 size={20} className="mr-3 text-blue-500" />
                              }
                              <div>
                                <div className="text-sm font-medium">{account.name}</div>
                                <div className="text-xs text-gray-500">
                                  Created: {new Date(account.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              account.account_type === 'Cash' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {account.account_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">
                              ₹{Number(account.opening_balance).toFixed(2)}
                            </div>
                            <div className={`text-xs ${
                              account.opening_balance_type === 'Debit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {account.opening_balance_type}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${
                              Number(account.current_balance) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ₹{Number(account.current_balance).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              account.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {account.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditAccount(account.id)}
                                className={`p-1 rounded ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                                title="Edit Account"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteAccount(account.id, account.name)}
                                className={`p-1 rounded ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`}
                                title="Delete Account"
                              >
                                <Trash2 size={16} />
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
          </>
        )}
      </main>
    </div>
  )
} 