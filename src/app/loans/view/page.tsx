"use client"

import { useState, useEffect, useRef } from "react"
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  X,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Wallet,
  Calendar,
  CreditCard,
  Clock,
  FileText,
  Database,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface Loan {
  id: string
  loan_name: string
  loan_amount?: number
  amount_received?: number
  received_date?: string
  received_account?: number
  received_account_name?: string
  emi_amount: number
  tenure_months: number
  start_date: string
  is_legacy?: boolean
  status?: string
  paid_emis_count?: number
  total_loan_amount?: number
  total_paid_amount?: number
  remaining_amount?: number
  remaining_emis?: number
  next_due_emi?: {
    due_date: string
    amount: number
  }
}

interface VisibilityOptions {
  emiAmount: boolean
  startDate: boolean
  tenure: boolean
  progress: boolean
}

type SortOption = "nameAsc" | "nameDesc" | "dateOld" | "dateNew" | "amountHigh" | "amountLow" | null

export default function LoansViewPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"card" | "table">("card")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [sortOption, setSortOption] = useState<SortOption>("nameAsc")
  const [visibilityOptions, setVisibilityOptions] = useState<VisibilityOptions>({
    emiAmount: true,
    startDate: true,
    tenure: true,
    progress: true,
  })
  const filterPanelRef = useRef<HTMLDivElement>(null)

  // Check system preference for dark mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Always use light theme regardless of device preference
      setIsDarkMode(false);
    }
  }, [])

  // Handle clicks outside panels
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setShowFilterPanel(false)
      }
      if (
        showMobileSearch &&
        !(event.target as Element).closest(".mobile-search-container") &&
        !(event.target as Element).closest(".mobile-search-toggle")
      ) {
        setShowMobileSearch(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMobileSearch])

  // Fetch loans
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}emi/loans/`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch loans")
        }

        const data = await response.json()
        // Ensure data is an array
        const loansArray = Array.isArray(data) ? data : data.results || [];
        setLoans(loansArray)
        setFilteredLoans(loansArray)
      } catch (err) {
        console.error("Error fetching loans:", err)
        setError("Failed to load loans")
        // Set empty arrays as fallback
        setLoans([])
        setFilteredLoans([])
      } finally {
        setLoading(false)
      }
    }

    fetchLoans()
  }, [])

  // Apply filtering and sorting
  useEffect(() => {
    let filtered = [...loans]

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((loan) =>
        loan.loan_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    switch (sortOption) {
      case "nameAsc":
        filtered.sort((a, b) => a.loan_name.localeCompare(b.loan_name))
        break
      case "nameDesc":
        filtered.sort((a, b) => b.loan_name.localeCompare(a.loan_name))
        break
      case "dateOld":
        filtered.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
        break
      case "dateNew":
        filtered.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
        break
      case "amountHigh":
        filtered.sort((a, b) => b.emi_amount - a.emi_amount)
        break
      case "amountLow":
        filtered.sort((a, b) => a.emi_amount - b.emi_amount)
        break
    }

    setFilteredLoans(filtered)
  }, [loans, searchTerm, sortOption])

  // Handle delete
  const handleDelete = async (id: string) => {
    if (deleteConfirmId === id) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}emi/loans/${id}/`, {
          method: "DELETE"
        })

        if (!response.ok) {
          throw new Error("Failed to delete loan")
        }

        setLoans(loans.filter((loan) => loan.id !== id))
        setDeleteConfirmId(null)
        setError("Loan deleted successfully")
        setTimeout(() => setError(null), 2000)
      } catch (err) {
        console.error("Error deleting loan:", err)
        setError(err instanceof Error ? err.message : "Failed to delete loan")
      }
    } else {
      setDeleteConfirmId(id)
      setTimeout(() => setDeleteConfirmId(null), 5000)
    }
  }

  const toggleViewMode = () => setViewMode((prev) => (prev === "card" ? "table" : "card"))
  const toggleFilter = () => setShowFilterPanel(!showFilterPanel)
  const toggleSortOption = (option: SortOption) => setSortOption(option === sortOption ? null : option)
  const toggleVisibilityOption = (option: keyof VisibilityOptions) => {
    setVisibilityOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }))
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Calculate progress percentage
  const calculateProgress = (loan: Loan) => {
    if (!loan.paid_emis_count) return 0
    return (loan.paid_emis_count / loan.tenure_months) * 100
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
          isDarkMode ? "border-blue-400" : "border-blue-600"
        }`}></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${
      isDarkMode
        ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
        : "bg-gradient-to-br from-gray-50 to-gray-100"
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className={`rounded-2xl shadow-xl overflow-hidden ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } border border-blue-200`}>
          {/* Header section */}
          <div className="relative h-48">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl"></div>
            
            {/* Decorative shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-indigo-400 opacity-20 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-blue-300 opacity-30 translate-x-1/3 -translate-y-1/3"></div>
            
            {/* Header content */}
            <div className="relative z-10 h-full px-6 py-8 sm:p-10 flex flex-col justify-center">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <Link
                      href="/admin/master"
                      className="mr-3 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                    >
                      <ArrowLeft className="h-5 w-5 text-white" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white drop-shadow-md">Loans</h1>
                  </div>
                  <p className="mt-2 text-white/80 drop-shadow">Manage your loan EMIs</p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Desktop Search */}
                  <div className="hidden sm:flex relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search loans..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 w-60"
                    />
                  </div>

                  {/* Add Loan Button */}
                  <Link
                    href="/loans/create"
                    className={`
                      px-3 py-2 rounded-lg
                      transition-all duration-200 
                      shadow-lg
                      transform hover:scale-105
                      flex items-center gap-1.5
                      text-sm
                      ${
                        isDarkMode
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-indigo-900/30"
                          : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-indigo-600/20"
                      }
                    `}
                  >
                    <Plus size={16} />
                    <span>Add Loan</span>
                  </Link>

                  {/* View Toggle */}
                  <button
                    onClick={toggleViewMode}
                    className={`p-2 rounded-lg transition-colors duration-200 flex items-center gap-1.5 shadow-md text-sm
                      ${
                        isDarkMode
                          ? "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                          : "bg-white/90 hover:bg-white text-gray-700 backdrop-blur-sm"
                      }`}
                  >
                    <span className="inline sm:hidden">{viewMode === "card" ? "Table" : "Card"}</span>
                    <span className="hidden sm:inline">{viewMode === "card" ? "Table View" : "Card View"}</span>
                  </button>

                  {/* Mobile Search Toggle */}
                  <div className="sm:hidden">
                    <button
                      onClick={() => setShowMobileSearch(!showMobileSearch)}
                      className={`p-2 rounded-lg transition-colors duration-200 shadow-md mobile-search-toggle
                        ${
                          isDarkMode
                            ? "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                            : "bg-white/90 hover:bg-white text-gray-700 backdrop-blur-sm"
                        } ${showMobileSearch ? "ring-2 ring-white/50" : ""}`}
                    >
                      <Search size={16} />
                    </button>
                  </div>

                  {/* Filter Button */}
                  <button
                    onClick={toggleFilter}
                    className={`p-2 rounded-lg transition-colors duration-200 flex items-center gap-1.5 shadow-md
                      ${
                        isDarkMode
                          ? "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                          : "bg-white/90 hover:bg-white text-gray-700 backdrop-blur-sm"
                      } ${showFilterPanel ? "ring-2 ring-white/50" : ""}`}
                  >
                    <SlidersHorizontal size={16} />
                    <span className="hidden sm:inline text-sm">Filter</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Search */}
            {showMobileSearch && (
              <div className="absolute bottom-0 left-0 right-0 transform translate-y-full z-20 mobile-search-container">
                <div className="relative bg-indigo-600/95 backdrop-blur-sm p-3 rounded-b-xl shadow-lg border-t border-indigo-500">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-white/70" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search loans..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                      autoFocus
                    />
                    <button
                      onClick={() => setShowMobileSearch(false)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="px-6 pb-8 sm:px-10 sm:pb-10 pt-6">
            {error && (
              <div className={`mb-6 p-4 rounded-xl ${
                error.includes("successfully")
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-100"
              }`}>
                {error}
              </div>
            )}

            {viewMode === "table" ? (
              <div className="overflow-x-auto -mx-6 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-6 sm:px-0">
                  <div className="overflow-hidden rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr className={isDarkMode ? "bg-gray-700/50" : "bg-gray-50/80"}>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                            <button 
                              onClick={() => toggleSortOption(sortOption === "nameAsc" ? "nameDesc" : "nameAsc")}
                              className="flex items-center gap-1.5 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                            >
                              Loan Name
                              {sortOption === "nameAsc" && <ArrowUp size={14} />}
                              {sortOption === "nameDesc" && <ArrowDown size={14} />}
                            </button>
                          </th>
                          {visibilityOptions.emiAmount && (
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                              <button 
                                onClick={() => toggleSortOption(sortOption === "amountLow" ? "amountHigh" : "amountLow")}
                                className="flex items-center gap-1.5 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                              >
                                EMI Amount
                                {sortOption === "amountHigh" && <ArrowUp size={14} />}
                                {sortOption === "amountLow" && <ArrowDown size={14} />}
                              </button>
                            </th>
                          )}
                          {visibilityOptions.startDate && (
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                              <button 
                                onClick={() => toggleSortOption(sortOption === "dateOld" ? "dateNew" : "dateOld")}
                                className="flex items-center gap-1.5 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                              >
                                Start Date
                                {sortOption === "dateOld" && <ArrowUp size={14} />}
                                {sortOption === "dateNew" && <ArrowDown size={14} />}
                              </button>
                            </th>
                          )}
                          {visibilityOptions.tenure && (
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                              Tenure
                            </th>
                          )}
                          {visibilityOptions.progress && (
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                              Progress
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                        {filteredLoans.map((loan) => (
                          <tr key={loan.id} className={`${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="text-sm font-medium">{loan.loan_name}</div>
                                <div className="flex gap-1">
                                  <Link
                                    href={`/loans/edit/${loan.id}`}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      isDarkMode
                                        ? "bg-gray-700 text-amber-400 hover:bg-gray-600"
                                        : "bg-gray-100 text-amber-500 hover:bg-gray-200"
                                    }`}
                                  >
                                    <Edit size={14} />
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(loan.id)}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      deleteConfirmId === loan.id
                                        ? "bg-red-500 text-white"
                                        : isDarkMode
                                          ? "bg-gray-700 text-red-400 hover:bg-gray-600"
                                          : "bg-gray-100 text-red-500 hover:bg-gray-200"
                                    }`}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </td>
                            {visibilityOptions.emiAmount && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-4 text-sm">
                                  <span>{formatCurrency(loan.emi_amount)}</span>
                                  <span>/ {loan.tenure_months} months</span>
                                </div>
                              </td>
                            )}
                            {visibilityOptions.startDate && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm">{formatDate(loan.start_date)}</div>
                                  <Link
                                    href={`/loans/${loan.id}`}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-400 hover:to-blue-400 transition-colors`}
                                  >
                                    View
                                  </Link>
                                </div>
                              </td>
                            )}
                            {visibilityOptions.tenure && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm">{loan.tenure_months} months</div>
                              </td>
                            )}
                            {visibilityOptions.progress && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                  <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${calculateProgress(loan)}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs mt-1">
                                  {loan.paid_emis_count || 0} of {loan.tenure_months} EMIs paid
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLoans.map((loan) => (
                  <motion.div
                    key={loan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-6 ${
                      isDarkMode
                        ? "bg-gray-800/50 border border-gray-700"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{loan.loan_name}</h3>
                        <div className="flex gap-1">
                          <Link
                            href={`/loans/edit/${loan.id}`}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDarkMode
                                ? "bg-gray-700 text-amber-400 hover:bg-gray-600"
                                : "bg-gray-100 text-amber-500 hover:bg-gray-200"
                            }`}
                          >
                            <Edit size={14} />
                          </Link>
                          <button
                            onClick={() => handleDelete(loan.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              deleteConfirmId === loan.id
                                ? "bg-red-500 text-white"
                                : isDarkMode
                                  ? "bg-gray-700 text-red-400 hover:bg-gray-600"
                                  : "bg-gray-100 text-red-500 hover:bg-gray-200"
                            }`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm mb-4">
                      <div className="flex items-center">
                        <CreditCard size={16} className="mr-2 text-blue-500" />
                        {formatCurrency(loan.emi_amount)}
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2 text-blue-500" />
                        {loan.tenure_months} months
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm">
                        <Calendar size={16} className="mr-2 text-blue-500" />
                        Started: {formatDate(loan.start_date)}
                      </div>
                      <Link
                        href={`/loans/${loan.id}`}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-400 hover:to-blue-400 transition-colors`}
                      >
                        View
                      </Link>
                    </div>

                    {visibilityOptions.progress && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{loan.paid_emis_count || 0} of {loan.tenure_months} EMIs</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${calculateProgress(loan)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredLoans.length === 0 && (
              <div className="text-center py-12">
                <Wallet className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium">No loans found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? "Try a different search term" : "Get started by creating a new loan"}
                </p>
                <div className="mt-6">
                  <Link
                    href="/loans/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    New Loan
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setShowFilterPanel(false)}
          ></div>
          <div
            ref={filterPanelRef}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md rounded-xl shadow-2xl z-50 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } p-6`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Filter & Sort</h3>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Sort Options */}
              <div>
                <h4 className="text-sm font-medium mb-3">Sort By</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => toggleSortOption("nameAsc")}
                    className={`w-full p-2 rounded-lg text-left ${
                      sortOption === "nameAsc"
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Name (A-Z)
                  </button>
                  <button
                    onClick={() => toggleSortOption("amountHigh")}
                    className={`w-full p-2 rounded-lg text-left ${
                      sortOption === "amountHigh"
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Amount (High-Low)
                  </button>
                  <button
                    onClick={() => toggleSortOption("amountLow")}
                    className={`w-full p-2 rounded-lg text-left ${
                      sortOption === "amountLow"
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Amount (Low-High)
                  </button>
                  <button
                    onClick={() => toggleSortOption("dateNew")}
                    className={`w-full p-2 rounded-lg text-left ${
                      sortOption === "dateNew"
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Date (Newest First)
                  </button>
                  <button
                    onClick={() => toggleSortOption("dateOld")}
                    className={`w-full p-2 rounded-lg text-left ${
                      sortOption === "dateOld"
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Date (Oldest First)
                  </button>
                </div>
              </div>

              {/* Visibility Options */}
              <div>
                <h4 className="text-sm font-medium mb-3">Show/Hide Columns</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">EMI Amount</span>
                    <button
                      onClick={() => toggleVisibilityOption("emiAmount")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        visibilityOptions.emiAmount
                          ? "bg-blue-600"
                          : isDarkMode
                            ? "bg-gray-600"
                            : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          visibilityOptions.emiAmount ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Start Date</span>
                    <button
                      onClick={() => toggleVisibilityOption("startDate")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        visibilityOptions.startDate
                          ? "bg-blue-600"
                          : isDarkMode
                            ? "bg-gray-600"
                            : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          visibilityOptions.startDate ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tenure</span>
                    <button
                      onClick={() => toggleVisibilityOption("tenure")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        visibilityOptions.tenure
                          ? "bg-blue-600"
                          : isDarkMode
                            ? "bg-gray-600"
                            : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          visibilityOptions.tenure ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Progress</span>
                    <button
                      onClick={() => toggleVisibilityOption("progress")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        visibilityOptions.progress
                          ? "bg-blue-600"
                          : isDarkMode
                            ? "bg-gray-600"
                            : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          visibilityOptions.progress ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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
          <Link href="/loans/view" className={`flex flex-col items-center py-2 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
            <CreditCard className="h-6 w-6 mb-1" />
            <span className="text-xs">Loans</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}