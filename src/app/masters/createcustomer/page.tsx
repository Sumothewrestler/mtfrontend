'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Tag, Plus, X } from "lucide-react"

interface Tag {
  id: string
  name: string
  color: string
  description: string
}

export default function CreateCustomer() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone_number: "",
    opening_balance: "",
    tags: "",
    group: "",
  })
  const [tags, setTags] = useState<Tag[]>([])
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showTagModal, setShowTagModal] = useState(false)
  const [tagFormData, setTagFormData] = useState({
    name: "",
    color: "#3B82F6",
    description: "",
  })

  // Check system preference for dark mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(prefersDark)

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
      mediaQuery.addEventListener("change", handleChange)

      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tags/list/`)
      if (response.ok) {
        const data = await response.json()
        setTags(data)
      }
    } catch (error) {
      console.error("Error fetching tags:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prevState) => ({ ...prevState, [name]: value }))
  }

  const handleTagFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTagFormData((prevState) => ({ ...prevState, [name]: value }))
  }

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tags/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tagFormData),
      })

      if (response.ok) {
        const newTag = await response.json()
        setTags([...tags, newTag])
        setTagFormData({ name: "", color: "#3B82F6", description: "" })
        setShowTagModal(false)
        setFormData({ ...formData, tags: newTag.id })
      } else {
        const errorData = await response.json()
        console.error("Error creating tag:", errorData)
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    setSuccessMessage("")
    setErrorMessage("")
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}customers/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
  
      if (response.ok) {
        setSuccessMessage("Customer created successfully!")
        setFormData({ 
          name: "",
          address: "",
          phone_number: "",
          opening_balance: "",
          tags: "",
          group: "",
        })
      } else {
        const errorData = await response.json()
        if (errorData.errors) {
          const errors = Object.values(errorData.errors)
            .flat()
            .join(", ")
          setErrorMessage(`Error: ${errors}`)
        } else {
          setErrorMessage("Failed to create customer.")
        }
        console.error("Error:", errorData)
      }
    } catch (error) {
      console.error("Error:", error)
      setErrorMessage("An unexpected error occurred. Please try again later.")
    }
  }

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div
          className={`rounded-2xl shadow-xl overflow-hidden ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } border border-green-200`}
        >
          {/* Header section with stacked circular shapes - Green theme */}
          <div className="relative h-48">
            {/* Base background */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl"></div>

            {/* Stacked circular shapes from top-right */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-400 opacity-20 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-green-300 opacity-30 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-lime-200 opacity-40 translate-x-1/4 -translate-y-1/4"></div>

            {/* Content overlay */}
            <div className="relative z-10 h-full px-6 py-8 sm:p-10 flex flex-col justify-center">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <Link
                      href="/masters/mastermain"
                      className="mr-3 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                    >
                      <ArrowLeft className="h-5 w-5 text-white" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white drop-shadow-md">Create Customer</h1>
                  </div>
                  <p className="mt-2 text-white/80 drop-shadow">Add a new customer to your database</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link 
                    href="/masters/tags" 
                    className={`px-3 py-1 rounded-md text-sm font-medium bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-200`}
                  >
                    Manage Tags
                  </Link>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-200`}
                    aria-label="Toggle dark mode"
                  >
                    {isDarkMode ? '☀️' : '🌙'}
                  </button>
                </div>
              </div>
            </div>

            {/* Minimal connecting line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-green-200"></div>
          </div>

          {/* Content Area */}
          <div className="px-6 pb-8 sm:px-10 sm:pb-10 pt-6">
            {successMessage && (
              <div className={`mb-6 p-4 rounded-xl text-green-500 text-sm ${isDarkMode ? "bg-green-900/20" : "bg-green-50"}`}>
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className={`mb-6 p-4 rounded-xl text-red-500 text-sm ${isDarkMode ? "bg-red-900/20" : "bg-red-50"}`}>
                {errorMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className={`max-w-2xl mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-xl p-8 space-y-6`}>
              <div>
                <label htmlFor="name" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Customer Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="address" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                />
              </div>

              <div>
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="opening_balance" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Opening Balance
                </label>
                <input
                  type="number"
                  id="opening_balance"
                  name="opening_balance"
                  value={formData.opening_balance}
                  onChange={handleChange}
                  required
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="group" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Group
                </label>
                <select
                  id="group"
                  name="group"
                  value={formData.group}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="">Select Group</option>
                  <option value="1">Group 1</option>
                  <option value="2">Group 2</option>
                  <option value="3">Group 3</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="tags" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tag
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTagModal(true)}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md ${isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                  >
                    <Plus className="w-3 h-3" />
                    New Tag
                  </button>
                </div>
                <select
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="">Select Tag</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors ${
                  isDarkMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                Create Customer
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Create New Tag
              </h3>
              <button
                onClick={() => setShowTagModal(false)}
                className={`p-1 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTag}>
              <div className="mb-4">
                <label htmlFor="tag_name" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tag Name
                </label>
                <input
                  type="text"
                  id="tag_name"
                  name="name"
                  value={tagFormData.name}
                  onChange={handleTagFormChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="tag_color" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Color
                </label>
                <input
                  type="color"
                  id="tag_color"
                  name="color"
                  value={tagFormData.color}
                  onChange={handleTagFormChange}
                  className={`w-full h-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="tag_description" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  id="tag_description"
                  name="description"
                  value={tagFormData.description}
                  onChange={handleTagFormChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTagModal(false)}
                  className={`flex-1 py-2 px-4 rounded-md border ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2 px-4 rounded-md ${
                    isDarkMode
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  Create Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}