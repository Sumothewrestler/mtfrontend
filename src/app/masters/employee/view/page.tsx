'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Database, 
  Edit, 
  Trash2, 
  Sun, 
  Moon, 
  Search,
  Plus,
  MoreVertical,
  ExternalLink
} from 'lucide-react'

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
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    // Filter employees based on search term and filters
    let result = employees
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(employee => 
        employee.name.toLowerCase().includes(term) || 
        employee.phone_number.includes(term)
      )
    }
    
    if (filterRole) {
      result = result.filter(employee => employee.role === filterRole)
    }
    
    if (filterStatus === 'active') {
      result = result.filter(employee => employee.is_active)
    } else if (filterStatus === 'inactive') {
      result = result.filter(employee => !employee.is_active)
    }
    
    setFilteredEmployees(result)
  }, [employees, searchTerm, filterRole, filterStatus])

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

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/masters/mastermain" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Employees</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link 
              href="/masters/employee/create" 
              className={`p-2 rounded-md ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white flex items-center`}
            >
              <Plus size={20} className="mr-1" />
              <span className="hidden sm:inline">Add Employee</span>
            </Link>
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

        {/* Search and Filter Section */}
        <div className={`p-4 mb-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 w-full px-4 py-2 rounded-md border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>
            
            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">All Roles</option>
                <option value="Driver">Driver</option>
                <option value="Loadman">Loadman</option>
              </select>
            </div>
            
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className={`text-center p-8 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <p className="text-lg">No employees found matching your criteria.</p>
            <button 
              onClick={() => {
                setSearchTerm('')
                setFilterRole('')
                setFilterStatus('')
              }}
              className={`mt-4 px-4 py-2 rounded-md ${
                isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              Clear Filters
            </button>
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
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.is_active 
                            ? isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800' 
                            : isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => toggleEmployeeStatus(employee)}
                            className={`p-1 rounded-full ${
                              employee.is_active 
                                ? isDarkMode ? 'bg-red-800 hover:bg-red-700' : 'bg-red-100 hover:bg-red-200 text-red-600' 
                                : isDarkMode ? 'bg-green-800 hover:bg-green-700' : 'bg-green-100 hover:bg-green-200 text-green-600'
                            }`}
                            title={employee.is_active ? 'Deactivate' : 'Activate'}
                          >
                            <ExternalLink size={18} />
                          </button>
                          <Link 
                            href={`/masters/employee/edit/${employee.id}`}
                            className={`p-1 rounded-full ${isDarkMode ? 'bg-blue-800 hover:bg-blue-700' : 'bg-blue-100 hover:bg-blue-200 text-blue-600'}`}
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => setConfirmDelete(employee.id)}
                            className={`p-1 rounded-full ${isDarkMode ? 'bg-red-800 hover:bg-red-700' : 'bg-red-100 hover:bg-red-200 text-red-600'}`}
                            title="Delete"
                          >
                            <Trash2 size={18} />
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
                    <div>
                      <h3 className="text-lg font-semibold">{employee.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full mr-2 ${
                          employee.role === 'Driver' 
                            ? isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800' 
                            : isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                        }`}>
                          {employee.role}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          employee.is_active 
                            ? isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800' 
                            : isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <button 
                        className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        onClick={() => {
                          setOpenDropdownId(openDropdownId === employee.id ? null : employee.id);
                        }}
                      >
                        <MoreVertical size={20} />
                      </button>
                      {openDropdownId === employee.id && (
                        <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-10`}>
                          <div className="py-1">
                            <Link
                              href={`/masters/employee/edit/${employee.id}`}
                              className={`block px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => {
                                toggleEmployeeStatus(employee);
                                setOpenDropdownId(null);
                              }}
                              className={`block w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                              {employee.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => {
                                setConfirmDelete(employee.id);
                                setOpenDropdownId(null);
                              }}
                              className={`block w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'text-red-400 hover:bg-gray-600' : 'text-red-600 hover:bg-gray-100'}`}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
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