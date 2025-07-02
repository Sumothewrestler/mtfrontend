'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Moon, Sun, Banknote, Building2, Loader2 } from 'lucide-react'

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

type EditAccount = {
  name: string
  account_type: string
  opening_balance: number
  opening_balance_type: string
  is_active: boolean
}

export default function EditCashBankAccount() {
  const router = useRouter()
  const params = useParams()
  const accountId = params.id as string

  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [originalAccount, setOriginalAccount] = useState<CashBankAccount | null>(null)
  const [editAccount, setEditAccount] = useState<EditAccount>({
    name: '',
    account_type: 'Cash',
    opening_balance: 0,
    opening_balance_type: 'Debit',
    is_active: true
  })

  const fetchAccount = useCallback(async () => {
    if (!accountId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-accounts/${accountId}/`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Account not found')
        }
        throw new Error(`Failed to fetch account: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      setOriginalAccount(data)
      setEditAccount({
        name: data.name,
        account_type: data.account_type,
        opening_balance: Number(data.opening_balance),
        opening_balance_type: data.opening_balance_type,
        is_active: data.is_active
      })
    } catch (error) {
      console.error('Error fetching account:', error)
      setError(`Failed to load account. Error: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }, [accountId])

  useEffect(() => {
    fetchAccount()
  }, [fetchAccount])

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-accounts/${accountId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editAccount),
      })

      if (!response.ok) {
        throw new Error(`Failed to update account: ${response.status} ${response.statusText}`)
      }

      alert('Account updated successfully!')
      router.push('/masters/cash_bank')
    } catch (error) {
      console.error('Error updating account:', error)
      alert(`Failed to update account. Error: ${(error as Error).message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const hasChanges = originalAccount && (
    editAccount.name !== originalAccount.name ||
    editAccount.account_type !== originalAccount.account_type ||
    editAccount.opening_balance !== Number(originalAccount.opening_balance) ||
    editAccount.opening_balance_type !== originalAccount.opening_balance_type ||
    editAccount.is_active !== originalAccount.is_active
  )

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className="flex justify-center items-center h-screen">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="text-lg">Loading account...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/masters/cash_bank" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-2xl font-bold">Edit Account</h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link 
              href="/masters/cash_bank" 
              className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Edit Account</h1>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8`}>
            <div className="mb-6">
              <div className="flex items-center mb-4">
                {editAccount.account_type === 'Cash' ? 
                  <Banknote className="h-8 w-8 text-green-500 mr-3" /> : 
                  <Building2 className="h-8 w-8 text-blue-500 mr-3" />
                }
                <div>
                  <h2 className="text-xl font-semibold">Edit Account Details</h2>
                  {originalAccount && (
                    <p className="text-sm text-gray-500">
                      Created on {new Date(originalAccount.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Update the account information below. Changes will affect future transactions.
              </p>
            </div>

            {/* Current Balance Info */}
            {originalAccount && (
              <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-blue-900 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                  Current Account Status
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Current Balance:</span>
                    <p className={`${Number(originalAccount.current_balance) >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                      ₹{Number(originalAccount.current_balance).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Status:</span>
                    <p className={originalAccount.is_active ? 'text-green-600' : 'text-red-600'}>
                      {originalAccount.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleUpdateAccount} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Account Name *
                </label>
                <input
                  type="text"
                  value={editAccount.name}
                  onChange={(e) => setEditAccount(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g., Petty Cash, SBI Current Account, HDFC Savings"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Account Type *
                </label>
                <select
                  value={editAccount.account_type}
                  onChange={(e) => setEditAccount(prev => ({ ...prev, account_type: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Opening Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editAccount.opening_balance}
                    onChange={(e) => setEditAccount(prev => ({ ...prev, opening_balance: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Balance Type
                  </label>
                  <select
                    value={editAccount.opening_balance_type}
                    onChange={(e) => setEditAccount(prev => ({ ...prev, opening_balance_type: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="Debit">Debit (Money In)</option>
                    <option value="Credit">Credit (Money Out)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Account Status
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="true"
                      checked={editAccount.is_active === true}
                      onChange={() => setEditAccount(prev => ({ ...prev, is_active: true }))}
                      className="mr-2 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-green-600 font-medium">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="false"
                      checked={editAccount.is_active === false}
                      onChange={() => setEditAccount(prev => ({ ...prev, is_active: false }))}
                      className="mr-2 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-red-600 font-medium">Inactive</span>
                  </label>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-blue-50 border border-blue-200'}`}>
                <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-blue-800'}`}>
                  Updated Account Summary
                </h3>
                <div className="space-y-1 text-sm">
                  <p className={isDarkMode ? 'text-gray-300' : 'text-blue-700'}>
                    <span className="font-medium">Name:</span> {editAccount.name || 'Not specified'}
                  </p>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-blue-700'}>
                    <span className="font-medium">Type:</span> {editAccount.account_type}
                  </p>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-blue-700'}>
                    <span className="font-medium">Opening Balance:</span> ₹{Number(editAccount.opening_balance).toFixed(2)} ({editAccount.opening_balance_type})
                  </p>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-blue-700'}>
                    <span className="font-medium">Status:</span> {editAccount.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              {hasChanges && (
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                    ⚠️ You have unsaved changes. Click &quot;Update Account&quot; to save your changes.
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } transition-colors duration-200`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !editAccount.name.trim() || !hasChanges}
                  className={`px-6 py-3 rounded-lg font-medium text-white transition-colors duration-200 flex items-center ${
                    isSaving || !editAccount.name.trim() || !hasChanges
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }`}
                >
                  {isSaving ? (
                    <Loader2 size={18} className="mr-2 animate-spin" />
                  ) : (
                    <Save size={18} className="mr-2" />
                  )}
                  {isSaving ? 'Updating...' : 'Update Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
} 