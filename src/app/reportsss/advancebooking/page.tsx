'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Moon, Sun, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

type AdvanceBooking = {
  id: number
  date: string
  customerName: string
  description: string
}

export default function AdvanceBookingReports() {
  const [bookings, setBookings] = useState<AdvanceBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Toggle cells functionality
  const [expandedCells, setExpandedCells] = useState<Record<string, boolean>>({})

  const toggleCell = (cellKey: string) => {
    setExpandedCells(prev => ({
      ...prev,
      [cellKey]: !prev[cellKey]
    }))
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}advance-bookings/`)
      if (!response.ok) {
        throw new Error('Failed to fetch advance bookings')
      }
      const data = await response.json()
      // Sort bookings by earliest date
      const sortedBookings = data.sort((a: AdvanceBooking, b: AdvanceBooking) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      setBookings(sortedBookings)
    } catch (error) {
      console.error('Error fetching advance bookings:', error)
      setError('Failed to load advance bookings. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}advance-bookings/${id}/`, {
          method: 'DELETE',
        });
  
        // Log the response for debugging
        console.log(`Delete response for booking ID ${id}:`, response);
  
        if (!response.ok) {
          const errorData = await response.json(); // Get error details from the response
          console.error('Delete error response:', errorData);
          throw new Error(`Failed to delete advance booking: ${errorData.detail || 'Unknown error'}`);
        }
  
        // Update the state to remove the deleted booking
        setBookings(bookings.filter(booking => booking.id !== id));
        alert('Advance booking deleted successfully.');
      } catch (error) {
        console.error('Error deleting advance booking:', error);
        alert(`Failed to delete advance booking. Error: ${(error as Error).message}`);
      }
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/daysheet/daysheetmain" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Advance Booking Reports</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleCell('table')}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}
              title="Toggle table view"
            >
              {expandedCells['table'] ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg overflow-hidden`}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Advance Bookings</h2>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total: {bookings.length} bookings
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              Loading...
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No advance bookings found.
              </p>
            </div>
          ) : (
            <div className={`overflow-x-auto transition-all duration-200 ${
              expandedCells['table'] ? 'max-h-screen' : 'max-h-96 overflow-y-auto'
            }`}>
              <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Date
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Customer Name
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Description
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className={`font-medium ${expandedCells['table'] ? 'text-base' : 'text-sm'}`}>
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        {expandedCells['table'] && (
                          <div className="text-xs text-gray-500">
                            {new Date(booking.date).toLocaleDateString('en-US', { 
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className={`font-medium ${expandedCells['table'] ? 'text-base' : 'text-sm'}`}>
                          {booking.customerName}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} ${
                        expandedCells['table'] ? 'max-w-none' : 'max-w-xs'
                      }`}>
                        <div className={`${expandedCells['table'] ? 'text-base' : 'text-sm truncate'}`}>
                          {booking.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className={`p-2 rounded-full transition-colors duration-200 ${
                            isDarkMode 
                              ? 'text-red-400 hover:bg-gray-700 hover:text-red-300' 
                              : 'text-red-600 hover:bg-red-100 hover:text-red-700'
                          }`}
                          title="Delete booking"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary section when expanded */}
          {expandedCells['table'] && bookings.length > 0 && (
            <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Total Bookings:
                  </span>
                  <span className={`ml-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {bookings.length}
                  </span>
                </div>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Earliest Date:
                  </span>
                  <span className={`ml-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {bookings.length > 0 ? new Date(bookings[0].date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Latest Date:
                  </span>
                  <span className={`ml-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {bookings.length > 0 ? new Date(bookings[bookings.length - 1].date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}