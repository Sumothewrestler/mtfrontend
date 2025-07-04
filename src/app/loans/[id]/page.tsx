"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Clock,
  Wallet,
  ListFilter,
  Grid,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Edit,
} from "lucide-react"
import { motion } from "framer-motion"

interface EMI {
  id: string
  month_number: number
  due_date: string
  paid_date: string | null
  status: "paid" | "pending" | "late"
  remarks: string
  created_at: string
  updated_at: string
}

interface Loan {
  id: string
  loan_name: string
  emi_amount: number
  tenure_months: number
  start_date: string
  paid_emis_count: number
  next_due_emi: {
    id: string
    month_number: number
    due_date: string
    status: string
  } | null
  total_paid_amount: number
  remaining_amount: number
  emis: EMI[]
  created_at: string
  updated_at: string
}

export default function LoanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [loan, setLoan] = useState<Loan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedEMI, setSelectedEMI] = useState<EMI | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0])
  const [paymentRemarks, setPaymentRemarks] = useState("")

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

  // Fetch loan details
  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}emi/loans/${resolvedParams.id}/`
        )
        if (!response.ok) throw new Error("Failed to fetch loan details")
        const data = await response.json()
        setLoan(data)
      } catch (err) {
        console.error("Error fetching loan:", err)
        setError(err instanceof Error ? err.message : "Failed to load loan details")
      } finally {
        setLoading(false)
      }
    }

    fetchLoanDetails()
  }, [resolvedParams.id])

  // Handle EMI payment
  const handleMarkAsPaid = async (emiId: string) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}emi/loan-emis/${emiId}/mark_paid/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paid_date: paymentDate,
            remarks: paymentRemarks,
          }),
        }
      )

      if (!response.ok) throw new Error("Failed to mark EMI as paid")

      // Refresh loan details
      const updatedLoanResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}emi/loans/${resolvedParams.id}/`
      )
      if (!updatedLoanResponse.ok) throw new Error("Failed to refresh loan details")
      
      const updatedLoan = await updatedLoanResponse.json()
      setLoan(updatedLoan)
      setIsPaymentModalOpen(false)
      setSelectedEMI(null)
      setPaymentRemarks("")
    } catch (err) {
      console.error("Error marking EMI as paid:", err)
      setError(err instanceof Error ? err.message : "Failed to mark EMI as paid")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
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

  // Get status color
  const getStatusColor = (status: string, dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    
    switch (status) {
      case "paid":
        return "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg"
      case "pending":
        // Check if the EMI is late (due date has passed)
        return today > due 
          ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg"
          : "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 shadow-lg"
      default:
        return "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 shadow-lg"
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="w-5 h-5" />
      case "pending":
        return <Clock className="w-5 h-5" />
      case "late":
        return <XCircle className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
              isDarkMode ? "border-blue-400" : "border-blue-600"
            }`}
          ></div>
          <p className="text-lg font-medium">Loading loan details...</p>
        </div>
      </div>
    )
  }

  if (error || !loan) {
    return (
      <div
        className={`min-h-screen p-4 ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="max-w-4xl mx-auto bg-red-100 dark:bg-red-900/30 p-6 rounded-xl">
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-300">{error || "Loan not found"}</p>
          <Link
            href="/loans/view"
            className="inline-flex items-center mt-4 text-red-700 dark:text-red-300 hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Loans
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div
          className={`rounded-2xl shadow-xl overflow-hidden ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } border border-blue-200`}
        >
          {/* Header section with gradient background */}
          <div className="relative h-48">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl"></div>
            
            {/* Decorative shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-indigo-400 opacity-20 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-blue-300 opacity-30 translate-x-1/3 -translate-y-1/3"></div>
            
            {/* Header content */}
            <div className="relative z-10 h-full px-6 py-8 sm:p-10">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      href="/loans/view"
                      className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                    >
                      <ArrowLeft className="w-5 h-5 text-white" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white">{loan.loan_name}</h1>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-white/90">
                    <span>{formatCurrency(loan.emi_amount)}/month</span>
                    <span>•</span>
                    <span>{loan.tenure_months} months</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/loans/edit/${loan.id}`}
                    className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 text-white"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                    className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 text-white"
                  >
                    {viewMode === "grid" ? <ListFilter className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="px-6 py-6 sm:px-10">
            {/* Desktop View */}
            <div className="hidden sm:grid sm:grid-cols-4 gap-4">
              <div className={`rounded-xl p-4 ${isDarkMode ? "bg-gray-700/50" : "bg-blue-50"}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    Total Amount
                  </span>
                  <Wallet className={`w-5 h-5 ${isDarkMode ? "text-blue-400" : "text-blue-500"}`} />
                </div>
                <div className={`text-xl font-bold mt-1 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
                  {formatCurrency(loan.emi_amount * loan.tenure_months)}
                </div>
              </div>

              <div className={`rounded-xl p-4 ${isDarkMode ? "bg-gray-700/50" : "bg-emerald-50"}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    Amount Paid
                  </span>
                  <CheckCircle2
                    className={`w-5 h-5 ${isDarkMode ? "text-emerald-400" : "text-emerald-500"}`}
                  />
                </div>
                <div
                  className={`text-xl font-bold mt-1 ${
                    isDarkMode ? "text-emerald-400" : "text-emerald-600"
                  }`}
                >
                  {formatCurrency(loan.total_paid_amount)}
                </div>
              </div>

              <div className={`rounded-xl p-4 ${isDarkMode ? "bg-gray-700/50" : "bg-amber-50"}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    Remaining
                  </span>
                  <AlertCircle className={`w-5 h-5 ${isDarkMode ? "text-amber-400" : "text-amber-500"}`} />
                </div>
                <div className={`text-xl font-bold mt-1 ${isDarkMode ? "text-amber-400" : "text-amber-600"}`}>
                  {formatCurrency(loan.remaining_amount)}
                </div>
              </div>

              <div className={`rounded-xl p-4 ${isDarkMode ? "bg-gray-700/50" : "bg-purple-50"}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Progress</span>
                  <Clock className={`w-5 h-5 ${isDarkMode ? "text-purple-400" : "text-purple-500"}`} />
                </div>
                <div
                  className={`text-xl font-bold mt-1 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}
                >
                  {loan.paid_emis_count} of {loan.tenure_months} EMIs
                </div>
              </div>
            </div>

            {/* New Compact Mobile View */}
            <div className="sm:hidden bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <p className="text-xs text-gray-400">Total Amount</p>
                  <p className="text-sm font-semibold">{formatCurrency(loan.emi_amount * loan.tenure_months)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Amount Paid</p>
                  <p className="text-sm font-semibold text-emerald-400">{formatCurrency(loan.total_paid_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Remaining</p>
                  <p className="text-sm font-semibold text-amber-400">{formatCurrency(loan.remaining_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Progress</p>
                  <p className="text-sm font-semibold text-purple-400">{loan.paid_emis_count} of {loan.tenure_months}</p>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="h-1.5 rounded-full bg-gray-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${(loan.paid_emis_count / loan.tenure_months) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* EMIs Section */}
          <div className="px-6 pb-8 sm:px-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">EMI Schedule</h2>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>View as:</span>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <ListFilter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 xl:grid-cols-31 gap-1">
                {loan?.emis?.map((emi) => (
                  <motion.button
                    key={emi.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative h-8 w-8 rounded-lg ${getStatusColor(
                      emi.status,
                      emi.due_date
                    )} cursor-pointer transition-transform duration-200 flex items-center justify-center`}
                    onClick={() => {
                      setSelectedEMI(emi)
                      if (emi.status !== "paid") {
                        setIsPaymentModalOpen(true)
                      }
                    }}
                  >
                    <span className="font-bold text-xs">{emi.month_number}</span>

                    {/* Hover Details */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-20">
                      <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        <div>EMI #{emi.month_number}</div>
                        <div>Due: {formatDate(emi.due_date)}</div>
                        {emi.paid_date && <div>Paid: {formatDate(emi.paid_date)}</div>}
                        <div className="capitalize">
                          {emi.status === "pending" && new Date() > new Date(emi.due_date)
                            ? "Late"
                            : emi.status}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        EMI #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Paid Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Remarks
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                    {loan?.emis?.map((emi) => (
                      <tr
                        key={emi.id}
                        className={`${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium">#{emi.month_number}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm">{formatDate(emi.due_date)}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm">{formatCurrency(loan.emi_amount)}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                              emi.status === "paid"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                                : emi.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                            }`}
                          >
                            {getStatusIcon(emi.status)}
                            <span className="ml-1">{emi.status}</span>
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {emi.paid_date ? formatDate(emi.paid_date) : "-"}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">{emi.remarks || "-"}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          {emi.status !== "paid" && (
                            <button
                              onClick={() => {
                                setSelectedEMI(emi)
                                setIsPaymentModalOpen(true)
                              }}
                              className={`inline-flex items-center px-3 py-1 rounded-lg text-sm ${
                                isDarkMode
                                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                                  : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                              }`}
                            >
                              Mark Paid
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedEMI && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div
              className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium mb-4">Mark EMI #{selectedEMI.month_number} as Paid</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Date</label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Remarks (Optional)</label>
                    <textarea
                      value={paymentRemarks}
                      onChange={(e) => setPaymentRemarks(e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      }`}
                      placeholder="Add any payment details or notes..."
                    />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkAsPaid(selectedEMI.id)}
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto px-4 py-2 rounded-lg text-white ${
                    isSubmitting
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } transition-colors duration-200`}
                >
                  {isSubmitting ? "Processing..." : "Confirm Payment"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPaymentModalOpen(false)
                    setSelectedEMI(null)
                    setPaymentRemarks("")
                  }}
                  className={`mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2 rounded-lg ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  } transition-colors duration-200`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend Section */}
      <div className="mt-6 px-6 py-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold mb-3">Legend:</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-500 to-emerald-600"></div>
            <span className="text-sm">Paid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-gray-300 to-gray-400"></div>
            <span className="text-sm">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-red-500 to-red-600"></div>
            <span className="text-sm">Late</span>
          </div>
        </div>
      </div>
    </div>
  )
}