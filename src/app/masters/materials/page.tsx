'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, Plus, Edit, Trash2, Calendar, FileText, Database, Package, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface Material {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export default function MaterialsPage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [formData, setFormData] = useState({ name: '' })
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchMaterials = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}materials/`)
      if (response.ok) {
        const data = await response.json()
        setMaterials(data)
      } else {
        setErrorMessage('Failed to fetch materials')
      }
    } catch (error) {
      setErrorMessage('Error fetching materials')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}materials/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccessMessage('Material created successfully!')
        setIsCreateOpen(false)
        setFormData({ name: '' })
        fetchMaterials()
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.errors?.name?.[0] || 'Failed to create material')
      }
    } catch (error) {
      setErrorMessage('Error creating material')
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMaterial) return

    setSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}materials/${editingMaterial.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccessMessage('Material updated successfully!')
        setIsEditOpen(false)
        setEditingMaterial(null)
        setFormData({ name: '' })
        fetchMaterials()
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.errors?.name?.[0] || 'Failed to update material')
      }
    } catch (error) {
      setErrorMessage('Error updating material')
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}materials/${id}/`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccessMessage('Material deleted successfully!')
        fetchMaterials()
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setErrorMessage('Failed to delete material')
      }
    } catch (error) {
      setErrorMessage('Error deleting material')
      console.error('Error:', error)
    }
  }

  const openEditDialog = (material: Material) => {
    setEditingMaterial(material)
    setFormData({ name: material.name })
    setIsEditOpen(true)
    setErrorMessage('')
  }

  const openCreateDialog = () => {
    setIsCreateOpen(true)
    setFormData({ name: '' })
    setErrorMessage('')
  }

  const closeCreateDialog = () => {
    setIsCreateOpen(false)
    setFormData({ name: '' })
    setErrorMessage('')
  }

  const closeEditDialog = () => {
    setIsEditOpen(false)
    setEditingMaterial(null)
    setFormData({ name: '' })
    setErrorMessage('')
  }

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/masters/mastermain" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-purple-900'}`}>
                Materials
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={openCreateDialog}
                className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
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

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
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

        {/* Materials List Card */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Loading materials...</p>
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  No materials found
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Add your first material to get started
                </p>
                <button
                  onClick={openCreateDialog}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Add Material
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {materials.map((material) => (
                  <div key={material.id} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                    <div className="font-medium">{material.name}</div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditDialog(material)}
                        className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} text-blue-600 hover:text-blue-700`}
                        title="Edit Material"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(material.id, material.name)}
                        className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} text-red-600 hover:text-red-700`}
                        title="Delete Material"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>


      </main>

      {/* Create Material Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-md w-full`}>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Create New Material</h3>
              
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Material Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter material name"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                    }`}
                    required
                    disabled={submitting}
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeCreateDialog}
                    disabled={submitting}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } disabled:opacity-50`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Material'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Material Modal */}
      {isEditOpen && editingMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-md w-full`}>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Edit Material</h3>
              
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Material Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter material name"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                    }`}
                    required
                    disabled={submitting}
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditDialog}
                    disabled={submitting}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } disabled:opacity-50`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {submitting ? 'Updating...' : 'Update Material'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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