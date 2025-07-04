"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  X,
} from "lucide-react"

interface EMI {
  id: string
  loan_id: string
  loan_name: string
  emi_amount: number
  month_number: number
  due_date: string
  paid_date: string | null
  status: "paid" | "pending" | "late"
  remarks: string
}

interface MonthlyData {
  month: number
  year: number
  summary: {
    total_emis: number
    paid_emis: number
    pending_emis: number
    late_emis: number
    payment_progress: number
  }
  emis: EMI[]
}

interface CustomPayment {
  loan_id: string;
  month_number: number;
  paid_date: string;
  remarks: string;
}

interface Loan {
  id: string;
  loan_name: string;
  tenure_months: number;
}

type SortField = "loan_name" | "amount" | "due_date" | "status"
type SortOrder = "asc" | "desc"

export default function PaymentsPage() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [sortField, setSortField] = useState<SortField>("due_date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [showCustomPaymentModal, setShowCustomPaymentModal] = useState(false)
  const [selectedEMI, setSelectedEMI] = useState<EMI | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0])
  const [paymentRemarks, setPaymentRemarks] = useState("")
  const [loans, setLoans] = useState<Loan[]>([])
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [customPayment, setCustomPayment] = useState<CustomPayment>({
    loan_id: '',
    month_number: 1,
    paid_date: new Date().toISOString().split('T')[0],
    remarks: ''
  })

  // Month names for display
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Check system preference for dark mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Always use light theme regardless of device preference
      setIsDarkMode(false)
    }
  }, [])

  // Fetch monthly data
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true)
        const queryParams = new URLSearchParams({
          month: selectedMonth.toString(),
          year: selectedYear.toString(),
          sort_by: sortField,
          sort_order: sortOrder,
        })

        if (statusFilter) {
          queryParams.append("status", statusFilter)
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}emi/emis/monthly_payments/?${queryParams}`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch monthly payments")
        }

        const data = await response.json()
        setMonthlyData(data)
      } catch (err) {
        console.error("Error fetching monthly data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMonthlyData()
  }, [selectedMonth, selectedYear, sortField, sortOrder, statusFilter])

  // Handle month navigation
  const navigateMonth = (direction: "prev" | "next") => {
    let newMonth = selectedMonth
    let newYear = selectedYear

    if (direction === "prev") {
      if (selectedMonth === 1) {
        newMonth = 12
        newYear = selectedYear - 1
      } else {
        newMonth = selectedMonth - 1
      }
    } else {
      if (selectedMonth === 12) {
        newMonth = 1
        newYear = selectedYear + 1
      } else {
        newMonth = selectedMonth + 1
      }
    }

    setSelectedMonth(newMonth)
    setSelectedYear(newYear)
  }

  // Handle sort
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  // Handle EMI payment
  const handleMarkAsPaid = async (emi: EMI) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}emi/emis/${emi.id}/mark_paid/`,
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

      if (!response.ok) {
        if (response.status === 401) {
          return;
        }
        throw new Error("Failed to mark EMI as paid")
      }

      // Refresh monthly data
      const updatedResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}emi/emis/monthly_payments/?month=${selectedMonth}&year=${selectedYear}`,
        {
        }
      )
      if (!updatedResponse.ok) throw new Error("Failed to refresh monthly data")

      const updatedData = await updatedResponse.json()
      setMonthlyData(updatedData)
      setSelectedEMI(null)
      setPaymentRemarks("")
    } catch (err) {
      console.error("Error marking EMI as paid:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle custom payment
  const handleCustomPayment = async () => {
    if (!selectedEMI) return

    try {
      setIsSubmitting(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}emi/emis/custom_payment/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            loan_id: selectedEMI.loan_id,
            month_number: selectedEMI.month_number,
            paid_date: paymentDate,
            remarks: paymentRemarks,
          }),
        }
      )

      if (!response.ok) throw new Error("Failed to process custom payment")

      // Refresh monthly data
      const updatedResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}emi/emis/monthly_payments/?month=${selectedMonth}&year=${selectedYear}`
      )
      if (!updatedResponse.ok) throw new Error("Failed to refresh monthly data")

      const updatedData = await updatedResponse.json()
      setMonthlyData(updatedData)
      setShowCustomPaymentModal(false)
      setSelectedEMI(null)
      setPaymentRemarks("")
    } catch (err) {
      console.error("Error processing custom payment:", err)
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
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
      case "late":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200"
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "late":
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  // Add this function to handle custom payment form changes
  const handleCustomPaymentChange = (field: keyof CustomPayment, value: string | number) => {
    setCustomPayment(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'loan_id') {
      const loan = loans.find(l => l.id === value);
      setSelectedLoan(loan || null);
    }
  };

  // Add this function to validate custom payment
  const isCustomPaymentValid = () => {
    return (
      customPayment.loan_id &&
      customPayment.month_number > 0 &&
      customPayment.paid_date
    );
  };

  // Add useEffect to fetch loans for custom payment
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}emi/loans/`,
          {
          }
        );
        if (!response.ok) {
          if (response.status === 401) {
            return;
          }
          throw new Error('Failed to fetch loans');
        }
        const data = await response.json();
        const loansArray = Array.isArray(data) ? data : data.results || [];
        setLoans(loansArray);
      } catch (err) {
        console.error('Error fetching loans:', err);
      }
    };

    if (showCustomPaymentModal) {
      fetchLoans();
    }
  }, [showCustomPaymentModal]);

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
          <p className="text-lg font-medium">Loading payments...</p>
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
        <div
          className={`rounded-2xl shadow-xl overflow-hidden ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } border border-blue-200`}
        >
          {/* Header section */}
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
                    <h1 className="text-3xl font-bold text-white">Loan Payments</h1>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => navigateMonth("prev")}
                      className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 text-white"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-semibold text-white">
                      {months[selectedMonth - 1]} {selectedYear}
                    </h2>
                    <button
                      onClick={() => navigateMonth("next")}
                      className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 text-white"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search loans..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                  </div>
                  <button
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    className={`p-2 rounded-lg transition-colors ${
                      showFilterPanel
                        ? "bg-white/20 text-white"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowCustomPaymentModal(true)}
                    className="px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 text-white flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Custom Payment</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          {monthlyData && (
            <div className="px-6 py-6 sm:px-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`rounded-xl p-4 ${isDarkMode ? "bg-gray-700/50" : "bg-blue-50"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Total EMIs
                    </span>
                    <Calendar className={`w-5 h-5 ${isDarkMode ? "text-blue-400" : "text-blue-500"}`} />
                  </div>
                  <div className={`text-xl font-bold mt-1 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
                    {monthlyData.summary.total_emis}
                  </div>
                </div>

                <div className={`rounded-xl p-4 ${isDarkMode ? "bg-gray-700/50" : "bg-emerald-50"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Paid EMIs
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
                    {monthlyData.summary.paid_emis}
                  </div>
                </div>

                <div className={`rounded-xl p-4 ${isDarkMode ? "bg-gray-700/50" : "bg-amber-50"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Pending EMIs
                    </span>
                    <Clock className={`w-5 h-5 ${isDarkMode ? "text-amber-400" : "text-amber-500"}`} />
                  </div>
                  <div className={`text-xl font-bold mt-1 ${isDarkMode ? "text-amber-400" : "text-amber-600"}`}>
                    {monthlyData.summary.pending_emis}
                  </div>
                </div>

                <div className={`rounded-xl p-4 ${isDarkMode ? "bg-gray-700/50" : "bg-red-50"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Late EMIs
                    </span>
                    <XCircle className={`w-5 h-5 ${isDarkMode ? "text-red-400" : "text-red-500"}`} />
                  </div>
                  <div className={`text-xl font-bold mt-1 ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
                    {monthlyData.summary.late_emis}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Payment Progress</span>
                  <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    {Math.round(monthlyData.summary.payment_progress)}%
                  </span>
                </div>
                <div className={`h-2 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${monthlyData.summary.payment_progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* EMIs List */}
          <div className="px-6 pb-8 sm:px-10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort("loan_name")}
                        className="flex items-center gap-1 hover:text-blue-500"
                      >
                        Loan Name
                        {sortField === "loan_name" && (
                          sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort("amount")}
                        className="flex items-center gap-1 hover:text-blue-500"
                      >
                        EMI Amount
                        {sortField === "amount" && (
                          sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort("due_date")}
                        className="flex items-center gap-1 hover:text-blue-500"
                      >
                        Due Date
                        {sortField === "due_date" && (
                          sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort("status")}
                        className="flex items-center gap-1 hover:text-blue-500"
                      >
                        Status
                        {sortField === "status" && (
                          sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">Payment Date</th>
                    <th className="px-4 py-3 text-left">Remarks</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                  {monthlyData?.emis
                    .filter((emi) =>
                      emi.loan_name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((emi) => (
                      <tr
                        key={emi.id}
                        className={`${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}
                      >
                        <td className="px-4 py-4">
                          <Link
                            href={`/loans/${emi.loan_id}`}
                            className="text-blue-500 hover:text-blue-600"
                          >
                            {emi.loan_name}
                          </Link>
                        </td>
                        <td className="px-4 py-4">{formatCurrency(emi.emi_amount)}</td>
                        <td className="px-4 py-4">{formatDate(emi.due_date)}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              emi.status
                            )}`}
                          >
                            {getStatusIcon(emi.status)}
                            <span className="capitalize">{emi.status}</span>
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {emi.paid_date ? formatDate(emi.paid_date) : "-"}
                        </td>
                        <td className="px-4 py-4">{emi.remarks || "-"}</td>
                        <td className="px-4 py-4 text-right">
                          {emi.status !== "paid" && (
                            <button
                              onClick={() => {
                                setSelectedEMI(emi)
                                setPaymentDate(new Date().toISOString().split("T")[0])
                              }}
                              className={`inline-flex items-center px-3 py-1 rounded-lg text-sm ${
                                isDarkMode
                                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                                  : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                              }`}
                            >
                              Mark Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {monthlyData?.emis.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium">No EMIs found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No EMIs are due for this month
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[98]"
            onClick={() => setShowFilterPanel(false)}
          ></div>
          <div
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md rounded-xl shadow-2xl z-[99] ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } p-6`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Filter & Sort</h3>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status Filter */}
              <div>
                <h4 className="text-sm font-medium mb-3">Filter by Status</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setStatusFilter(null)}
                    className={`w-full p-2 rounded-lg text-left ${
                      statusFilter === null
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter("paid")}
                    className={`w-full p-2 rounded-lg text-left ${
                      statusFilter === "paid"
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Paid
                  </button>
                  <button
                    onClick={() => setStatusFilter("pending")}
                    className={`w-full p-2 rounded-lg text-left ${
                      statusFilter === "pending"
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setStatusFilter("late")}
                    className={`w-full p-2 rounded-lg text-left ${
                      statusFilter === "late"
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Late
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Payment Modal */}
      {selectedEMI && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-opacity-75" 
              onClick={() => setSelectedEMI(null)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div
              className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-[101] ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium mb-4">
                  Mark EMI for {selectedEMI.loan_name}                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Due Date
                    </label>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(selectedEMI.due_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      EMI Amount
                    </label>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      ₹{selectedEMI.emi_amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="paid_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      id="paid_date"
                      name="paid_date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Remarks (Optional)
                    </label>
                    <textarea
                      id="remarks"
                      name="remarks"
                      rows={3}
                      value={paymentRemarks}
                      onChange={(e) => setPaymentRemarks(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Add any notes about this payment..."
                    />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse bg-gray-50 dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => handleMarkAsPaid(selectedEMI)}
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Mark as Paid'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEMI(null)}
                  disabled={isSubmitting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Payment Modal */}
      {showCustomPaymentModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-opacity-75" 
              onClick={() => setShowCustomPaymentModal(false)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-[101]">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium mb-4">Custom EMI Payment</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="loan_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select Loan
                    </label>
                    <select
                      id="loan_id"
                      name="loan_id"
                      value={customPayment.loan_id}
                      onChange={(e) => handleCustomPaymentChange('loan_id', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select a loan</option>
                      {loans.map((loan) => (
                        <option key={loan.id} value={loan.id}>
                          {loan.loan_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="month_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      EMI Month Number
                    </label>
                    <input
                      type="number"
                      id="month_number"
                      name="month_number"
                      min="1"
                      max={selectedLoan?.tenure_months || 1}
                      value={customPayment.month_number}
                      onChange={(e) => handleCustomPaymentChange('month_number', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="custom_paid_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      id="custom_paid_date"
                      name="custom_paid_date"
                      value={customPayment.paid_date}
                      onChange={(e) => handleCustomPaymentChange('paid_date', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label htmlFor="custom_remarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Remarks (Optional)
                    </label>
                    <textarea
                      id="custom_remarks"
                      name="custom_remarks"
                      rows={3}
                      value={customPayment.remarks}
                      onChange={(e) => handleCustomPaymentChange('remarks', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Add any notes about this payment..."
                    />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse bg-gray-50 dark:bg-gray-800">
                <button
                  type="button"
                  onClick={handleCustomPayment}
                  disabled={isSubmitting || !isCustomPaymentValid()}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Make Payment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomPaymentModal(false)}
                  disabled={isSubmitting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
