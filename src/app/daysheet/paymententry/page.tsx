'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, FileText, Database, Moon, Sun } from 'lucide-react'
import Select from 'react-select'

type ExpenseCategory = {
  id: number
  name: string
}

type Supplier = {
  id: number
  name: string
}

type PaymentMethod = 'Cash' | 'Gpay' | 'Discount'

export default function PaymentEntry() {
  const [date, setDate] = useState('')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState('')
  const [amountPaid, setAmountPaid] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    fetchSuppliers()
    fetchExpenseCategories()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}suppliers/list/`)
      if (!response.ok) {
        throw new Error('Failed to fetch suppliers')
      }
      const data = await response.json()
      setSuppliers(data.sort((a: Supplier, b: Supplier) => a.name.localeCompare(b.name)))
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      setError('Failed to load suppliers. Please try again later.')
    }
  }

  const fetchExpenseCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}expense-categories/list/`)
      if (!response.ok) {
        throw new Error('Failed to fetch expense categories')
      }
      const data = await response.json()
      setExpenseCategories(data.sort((a: ExpenseCategory, b: ExpenseCategory) => a.name.localeCompare(b.name)))
    } catch (error) {
      console.error('Error fetching expense categories:', error)
      setError('Failed to load expense categories. Please try again later.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}payments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          supplier: selectedSupplier,
          expense_category: selectedExpenseCategory,
          amount_paid: parseFloat(amountPaid),
          payment_methods: paymentMethod,
          description
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit payment')
      }

      const result = await response.json()
      console.log('Payment submitted:', result)
      alert('Payment submitted successfully!')
      // Reset form
      setDate('')
      setSelectedSupplier('')
      setSelectedExpenseCategory('')
      setAmountPaid('')
      setPaymentMethod('')
      setDescription('')
    } catch (error) {
      console.error('Error submitting payment:', error)
      setError('Failed to submit payment. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method)
  }

  const supplierOptions = suppliers.map(supplier => ({
    value: supplier.id.toString(),
    label: supplier.name
  }))

  const expenseCategoryOptions = expenseCategories.map(category => ({
    value: category.id.toString(),
    label: category.name
  }))

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/daysheet/daysheetmain" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Payment Entry</h1>
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="supplier" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Supplier Name
            </label>
            <Select
              id="supplier"
              options={supplierOptions}
              value={supplierOptions.find(option => option.value === selectedSupplier)}
              onChange={(selected) => setSelectedSupplier(selected ? selected.value : '')}
              isSearchable
              placeholder="Search or select a supplier..."
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
                    ? state.isFocused
                      ? '#4B5563'
                      : '#374151'
                    : state.isFocused
                      ? '#F3F4F6'
                      : 'white',
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
          </div>
          <div className="mb-6">
            <label htmlFor="expenseCategory" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Expense Category
            </label>
            <Select
              id="expenseCategory"
              options={expenseCategoryOptions}
              value={expenseCategoryOptions.find(option => option.value === selectedExpenseCategory)}
              onChange={(selected) => setSelectedExpenseCategory(selected ? selected.value : '')}
              isSearchable
              placeholder="Search or select an expense category..."
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
                    ? state.isFocused
                      ? '#4B5563'
                      : '#374151'
                    : state.isFocused
                      ? '#F3F4F6'
                      : 'white',
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
          </div>
          <div className="mb-6">
            <label htmlFor="amountPaid" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Amount Paid
            </label>
            <input
              type="number"
              id="amountPaid"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Payment Method
            </label>
            <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              {(['Cash', 'Gpay', 'Discount'] as PaymentMethod[]).map((method) => (
                <label key={method} className="inline-flex items-center mr-6">
                  <input
                    type="radio"
                    checked={paymentMethod === method}
                    onChange={() => handlePaymentMethodChange(method)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{method}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="description" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              rows={3}
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
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </main>

      {/* Bottom navigation for mobile */}
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