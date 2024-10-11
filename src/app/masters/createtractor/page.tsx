"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CreateTractor() {
  const [formData, setFormData] = useState({
    name: '',
    tractor_number: '',
    rc_date: '',
  })
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prevState => ({ ...prevState, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')
    
    try {
      const response = await fetch('http://localhost:8000/api/tractors/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Response from backend:', result)
        setSuccessMessage('Tractor created successfully!')
        setFormData({ name: '', tractor_number: '', rc_date: '' })
      } else {
        const errorData = await response.json()
        if (errorData.errors) {
          const errors = Object.values(errorData.errors).flat().join(', ')
          setErrorMessage(`Error: ${errors}`)
        } else {
          setErrorMessage('Failed to create tractor.')
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrorMessage('An unexpected error occurred. Please try again later.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 flex items-center">
          <Link href="/masters/mastermain" className="text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Tractor</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-12">
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-8">
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Tractor Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="tractor_number" className="block text-sm font-medium text-gray-700 mb-2">
              Tractor Number
            </label>
            <input
              type="text"
              id="tractor_number"
              name="tractor_number"
              value={formData.tractor_number}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="rc_date" className="block text-sm font-medium text-gray-700 mb-2">
              RC Date
            </label>
            <input
              type="date"
              id="rc_date"
              name="rc_date"
              value={formData.rc_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            Submit
          </button>
        </form>
      </main>
    </div>
  )
}