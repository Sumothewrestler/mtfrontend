"use client"

import type React from "react"
import { useState, useEffect, type FormEvent } from "react"
import { Wallet, Calendar, CreditCard, Clock, ArrowLeft, CheckCircle2, Building2, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface CashBankAccount {
  id: number;
  name: string;
  account_type: string;
  is_active: boolean;
}

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

export default function CreateLoanPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [accounts, setAccounts] = useState<CashBankAccount[]>([])

  // Form state
  const [formData, setFormData] = useState({
    loan_name: "",
    loan_amount: "",
    amount_received: "",
    received_date: new Date().toISOString().split('T')[0],
    received_account: "",
    emi_amount: "",
    tenure_months: "",
    start_date: new Date().toISOString().split('T')[0],
    paid_emis: "",
  })



  // Fetch cash/bank accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${API_BASE_URL}cash-bank-accounts/`)
        
        if (response.ok) {
          const data = await response.json()
          setAccounts(data.filter((acc: CashBankAccount) => acc.is_active))
        }
      } catch (error) {
        console.error('Failed to fetch accounts:', error)
      } finally {
        setIsLoading(false)
      }
    };

    fetchAccounts();
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)

    // Validate required fields
    if (!formData.loan_name || !formData.loan_amount || !formData.emi_amount || !formData.tenure_months) {
      setFormError("All required fields must be filled")
      setIsSubmitting(false)
      return
    }

    // Validate paid_emis
    if (formData.paid_emis && parseInt(formData.paid_emis) > parseInt(formData.tenure_months)) {
      setFormError("Paid EMIs cannot be greater than tenure months")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}emi/loans/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loan_name: formData.loan_name.trim(),
          loan_amount: parseFloat(formData.loan_amount),
          amount_received: formData.amount_received ? parseFloat(formData.amount_received) : null,
          received_date: formData.received_date || null,
          received_account: formData.received_account ? parseInt(formData.received_account) : null,
          emi_amount: parseFloat(formData.emi_amount),
          tenure_months: parseInt(formData.tenure_months),
          start_date: formData.start_date,
          paid_emis: formData.paid_emis ? parseInt(formData.paid_emis) : 0,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || errorData.error || "Failed to create loan")
      }

      await response.json()
      setFormSuccess(true)

      // Reset form
      setFormData({
        loan_name: "",
        loan_amount: "",
        amount_received: "",
        received_date: new Date().toISOString().split('T')[0],
        received_account: "",
        emi_amount: "",
        tenure_months: "",
        start_date: new Date().toISOString().split('T')[0],
        paid_emis: "",
      })

      // Redirect to loans list
      setTimeout(() => {
        router.push("/loans/view")
      }, 2000)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to create loan")
      console.error("Error creating loan:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 bg-gradient-to-br from-gray-50 to-gray-100">
      <style jsx>{disableNumberInputScrolling}</style>

      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden shadow-xl">
          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-2xl p-[2px] -z-10">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500"></div>
          </div>

          {/* Header section */}
          <div className="rounded-t-2xl p-6 bg-gradient-to-r from-blue-500 to-indigo-400">
            <div className="flex items-center">
              <Link
                href="/loans/view"
                className="mr-4 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
              >
                <ArrowLeft className="text-white" size={20} />
              </Link>
              <h1 className="text-xl sm:text-3xl font-bold text-white">Create New Loan</h1>
            </div>
          </div>

          {/* Form section */}
          <div className="rounded-b-2xl px-6 py-8 sm:p-10 bg-white">
            {formSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-green-100 text-green-800 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Loan created successfully! Redirecting...
              </div>
            )}

            {formError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Loan Name */}
              <div>
                <label
                  htmlFor="loan_name"
                  className="block text-sm font-medium mb-2 text-gray-700"
                >
                  <Wallet className="inline-block mr-2 h-4 w-4 text-gray-600" />
                  Loan Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="loan_name"
                  id="loan_name"
                  required
                  value={formData.loan_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter loan name"
                />
              </div>

              {/* Loan Amount */}
              <div>
                <label
                  htmlFor="loan_amount"
                  className="block text-sm font-medium mb-2 text-gray-700"
                >
                  <DollarSign className="inline-block mr-2 h-4 w-4 text-gray-600" />
                  Total Loan Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="loan_amount"
                  id="loan_amount"
                  required
                  value={formData.loan_amount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter total loan amount"
                  step="0.01"
                  min="0.01"
                />
              </div>

              {/* Amount Received */}
              <div>
                <label
                  htmlFor="amount_received"
                  className="block text-sm font-medium mb-2 text-gray-700"
                >
                  <Building2 className="inline-block mr-2 h-4 w-4 text-gray-600" />
                  Amount Received
                </label>
                <input
                  type="number"
                  name="amount_received"
                  id="amount_received"
                  value={formData.amount_received}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Actual amount received (if different)"
                  step="0.01"
                  min="0"
                />
                <p className="mt-1 text-sm text-gray-500">
                  May be less than loan amount due to processing fees
                </p>
              </div>

              {/* Received Date */}
              <div>
                <label
                  htmlFor="received_date"
                  className="block text-sm font-medium mb-2 text-gray-700"
                >
                  <Calendar className="inline-block mr-2 h-4 w-4 text-gray-600" />
                  Date Received
                </label>
                <input
                  type="date"
                  name="received_date"
                  id="received_date"
                  value={formData.received_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                />
              </div>

              {/* Cash/Bank Account */}
              <div>
                <label
                  htmlFor="received_account"
                  className="block text-sm font-medium mb-2 text-gray-700"
                >
                  <Building2 className="inline-block mr-2 h-4 w-4 text-gray-600" />
                  Received in Account
                </label>
                <select
                  name="received_account"
                  id="received_account"
                  value={formData.received_account}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                >
                  <option value="">Select cash/bank account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.account_type})
                    </option>
                  ))}
                </select>
                {accounts.length === 0 && (
                  <p className="mt-1 text-sm text-yellow-600">
                    No cash/bank accounts available. Create accounts first.
                  </p>
                )}
              </div>

              {/* EMI Amount */}
              <div>
                <label
                  htmlFor="emi_amount"
                  className="block text-sm font-medium mb-2 text-gray-700"
                >
                  <CreditCard className="inline-block mr-2 h-4 w-4 text-gray-600" />
                  EMI Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="emi_amount"
                  id="emi_amount"
                  required
                  value={formData.emi_amount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter EMI amount"
                  step="0.01"
                  min="0.01"
                />
              </div>

              {/* Tenure Months */}
              <div>
                <label
                  htmlFor="tenure_months"
                  className="block text-sm font-medium mb-2 text-gray-700"
                >
                  <Clock className="inline-block mr-2 h-4 w-4 text-gray-600" />
                  Tenure (Months) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="tenure_months"
                  id="tenure_months"
                  required
                  value={formData.tenure_months}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter tenure in months"
                  min="1"
                  max="600"
                />
              </div>

              {/* Start Date */}
              <div>
                <label
                  htmlFor="start_date"
                  className="block text-sm font-medium mb-2 text-gray-700"
                >
                  <Calendar className="inline-block mr-2 h-4 w-4 text-gray-600" />
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  id="start_date"
                  required
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                />
              </div>

              {/* Paid EMIs */}
              <div>
                <label
                  htmlFor="paid_emis"
                  className="block text-sm font-medium mb-2 text-gray-700"
                >
                  <CheckCircle2 className="inline-block mr-2 h-4 w-4 text-gray-600" />
                  Already Paid EMIs
                </label>
                <input
                  type="number"
                  name="paid_emis"
                  id="paid_emis"
                  value={formData.paid_emis}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Number of EMIs already paid (optional)"
                  min="0"
                  max={formData.tenure_months || 0}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Leave empty if starting fresh
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Link
                  href="/loans/view"
                  className="flex-1 px-4 py-3 rounded-xl text-center transition-all duration-200 flex items-center justify-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  View Loans
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-3 text-white rounded-xl 
                    transition-all duration-300 transform hover:scale-[1.02]
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg
                    ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""} 
                    bg-gradient-to-r from-blue-500 to-indigo-400 hover:from-blue-400 hover:to-indigo-300 shadow-indigo-500/20`}
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
                      Creating...
                    </>
                  ) : (
                    <span>Create Loan</span>
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