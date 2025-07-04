'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Moon, Sun } from 'lucide-react'
import Select from 'react-select'
import { useDarkMode } from '@/contexts/DarkModeContext'

type Customer = {
  id: number
  name: string
}

type CashBankAccount = {
  id: number
  name: string
  account_type: 'Cash' | 'Bank'
  current_balance: number
}

interface CustomerOption {
  value: string;
  label: string;
}

interface AccountOption {
  value: string;
  label: string;
  balance: number;
  type: string;
}

export default function ReceiptEntry() {
  const [date, setDate] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [cashBankAccounts, setCashBankAccounts] = useState<CashBankAccount[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [amountReceived, setAmountReceived] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  useEffect(() => {
    setMounted(true)
    fetchCustomers()
    fetchCashBankAccounts()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}customers/list/`)
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
      setError('Failed to load customers. Please try again later.')
    }
  }

  const fetchCashBankAccounts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-accounts/`)
      if (!response.ok) {
        throw new Error('Failed to fetch cash/bank accounts')
      }
      const data = await response.json()
      setCashBankAccounts(data)
    } catch (error) {
      console.error('Error fetching cash/bank accounts:', error)
      setError('Failed to load cash/bank accounts. Please try again later.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!selectedAccount) {
      setError('Please select a cash/bank account')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}receipts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          customer: selectedCustomer,
          amount_received: parseFloat(amountReceived),
          cash_bank_account: selectedAccount,
          payment_method: cashBankAccounts.find(acc => acc.id.toString() === selectedAccount)?.account_type || 'Cash', // For backwards compatibility
          description
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit receipt')
      }

      const result = await response.json()
      console.log('Receipt submitted:', result)
      alert('Receipt submitted successfully!')
      
      // Reset form
      setDate('')
      setSelectedCustomer('')
      setSelectedAccount('')
      setAmountReceived('')
      setDescription('')
      
      // Refresh cash/bank accounts to show updated balances
      fetchCashBankAccounts()
    } catch (error) {
      console.error('Error submitting receipt:', error)
      setError('Failed to submit receipt. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const accountOptions: AccountOption[] = cashBankAccounts.map(account => ({
    value: account.id.toString(),
    label: `${account.name} (${account.account_type}) - Balance: ${formatCurrency(account.current_balance)}`,
    balance: account.current_balance,
    type: account.account_type
  }))

  const inputStyle = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
  }`

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/daysheet/daysheetmain" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold text-blue-600">Receipt Entry</h1>
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
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-8`}>
          <div className="mb-6">
            <label htmlFor="date" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className={inputStyle}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="customer" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Customer Name
            </label>
            {mounted ? (
              <Select<CustomerOption>
                instanceId="customer-select"
                id="customer"
                value={customers.find(c => c.id.toString() === selectedCustomer) ? 
                  { value: selectedCustomer, label: customers.find(c => c.id.toString() === selectedCustomer)!.name } : null}
                onChange={(selected) => setSelectedCustomer(selected ? selected.value : '')}
                options={customers.map(customer => ({ value: customer.id.toString(), label: customer.name }))}
                isSearchable
                placeholder="Search or select a customer..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: isDarkMode ? '#374151' : 'white',
                    borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: isDarkMode ? '#374151' : 'white',
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: isDarkMode
                      ? state.isFocused ? '#4B5563' : '#374151'
                      : state.isFocused ? '#F3F4F6' : 'white',
                    color: isDarkMode ? 'white' : 'black',
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: isDarkMode ? 'white' : 'black',
                  }),
                  input: (provided) => ({
                    ...provided,
                    color: isDarkMode ? 'white' : 'black',
                  }),
                }}
              />
            ) : (
              <select
                id="customer"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className={inputStyle}
              >
                <option value="">Search or select a customer...</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id.toString()}>
                    {customer.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="amountReceived" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Amount Received
            </label>
            <input
              type="number"
              id="amountReceived"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              required
              step="0.01"
              min="0"
              className={inputStyle}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="cashBankAccount" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Cash/Bank Account *
            </label>
            {mounted ? (
              <Select<AccountOption>
                instanceId="account-select"
                id="cashBankAccount"
                value={accountOptions.find(acc => acc.value === selectedAccount) || null}
                onChange={(selected) => setSelectedAccount(selected ? selected.value : '')}
                options={accountOptions}
                isSearchable
                placeholder="Select cash or bank account..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: isDarkMode ? '#374151' : 'white',
                    borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: isDarkMode ? '#374151' : 'white',
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: isDarkMode
                      ? state.isFocused ? '#4B5563' : '#374151'
                      : state.isFocused ? '#F3F4F6' : 'white',
                    color: isDarkMode ? 'white' : 'black',
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: isDarkMode ? 'white' : 'black',
                  }),
                  input: (provided) => ({
                    ...provided,
                    color: isDarkMode ? 'white' : 'black',
                  }),
                }}
                formatOptionLabel={(option) => (
                  <div className="flex justify-between items-center">
                    <span>{option.label.split(' - Balance:')[0]}</span>
                    <span className={`text-sm font-medium ${
                      option.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(option.balance)}
                    </span>
                  </div>
                )}
              />
            ) : (
              <select
                id="cashBankAccount"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className={inputStyle}
              >
                <option value="">Select cash or bank account...</option>
                {cashBankAccounts.map(account => (
                  <option key={account.id} value={account.id.toString()}>
                    {account.name} ({account.account_type}) - Balance: {formatCurrency(account.current_balance)}
                  </option>
                ))}
              </select>
            )}
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              * This amount will be added to the selected account balance
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="description" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputStyle}
              rows={3}
              placeholder="Optional description..."
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Receipt'}
          </button>
        </form>
      </main>
    </div>
  )
}