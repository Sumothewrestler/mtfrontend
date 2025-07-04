'use client'

import { useState, useEffect, useCallback } from 'react'
import { Moon, Sun, Filter, Calendar, FileText, Database, Package, Users, ArrowLeft, Download, TrendingUp, TrendingDown} from 'lucide-react'
import Link from 'next/link'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface MaterialReport {
  material_id: number
  material_name: string
  total_need: number
  total_offer: number
  transactions: MaterialTransaction[]
}

interface MaterialTransaction {
  id: number
  customer_name: string
  material_name: string
  unit_name: string
  quantity: string
  type: 'need' | 'offer'
  type_display: string
  status: 'pending' | 'done' | 'cancelled'
  status_display: string
  date: string
  remarks: string
  created_at: string
}

interface MaterialDetail {
  material_id: number
  material_name: string
  transactions: MaterialTransaction[]
}

export default function MaterialReportsPage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [materialReports, setMaterialReports] = useState<MaterialReport[]>([])
  const [filteredReports, setFilteredReports] = useState<MaterialReport[]>([])
  const [selectedMaterialDetail, setSelectedMaterialDetail] = useState<MaterialDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showMaterialDetail, setShowMaterialDetail] = useState(false)
  const [selectedType, setSelectedType] = useState<'all' | 'need' | 'offer'>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'done' | 'cancelled'>('all')
  const [showDetailFilters, setShowDetailFilters] = useState(false)

  useEffect(() => {
    fetchMaterialReports()
  }, [])

  const fetchMaterialReports = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}materials/report/`)
      if (response.ok) {
        const data = await response.json()
        setMaterialReports(data)
      }
    } catch (error) {
      console.error('Error fetching material reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMaterialDetail = async (materialId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}material-transactions/by-material/${materialId}/`)
      if (response.ok) {
        const data = await response.json()
        setSelectedMaterialDetail({
          material_id: data.material_id,
          material_name: data.material_name,
          transactions: data.transactions
        })
        setShowMaterialDetail(true)
      }
    } catch (error) {
      console.error('Error fetching material details:', error)
    }
  }

  const filterReports = useCallback(() => {
    let filtered = materialReports

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.material_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredReports(filtered)
  }, [materialReports, searchTerm])

  useEffect(() => {
    filterReports()
  }, [materialReports, searchTerm, filterReports])

  const getFilteredDetailTransactions = () => {
    if (!selectedMaterialDetail) return []

    let filtered = selectedMaterialDetail.transactions

    if (selectedType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === selectedType)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === selectedStatus)
    }

    return filtered
  }

  const exportToCSV = useCallback(() => {
    const csvContent = [
      ['Material Name', 'Total Need', 'Total Offer', 'Balance', 'Status'],
      ...filteredReports.map(report => [
        report.material_name,
        report.total_need.toString(),
        report.total_offer.toString(),
        (report.total_offer - report.total_need).toString(),
        report.total_need > report.total_offer ? 'Shortfall' : 
        report.total_offer > report.total_need ? 'Surplus' : 'Balanced'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `material_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [filteredReports])

  const calculateSummaryStats = useCallback(() => {
    const totalMaterials = materialReports.length
    const totalNeed = materialReports.reduce((sum, report) => sum + report.total_need, 0)
    const totalOffer = materialReports.reduce((sum, report) => sum + report.total_offer, 0)
    const shortfallMaterials = materialReports.filter(report => report.total_need > report.total_offer).length
    const surplusMaterials = materialReports.filter(report => report.total_offer > report.total_need).length

    return {
      totalMaterials,
      totalNeed,
      totalOffer,
      shortfallMaterials,
      surplusMaterials,
      netBalance: totalOffer - totalNeed
    }
  }, [materialReports])

  const summaryStats = calculateSummaryStats()

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                href="/reports" 
                className={`mr-4 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-purple-900'}`}>
                  Material Reports
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportToCSV}
                className={`flex items-center px-3 py-2 rounded-lg text-sm ${
                  isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                <Download className="h-4 w-4 mr-1" />
                Export CSV
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
        
        {/* Search and Summary Stats */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Materials</p>
                  <p className="text-2xl font-bold">{summaryStats.totalMaterials}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Need</p>
                  <p className="text-2xl font-bold text-blue-600">{summaryStats.totalNeed}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Offer</p>
                  <p className="text-2xl font-bold text-green-600">{summaryStats.totalOffer}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Net Balance</p>
                  <p className={`text-2xl font-bold ${
                    summaryStats.netBalance > 0 ? 'text-green-600' : 
                    summaryStats.netBalance < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {summaryStats.netBalance > 0 ? '+' : ''}{summaryStats.netBalance}
                  </p>
                </div>
                <Filter className="h-8 w-8 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Material-Wise Report Table */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg mb-6`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold flex items-center">
              <Package className="mr-3" />
              Material Reports
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                No material data found
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Add material transactions to see reports
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Material Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Need
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Offer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredReports.map((report) => {
                    const balance = report.total_offer - report.total_need
                    
                    return (
                      <tr 
                        key={report.material_id} 
                        className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} cursor-pointer`}
                        onClick={() => fetchMaterialDetail(report.material_id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {report.material_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-blue-600">
                            {report.total_need}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-green-600">
                            {report.total_offer}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`font-medium ${
                            balance > 0 ? 'text-green-600' : 
                            balance < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {balance > 0 ? '+' : ''}{balance}
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
      </main>

      {/* Material Detail Modal */}
      {showMaterialDetail && selectedMaterialDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden`}>
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedMaterialDetail.material_name} - Details View
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Complete transaction history and manual matching
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowDetailFilters(!showDetailFilters)}
                    className={`flex items-center px-3 py-1 rounded-lg text-sm ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    Filters
                  </button>
                  <button
                    onClick={() => {
                      setShowMaterialDetail(false)
                      setSelectedMaterialDetail(null)
                      setSelectedType('all')
                      setSelectedStatus('all')
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Detail Filters */}
              {showDetailFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Transaction Type
                      </label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedType('all')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            selectedType === 'all'
                              ? 'bg-blue-600 text-white'
                              : isDarkMode
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setSelectedType('need')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            selectedType === 'need'
                              ? 'bg-blue-600 text-white'
                              : isDarkMode
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          Need
                        </button>
                        <button
                          onClick={() => setSelectedType('offer')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            selectedType === 'offer'
                              ? 'bg-green-600 text-white'
                              : isDarkMode
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          Offer
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Status
                      </label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedStatus('all')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            selectedStatus === 'all'
                              ? 'bg-blue-600 text-white'
                              : isDarkMode
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setSelectedStatus('pending')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            selectedStatus === 'pending'
                              ? 'bg-yellow-600 text-white'
                              : isDarkMode
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => setSelectedStatus('done')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            selectedStatus === 'done'
                              ? 'bg-green-600 text-white'
                              : isDarkMode
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          Done
                        </button>
                        <button
                          onClick={() => setSelectedStatus('cancelled')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            selectedStatus === 'cancelled'
                              ? 'bg-red-600 text-white'
                              : isDarkMode
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          Cancelled
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {getFilteredDetailTransactions().length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    No transactions found
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Try adjusting your filters
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {getFilteredDetailTransactions().map((transaction) => (
                        <tr key={transaction.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.type === 'need' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {transaction.type_display}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium">{transaction.customer_name}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium">{transaction.quantity}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div>{transaction.unit_name}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.status === 'done' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status_display}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="max-w-xs truncate" title={transaction.remarks}>
                              {transaction.remarks || '-'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-center`}>
                🔸 Use this detailed view to manually match supply with demand by customer
                <br />
                🔸 Shows both Needs and Offers with their status and transaction information
              </div>
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