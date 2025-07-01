'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, FileText, Database, Sun, Moon, Phone } from 'lucide-react'

type FollowUpCustomer = {
  id: number
  name: string
  mobile_number: string
  group: string
  follow_up_date: string | null
  status: 'Pending' | 'Followed'
}

type GroupedFollowUpCustomer = {
  group_number: number
  customers: FollowUpCustomer[]
}

export default function FollowUpCustomers() {
  const [groupedCustomers, setGroupedCustomers] = useState<GroupedFollowUpCustomer[]>([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchGroupedCustomers()
  }, [])

  const fetchGroupedCustomers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}follow-up-customers/group/`)
      if (!response.ok) {
        throw new Error('Failed to fetch grouped customers')
      }
      const data = await response.json()
      setGroupedCustomers(data)
    } catch (error) {
      console.error('Error fetching grouped customers:', error)
      setError('Failed to load customers. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`
  }

  const handleStatusChange = async (customerId: number, newStatus: 'Pending' | 'Followed') => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}follow-up-customers/${customerId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
            throw new Error('Failed to update status');
        }
        setGroupedCustomers(prevGroups =>
            prevGroups.map(group => ({
                ...group,
                customers: group.customers.map(customer =>
                    customer.id === customerId ? { ...customer, status: newStatus } : customer
                )
            }))
        );
    } catch (error) {
        console.error('Error updating status:', error);
        setError('Failed to update status. Please try again.');
    }
};

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/daysheet/daysheetmain" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Follow Up Customers</h1>
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
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {groupedCustomers.map((group) => (
              <div key={group.group_number} className="mb-6">
                <h2 className="text-lg font-bold mb-2">Group {group.group_number}</h2>
                <table className={`min-w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg overflow-hidden`}>
                  <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Tel</th>
                      <th className="px-4 py-2 text-left">Group</th>
                      <th className="px-4 py-2 text-left">Follow-Up Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.customers.map((customer, index) => (
                      <tr key={customer.id} className={`${index % 2 === 0 ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-50') : ''}`}>
                        <td className="px-4 py-2 font-bold">{customer.name}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleStatusChange(customer.id, customer.status === 'Pending' ? 'Followed' : 'Pending')}
                            className={`px-2 py-1 rounded-md text-sm transition-colors ${
                              customer.status === 'Pending'
                                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                : 'bg-green-200 text-green-800 hover:bg-green-300'
                            }`}
                          >
                            {customer.status}
                          </button>
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleCall(customer.mobile_number)}
                            className="flex items-center text-blue-500 hover:text-blue-600"
                            aria-label={`Call ${customer.name}`}
                          >
                            <Phone size={16} className="mr-2" />
                            {customer.mobile_number}
                          </button>
                        </td>
                        <td className="px-4 py-2">{customer.group}</td>
                        <td className="px-4 py-2">{customer.follow_up_date ? new Date(customer.follow_up_date).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </main>

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