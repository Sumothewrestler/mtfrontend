'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Moon, Sun, ArrowUpCircle, ArrowDownCircle, Building, FileText, DollarSign, Calendar, AlertCircle, CheckCircle, CreditCard, ArrowLeft } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import Link from 'next/link'

interface Business {
  id: number
  name: string
}

interface Ledger {
  id: number
  business: number
  business_name: string
  name: string
  category: 'Expense' | 'Income' | 'Others'
  category_display: string
}

interface CashBankAccount {
  id: number
  name: string
  account_type: string
  current_balance: number
  is_active: boolean
}

interface ReceiptPaymentFormData {
  date: string
  type: 'Receipt' | 'Payment'
  ledger: number | ''
  business: number | ''
  amount: string
  payment_account: number | ''
  note: string
}

export default function ReceiptPaymentPage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  
  // State for form data
  const [formData, setFormData] = useState<ReceiptPaymentFormData>({
    date: new Date().toISOString().split('T')[0],
    type: 'Receipt',
    ledger: '',
    business: '',
    amount: '',
    payment_account: '',
    note: ''
  })

  // State for dropdowns
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [ledgers, setLedgers] = useState<Ledger[]>([])
  const [filteredLedgers, setFilteredLedgers] = useState<Ledger[]>([])
  const [cashBankAccounts, setCashBankAccounts] = useState<CashBankAccount[]>([])

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

  const fetchAllLedgers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}ledgers/`)
      if (response.ok) {
        const data = await response.json()
        setLedgers(data)
        setFilteredLedgers(data)
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
        // Ensure current_balance is a number
        const processedData = data.map((account: CashBankAccount) => ({
          ...account,
          current_balance: Number(account.current_balance)
        }))
        setCashBankAccounts(processedData)
      }
    } catch (error) {
      console.error('Error fetching cash bank accounts:', error)
    }
  }, [API_BASE_URL])

  // Fetch data on component mount
  useEffect(() => {
    fetchBusinesses()
    fetchAllLedgers()
    fetchCashBankAccounts()
  }, [fetchBusinesses, fetchAllLedgers, fetchCashBankAccounts])

  // Filter ledgers when business changes
  useEffect(() => {
    if (formData.business) {
      setFilteredLedgers(ledgers.filter(ledger => ledger.business === formData.business))
    } else {
      setFilteredLedgers(ledgers)
    }
    setFormData(prev => ({ ...prev, ledger: '' }))
  }, [formData.business, ledgers])

  const handleInputChange = (field: keyof ReceiptPaymentFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleSubmitReceiptPayment = async () => {
    // Validation
    if (!formData.ledger || !formData.amount || !formData.payment_account) {
      showMessage('error', 'Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        date: formData.date,
        transaction_type: formData.type,
        amount: parseFloat(formData.amount),
        cash_bank_account: formData.payment_account,
        note: formData.note,
        // This could be enhanced to link with specific transactions
        reference_info: {
          ledger: formData.ledger,
          business: formData.business || null
        }
      }

      const response = await fetch(`${API_BASE_URL}cash-bank-transactions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        showMessage('success', `${formData.type} recorded successfully!`)
        
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          type: 'Receipt',
          ledger: '',
          business: '',
          amount: '',
          payment_account: '',
          note: ''
        })
      } else {
        const errorData = await response.json()
        showMessage('error', errorData.errors ? String(Object.values(errorData.errors)[0]) : `Error recording ${formData.type.toLowerCase()}`)
      }
    } catch {
      showMessage('error', `Network error recording ${formData.type.toLowerCase()}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-purple-900'}`}>
              Receipt & Payment
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

        {/* Receipt/Payment Form */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
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

            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Transaction Type *
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleInputChange('type', 'Receipt')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors flex items-center justify-center ${
                    formData.type === 'Receipt'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : isDarkMode
                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <ArrowDownCircle size={18} className="mr-2" />
                  Receipt
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('type', 'Payment')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors flex items-center justify-center ${
                    formData.type === 'Payment'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : isDarkMode
                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <ArrowUpCircle size={18} className="mr-2" />
                  Payment
                </button>
              </div>
            </div>

            {/* Business Filter (Optional) */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <Building size={16} className="mr-1" />
                Business (Optional Filter)
              </label>
              <select
                value={formData.business}
                onChange={(e) => handleInputChange('business', e.target.value ? parseInt(e.target.value) : '')}
                className={`w-full p-3 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">All Businesses</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ledger */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <FileText size={16} className="mr-1" />
                Ledger *
              </label>
              <select
                value={formData.ledger}
                onChange={(e) => handleInputChange('ledger', e.target.value ? parseInt(e.target.value) : '')}
                className={`w-full p-3 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select Ledger</option>
                {filteredLedgers.map((ledger) => (
                  <option key={ledger.id} value={ledger.id}>
                    {ledger.business_name} - {ledger.name} ({ledger.category_display})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <DollarSign size={16} className="mr-1" />
                Amount * (₹)
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

            {/* Payment Account */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <CreditCard size={16} className="mr-1" />
                Payment Mode *
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
                    {account.name} ({account.account_type}) - ₹{typeof account.current_balance === 'number' ? account.current_balance.toFixed(2) : account.current_balance}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Notes *
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                placeholder=""
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
              onClick={handleSubmitReceiptPayment}
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : formData.type === 'Receipt'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  {formData.type === 'Receipt' ? <ArrowDownCircle size={18} className="mr-2" /> : <ArrowUpCircle size={18} className="mr-2" />}
                  Record {formData.type}
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
} 