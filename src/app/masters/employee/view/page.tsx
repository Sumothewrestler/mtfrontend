'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Edit, 
  Trash2, 
  Sun, 
  Moon, 
  Plus,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface Employee {
  id: number
  name: string
  role: string
  phone_number: string
  date_of_joining: string
  daily_wage: number
  daily_beta: number
  is_active: boolean
}

export default function Page() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'active' | 'inactive' | 'all'>('active')
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    // Filter employees based on active tab
    let result = employees
    
    if (activeTab === 'active') {
      result = result.filter(employee => employee.is_active)
    } else if (activeTab === 'inactive') {
      result = result.filter(employee => !employee.is_active)
    }
    // For 'all' tab, no filtering needed
    
    setFilteredEmployees(result)
  }, [employees, activeTab])

  const fetchEmployees = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}employees/list/`)
      if (!response.ok) {
        throw new Error('Failed to fetch employees')
      }
      const data = await response.json()
      setEmployees(data)
      setFilteredEmployees(data)
    } catch (error) {
      console.error('Error fetching employees:', error)
      setError('Failed to load employees. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEmployee = async (id: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}employees/${id}/`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setEmployees(employees.filter(employee => employee.id !== id))
        setSuccessMessage('Employee deleted successfully')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        throw new Error('Failed to delete employee')
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
      setError('Failed to delete employee. Please try again.')
      setTimeout(() => setError(null), 3000)
    } finally {
      setConfirmDelete(null)
    }
  }

  const toggleEmployeeStatus = async (employee: Employee) => {
    try {
      const updatedEmployee = { ...employee, is_active: !employee.is_active }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}employees/${employee.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !employee.is_active }),
      })
      
      if (response.ok) {
        setEmployees(employees.map(emp => 
          emp.id === employee.id ? updatedEmployee : emp
        ))
        setSuccessMessage(`Employee status changed to ${updatedEmployee.is_active ? 'active' : 'inactive'}`)
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        throw new Error('Failed to update employee status')
      }
    } catch (error) {
      console.error('Error updating employee status:', error)
      setError('Failed to update employee status. Please try again.')
      setTimeout(() => setError(null), 3000)
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const getEmployeeCount = (status: 'active' | 'inactive' | 'all') => {
    if (status === 'active') return employees.filter(emp => emp.is_active).length
    if (status === 'inactive') return employees.filter(emp => !emp.is_active).length
    return employees.length
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/masters/mastermain" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Employees</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Link 
              href="/masters/employee/create" 
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                isDarkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <Plus size={18} />
              <span>New</span>
            </Link>
            <button
              onClick={() => toggleDarkMode()}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Success and Error Messages */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex justify-between items-center">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} className="text-green-700">×</button>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700">×</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className={`mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {(['active', 'inactive', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors relative ${
                  activeTab === tab
                    ? isDarkMode
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-blue-600 border-b-2 border-blue-600'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="capitalize">{tab}</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeTab === tab
                    ? isDarkMode
                      ? 'bg-blue-900 text-blue-200'
                      : 'bg-blue-100 text-blue-800'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {getEmployeeCount(tab)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className={`text-center p-8 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <p className="text-lg">No {activeTab === 'all' ? '' : activeTab} employees found.</p>
          </div>
        ) : (
          <>
            {/* Desktop View - Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                  <tr>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Name
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Role
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Phone
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Daily Wage
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Daily Beta
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Joining Date
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th scope="col" className={`px-6 py-3 text-right text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {employee.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.role === 'Driver' 
                            ? isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800' 
                            : isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                        }`}>
                          {employee.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {employee.phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        ₹{employee.daily_wage}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        ₹{employee.daily_beta}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(employee.date_of_joining)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleEmployeeStatus(employee)}
                          className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                            employee.is_active 
                              ? isDarkMode 
                                ? 'bg-green-800 text-green-200 hover:bg-green-700' 
                                : 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : isDarkMode 
                                ? 'bg-red-800 text-red-200 hover:bg-red-700' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {employee.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end items-center space-x-2">
                          <Link 
                            href={`/masters/employee/edit/${employee.id}`}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center space-x-1 ${
                              isDarkMode 
                                ? 'bg-blue-800 text-blue-200 hover:bg-blue-700' 
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                          >
                            <Edit size={14} />
                            <span>Edit</span>
                          </Link>
                          <button
                            onClick={() => setConfirmDelete(employee.id)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center space-x-1 ${
                              isDarkMode 
                                ? 'bg-red-800 text-red-200 hover:bg-red-700' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4">
              {filteredEmployees.map((employee) => (
                <div 
                  key={employee.id} 
                  className={`rounded-lg shadow-md p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{employee.name}</h3>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          employee.role === 'Driver' 
                            ? isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800' 
                            : isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                        }`}>
                          {employee.role}
                        </span>
                        <button
                          onClick={() => toggleEmployeeStatus(employee)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                            employee.is_active 
                              ? isDarkMode ? 'bg-green-800 text-green-200 hover:bg-green-700' : 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : isDarkMode ? 'bg-red-800 text-red-200 hover:bg-red-700' : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {employee.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <Link
                        href={`/masters/employee/edit/${employee.id}`}
                        className={`p-2 rounded-md transition-colors ${
                          isDarkMode ? 'bg-blue-800 text-blue-200 hover:bg-blue-700' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => setConfirmDelete(employee.id)}
                        className={`p-2 rounded-md transition-colors ${
                          isDarkMode ? 'bg-red-800 text-red-200 hover:bg-red-700' : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                      <p>{employee.phone_number}</p>
                    </div>
                    <div>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Joined</p>
                      <p>{formatDate(employee.date_of_joining)}</p>
                    </div>
                    <div>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Daily Wage</p>
                      <p>₹{employee.daily_wage}</p>
                    </div>
                    <div>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Daily Beta</p>
                      <p>₹{employee.daily_beta}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-sm w-full`}>
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this employee? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className={`px-4 py-2 rounded-md ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEmployee(confirmDelete)}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}