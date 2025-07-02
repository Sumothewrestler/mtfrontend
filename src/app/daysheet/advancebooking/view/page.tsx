'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Moon, Sun, Calendar, User, FileText, Clock } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import Loading from '@/components/Loading'

interface AdvanceBooking {
  id: number
  customer: number
  customer_name: string
  date: string
  description: string
  status: 'Pending' | 'Done' | 'Cancelled'
  created_at: string
  updated_at: string
}

type StatusFilter = 'Pending' | 'Done' | 'Cancelled' | 'All'

export default function AdvanceBookingReports() {
  const [bookings, setBookings] = useState<AdvanceBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('Pending')
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const fetchBookings = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const statusParam = activeFilter === 'All' ? '' : `?status=${activeFilter}`
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}advance-bookings/${statusParam}`)
      if (!response.ok) {
        throw new Error('Failed to fetch advance bookings')
      }
      const data = await response.json()
      setBookings(data)
    } catch (error) {
      console.error('Error fetching advance bookings:', error)
      setError('Failed to load advance bookings. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }, [activeFilter])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const updateStatus = async (id: number, newStatus: 'Pending' | 'Done' | 'Cancelled') => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}advance-bookings/${id}/update/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to update status: ${errorData.detail || 'Unknown error'}`)
      }

      const updatedBooking = await response.json()
      setBookings(bookings.map(booking => 
        booking.id === id ? { ...booking, status: updatedBooking.status } : booking
      ))
    } catch (error) {
      console.error('Error updating status:', error)
      alert(`Failed to update status. Error: ${(error as Error).message}`)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}advance-bookings/${id}/`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Failed to delete advance booking: ${errorData.detail || 'Unknown error'}`)
        }

        setBookings(bookings.filter(booking => booking.id !== id))
        alert('Advance booking deleted successfully.')
      } catch (error) {
        console.error('Error deleting advance booking:', error)
        alert(`Failed to delete advance booking. Error: ${(error as Error).message}`)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'Done':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const StatusButton = ({ status, isActive, onClick }: { status: StatusFilter, isActive: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive
          ? 'bg-blue-600 text-white dark:bg-blue-700'
          : isDarkMode
          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {status}
    </button>
  )

  const StatusTab = ({ booking }: { booking: AdvanceBooking }) => {
    const statuses: ('Pending' | 'Done' | 'Cancelled')[] = ['Pending', 'Done', 'Cancelled']
    
    return (
      <div className="flex flex-wrap gap-1">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => updateStatus(booking.id, status)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              booking.status === status
                ? getStatusColor(status) + ' font-medium'
                : isDarkMode
                ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/daysheet/daysheetmain" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Advance Booking Reports</h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(['Pending', 'Done', 'Cancelled', 'All'] as StatusFilter[]).map((status) => (
            <StatusButton
              key={status}
              status={status}
              isActive={activeFilter === status}
              onClick={() => setActiveFilter(status)}
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <Loading message="Loading advance bookings..." />
          </div>
        ) : bookings.length === 0 ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No advance bookings found for {activeFilter.toLowerCase()} status.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className={`p-4 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    : 'bg-white border-gray-200 hover:shadow-md'
                } transition-all duration-200`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold text-lg">{booking.customer_name}</h3>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(booking.date)}</span>
                  </div>
                  
                  <div className="flex items-start space-x-2 text-sm">
                    <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} line-clamp-2`}>
                      {booking.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-500">
                      Created: {formatDate(booking.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <StatusTab booking={booking} />
                  <button
                    onClick={() => handleDelete(booking.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}