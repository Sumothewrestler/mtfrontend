'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, FileText, Database } from 'lucide-react'

export default function Page() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone_number: '',
    date_of_joining: '',
    daily_wage: '',
    daily_beta: '',
    is_active: true,
  })
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prevState => ({ ...prevState, [name]: value }))
  }

  const handleToggleActive = () => {
    setFormData(prevState => ({ ...prevState, is_active: !prevState.is_active }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}employees/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await response.json()
        setSuccessMessage('Employee created successfully!')
        setFormData({ name: '', role: '', phone_number: '', date_of_joining: '', daily_wage: '', daily_beta: '', is_active: true })
        
        setTimeout(() => {
          router.push('/masters/employee/view')
        }, 2000)
      } else {
        const errorData = await response.json()
        if (errorData.errors) {
          const errors = Object.values(errorData.errors).flat().join(', ')
          setErrorMessage(`Error: ${errors}`)
        } else {
          setErrorMessage('Failed to create employee.')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setErrorMessage('An unexpected error occurred. Please try again later.')
    }
  }

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/masters/employee/view" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Create Employee</h1>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded" role="alert">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className={`max-w-lg mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg p-8`}>
          <div className="mb-6">
            <label htmlFor="name" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Employee Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
              }`}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="role" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
              }`}
            >
              <option value="">Select a role</option>
              <option value="Driver">Driver</option>
              <option value="Loadman">Loadman</option>
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="phone_number" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Phone Number
            </label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
              }`}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="date_of_joining" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Date of Joining
            </label>
            <input
              type="date"
              id="date_of_joining"
              name="date_of_joining"
              value={formData.date_of_joining}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
              }`}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="daily_wage" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Daily Wage (₹)
            </label>
            <input
              type="number"
              step="0.01"
              id="daily_wage"
              name="daily_wage"
              value={formData.daily_wage}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
              }`}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="daily_beta" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Daily Beta (₹)
            </label>
            <input
              type="number"
              step="0.01"
              id="daily_beta"
              name="daily_beta"
              value={formData.daily_beta}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
              }`}
            />
          </div>
          <div className="mb-6">
            <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={handleToggleActive}
                className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium">Active Employee</span>
            </label>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {formData.is_active
                ? 'Employee is currently active and available for assignment.'
                : 'Employee is currently inactive and not available for assignment.'}
            </p>
          </div>
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              isDarkMode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            Create Employee
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