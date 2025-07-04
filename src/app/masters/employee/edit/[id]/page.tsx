'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Sun, Moon } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'

export default function Page() {
  // Use next/navigation's useParams hook instead of receiving params as props
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const { isDarkMode, toggleDarkMode } = useDarkMode()

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
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
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

            <div className={`max-w-lg mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg p-8`}>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label 
                    htmlFor="name" 
                    className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Employee Name
                  </label>
                  <input 
                    type="text"
                    id="name"
                    name="name"
                    value={employeeData.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-black'
                    }`}
                  />
                </div>

                <div className="mb-6">
                  <label 
                    htmlFor="role" 
                    className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Role
                  </label>
                  <select 
                    id="role"
                    name="role"
                    value={employeeData.role}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-black'
                    }`}
                  >
                    <option value="Driver">Driver</option>
                    <option value="Loadman">Loadman</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label 
                    htmlFor="phone_number" 
                    className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Phone Number
                  </label>
                  <input 
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={employeeData.phone_number}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-black'
                    }`}
                  />
                </div>

                <div className="mb-6">
                  <label 
                    htmlFor="date_of_joining" 
                    className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Date of Joining
                  </label>
                  <input 
                    type="date"
                    id="date_of_joining"
                    name="date_of_joining"
                    value={employeeData.date_of_joining}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-black'
                    }`}
                  />
                </div>

                <div className="mb-6">
                  <label 
                    htmlFor="daily_wage" 
                    className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Daily Wage (₹)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    id="daily_wage"
                    name="daily_wage"
                    value={employeeData.daily_wage}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-black'
                    }`}
                  />
                </div>

                <div className="mb-6">
                  <label 
                    htmlFor="daily_beta" 
                    className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Daily Beta (₹)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    id="daily_beta"
                    name="daily_beta"
                    value={employeeData.daily_beta}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-black'
                    }`}
                  />
                </div>

                <div className="mb-6">
                  <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={employeeData.is_active}
                      onChange={(e) => setEmployeeData({...employeeData, is_active: e.target.checked})}
                      className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium">Active Employee</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <Link 
                    href="/masters/employee/view" 
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
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
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      isSaving 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : isDarkMode
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
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