"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Printer } from "lucide-react"
import { useDarkMode } from "@/contexts/DarkModeContext"
import BottomNav from "@/components/BottomNav"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

// Types for the API response
interface DailyReport {
  date: string
  attendance: {
    employee_name: string
    status: string
    description: string | null
  }[]
  tractor_hours: {
    tractor_name: string
    start_hour: number
    end_hour: number
    total_hours: number
  }[]
  bookings: {
    customer_name: string
    date: string
    description: string
    status: string
  }[]
  follow_up_summary: {
    total_followups: number
    unique_customers: number
  }
  sales_summary: {
    total_sales: number
    customer_wise: {
      customer__name: string
      total_amount: number
    }[]
  }
  labour_accounts: {
    employee_name: string
    daily_wage: number
    daily_beta: number
    incentive_amount: number
    total_amount: number
  }[]
  business_transactions: {
    income: number
    expense: number
    others: number
  }
  cash_bank_summary: {
    account_name: string
    account_type: string
    current_balance: number
  }[]
  tasks: {
    completed: {
      task_name: string
      completion_date: string
    }[]
    pending: {
      task_name: string
      due_date: string
    }[]
  }
}

export default function DailyReportsPage() {
  const { isDarkMode } = useDarkMode()
  const reportRef = useRef<HTMLDivElement>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [report, setReport] = useState<DailyReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  const fetchReport = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}daily-reports/?date=${selectedDate}`
      )
      if (!response.ok) throw new Error("Failed to fetch report")
      const data = await response.json()
      setReport(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const exportToPDF = async () => {
    if (!reportRef.current) return

    try {
      // Create a temporary container
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.backgroundColor = isDarkMode ? '#111827' : '#ffffff'
      document.body.appendChild(tempContainer)

      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Calculate page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10
      const contentWidth = pageWidth - (2 * margin)

      // Add title section
      const titleSection = document.createElement('div')
      titleSection.className = `p-4 ${isDarkMode ? "bg-gray-800" : "bg-white"}`
      titleSection.innerHTML = `
        <h1 class="text-2xl font-bold text-center" style="color: ${isDarkMode ? '#ffffff' : '#111827'}">
          Metro Transports
        </h1>
        <h2 class="text-xl font-semibold text-center mt-2" style="color: ${isDarkMode ? '#ffffff' : '#111827'}">
          Daily Report - ${new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </h2>
      `
      tempContainer.appendChild(titleSection)

      // Capture title with optimized settings
      const titleImg = await html2canvas(titleSection, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: isDarkMode ? '#111827' : '#ffffff',
      })
      
      const titleImgWidth = contentWidth
      const titleImgHeight = (titleImg.height * titleImgWidth) / titleImg.width
      pdf.addImage(titleImg.toDataURL('image/png'), 'PNG', margin, margin, titleImgWidth, titleImgHeight)
      
      let currentY = titleImgHeight + (margin * 1.5)

      // Process each section
      const sections = reportRef.current.getElementsByTagName('section')
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i]
        const clonedSection = section.cloneNode(true) as HTMLElement
        clonedSection.style.backgroundColor = isDarkMode ? '#1f2937' : '#ffffff'
        
        // Force text colors
        const textElements = clonedSection.getElementsByTagName('*')
        for (const el of textElements) {
          if (isDarkMode) {
            (el as HTMLElement).style.color = '#ffffff'
          }
        }
        
        tempContainer.appendChild(clonedSection)

        // Capture section with optimized settings
        const canvas = await html2canvas(clonedSection, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: isDarkMode ? '#111827' : '#ffffff',
        })

        const imgWidth = contentWidth
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        // Add new page if needed
        if (currentY + imgHeight > pageHeight - margin) {
          pdf.addPage()
          currentY = margin
        }

        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, currentY, imgWidth, imgHeight)
        currentY += imgHeight + (margin / 2) // Reduced spacing between sections

        tempContainer.removeChild(clonedSection)
      }

      // Clean up
      document.body.removeChild(tempContainer)
      pdf.save(`metro-transports-daily-report-${selectedDate}.pdf`)
    } catch (err) {
      console.error("PDF export failed:", err)
    }
  }

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-sm`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/reports"
              className={`${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-xl font-bold">Daily Report</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`px-2 py-1 rounded border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>
            <button
              onClick={exportToPDF}
              className={`p-2 rounded-full ${
                isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-800"
              }`}
            >
              <Printer className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {isLoading && (
          <div className="text-center py-8">Loading...</div>
        )}

        {error && (
          <div className={`p-4 rounded-lg ${isDarkMode ? "bg-red-900" : "bg-red-100"} text-red-600 mb-4`}>
            {error}
          </div>
        )}

        {report && (
          <div 
            ref={reportRef} 
            id="report-container" 
            className="space-y-2 print:bg-white print:text-black"
          >
            {/* Attendance Section */}
            <section className={`p-3 rounded-lg shadow ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
              <h2 className="text-lg font-semibold mb-2">Attendance</h2>
              <div className="grid grid-cols-1 gap-2">
                {report.attendance.map((entry, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    } flex justify-between items-center`}
                  >
                    <span>{entry.employee_name}</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      entry.status === "present"
                        ? "bg-green-500 text-white"
                        : entry.status === "absent"
                        ? "bg-red-500 text-white"
                        : "bg-yellow-500 text-white"
                    }`}>
                      {entry.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Tractor Hours Section */}
            <section className={`p-3 rounded-lg shadow ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
              <h2 className="text-lg font-semibold mb-2">Tractor Hours</h2>
              <div className="grid grid-cols-1 gap-2">
                {report.tractor_hours.map((entry, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{entry.tractor_name}</span>
                      <span className="text-sm">{entry.total_hours} hrs</span>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span>Start: {entry.start_hour}</span>
                      <span>End: {entry.end_hour}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Sales Summary Section */}
            <section className={`p-3 rounded-lg shadow ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
              <h2 className="text-lg font-semibold mb-2">Sales Summary</h2>
              <div className={`p-3 rounded mb-3 ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <div className="text-xl font-bold">₹ {report.sales_summary.total_sales.toFixed(2)}</div>
                <div className="text-sm">Total Sales</div>
              </div>
              <div className="space-y-2">
                {report.sales_summary.customer_wise.map((sale, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-50"} flex justify-between`}
                  >
                    <span>{sale.customer__name}</span>
                    <span>₹ {sale.total_amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Business Transactions Section */}
            <section className={`p-3 rounded-lg shadow ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
              <h2 className="text-lg font-semibold mb-2">Business Transactions</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className={`p-3 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className="text-green-500 font-bold">₹ {report.business_transactions.income.toFixed(2)}</div>
                  <div className="text-sm">Income</div>
                </div>
                <div className={`p-3 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className="text-red-500 font-bold">₹ {report.business_transactions.expense.toFixed(2)}</div>
                  <div className="text-sm">Expense</div>
                </div>
                <div className={`p-3 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className="text-blue-500 font-bold">₹ {report.business_transactions.others.toFixed(2)}</div>
                  <div className="text-sm">Others</div>
                </div>
              </div>
            </section>

            {/* Cash Bank Summary Section */}
            <section className={`p-3 rounded-lg shadow ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
              <h2 className="text-lg font-semibold mb-2">Cash & Bank Summary</h2>
              <div className="grid grid-cols-1 gap-2">
                {report.cash_bank_summary.map((account, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-50"} flex justify-between`}
                  >
                    <div>
                      <div className="font-medium">{account.account_name}</div>
                      <div className="text-sm opacity-75">{account.account_type}</div>
                    </div>
                    <div className="font-bold">₹ {account.current_balance.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Tasks Section */}
            <section className={`p-3 rounded-lg shadow ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
              <h2 className="text-lg font-semibold mb-2">Tasks</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Completed Tasks</h3>
                  <div className="space-y-2">
                    {report.tasks.completed.map((task, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}
                      >
                        {task.task_name}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Pending Tasks</h3>
                  <div className="space-y-2">
                    {report.tasks.pending.map((task, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}
                      >
                        {task.task_name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}