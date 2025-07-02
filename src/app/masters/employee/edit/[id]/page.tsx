'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Sun, Moon, ToggleLeft, ToggleRight } from 'lucide-react'

export default function Page() {
  // Use next/navigation's useParams hook instead of receiving params as props
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  const [employeeData, setEmployeeData] = useState({
    name: '',
    role: 'Driver',
    phone_number: '',
    date_of_joining: '',
    daily_wage: '',
    daily_beta: '',
    is_active: true
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Toggle cells functionality
  const [expandedCells, setExpandedCells] = useState<Record<string, boolean>>({})

  const toggleCell = (cellKey: string) => {
    setExpandedCells(prev => ({
      ...prev,
      [cellKey]: !prev[cellKey]
    }))
  }

  useEffect(() => {
    if (id) {
      fetchEmployeeData()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchEmployeeData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}employees/${id}/`)
      if (!response.ok) {
        throw new Error('Failed to fetch employee data')
      }
      const data = await response.json()
      setEmployeeData({
        name: data.name,
        role: data.role,
        phone_number: data.phone_number,
        date_of_joining: data.date_of_joining ? data.date_of_joining.split('T')[0] : '',
        daily_wage: data.daily_wage || '',
        daily_beta: data.daily_beta || '',
        is_active: data.is_active
      })
    } catch (error) {
      console.error('Error fetching employee data:', error)
      setError('Failed to load employee data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}employees/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      })

      if (!response.ok) {
        throw new Error('Failed to update employee')
      }

      setSuccessMessage('Employee updated successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating employee:', error)
      setError('Failed to update employee. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setEmployeeData({
        ...employeeData,
        [name]: checked
      })
    } else {
      setEmployeeData({
        ...employeeData,
        [name]: value
      })
    }
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/masters/employee/view" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Edit Employee</h1>
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
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Success and Error Messages */}
            {successMessage && (
              <div className="mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex justify-between items-center">
                <span>{successMessage}</span>
                <button onClick={() => setSuccessMessage('')} className="text-green-700">×</button>
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex justify-between items-center">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="text-red-700">×</button>
              </div>
            )}

            <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor="name" 
                      className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Employee Name
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleCell('name')}
                      className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      {expandedCells['name'] ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </button>
                  </div>
                  <input 
                    type="text"
                    id="name"
                    name="name"
                    value={employeeData.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      expandedCells['name'] ? 'h-20' : 'h-10'
                    } transition-all duration-200`}
                  />
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor="role" 
                      className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Role
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleCell('role')}
                      className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      {expandedCells['role'] ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </button>
                  </div>
                  <select 
                    id="role"
                    name="role"
                    value={employeeData.role}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      expandedCells['role'] ? 'h-20' : 'h-10'
                    } transition-all duration-200`}
                  >
                    <option value="Driver">Driver</option>
                    <option value="Loadman">Loadman</option>
                  </select>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor="phone_number" 
                      className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Phone Number
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleCell('phone')}
                      className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      {expandedCells['phone'] ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </button>
                  </div>
                  <input 
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={employeeData.phone_number}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      expandedCells['phone'] ? 'h-20' : 'h-10'
                    } transition-all duration-200`}
                  />
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    10-digit mobile number without country code
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor="date_of_joining" 
                      className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Date of Joining
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleCell('date')}
                      className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      {expandedCells['date'] ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </button>
                  </div>
                  <input 
                    type="date"
                    id="date_of_joining"
                    name="date_of_joining"
                    value={employeeData.date_of_joining}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      expandedCells['date'] ? 'h-20' : 'h-10'
                    } transition-all duration-200`}
                  />
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor="daily_wage" 
                      className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Daily Wage (₹)
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleCell('wage')}
                      className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      {expandedCells['wage'] ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </button>
                  </div>
                  <input 
                    type="number"
                    step="0.01"
                    id="daily_wage"
                    name="daily_wage"
                    value={employeeData.daily_wage}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      expandedCells['wage'] ? 'h-20' : 'h-10'
                    } transition-all duration-200`}
                  />
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor="daily_beta" 
                      className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Daily Beta (₹)
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleCell('beta')}
                      className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      {expandedCells['beta'] ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </button>
                  </div>
                  <input 
                    type="number"
                    step="0.01"
                    id="daily_beta"
                    name="daily_beta"
                    value={employeeData.daily_beta}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      expandedCells['beta'] ? 'h-20' : 'h-10'
                    } transition-all duration-200`}
                  />
                </div>

                <div className="mb-6 flex items-center">
                  <input 
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={employeeData.is_active}
                    onChange={(e) => setEmployeeData({...employeeData, is_active: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label 
                    htmlFor="is_active" 
                    className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Active
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <Link 
                    href="/masters/employee/view" 
                    className={`px-4 py-2 rounded-md ${
                      isDarkMode 
                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </Link>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  )
}