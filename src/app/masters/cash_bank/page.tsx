"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Edit2, Trash2, Moon, Sun, Banknote, Building2, Eye, MoreHorizontal, X } from "lucide-react"
import { useDarkMode } from "@/contexts/DarkModeContext"

type CashBankAccount = {
  id: number
  name: string
  account_type: string
  opening_balance: number
  opening_balance_type: string
  current_balance: number
  is_active: boolean
  created_at: string
}

export default function CashBankAccountsList() {
  const router = useRouter()
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [accounts, setAccounts] = useState<CashBankAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<CashBankAccount | null>(null)
  const [showModal, setShowModal] = useState(false)

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-accounts/`)
      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      setAccounts(data)
    } catch (error) {
      console.error("Error fetching accounts:", error)
      setError(`Failed to load accounts. Error: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const handleDeleteAccount = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cash-bank-accounts/${id}/`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Failed to delete account: ${response.status} ${response.statusText}`)
      }

      alert("Account deleted successfully!")
      fetchAccounts()
      setShowModal(false)
    } catch (error) {
      console.error("Error deleting account:", error)
      alert(`Failed to delete account. Error: ${(error as Error).message}`)
    }
  }

  const handleEditAccount = (id: number) => {
    router.push(`/masters/cash_bank/edit/${id}`)
  }

  const openAccountModal = (account: CashBankAccount) => {
    setSelectedAccount(account)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedAccount(null)
  }

  const totalCashBalance = accounts
    .filter((acc) => acc.account_type === "Cash")
    .reduce((sum, acc) => sum + Number(acc.current_balance), 0)

  const totalBankBalance = accounts
    .filter((acc) => acc.account_type === "Bank")
    .reduce((sum, acc) => sum + Number(acc.current_balance), 0)

  const grandTotal = totalCashBalance + totalBankBalance

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <header className={`${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link
              href="/masters/mastermain"
              className={`${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"} mr-4`}
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Cash & Bank</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/masters/cash_bank/create"
              className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Link>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${isDarkMode ? "bg-gray-700 text-yellow-300" : "bg-gray-200 text-gray-800"}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {isLoading ? (
          <div className={`flex justify-center items-center h-64 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mx-2 sm:mx-0" role="alert">
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            {/* Compact Summary Card */}
            <div
              className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-lg p-6 mb-6`}
            >
              <div className="space-y-4">
                {/* First Row: Cash and Bank */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Banknote className="h-6 w-6 text-green-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Cash</p>
                      <p className="text-lg font-bold text-green-600">₹{totalCashBalance.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Building2 className="h-6 w-6 text-blue-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Bank</p>
                      <p className="text-lg font-bold text-blue-600">₹{totalBankBalance.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Second Row: Total and Accounts Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="h-6 w-6 text-purple-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-xl font-bold text-purple-600">₹{grandTotal.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Accounts</p>
                    <p className="text-xl font-bold">{accounts.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-1 sm:px-0">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-lg p-3 sm:p-4 hover:shadow-xl transition-shadow`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      {account.account_type === "Cash" ? (
                        <Banknote className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0" />
                      ) : (
                        <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0 mr-2">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{account.name}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                            account.account_type === "Cash"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {account.account_type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p
                          className={`text-sm sm:text-base font-bold ${
                            Number(account.current_balance) >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          ₹{Number(account.current_balance).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => openAccountModal(account)}
                        className={`p-1.5 sm:p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0`}
                      >
                        <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {accounts.length === 0 && (
              <div className={`text-center py-12 ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                <Banknote className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">No accounts found</p>
                <p className="text-sm">Create your first account to get started</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Account Details Modal */}
      {showModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div
            className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto`}
          >
            {/* Modal Header */}
            <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {selectedAccount.account_type === "Cash" ? (
                    <Banknote className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mr-2" />
                  ) : (
                    <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mr-2" />
                  )}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">{selectedAccount.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">{selectedAccount.account_type}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className={`p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Current Balance</p>
                  <p
                    className={`text-base sm:text-lg font-bold ${
                      Number(selectedAccount.current_balance) >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ₹{Number(selectedAccount.current_balance).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Opening Balance</p>
                  <p className="text-base sm:text-lg font-bold">
                    ₹{Number(selectedAccount.opening_balance).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Balance Type</p>
                  <p
                    className={`text-xs sm:text-sm font-medium ${
                      selectedAccount.opening_balance_type === "Debit" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {selectedAccount.opening_balance_type}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Status</p>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      selectedAccount.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedAccount.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-500">Created On</p>
                <p className="text-xs sm:text-sm font-medium">
                  {new Date(selectedAccount.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div
              className={`px-4 sm:px-6 py-3 sm:py-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"} flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3`}
            >
              <button
                onClick={() => {
                  closeModal()
                  handleEditAccount(selectedAccount.id)
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                  isDarkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                <Edit2 size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDeleteAccount(selectedAccount.id, selectedAccount.name)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                  isDarkMode ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
