"use client"
import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Wallet,
  CreditCard,
  Calendar,
  Clock,
  TrendingUp,
  CircleDollarSign,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface EMI {
  id: string
  month_number: number
  due_date: string
  paid_date: string | null
  status: "paid" | "pending" | "late"
  remarks?: string
}

interface Loan {
  id: string
  loan_name: string
  emi_amount: number
  tenure_months: number
  start_date: string
  paid_emis_count: number
  total_paid_amount: number
  remaining_amount: number
  next_due_emi?: EMI
  emis: EMI[]
}

interface SummaryStats {
  total_loans: number
  active_loans: number
  total_monthly_emi: number
  paid_this_month: number
  total_paid_amount: number
  total_remaining_amount: number
}

export default function LoansSummaryPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [loans, setLoans] = useState<Loan[]>([])
  const [stats, setStats] = useState<SummaryStats>({
    total_loans: 0,
    active_loans: 0,
    total_monthly_emi: 0,
    paid_this_month: 0,
    total_paid_amount: 0,
    total_remaining_amount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check system preference for dark mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Always use light theme regardless of device preference
      setTheme("light")
    }
  }, [])

  // Fetch loans and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [loansResponse, statsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}emi/loans/`, {
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}emi/loans/stats/`, {
          }),
        ])

        if (!loansResponse.ok || !statsResponse.ok) {
          if (loansResponse.status === 401 || statsResponse.status === 401) {
            return;
          }
          throw new Error("Failed to fetch data")
        }

        const loansData = await loansResponse.json()
        const statsData = await statsResponse.json()

        // Ensure loansData is an array
        const loansArray = Array.isArray(loansData) ? loansData : loansData.results || [];
        setLoans(loansArray)
        setStats(statsData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load loan summary")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

  // Calculate progress percentage
  const calculateProgress = (loan: Loan) => {
    return (loan.paid_emis_count / loan.tenure_months) * 100
  }

  const mainClassName =
    theme === "dark"
      ? "min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 bg-gradient-to-br from-gray-900 to-gray-800 text-white"
      : "min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 bg-gradient-to-br from-gray-50 to-gray-100"

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={mainClassName}>
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div
          className={`rounded-2xl shadow-xl overflow-hidden ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          } border border-blue-200`}
        >
          {/* Header section */}
          <div className="relative h-48">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl"></div>

            {/* Decorative shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-indigo-400 opacity-20 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-blue-300 opacity-30 translate-x-1/3 -translate-y-1/3"></div>

            {/* Header content */}
            <div className="relative z-10 h-full px-6 py-8 sm:p-10 flex flex-col justify-center">
              <div className="flex items-center mb-2">
                <Link
                  href="/loans/view"
                  className="mr-3 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                >
                  <ArrowLeft className="h-5 w-5 text-white" />
                </Link>
                <h1 className="text-3xl font-bold text-white drop-shadow-md">Loan Summary</h1>
              </div>
              <p className="mt-2 text-white/80 drop-shadow">Overview of all your loan EMIs and payments</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="px-6 py-8 sm:px-10">
            {/* Desktop View: Grid */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Loans Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl border ${
                  theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Total Loans</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.total_loans}</h3>
                  </div>
                  <div className={`p-3 rounded-full ${theme === "dark" ? "bg-blue-500/20" : "bg-blue-100"}`}>
                    <Wallet className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Active Loans: {stats.active_loans}
                  </p>
                </div>
              </motion.div>

              {/* Monthly EMI Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`p-6 rounded-xl border ${
                  theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      Total Monthly EMI
                    </p>
                    <h3 className="text-2xl font-bold mt-1">{formatCurrency(stats.total_monthly_emi)}</h3>
                  </div>
                  <div className={`p-3 rounded-full ${theme === "dark" ? "bg-green-500/20" : "bg-green-100"}`}>
                    <CircleDollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Paid this month: {formatCurrency(stats.paid_this_month)}
                  </p>
                </div>
              </motion.div>

              {/* Total Amount Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`p-6 rounded-xl border ${
                  theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      Total Paid Amount
                    </p>
                    <h3 className="text-2xl font-bold mt-1">{formatCurrency(stats.total_paid_amount)}</h3>
                  </div>
                  <div className={`p-3 rounded-full ${theme === "dark" ? "bg-green-500/20" : "bg-green-100"}`}>
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Remaining: {formatCurrency(stats.total_remaining_amount)}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Mobile View: Single Compact Card */}
            <div className="sm:hidden">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border ${
                  theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                }`}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Monthly EMI</p>
                    <p className="text-lg font-semibold">{formatCurrency(stats.total_monthly_emi)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Paid this month</p>
                    <p className={`text-lg font-semibold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                      {formatCurrency(stats.paid_this_month)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Total Remaining</p>
                    <p className="text-lg font-semibold">{formatCurrency(stats.total_remaining_amount)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Total Paid</p>
                    <p className="text-lg font-semibold">{formatCurrency(stats.total_paid_amount)}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Loans Progress Section */}
            <div className="mt-8">
              <h2 className={`text-xl font-semibold mb-6 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                Loan Progress
              </h2>

              <div className="space-y-6">
                {loans.map((loan, index) => (
                  <motion.div
                    key={loan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-xl border ${
                      theme === "dark"
                        ? "bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    } transition-colors duration-200`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{loan.loan_name}</h3>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="text-sm">{formatCurrency(loan.emi_amount)}/month</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="text-sm">Started: {formatDate(loan.start_date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="text-sm">{loan.tenure_months} months</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/loans/${loan.id}`}
                        className={`mt-4 sm:mt-0 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          theme === "dark"
                            ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        View Details
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          {loan.paid_emis_count} of {loan.tenure_months} EMIs paid
                        </span>
                        <span>{Math.round(calculateProgress(loan))}% Complete</span>
                      </div>
                      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${calculateProgress(loan)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="mt-4 flex flex-wrap gap-4">
                      <div
                        className={`flex items-center px-3 py-1 rounded-full text-sm ${
                          theme === "dark" ? "bg-green-900/20" : "bg-green-100"
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        <span>Paid: {formatCurrency(loan.total_paid_amount)}</span>
                      </div>
                      <div
                        className={`flex items-center px-3 py-1 rounded-full text-sm ${
                          theme === "dark" ? "bg-blue-900/20" : "bg-blue-100"
                        }`}
                      >
                        <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                        <span>Remaining: {formatCurrency(loan.remaining_amount)}</span>
                      </div>
                      {loan.next_due_emi && (
                        <div
                          className={`flex items-center px-3 py-1 rounded-full text-sm ${
                            theme === "dark" ? "bg-amber-900/20" : "bg-amber-100"
                          }`}
                        >
                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                          <span>Next Due: {formatDate(loan.next_due_emi.due_date)}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Empty State */}
              {loans.length === 0 && (
                <div className="text-center py-12">
                  <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No loans found</h3>
                  <p className="text-gray-500 dark:text-gray-400">You don&apos;t have any loans registered yet.</p>
                  <Link
                    href="/loans/add"
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Your First Loan
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
