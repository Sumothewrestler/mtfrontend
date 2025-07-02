'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit2, Search, Filter, Calendar, Truck, FileText, Moon, Sun, Trash2 } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import Loading from '@/components/Loading'

interface Tractor {
  id: number
  name: string
  tractor_number: string
  rc_date: string
}

interface TractorFormData {
  name: string
  tractor_number: string
  rc_date: string
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
  const [formData, setFormData] = useState<TractorFormData>({
    name: '',
    tractor_number: '',
    rc_date: ''
  })
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  useEffect(() => {
    fetchTractors()
  }, [])

  useEffect(() => {
    filterTractors()
  }, [tractors, searchTerm, filterRcExpiry])

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

  const filterTractors = () => {
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
  }

  const openCreateModal = () => {
    setFormData({ name: '', tractor_number: '', rc_date: '' })
    setShowCreateModal(true)
  }

  const openEditModal = (tractor: Tractor) => {
    setSelectedTractor(tractor)
    setFormData({
      name: tractor.name,
      tractor_number: tractor.tractor_number,
      rc_date: tractor.rc_date
    })
    setShowEditModal(true)
  }

  const closeModals = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setSelectedTractor(null)
    setFormData({ name: '', tractor_number: '', rc_date: '' })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tractors</p>
                <p className="text-2xl font-bold text-blue-600">{tractors.length}</p>
              </div>
            </div>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Valid RC</p>
                <p className="text-2xl font-bold text-green-600">
                  {tractors.filter(t => getRcStatus(t.rc_date).status === 'Valid').length}
                </p>
              </div>
            </div>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">
                  {tractors.filter(t => {
                    const status = getRcStatus(t.rc_date).status
                    return status === 'Expiring Soon' || status === 'Expiring'
                  }).length}
                </p>
              </div>
            </div>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Expired RC</p>
                <p className="text-2xl font-bold text-red-600">
                  {tractors.filter(t => getRcStatus(t.rc_date).status === 'Expired').length}
                </p>
              </div>
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
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">
                Tractors ({filteredTractors.length})
              </h2>
            </div>
            
            {filteredTractors.length === 0 ? (
              <div className={`p-8 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                {searchTerm || filterRcExpiry ? 'No tractors found matching your criteria.' : 'No tractors found.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tractor Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tractor Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        RC Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        RC Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y divide-gray-200 dark:divide-gray-700`}>
                    {filteredTractors.map((tractor) => {
                      const rcStatus = getRcStatus(tractor.rc_date)
                      return (
                        <tr key={tractor.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Truck className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium">{tractor.name}</div>
                                <div className="text-sm text-gray-500">ID: {tractor.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {tractor.tractor_number}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatDate(tractor.rc_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${rcStatus.color}`}>
                              {rcStatus.status}
                              {rcStatus.status !== 'Valid' && (
                                <span className="ml-1">
                                  ({rcStatus.days} days {rcStatus.status === 'Expired' ? 'ago' : 'left'})
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditModal(tractor)}
                                className={`p-1 rounded ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                                title="Edit Tractor"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteTractor(tractor.id)}
                                className={`p-1 rounded ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`}
                                title="Delete Tractor"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
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
