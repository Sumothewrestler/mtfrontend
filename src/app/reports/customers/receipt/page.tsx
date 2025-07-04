'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Moon, Sun, Trash2, Search } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface Receipt {
  id: number
  date: string
  customer_name: string
  amount_received: string
  payment_method: 'Cash' | 'Gpay' | 'Discount' | 'Bank'
  description: string
  account_name?: string  // NEW: For cash/bank integration
  is_legacy_data?: boolean  // NEW: To identify old receipts
}

export default function ReceiptEntryViewPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const fetchReceipts = async (from: string, to: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}receipts/report/?from_date=${from}&to_date=${to}`)
      if (!response.ok) {
        throw new Error('Failed to fetch receipts')
      }
      const data = await response.json()
      setReceipts(data)
    } catch (error) {
      console.error('Error fetching receipts:', error)
      alert('Failed to load receipts. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = () => {
    if (!fromDate || !toDate) {
      alert('Please select both From Date and To Date')
      return
    }
    fetchReceipts(fromDate, toDate)
  }

  const handleDeleteReceipt = async (receiptId: number) => {
    if (!confirm('Are you sure you want to delete this receipt?')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}receipts/delete/${receiptId}/`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete receipt')
      }
      setReceipts(receipts.filter(receipt => receipt.id !== receiptId))
      alert('Receipt deleted successfully')
    } catch (error) {
      console.error('Error deleting receipt:', error)
      alert('Failed to delete receipt. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(parseFloat(amount))
  }

  const getPaymentMethodDisplay = (receipt: Receipt) => {
    if (receipt.is_legacy_data) {
      return (
        <div className="flex flex-col">
          <span>{receipt.payment_method}</span>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            (Legacy)
          </span>
        </div>
      )
    }
    
    return receipt.account_name || receipt.payment_method
  }

  const inputStyle = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
  }`

  // Calculate totals
  const totalAmount = receipts.reduce((sum, receipt) => sum + parseFloat(receipt.amount_received), 0)
  const legacyCount = receipts.filter(r => r.is_legacy_data).length
  const newCount = receipts.length - legacyCount

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/daysheet/daysheetmain" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold text-blue-600">View Receipts</h1>
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

      <main className="container mx-auto px-4 py-8">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-6 mb-8`}>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="fromDate" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>From Date</label>
              <input
                type="date"
                id="fromDate"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="toDate" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>To Date</label>
              <input
                type="date"
                id="toDate"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={inputStyle}
              />
            </div>
            <button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white flex items-center`}
            >
              <Search className="mr-2" size={18} />
              {isLoading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {receipts.length > 0 && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-6 mb-8`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <div className="text-2xl font-bold text-blue-600">{receipts.length}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Receipts</div>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount.toString())}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Amount</div>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-yellow-50'}`}>
                <div className="text-2xl font-bold text-yellow-600">{legacyCount}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Legacy Receipts</div>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                <div className="text-2xl font-bold text-purple-600">{newCount}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cash/Bank Integrated</div>
              </div>
            </div>
          </div>
        )}

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount Received</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Account/Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className={receipt.is_legacy_data ? `${isDarkMode ? 'bg-gray-750' : 'bg-yellow-50'}` : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(receipt.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{receipt.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{formatCurrency(receipt.amount_received)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getPaymentMethodDisplay(receipt)}</td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs overflow-hidden overflow-ellipsis">{receipt.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteReceipt(receipt.id)}
                        className={`p-1 rounded-full ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
                        aria-label="Delete receipt"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {receipts.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No receipts found for the selected date range.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
