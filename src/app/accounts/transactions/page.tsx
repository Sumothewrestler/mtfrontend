'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Moon, Sun, Plus, X, Building, FileText, DollarSign, Calendar, AlertCircle, CheckCircle, CreditCard } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface Business {
  id: number
  name: string
  created_at: string
  updated_at: string
}

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

interface CashBankAccount {
  id: number
  name: string
  account_type: string
  current_balance: number
  is_active: boolean
}

interface TransactionFormData {
  date: string
  business: number | ''
  ledger: number | ''
  amount: string
  status: 'Paid' | 'Partially Paid' | 'Unpaid'
  paid_amount: string
  payment_account: number | ''
  note: string
}

export default function TransactionEntryPage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  
  // State for form data
  const [formData, setFormData] = useState<TransactionFormData>({
    date: new Date().toISOString().split('T')[0],
    business: '',
    ledger: '',
    amount: '',
    status: 'Unpaid',
    paid_amount: '',
    payment_account: '',
    note: ''
  })

  // State for dropdowns
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [ledgers, setLedgers] = useState<Ledger[]>([])
  const [cashBankAccounts, setCashBankAccounts] = useState<CashBankAccount[]>([])
  
  // State for modals
  const [showBusinessModal, setShowBusinessModal] = useState(false)
  const [showLedgerModal, setShowLedgerModal] = useState(false)
  
  // State for new business form
  const [newBusinessName, setNewBusinessName] = useState('')
  
  // State for new ledger form
  const [newLedgerData, setNewLedgerData] = useState({
    name: '',
    category: 'Expense' as 'Expense' | 'Income' | 'Others',
    business: '' as number | ''
  })

  // Loading and feedback states
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  // API Base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  // Memoize fetch functions to prevent unnecessary re-renders
  const fetchBusinesses = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}businesses/`)
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data)
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
    }
  }, [API_BASE_URL])

  const fetchLedgers = useCallback(async (businessId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}ledgers/?business=${businessId}`)
      if (response.ok) {
        const data = await response.json()
        setLedgers(data)
      }
    } catch (error) {
      console.error('Error fetching ledgers:', error)
    }
  }, [API_BASE_URL])

  const fetchCashBankAccounts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}cash-bank-accounts/`)
      if (response.ok) {
        const data = await response.json()
        setCashBankAccounts(data)
      }
    } catch (error) {
      console.error('Error fetching cash bank accounts:', error)
    }
  }, [API_BASE_URL])

  // Fetch data on component mount
  useEffect(() => {
    fetchBusinesses()
    fetchCashBankAccounts()
  }, [fetchBusinesses, fetchCashBankAccounts])

  // Fetch ledgers when business changes
  useEffect(() => {
    if (formData.business) {
      fetchLedgers(formData.business as number)
    } else {
      setLedgers([])
    }
    setFormData(prev => ({ ...prev, ledger: '' }))
  }, [formData.business, fetchLedgers])

  // Update paid amount when status or amount changes
  useEffect(() => {
    if (formData.status === 'Paid' && formData.amount) {
      setFormData(prev => ({ ...prev, paid_amount: prev.amount }))
    } else if (formData.status === 'Unpaid') {
      setFormData(prev => ({ ...prev, paid_amount: '', payment_account: '' }))
    }
  }, [formData.status, formData.amount])

  const handleInputChange = (field: keyof TransactionFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleCreateBusiness = async () => {
    if (!newBusinessName.trim()) return

    try {
      const response = await fetch(`${API_BASE_URL}businesses/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBusinessName.trim() })
      })

      if (response.ok) {
        const newBusiness = await response.json()
        setBusinesses(prev => [...prev, newBusiness])
        setFormData(prev => ({ ...prev, business: newBusiness.id }))
        setNewBusinessName('')
        setShowBusinessModal(false)
        showMessage('success', 'Business created successfully!')
      } else {
        const errorData = await response.json()
        showMessage('error', errorData.errors?.name?.[0] || 'Error creating business')
      }
    } catch {
      showMessage('error', 'Network error creating business')
    }
  }

  const handleCreateLedger = async () => {
    if (!newLedgerData.name.trim() || !newLedgerData.business) return

    try {
      const response = await fetch(`${API_BASE_URL}ledgers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLedgerData.name.trim(),
          category: newLedgerData.category,
          business: newLedgerData.business
        })
      })

      if (response.ok) {
        const newLedger = await response.json()
        setLedgers(prev => [...prev, newLedger])
        setFormData(prev => ({ ...prev, ledger: newLedger.id }))
        setNewLedgerData({ name: '', category: 'Expense', business: '' })
        setShowLedgerModal(false)
        showMessage('success', 'Ledger created successfully!')
      } else {
        const errorData = await response.json()
        showMessage('error', errorData.errors?.name?.[0] || 'Error creating ledger')
      }
    } catch {
      showMessage('error', 'Network error creating ledger')
    }
  }

  const handleSubmitTransaction = async () => {
    // Validation
    if (!formData.business || !formData.ledger || !formData.amount) {
      showMessage('error', 'Please fill in all required fields')
      return
    }

    if (formData.status !== 'Unpaid' && (!formData.paid_amount || !formData.payment_account)) {
      showMessage('error', 'Payment details required for paid/partially paid transactions')
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        date: formData.date,
        business: formData.business,
        ledger: formData.ledger,
        amount: parseFloat(formData.amount),
        status: formData.status,
        paid_amount: formData.paid_amount ? parseFloat(formData.paid_amount) : null,
        payment_account: formData.payment_account || null,
        note: formData.note
      }

      const response = await fetch(`${API_BASE_URL}transactions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        await response.json()
        showMessage('success', 'Transaction created successfully!')
        
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          business: '',
          ledger: '',
          amount: '',
          status: 'Unpaid',
          paid_amount: '',
          payment_account: '',
          note: ''
        })
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.errors 
          ? (Array.isArray(Object.values(errorData.errors)[0]) 
              ? (Object.values(errorData.errors)[0] as string[])[0] 
              : String(Object.values(errorData.errors)[0]))
          : 'Error creating transaction'
        showMessage('error', errorMessage)
      }
    } catch {
      showMessage('error', 'Network error creating transaction')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-purple-900'}`}>
            Business Transactions
          </h1>
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
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        
        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
            {message.text}
          </div>
        )}

        {/* Transaction Form */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <DollarSign className="mr-2" />
            New Transaction Entry
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <Calendar size={16} className="mr-1" />
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full p-3 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Business */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <Building size={16} className="mr-1" />
                Business *
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.business}
                  onChange={(e) => handleInputChange('business', e.target.value ? parseInt(e.target.value) : '')}
                  className={`flex-1 p-3 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select Business</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowBusinessModal(true)}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Ledger */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <FileText size={16} className="mr-1" />
                Ledger *
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.ledger}
                  onChange={(e) => handleInputChange('ledger', e.target.value ? parseInt(e.target.value) : '')}
                  disabled={!formData.business}
                  className={`flex-1 p-3 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${!formData.business ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select Ledger</option>
                  {ledgers.map((ledger) => (
                    <option key={ledger.id} value={ledger.id}>
                      {ledger.name} ({ledger.category_display})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.business) {
                      setNewLedgerData(prev => ({ ...prev, business: formData.business as number }))
                      setShowLedgerModal(true)
                    }
                  }}
                  disabled={!formData.business}
                  className={`p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                    !formData.business ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Total Amount * (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                className={`w-full p-3 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className={`w-full p-3 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            {/* Paid Amount */}
            {formData.status !== 'Unpaid' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Paid Amount * (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={formData.amount || undefined}
                  value={formData.paid_amount}
                  onChange={(e) => handleInputChange('paid_amount', e.target.value)}
                  placeholder="0.00"
                  className={`w-full p-3 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            )}

            {/* Payment Account */}
            {formData.status !== 'Unpaid' && (
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <CreditCard size={16} className="mr-1" />
                  Payment Account *
                </label>
                <select
                  value={formData.payment_account}
                  onChange={(e) => handleInputChange('payment_account', e.target.value ? parseInt(e.target.value) : '')}
                  className={`w-full p-3 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select Account</option>
                  {cashBankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.account_type}) - ₹{account.current_balance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Notes
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                placeholder="Optional notes about this transaction..."
                rows={3}
                className={`w-full p-3 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              onClick={handleSubmitTransaction}
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? 'Creating Transaction...' : 'Create Transaction'}
            </button>
          </div>
        </div>
      </main>

      {/* Business Modal */}
      {showBusinessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Business</h3>
              <button
                onClick={() => {
                  setShowBusinessModal(false)
                  setNewBusinessName('')
                }}
                className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Business Name *</label>
                <input
                  type="text"
                  value={newBusinessName}
                  onChange={(e) => setNewBusinessName(e.target.value)}
                  placeholder="Enter business name"
                  className={`w-full p-3 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateBusiness()}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBusinessModal(false)
                    setNewBusinessName('')
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBusiness}
                  disabled={!newBusinessName.trim()}
                  className={`flex-1 py-2 px-4 rounded-lg text-white ${
                    newBusinessName.trim()
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Modal */}
      {showLedgerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Ledger</h3>
              <button
                onClick={() => {
                  setShowLedgerModal(false)
                  setNewLedgerData({ name: '', category: 'Expense', business: '' })
                }}
                className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ledger Name *</label>
                <input
                  type="text"
                  value={newLedgerData.name}
                  onChange={(e) => setNewLedgerData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Office Rent, Sales Revenue, Loan to X"
                  className={`w-full p-3 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  value={newLedgerData.category}
                  onChange={(e) => setNewLedgerData(prev => ({ ...prev, category: e.target.value as 'Expense' | 'Income' | 'Others' }))}
                  className={`w-full p-3 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                  <option value="Others">Others (Loans/Advances)</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowLedgerModal(false)
                    setNewLedgerData({ name: '', category: 'Expense', business: '' })
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateLedger}
                  disabled={!newLedgerData.name.trim() || !newLedgerData.business}
                  className={`flex-1 py-2 px-4 rounded-lg text-white ${
                    newLedgerData.name.trim() && newLedgerData.business
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
