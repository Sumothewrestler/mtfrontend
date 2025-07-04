'use client'

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, FileText, Database, Sun, Moon } from 'lucide-react'

export default function FollowUpCustomer() {
  const [formData, setFormData] = useState({
    name: "",
    group: "",
    mobile_number: "",
  })
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)

  const groups = ["Borewell", "Contractors", "Engineers", "JCB", "Mesthri", "Transports", "Others"]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prevState) => ({ ...prevState, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    setSuccessMessage("")
    setErrorMessage("")
  
    // Validate mobile number format
    if (!/^\d{10}$/.test(formData.mobile_number)) {
      setErrorMessage("Mobile number must be exactly 10 digits.")
      return
    }
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}follow-up-customers/create/`, { // Updated URL to match the correct endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
  
      if (response.ok) {
        setSuccessMessage("Follow up customer created successfully!")
        setFormData({ 
          name: "",
          group: "",
          mobile_number: "",
        })
      } else {
        const errorData = await response.json()
        if (errorData.errors) {
          const errors = Object.values(errorData.errors)
            .flat()
            .join(", ")
          setErrorMessage(`Error: ${errors}`)
        } else {
          setErrorMessage("Failed to create follow up customer.")
        }
        console.error("Error:", errorData)
      }
    } catch (error) {
      console.error("Error:", error)
      setErrorMessage("An unexpected error occurred. Please try again later.")
    }
  }

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/masters/mastermain" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Create Follow Up Customer</h1>
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
        <form onSubmit={handleSubmit} className={`max-w-lg mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg p-8`}>
          <div className="mb-6">
            <label htmlFor="name" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Follow Up Customer Name
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
            <label htmlFor="mobile_number" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Mobile Number
            </label>
            <input
              type="tel"
              id="mobile_number"
              name="mobile_number"
              value={formData.mobile_number}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              maxLength={10}
              placeholder="e.g., 9443225671"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
              }`}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="group" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Group
            </label>
            <select
              id="group"
              name="group"
              value={formData.group}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
              }`}
            >
              <option value="">Select a group</option>
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Submit
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