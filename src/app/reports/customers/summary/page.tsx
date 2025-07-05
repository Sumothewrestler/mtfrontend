"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Moon,
  Sun,
  ZoomIn,
  ZoomOut,
  Search,
  SortAsc,
  SortDesc,
  LayoutGrid,
  List,
} from "lucide-react"

type CustomerOutstanding = {
  customerName: string
  phoneNumber: string
  totalAmountDr: number
  totalAmountCr: number
}

type SortField = "customerName" | "netOutstanding"
type SortOrder = "asc" | "desc"

export default function TotalCustomerOutstanding() {
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  const [asOnDate, setAsOnDate] = useState(getCurrentDate())
  const [outstandingData, setOutstandingData] = useState<CustomerOutstanding[]>([])
  const [filteredData, setFilteredData] = useState<CustomerOutstanding[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [zoom, setZoom] = useState(100)

  // New state variables for the requested features
  const [isCardView, setIsCardView] = useState(true)
  const [showZeroBalances, setShowZeroBalances] = useState(false)
  const [sortField, setSortField] = useState<SortField>("netOutstanding")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [searchQuery, setSearchQuery] = useState("")

  // Generate report on component mount with current date
  useEffect(() => {
    generateReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filter and sort data whenever relevant state changes
  useEffect(() => {
    if (outstandingData.length > 0) {
      let filtered = [...outstandingData]

      // Apply zero balance filter
      if (!showZeroBalances) {
        filtered = filtered.filter((customer) => calculateNetOutstanding(customer) !== 0)
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter((customer) => customer.customerName.toLowerCase().includes(query))
      }

      // Apply sorting
      filtered.sort((a, b) => {
        if (sortField === "customerName") {
          return sortOrder === "asc"
            ? a.customerName.localeCompare(b.customerName)
            : b.customerName.localeCompare(a.customerName)
        } else {
          const netA = calculateNetOutstanding(a)
          const netB = calculateNetOutstanding(b)
          return sortOrder === "asc" ? netA - netB : netB - netA
        }
      })

      setFilteredData(filtered)
    }
  }, [outstandingData, showZeroBalances, sortField, sortOrder, searchQuery])

  const generateReport = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}total-customer-outstanding/?asOnDate=${asOnDate}`
      console.log("Fetching report from:", url)

      const response = await fetch(url)
      console.log("Response status:", response.status)

      const responseText = await response.text()
      console.log("Response text:", responseText)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`)
      }

      const data = JSON.parse(responseText)
      console.log("Parsed data:", data)
      setOutstandingData(data)
    } catch (error) {
      console.error("Error fetching total customer outstanding:", error)
      if (error instanceof Error) {
        setError(`Failed to generate report. Error: ${error.message}`)
      } else {
        setError("Failed to generate report. An unknown error occurred.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const calculateNetOutstanding = (customer: CustomerOutstanding) => {
    return customer.totalAmountDr - customer.totalAmountCr
  }

  const calculateTotalNetOutstanding = () => {
    return filteredData.reduce((total, customer) => total + calculateNetOutstanding(customer), 0)
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50))

  const toggleSortField = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      // Set new field with default order (desc for amount, asc for name)
      setSortField(field)
      setSortOrder(field === "netOutstanding" ? "desc" : "asc")
    }
  }

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}
      style={{ fontSize: `${zoom}%` }}
    >
      <header className={`${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link
              href="/reports"
              className={`${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"} mr-4`}
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Total Customer Outstanding</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleZoomOut}
              className={`p-2 rounded-full ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-800"}`}
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={handleZoomIn}
              className={`p-2 rounded-full ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-800"}`}
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full ${isDarkMode ? "bg-gray-700 text-yellow-300" : "bg-gray-200 text-gray-800"}`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="w-full md:w-1/3">
              <label
                htmlFor="asOnDate"
                className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                As on Date
              </label>
              <input
                type="date"
                id="asOnDate"
                value={asOnDate}
                onChange={(e) => setAsOnDate(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
            <div className="w-full md:w-1/3 flex items-end">
              <button
                onClick={generateReport}
                className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                  isDarkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>

          {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

          {outstandingData.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                {/* View Toggle */}
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>View:</span>
                  <div
                    className={`flex rounded-md overflow-hidden border ${isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                  >
                    <button
                      onClick={() => setIsCardView(true)}
                      className={`px-3 py-1.5 flex items-center gap-1 ${
                        isCardView
                          ? isDarkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : isDarkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <LayoutGrid size={16} />
                      <span className="hidden sm:inline">Card</span>
                    </button>
                    <button
                      onClick={() => setIsCardView(false)}
                      className={`px-3 py-1.5 flex items-center gap-1 ${
                        !isCardView
                          ? isDarkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : isDarkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <List size={16} />
                      <span className="hidden sm:inline">Table</span>
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className={`relative w-full md:w-1/3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
              </div>

              {/* Filters and Sorting */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div
                    className={`flex rounded-md overflow-hidden border ${isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                  >
                    <button
                      onClick={() => setIsCardView(true)}
                      className={`px-3 py-1.5 flex items-center gap-1 ${
                        isCardView
                          ? isDarkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : isDarkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <LayoutGrid size={16} />
                      <span className="hidden sm:inline">Card</span>
                    </button>
                    <button
                      onClick={() => setIsCardView(false)}
                      className={`px-3 py-1.5 flex items-center gap-1 ${
                        !isCardView
                          ? isDarkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : isDarkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <List size={16} />
                      <span className="hidden sm:inline">Table</span>
                    </button>
                  </div>
                  <button
                    onClick={() => toggleSortField("netOutstanding")}
                    className={`flex items-center px-2 py-1 rounded text-sm ${
                      sortField === "netOutstanding"
                        ? isDarkMode
                          ? "bg-blue-600 text-white"
                          : "bg-blue-100 text-blue-700"
                        : isDarkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Amount
                    {sortField === "netOutstanding" &&
                      (sortOrder === "desc" ? (
                        <SortDesc size={14} className="ml-1" />
                      ) : (
                        <SortAsc size={14} className="ml-1" />
                      ))}
                  </button>
                  <button
                    onClick={() => toggleSortField("customerName")}
                    className={`flex items-center px-2 py-1 rounded text-sm ${
                      sortField === "customerName"
                        ? isDarkMode
                          ? "bg-blue-600 text-white"
                          : "bg-blue-100 text-blue-700"
                        : isDarkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Name
                    {sortField === "customerName" &&
                      (sortOrder === "asc" ? (
                        <SortAsc size={14} className="ml-1" />
                      ) : (
                        <SortDesc size={14} className="ml-1" />
                      ))}
                  </button>
                  <button
                    onClick={() => setShowZeroBalances(!showZeroBalances)}
                    className={`px-3 py-1.5 rounded text-sm ${
                      showZeroBalances
                        ? isDarkMode
                          ? "bg-blue-600 text-white"
                          : "bg-blue-500 text-white"
                        : isDarkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Show 0
                  </button>
                </div>
              </div>

              {/* Card View */}
              {isCardView && (
                <>
                  <div className={`p-4 rounded-lg shadow mb-4 ${
                    isDarkMode ? "bg-gray-700" : "bg-white"
                  }`}>
                    <h3 className={`font-medium text-lg ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                      Total Outstanding: Rs. {calculateTotalNetOutstanding().toFixed(2)}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredData.map((customer, index) => {
                      const netOutstanding = calculateNetOutstanding(customer)
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-lg shadow ${
                            isDarkMode ? "bg-gray-700 hover:bg-gray-650" : "bg-white hover:bg-gray-50"
                          } transition-colors`}
                        >
                          <h3 className={`font-medium text-lg mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                            {customer.customerName}
                            {customer.phoneNumber && customer.phoneNumber !== "0" && (
                              <a
                                href={`tel:${customer.phoneNumber}`}
                                className="ml-2 px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-full hover:from-blue-600 hover:to-blue-700 transition-all"
                              >
                                Call
                              </a>
                            )}
                          </h3>
                          <div className="flex justify-between items-center mt-2">
                            <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              Net Outstanding:
                            </span>
                            <span
                              className={`font-semibold ${
                                netOutstanding > 0
                                  ? "text-green-500"
                                  : netOutstanding < 0
                                    ? "text-red-500"
                                    : isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-500"
                              }`}
                            >
                              {netOutstanding.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1 text-xs">
                            <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                              Dr: {customer.totalAmountDr.toFixed(2)}
                            </span>
                            <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                              Cr: {customer.totalAmountCr.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Table View */}
              {!isCardView && (
                <div className="overflow-x-auto">
                  <table className={`min-w-full divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                    <thead className={isDarkMode ? "bg-gray-700" : "bg-gray-50"}>
                      <tr>
                        <th
                          scope="col"
                          className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
                          onClick={() => toggleSortField("customerName")}
                        >
                          <div className="flex items-center">
                            Customer Name
                            {sortField === "customerName" &&
                              (sortOrder === "asc" ? (
                                <SortAsc size={14} className="ml-1" />
                              ) : (
                                <SortDesc size={14} className="ml-1" />
                              ))}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
                        >
                          Dr Amount
                        </th>
                        <th
                          scope="col"
                          className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
                        >
                          Cr Amount
                        </th>
                        <th
                          scope="col"
                          className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider cursor-pointer ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
                          onClick={() => toggleSortField("netOutstanding")}
                        >
                          <div className="flex items-center justify-end">
                            Net Outstanding
                            {sortField === "netOutstanding" &&
                              (sortOrder === "desc" ? (
                                <SortDesc size={14} className="ml-1" />
                              ) : (
                                <SortAsc size={14} className="ml-1" />
                              ))}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                      {filteredData.map((customer, index) => {
                        const netOutstanding = calculateNetOutstanding(customer)
                        return (
                          <tr key={index} className={isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                            <td
                              className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                            >
                              {customer.customerName}
                            </td>
                            <td
                              className={`px-6 py-4 whitespace-nowrap text-sm text-right ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                            >
                              {customer.totalAmountDr.toFixed(2)}
                            </td>
                            <td
                              className={`px-6 py-4 whitespace-nowrap text-sm text-right ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                            >
                              {customer.totalAmountCr.toFixed(2)}
                            </td>
                            <td
                              className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                                netOutstanding > 0
                                  ? "text-green-500"
                                  : netOutstanding < 0
                                    ? "text-red-500"
                                    : isDarkMode
                                      ? "text-gray-300"
                                      : "text-gray-900"
                              }`}
                            >
                              {netOutstanding.toFixed(2)}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                              {customer.phoneNumber && customer.phoneNumber !== "0" && (
                                <a
                                  href={`tel:${customer.phoneNumber}`}
                                  className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-full hover:from-blue-600 hover:to-blue-700 transition-all"
                                >
                                  Call
                                </a>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td
                          colSpan={3}
                          className={`px-6 py-4 font-bold text-right ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                        >
                          Total Net Outstanding:
                        </td>
                        <td
                          className={`px-6 py-4 font-bold text-right ${
                            calculateTotalNetOutstanding() > 0
                              ? "text-green-500"
                              : calculateTotalNetOutstanding() < 0
                                ? "text-red-500"
                                : isDarkMode
                                  ? "text-gray-300"
                                  : "text-gray-900"
                          }`}
                        >
                          {calculateTotalNetOutstanding().toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>


    </div>
  )
}

