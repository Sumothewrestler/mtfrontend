"use client"

import type React from "react"
import { useState, useEffect, type FormEvent } from "react"
import { Wallet, Calendar, CreditCard, Clock, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Style for number inputs
const disableNumberInputScrolling = `
  input[type="number"] {
    -moz-appearance: textfield;
  }
  
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

interface Loan {
  id: string
  loan_name: string
  emi_amount: number
  tenure_months: number
  start_date: string
}

export default function EditLoanPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loanId, setLoanId] = useState<string>("")

  // Form state
  const [formData, setFormData] = useState<Loan>({
    id: "",
    loan_name: "",
    emi_amount: 0,
    tenure_months: 0,
    start_date: new Date().toISOString().split('T')[0],
  })

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setLoanId(resolvedParams.id)
      setFormData(prev => ({ ...prev, id: resolvedParams.id }))
    }
    resolveParams()
  }, [params])

  // Check system preference for dark mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Always use light theme regardless of device preference
      setTheme("light")
    }
  }, [])

  // Fetch loan data
  useEffect(() => {
    if (!loanId) return
    
    const fetchLoan = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}emi/loans/${loanId}/`, {
        })
        if (!response.ok) {
          if (response.status === 401) {
            return;
          }
          throw new Error("Failed to fetch loan details")
        }
        const data = await response.json()
        setFormData({
          id: data.id,
          loan_name: data.loan_name,
          emi_amount: data.emi_amount,
          tenure_months: data.tenure_months,
          start_date: data.start_date,
        })
      } catch (error) {
        console.error("Error fetching loan:", error)
        setFormError("Failed to load loan details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoan()
  }, [loanId])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "emi_amount" ? parseFloat(value) || 0 : 
              name === "tenure_months" ? parseInt(value) || 0 : value,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)

    // Validate required fields
    if (!formData.loan_name || !formData.emi_amount || !formData.tenure_months) {
      setFormError("All fields are required")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}emi/loans/${loanId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        if (response.status === 401) {
          return;
        }
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update loan")
      }

      setFormSuccess(true)

      // Redirect to loans list after success
      setTimeout(() => {
        router.push("/loans/view")
      }, 2000)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to update loan")
      console.error("Error updating loan:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
          theme === "dark" ? "border-blue-400" : "border-blue-600"
        }`}></div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}
    >
      <style jsx>{disableNumberInputScrolling}</style>

      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden shadow-xl">
          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-2xl p-[2px] -z-10">
            <div
              className={`absolute inset-0 rounded-2xl ${
                theme === "dark"
                  ? "bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"
                  : "bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500"
              }`}
            ></div>
          </div>

          {/* Header section */}
          <div
            className={`rounded-t-2xl p-6 ${
              theme === "dark"
                ? "bg-gradient-to-r from-blue-600 to-indigo-500"
                : "bg-gradient-to-r from-blue-500 to-indigo-400"
            }`}
          >
            <div className="flex items-center">
              <Link
                href="/loans/view"
                className="mr-4 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
              >
                <ArrowLeft className="text-white" size={20} />
              </Link>
              <h1 className="text-xl sm:text-3xl font-bold text-white">Edit Loan</h1>
            </div>
          </div>

          {/* Form section */}
          <div className={`rounded-b-2xl px-6 py-8 sm:p-10 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            {formSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Loan updated successfully!
              </div>
            )}

            {formError && (
              <div className={`mb-6 p-4 rounded-xl text-red-500 text-sm ${theme === "dark" ? "bg-red-900/20" : "bg-red-50"}`}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Loan Name */}
              <div>
                <label
                  htmlFor="loan_name"
                  className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                >
                  <Wallet className="inline-block mr-2 h-4 w-4" style={{ color: theme === "dark" ? "#A1ACBD" : "#3D4756" }} />
                  Loan Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="loan_name"
                  id="loan_name"
                  required
                  value={formData.loan_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200`}
                  placeholder="Enter loan name"
                />
              </div>

              {/* EMI Amount */}
              <div>
                <label
                  htmlFor="emi_amount"
                  className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                >
                  <CreditCard className="inline-block mr-2 h-4 w-4" style={{ color: theme === "dark" ? "#A1ACBD" : "#3D4756" }} />
                  EMI Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="emi_amount"
                  id="emi_amount"
                  required
                  value={formData.emi_amount}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200`}
                  placeholder="Enter EMI amount"
                  step="0.01"
                />
              </div>

              {/* Tenure Months */}
              <div>
                <label
                  htmlFor="tenure_months"
                  className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                >
                  <Clock className="inline-block mr-2 h-4 w-4" style={{ color: theme === "dark" ? "#A1ACBD" : "#3D4756" }} />
                  Tenure (Months) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="tenure_months"
                  id="tenure_months"
                  required
                  value={formData.tenure_months}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200`}
                  placeholder="Enter tenure in months"
                  min="1"
                />
              </div>

              {/* Start Date */}
              <div>
                <label
                  htmlFor="start_date"
                  className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                >
                  <Calendar className="inline-block mr-2 h-4 w-4" style={{ color: theme === "dark" ? "#A1ACBD" : "#3D4756" }} />
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  id="start_date"
                  required
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Link
                  href="/loans/view"
                  className={`flex-1 px-4 py-3 rounded-xl text-center transition-all duration-200 flex items-center justify-center gap-1 ${
                    theme === "dark"
                      ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-3 text-white rounded-xl 
                    transition-all duration-300 transform hover:scale-[1.02]
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg
                    ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""} ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-400 hover:from-blue-400 hover:to-indigo-300 shadow-indigo-500/30"
                      : "bg-gradient-to-r from-blue-500 to-indigo-400 hover:from-blue-400 hover:to-indigo-300 shadow-indigo-500/20"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <span>Update Loan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}