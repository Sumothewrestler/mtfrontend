'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Moon, Sun, Banknote, Building2 } from 'lucide-react'

type NewAccount = {
  name: string
  account_type: string
  opening_balance: number
  opening_balance_type: string
}

export default function CreateCashBankAccount() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newAccount, setNewAccount] = useState<NewAccount>({
    name: '',
    account_type: 'Cash',
    opening_balance: 0,
    opening_balance_type: 'Debit'
  })

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
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
      router.push('/masters/cash_bank')
    } catch (error) {
      console.error('Error creating account:', error)
      alert(`Failed to create account. Error: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
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
            <h1 className="text-2xl font-bold">Create Cash/Bank Account</h1>
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
                {newAccount.account_type === 'Cash' ? 
                  <Banknote className="h-8 w-8 text-green-500 mr-3" /> : 
                  <Building2 className="h-8 w-8 text-blue-500 mr-3" />
                }
                <h2 className="text-xl font-semibold">Account Details</h2>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Fill in the details below to create a new cash or bank account.
              </p>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Account Name *
                </label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
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
                  value={newAccount.account_type}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, account_type: e.target.value }))}
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
                    value={newAccount.opening_balance}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, opening_balance: parseFloat(e.target.value) || 0 }))}
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
                    value={newAccount.opening_balance_type}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, opening_balance_type: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="Debit">Debit (Money In)</option>
                    <option value="Credit">Credit (Money Out)</option>
                  </select>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-blue-50 border border-blue-200'}`}>
                <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-blue-800'}`}>
                  Account Summary
                </h3>
                <div className="space-y-1 text-sm">
                  <p className={isDarkMode ? 'text-gray-300' : 'text-blue-700'}>
                    <span className="font-medium">Name:</span> {newAccount.name || 'Not specified'}
                  </p>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-blue-700'}>
                    <span className="font-medium">Type:</span> {newAccount.account_type}
                  </p>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-blue-700'}>
                    <span className="font-medium">Opening Balance:</span> ₹{Number(newAccount.opening_balance).toFixed(2)} ({newAccount.opening_balance_type})
                  </p>
                </div>
              </div>

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
                  disabled={isLoading || !newAccount.name.trim()}
                  className={`px-6 py-3 rounded-lg font-medium text-white transition-colors duration-200 flex items-center ${
                    isLoading || !newAccount.name.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }`}
                >
                  <Save size={18} className="mr-2" />
                  {isLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
} 