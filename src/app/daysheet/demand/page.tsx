'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, Plus, ArrowLeft, Calendar, FileText, Database } from 'lucide-react'
import Link from 'next/link'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface Customer {
  id: number
  name: string
  phone_number: string
}

interface Material {
  id: number
  name: string
}

interface Unit {
  id: number
  name: string
}

interface FormData {
  customer: string
  material: string
  unit: string
  quantity: string
  type: 'need' | 'offer'
  status: 'pending' | 'done' | 'cancelled'
  remarks: string
}

export default function MaterialEntryPage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [formData, setFormData] = useState<FormData>({
    customer: '',
    material: '',
    unit: '',
    quantity: '',
    type: 'need',
    status: 'pending',
    remarks: ''
  })

  const [searchTerms, setSearchTerms] = useState({
    customer: '',
    material: ''
  })

  const [showDropdowns, setShowDropdowns] = useState({
    customer: false,
    material: false
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [customersRes, materialsRes, unitsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}customers/list/`),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}materials/`),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}units/`)
      ])

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData)
      }

      if (materialsRes.ok) {
        const materialsData = await materialsRes.json()
        setMaterials(materialsData)
      }

      if (unitsRes.ok) {
        const unitsData = await unitsRes.json()
        setUnits(unitsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setErrorMessage('Failed to load form data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}material-transactions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: parseInt(formData.customer),
          material: parseInt(formData.material),
          unit: parseInt(formData.unit),
          quantity: parseFloat(formData.quantity),
          type: formData.type,
          status: formData.status,
          remarks: formData.remarks
        }),
      })

      if (response.ok) {
        setSuccessMessage('Material transaction created successfully!')
        setFormData({
          customer: '',
          material: '',
          unit: '',
          quantity: '',
          type: 'need',
          status: 'pending',
          remarks: ''
        })
        setSearchTerms({ customer: '', material: '' })
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Failed to create transaction')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrorMessage('Network error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerms.customer.toLowerCase()) ||
    customer.phone_number.includes(searchTerms.customer)
  )

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerms.material.toLowerCase())
  )

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-purple-900'}`}>
                  Material Entry
                </h1>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Transaction Type Tabs */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setFormData({ ...formData, type: 'need' })}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                formData.type === 'need'
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Need (Demand)
            </button>
            <button
              onClick={() => setFormData({ ...formData, type: 'offer' })}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                formData.type === 'offer'
                  ? 'bg-green-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Offer (Supply)
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Loading form data...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Selection */}
              <div className="relative">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Customer *
                </label>
                <input
                  type="text"
                  value={searchTerms.customer}
                  onChange={(e) => {
                    setSearchTerms({ ...searchTerms, customer: e.target.value })
                    setShowDropdowns({ ...showDropdowns, customer: true })
                  }}
                  onFocus={() => setShowDropdowns({ ...showDropdowns, customer: true })}
                  placeholder="Search customers..."
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                  required
                />
                {showDropdowns.customer && filteredCustomers.length > 0 && (
                  <div className={`absolute z-10 w-full mt-1 max-h-56 overflow-y-auto ${isDarkMode ? 'bg-gray-700' : 'bg-white'} border border-gray-300 rounded-lg shadow-lg`}>
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, customer: customer.id.toString() })
                          setSearchTerms({ ...searchTerms, customer: customer.name })
                          setShowDropdowns({ ...showDropdowns, customer: false })
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-blue-100 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                      >
                        {customer.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Material Selection */}
              <div className="relative">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Material *
                </label>
                <input
                  type="text"
                  value={searchTerms.material}
                  onChange={(e) => {
                    setSearchTerms({ ...searchTerms, material: e.target.value })
                    setShowDropdowns({ ...showDropdowns, material: true })
                  }}
                  onFocus={() => setShowDropdowns({ ...showDropdowns, material: true })}
                  placeholder="Search materials..."
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                  required
                />
                {showDropdowns.material && filteredMaterials.length > 0 && (
                  <div className={`absolute z-10 w-full mt-1 max-h-48 overflow-y-auto ${isDarkMode ? 'bg-gray-700' : 'bg-white'} border border-gray-300 rounded-lg shadow-lg`}>
                    {filteredMaterials.map((material) => (
                      <button
                        key={material.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, material: material.id.toString() })
                          setSearchTerms({ ...searchTerms, material: material.name })
                          setShowDropdowns({ ...showDropdowns, material: false })
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-blue-100 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                      >
                        {material.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Unit and Quantity - Same line */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Unit *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                    }`}
                    required
                  >
                    <option value="">Select Unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Quantity *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Enter quantity"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'done' | 'cancelled' })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="done">Done</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Remarks - Compact */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Remarks
                </label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Additional notes (optional)"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : formData.type === 'need'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  `Submit ${formData.type === 'need' ? 'Need' : 'Offer'}`
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
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