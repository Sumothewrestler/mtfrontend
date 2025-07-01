"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, FileText, Database, Moon, Sun } from 'lucide-react'

type Tractor = {
  id: number
  name: string
}

export default function TractorHours() {
  const [date, setDate] = useState('')
  const [tractors, setTractors] = useState<Tractor[]>([])
  const [hours, setHours] = useState<{[key: number]: {start: string, end: string, total: number}}>({})
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tractors/list/`)
      .then(response => response.json())
      .then(data => setTractors(data))
  }, [])

  const handleHourChange = (id: number, field: 'start' | 'end', value: string) => {
    setHours(prev => {
      const newHours = { ...prev[id], [field]: value }
      const start = parseFloat(newHours.start) || 0
      const end = parseFloat(newHours.end) || 0
      newHours.total = Math.max(0, end - start)
      return { ...prev, [id]: newHours }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const submissionData = {
        date,
        hours: Object.entries(hours).reduce((acc, [id, hourData]) => {
          acc[id] = {
            start: parseFloat(hourData.start),
            end: parseFloat(hourData.end),
            total: hourData.total
          }
          return acc
        }, {} as Record<string, { start: number; end: number; total: number }>)
      };
  
      console.log('Submitting tractor hours:', JSON.stringify(submissionData, null, 2))
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tractor-hours/submit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })
  
      console.log('Response status:', response.status)
  
      if (!response.ok) {
        const errorData = await response.text()
        console.error('Error response:', errorData)
        throw new Error(`Failed to submit tractor hours: ${response.status} ${response.statusText}\n${errorData}`)
      }
  
      const result = await response.json()
      console.log('Tractor hours submitted:', result)
      setDate('')
      setHours({})
      alert('Tractor hours submitted successfully!')
    } catch (error) {
      console.error('Error submitting tractor hours:', error)
      if (error instanceof Error) {
        alert(`Failed to submit tractor hours. Error: ${error.message}`)
      } else {
        alert('Failed to submit tractor hours. An unknown error occurred.')
      }
    }
  }

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/daysheet/daysheetmain" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Tractor Hours</h1>
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
        <form onSubmit={handleSubmit} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-8`}>
          <div className="mb-6">
            <label htmlFor="date" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="mb-6">
            <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Tractor Hours</h2>
            <div className="space-y-4">
              {tractors.map(tractor => (
                <div key={tractor.id} className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{tractor.name}</div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor={`start-${tractor.id}`} className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Starting Hour
                      </label>
                      <input
                        type="number"
                        id={`start-${tractor.id}`}
                        value={hours[tractor.id]?.start || ''}
                        onChange={(e) => handleHourChange(tractor.id, 'start', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label htmlFor={`end-${tractor.id}`} className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Closing Hour
                      </label>
                      <input
                        type="number"
                        id={`end-${tractor.id}`}
                        value={hours[tractor.id]?.end || ''}
                        onChange={(e) => handleHourChange(tractor.id, 'end', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label htmlFor={`total-${tractor.id}`} className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Total Hours
                      </label>
                      <input
                        type="number"
                        id={`total-${tractor.id}`}
                        value={hours[tractor.id]?.total || 0}
                        readOnly
                        className={`w-full px-3 py-2 border rounded-md ${
                          isDarkMode ? 'bg-gray-500 border-gray-400 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
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