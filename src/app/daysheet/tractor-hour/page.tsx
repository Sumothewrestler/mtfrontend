'use client'

import { useState, useEffect, useCallback } from 'react'
import { Moon, Sun, Plus, Edit, Trash2, Save, X, Calendar, Clock, Truck, Database, FileText, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface Tractor {
  id: number
  name: string
  tractor_number: string
  rc_date: string
  is_active: boolean
}

interface TractorHours {
  id: number
  tractor: number
  tractor_name: string
  date: string
  start_hour: number
  end_hour: number
  total_hours: number
}

interface TractorHoursForm {
  tractor: number
  date: string
  start_hour: number
  end_hour: number
}

interface SuggestedStartHour {
  tractor_id: number
  tractor_name: string
  date: string
  suggested_start_hour: number
  previous_day_end_hour: number | null
  has_previous_day_data: boolean
}

interface ApiResponse {
  date: string
  tractor_hours: TractorHours[]
  tractors_without_hours: Array<{
    id: number
    name: string
    tractor_number: string
    suggested_start_hour?: number
  }>
}

// Helper function to format date consistently between server and client
const formatDateForDisplay = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00') // Add time to avoid timezone issues
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${day}/${month}/${year}`
}

export default function TractorEntryPage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  
  // State management
  const [tractors, setTractors] = useState<Tractor[]>([])
  const [tractorHours, setTractorHours] = useState<TractorHours[]>([])
  const [tractorsWithoutHours, setTractorsWithoutHours] = useState<Array<{id: number, name: string, tractor_number: string, suggested_start_hour?: number}>>([])
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<TractorHoursForm>({
    tractor: 0,
    date: new Date().toISOString().split('T')[0],
    start_hour: 0,
    end_hour: 0,
  })

  const showMessage = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }, [])

  const fetchTractors = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tractors/list/`)
      if (response.ok) {
        const data = await response.json()
        // Filter to show only active tractors
        const activeTractors = data.filter((tractor: Tractor) => tractor.is_active)
        setTractors(activeTractors)
      }
    } catch (error) {
      console.error('Error fetching tractors:', error)
      showMessage('error', 'Failed to fetch tractors')
    }
  }, [showMessage])

  const fetchTractorHoursByDate = useCallback(async (date: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tractor-hours/by-date/?date=${date}`)
      if (response.ok) {
        const data: ApiResponse = await response.json()
        setTractorHours(data.tractor_hours)
        setTractorsWithoutHours(data.tractors_without_hours)
      }
    } catch (error) {
      console.error('Error fetching tractor hours:', error)
      showMessage('error', 'Failed to fetch tractor hours')
    } finally {
      setLoading(false)
    }
  }, [showMessage])

  // Fetch tractors on component mount
  useEffect(() => {
    fetchTractors()
  }, [fetchTractors])

  // Fetch tractor hours when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchTractorHoursByDate(selectedDate)
    }
  }, [selectedDate, fetchTractorHoursByDate])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.start_hour > formData.end_hour) {
      showMessage('error', 'End hour meter reading must be greater than or equal to start reading')
      return
    }

    if (formData.tractor === 0) {
      showMessage('error', 'Please select a tractor')
      return
    }

    try {
      setSubmitLoading(true)
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}tractor-hours/${editingId}/`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}tractor-hours/`
      
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        showMessage('success', editingId ? 'Tractor hours updated successfully' : 'Tractor hours created successfully')
        fetchTractorHoursByDate(selectedDate)
        resetForm()
      } else {
        const errorData = await response.json()
        showMessage('error', errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'Failed to save tractor hours')
      }
    } catch (error) {
      console.error('Error saving tractor hours:', error)
      showMessage('error', 'Failed to save tractor hours')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleEdit = (tractorHour: TractorHours) => {
    setFormData({
      tractor: tractorHour.tractor,
      date: tractorHour.date,
      start_hour: tractorHour.start_hour,
      end_hour: tractorHour.end_hour,
    })
    setEditingId(tractorHour.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tractor-hours/${id}/`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showMessage('success', 'Tractor hours deleted successfully')
        fetchTractorHoursByDate(selectedDate)
      } else {
        showMessage('error', 'Failed to delete tractor hours')
      }
    } catch (error) {
      console.error('Error deleting tractor hours:', error)
      showMessage('error', 'Failed to delete tractor hours')
    }
  }

  const resetForm = () => {
    setFormData({
      tractor: 0,
      date: selectedDate,
      start_hour: 0,
      end_hour: 0,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const fetchSuggestedStartHour = async (tractorId: number, date: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}tractor-hours/suggested-start-hour/?tractor_id=${tractorId}&date=${date}`
      )
      if (response.ok) {
        const data: SuggestedStartHour = await response.json()
        return data.suggested_start_hour
      }
    } catch (error) {
      console.error('Error fetching suggested start hour:', error)
    }
    return 0
  }

  const addHoursForTractor = async (tractorId: number) => {
    const suggestedStartHour = await fetchSuggestedStartHour(tractorId, selectedDate)
    
    setFormData({
      tractor: tractorId,
      date: selectedDate,
      start_hour: suggestedStartHour,
      end_hour: suggestedStartHour,
    })
    setEditingId(null)
    setShowForm(true)
  }

  const calculateTotalHours = (start: number, end: number) => {
    return Math.max(0, end - start)
  }

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className={`mr-4 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-purple-900'}`}>
                  Tractor Hours Entry
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

      {/* Message Alert */}
      {message && (
        <div className={`mx-4 mt-4 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        
        {/* Date Selection */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <label className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Select Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                }`}
              />
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {tractorHours.length} tractors with hours entered
            </div>
          </div>
        </div>

        {/* Add Hours Button - Big button after date section */}
        <div className="mb-6">
          <button
            onClick={() => {
              setFormData({
                tractor: 0,
                date: selectedDate,
                start_hour: 0,
                end_hour: 0,
              })
              setEditingId(null)
              setShowForm(true)
            }}
            className={`w-full flex items-center justify-center px-6 py-4 rounded-lg text-lg font-semibold ${
              isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors duration-200`}
          >
            <Plus className="h-6 w-6 mr-3" />
            Add Tractor Hours
          </button>
        </div>

        {/* Tractors Without Hours - Moved up */}
        {tractorsWithoutHours.length > 0 && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg mb-6`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold flex items-center">
                <Truck className="mr-3" />
                Tractors Without Hours ({tractorsWithoutHours.length})
              </h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tractorsWithoutHours.map((tractor) => (
                  <div
                    key={tractor.id}
                    className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{tractor.name}</h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {tractor.tractor_number}
                        </p>
                        {tractor.suggested_start_hour !== undefined && tractor.suggested_start_hour > 0 && (
                          <p className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            Suggested start: {tractor.suggested_start_hour}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => addHoursForTractor(tractor.id)}
                        className={`flex items-center px-3 py-1 rounded-lg text-sm ${
                          isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Hours
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Existing Hours Table - Moved down */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg mb-6`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold flex items-center">
              <Clock className="mr-3" />
              Hours Entered for {formatDateForDisplay(selectedDate)}
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Loading...</p>
            </div>
          ) : tractorHours.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                No hours entered for this date
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Click &quot;Add Hours&quot; to start tracking tractor hours
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tractor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Reading
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Reading
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tractorHours.map((tractorHour) => (
                    <tr key={tractorHour.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-blue-600">
                          {tractorHour.tractor_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">
                          {tractorHour.start_hour}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">
                          {tractorHour.end_hour}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-green-600">
                          {tractorHour.total_hours.toFixed(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(tractorHour)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tractorHour.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingId ? 'Edit Tractor Hours' : 'Add Tractor Hours'}
                </h3>
                <button
                  onClick={resetForm}
                  className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tractor
                  </label>
                  <select
                    value={formData.tractor}
                    onChange={async (e) => {
                      const tractorId = parseInt(e.target.value)
                      if (tractorId > 0 && editingId === null) {
                        // Fetch suggested start hour for the selected tractor
                        const suggestedStartHour = await fetchSuggestedStartHour(tractorId, formData.date)
                        setFormData({ 
                          ...formData, 
                          tractor: tractorId,
                          start_hour: suggestedStartHour,
                          end_hour: suggestedStartHour
                        })
                      } else {
                        setFormData({ ...formData, tractor: tractorId })
                      }
                    }}
                    disabled={editingId !== null}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                    } ${editingId !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                    required
                  >
                    <option value={0}>Select a tractor</option>
                    {tractors.map((tractor) => (
                      <option key={tractor.id} value={tractor.id}>
                        {tractor.name} - {tractor.tractor_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    disabled={editingId !== null}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                    } ${editingId !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Start Hour
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.start_hour}
                      onChange={(e) => setFormData({ ...formData, start_hour: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                      }`}
                      placeholder="e.g., 1400.5"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      End Hour
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.end_hour}
                      onChange={(e) => setFormData({ ...formData, end_hour: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                      }`}
                      placeholder="e.g., 1410.5"
                      required
                    />
                  </div>
                </div>

                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Hours:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {calculateTotalHours(formData.start_hour, formData.end_hour).toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg ${
                      isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white disabled:opacity-50`}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {submitLoading ? 'Saving...' : editingId ? 'Update' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`px-4 py-2 rounded-lg ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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