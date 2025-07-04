'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit2, Search, Filter, Truck, Moon, Sun, Trash2 } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import Loading from '@/components/Loading'

interface Tractor {
  id: number
  name: string
  tractor_number: string
  rc_date: string
  is_active: boolean
  next_insurance_date: string | null
}

interface TractorFormData {
  name: string
  tractor_number: string
  rc_date: string
  is_active: boolean
  next_insurance_date: string
}

export default function TractorView() {
  const [tractors, setTractors] = useState<Tractor[]>([])
  const [filteredTractors, setFilteredTractors] = useState<Tractor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRcExpiry, setFilterRcExpiry] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTractor, setSelectedTractor] = useState<Tractor | null>(null)
  const [showAllDetails, setShowAllDetails] = useState(false)
  const [formData, setFormData] = useState<TractorFormData>({
    name: '',
    tractor_number: '',
    rc_date: '',
    is_active: true,
    next_insurance_date: ''
  })
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const filterTractors = useCallback(() => {
    let filtered = tractors.filter(tractor =>
      tractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tractor.tractor_number.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (filterRcExpiry) {
      const currentDate = new Date()
      const filterDate = new Date(currentDate)
      
      if (filterRcExpiry === 'expired') {
        filtered = filtered.filter(tractor => new Date(tractor.rc_date) < currentDate)
      } else if (filterRcExpiry === 'expiring_30') {
        filterDate.setDate(currentDate.getDate() + 30)
        filtered = filtered.filter(tractor => {
          const rcDate = new Date(tractor.rc_date)
          return rcDate >= currentDate && rcDate <= filterDate
        })
      } else if (filterRcExpiry === 'expiring_90') {
        filterDate.setDate(currentDate.getDate() + 90)
        filtered = filtered.filter(tractor => {
          const rcDate = new Date(tractor.rc_date)
          return rcDate >= currentDate && rcDate <= filterDate
        })
      }
    }

    setFilteredTractors(filtered)
  }, [tractors, searchTerm, filterRcExpiry])

  useEffect(() => {
    fetchTractors()
  }, [])

  useEffect(() => {
    filterTractors()
  }, [filterTractors])

  const fetchTractors = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tractors/list/`)
      if (!response.ok) {
        throw new Error('Failed to fetch tractors')
      }
      const data = await response.json()
      setTractors(data)
    } catch (error) {
      console.error('Error fetching tractors:', error)
      setError('Failed to load tractors. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateModal = () => {
    setFormData({ name: '', tractor_number: '', rc_date: '', is_active: true, next_insurance_date: '' })
    setShowCreateModal(true)
  }

  const openEditModal = (tractor: Tractor) => {
    setSelectedTractor(tractor)
    setFormData({
      name: tractor.name,
      tractor_number: tractor.tractor_number,
      rc_date: tractor.rc_date,
      is_active: tractor.is_active,
      next_insurance_date: tractor.next_insurance_date || ''
    })
    setShowEditModal(true)
  }

  const closeModals = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setSelectedTractor(null)
    setFormData({ name: '', tractor_number: '', rc_date: '', is_active: true, next_insurance_date: '' })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const handleCreateTractor = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tractors/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create tractor')
      }

      const newTractor = await response.json()
      setTractors(prev => [...prev, newTractor])
      closeModals()
      alert('Tractor created successfully!')
    } catch (error) {
      console.error('Error creating tractor:', error)
      alert(`Failed to create tractor: ${(error as Error).message}`)
    }
  }

  const handleUpdateTractor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTractor) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tractors/${selectedTractor.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update tractor')
      }

      const updatedTractor = await response.json()
      setTractors(prev => prev.map(tractor => 
        tractor.id === selectedTractor.id ? updatedTractor : tractor
      ))
      closeModals()
      alert('Tractor updated successfully!')
    } catch (error) {
      console.error('Error updating tractor:', error)
      alert(`Failed to update tractor: ${(error as Error).message}`)
    }
  }

  const handleDeleteTractor = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tractor?')) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tractors/${id}/`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete tractor')
      }

      setTractors(prev => prev.filter(tractor => tractor.id !== id))
      alert('Tractor deleted successfully!')
    } catch (error) {
      console.error('Error deleting tractor:', error)
      alert('Failed to delete tractor')
    }
  }

  const handleToggleActive = async (id: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tractors/${id}/toggle-active/`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to toggle tractor status')
      }

      const result = await response.json()
      setTractors(prev => prev.map(tractor => 
        tractor.id === id ? result.tractor : tractor
      ))
      alert(result.message)
    } catch (error) {
      console.error('Error toggling tractor status:', error)
      alert('Failed to toggle tractor status')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  const getRcStatus = (rcDate: string) => {
    const currentDate = new Date()
    const expiry = new Date(rcDate)
    const diffTime = expiry.getTime() - currentDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { status: 'Expired', color: 'text-red-600 bg-red-100', days: Math.abs(diffDays) }
    } else if (diffDays <= 30) {
      return { status: 'Expiring Soon', color: 'text-orange-600 bg-orange-100', days: diffDays }
    } else if (diffDays <= 90) {
      return { status: 'Expiring', color: 'text-yellow-600 bg-yellow-100', days: diffDays }
    } else {
      return { status: 'Valid', color: 'text-green-600 bg-green-100', days: diffDays }
    }
  }

  const getInsuranceStatus = (insuranceDate: string | null) => {
    if (!insuranceDate) {
      return { status: 'Not Set', color: 'text-gray-600 bg-gray-100', days: 0 }
    }

    const currentDate = new Date()
    const expiry = new Date(insuranceDate)
    const diffTime = expiry.getTime() - currentDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { status: 'Expired', color: 'text-red-600 bg-red-100', days: Math.abs(diffDays) }
    } else if (diffDays <= 30) {
      return { status: 'Expiring Soon', color: 'text-orange-600 bg-orange-100', days: diffDays }
    } else if (diffDays <= 90) {
      return { status: 'Expiring', color: 'text-yellow-600 bg-yellow-100', days: diffDays }
    } else {
      return { status: 'Valid', color: 'text-green-600 bg-green-100', days: diffDays }
    }
  }

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/masters/mastermain" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-2xl font-bold">Tractor Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={openCreateModal}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus size={20} />
                <span>Add Tractor</span>
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by tractor name or number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAllDetails(!showAllDetails)}
                className={`px-3 py-2 rounded-lg border transition-colors ${
                  showAllDetails
                    ? 'bg-blue-500 text-white border-blue-500'
                    : isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {showAllDetails ? 'Hide Details' : 'Show All'}
              </button>
              {showAllDetails && (
                <div className="flex items-center space-x-2">
                  <Filter size={20} className="text-gray-500" />
                  <select
                    value={filterRcExpiry}
                    onChange={(e) => setFilterRcExpiry(e.target.value)}
                    className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">All RC Status</option>
                    <option value="expired">Expired</option>
                    <option value="expiring_30">Expiring in 30 days</option>
                    <option value="expiring_90">Expiring in 90 days</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Tractors List */}
        {isLoading ? (
          <Loading message="Loading tractors..." size="lg" />
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
              <h2 className="text-lg font-semibold mb-4">
                Tractors ({filteredTractors.length})
              </h2>
            </div>
            
            {filteredTractors.length === 0 ? (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8 text-center`}>
                <div className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>
                  {searchTerm || filterRcExpiry ? 'No tractors found matching your criteria.' : 'No tractors found.'}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTractors.map((tractor) => {
                  const rcStatus = getRcStatus(tractor.rc_date)
                  const insuranceStatus = getInsuranceStatus(tractor.next_insurance_date)
                  return (
                    <div key={tractor.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow`}>
                      {/* Header with Name and Status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Truck className="h-5 w-5 text-blue-500 mr-2" />
                          <div>
                            <h3 className="font-semibold text-lg">{tractor.name}</h3>
                            <p className="text-sm text-gray-500">#{tractor.tractor_number}</p>
                          </div>
                        </div>
                        
                        {/* Active Status Toggle */}
                        <div className="flex items-center">
                          <button
                            onClick={() => handleToggleActive(tractor.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              tractor.is_active ? 'bg-green-600' : 'bg-gray-300'
                            }`}
                            title={tractor.is_active ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                tractor.is_active ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className={`ml-2 text-xs font-medium ${
                            tractor.is_active ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {tractor.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {/* RC Date and Insurance Details - Show only if showAllDetails is true */}
                      {showAllDetails && (
                        <div className="space-y-2 mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">RC Date:</span>
                            <span className="text-sm font-medium">{formatDate(tractor.rc_date)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">RC Status:</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${rcStatus.color}`}>
                              {rcStatus.status}
                            </span>
                          </div>
                          {tractor.next_insurance_date && (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Insurance:</span>
                                <span className="text-sm font-medium">{formatDate(tractor.next_insurance_date)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Insurance Status:</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${insuranceStatus.color}`}>
                                  {insuranceStatus.status}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-end space-x-2 pt-2 border-t dark:border-gray-700">
                        <button
                          onClick={() => openEditModal(tractor)}
                          className={`p-2 rounded-lg ${isDarkMode ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700' : 'text-blue-600 hover:text-blue-500 hover:bg-blue-50'} transition-colors`}
                          title="Edit Tractor"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTractor(tractor.id)}
                          className={`p-2 rounded-lg ${isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-gray-700' : 'text-red-600 hover:text-red-500 hover:bg-red-50'} transition-colors`}
                          title="Delete Tractor"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Tractor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4`}>
            <h3 className="text-lg font-semibold mb-4">Add New Tractor</h3>
            <form onSubmit={handleCreateTractor}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tractor Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Enter tractor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tractor Number</label>
                  <input
                    type="text"
                    name="tractor_number"
                    value={formData.tractor_number}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Enter tractor number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">RC Date</label>
                  <input
                    type="date"
                    name="rc_date"
                    value={formData.rc_date}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Next Insurance Date (Optional)</label>
                  <input
                    type="date"
                    name="next_insurance_date"
                    value={formData.next_insurance_date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    Active Tractor
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={closeModals}
                  className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Create Tractor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tractor Modal */}
      {showEditModal && selectedTractor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4`}>
            <h3 className="text-lg font-semibold mb-4">Edit Tractor</h3>
            <form onSubmit={handleUpdateTractor}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tractor Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Enter tractor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tractor Number</label>
                  <input
                    type="text"
                    name="tractor_number"
                    value={formData.tractor_number}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Enter tractor number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">RC Date</label>
                  <input
                    type="date"
                    name="rc_date"
                    value={formData.rc_date}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Next Insurance Date (Optional)</label>
                  <input
                    type="date"
                    name="next_insurance_date"
                    value={formData.next_insurance_date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    Active Tractor
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={closeModals}
                  className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Update Tractor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
