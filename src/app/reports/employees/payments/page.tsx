'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit2, Trash2, Moon, Sun, Filter, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'

type Payment = {
  id: number
  employee_id: number
  employee_name: string
  date: string
  amount: number
  payment_method: string
  account_name: string
  description: string
  created_at: string
}

type Employee = {
  id: number
  name: string
  role: string
  current_balance: number
}

type EditModalProps = {
  payment: Payment | null
  onClose: () => void
  onSave: (payment: Partial<Payment>) => Promise<void>
  accounts: CashBankAccount[]
  isDarkMode: boolean
}

type CashBankAccount = {
  id: number
  name: string
  account_type: string
  current_balance: number
}

function EditModal({ payment, onClose, onSave, accounts, isDarkMode }: EditModalProps) {
  const [formData, setFormData] = useState<Partial<Payment>>({
    ...payment,
    amount: Number(payment?.amount) || 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Edit Payment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Account
              </label>
              <select
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
              >
                <option value="">Select Account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.name}>
                    {account.name} (₹{account.current_balance})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                rows={3}
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function EmployeePayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [accounts, setAccounts] = useState<CashBankAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  
  // Filters
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Edit Modal
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)

  const fetchPayments = useCallback(async () => {
    setIsLoading(true)
    try {
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}employee-payments/`
      const params = new URLSearchParams()
      
      if (selectedEmployee) params.append('employee_id', selectedEmployee)
      if (dateFrom) params.append('from_date', dateFrom)
      if (dateTo) params.append('to_date', dateTo)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch payments: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      setPayments(data)
    } catch (error) {
      console.error('Error fetching payments:', error)
      setError(`Failed to load payments. Error: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }, [selectedEmployee, dateFrom, dateTo])

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}employee-ledger/`)
      if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      setEmployees(data.employees || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }, [])

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-accounts/`)
      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      setAccounts(data)
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
    fetchAccounts()
  }, [fetchEmployees, fetchAccounts])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this payment?')) {
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}employee-payments/${id}/`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete payment: ${response.status} ${response.statusText}`)
      }

      alert('Payment deleted successfully!')
      fetchPayments()
    } catch (error) {
      console.error('Error deleting payment:', error)
      alert(`Failed to delete payment. Error: ${(error as Error).message}`)
    }
  }

  const handleSavePayment = async (updatedPayment: Partial<Payment>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}employee-payments/${editingPayment?.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPayment),
      })

      if (!response.ok) {
        throw new Error(`Failed to update payment: ${response.status} ${response.statusText}`)
      }

      alert('Payment updated successfully!')
      fetchPayments()
    } catch (error) {
      console.error('Error updating payment:', error)
      alert(`Failed to update payment. Error: ${(error as Error).message}`)
    }
  }

  const clearFilters = () => {
    setSelectedEmployee('')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/reports" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Employee Payments History</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center p-2 rounded ${
                showFilters
                  ? isDarkMode ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'
                  : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <Filter size={16} className="mr-1" />
              <span className="text-sm hidden sm:inline">Filters</span>
              {showFilters ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} px-4 py-4 border-t`}>
            <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Employee
                  </label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">All Employees</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} (₹{employee.current_balance})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className={`w-full px-3 py-2 rounded-md ${
                      isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg overflow-hidden`}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Payment History ({payments.length})</h2>
            </div>

            {payments.length === 0 ? (
              <div className={`p-8 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                No payments found for the selected criteria.
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
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y divide-gray-200`}>
                    {payments.map((payment) => (
                      <tr key={payment.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(payment.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {payment.employee_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ₹{(Number(payment.amount) || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {payment.payment_method}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {payment.account_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {payment.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingPayment(payment)}
                              className={`p-1 rounded ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(payment.id)}
                              className={`p-1 rounded ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`}
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
        )}
      </main>

      {editingPayment && (
        <EditModal
          payment={editingPayment}
          onClose={() => setEditingPayment(null)}
          onSave={handleSavePayment}
          accounts={accounts}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  )
}