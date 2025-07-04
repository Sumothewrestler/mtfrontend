"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Moon,
  Sun,
  ZoomIn,
  ZoomOut,
  LayoutGrid,
  List,
  Download,
  Printer,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import Select from "react-select"
import jsPDF from "jspdf"
// Import the autoTable type
import "jspdf-autotable"
import { format } from 'date-fns'

type Customer = {
  id: number
  name: string
}

type LedgerEntry = {
  date: string
  description: string
  amount_dr: number
  amount_cr: number
  balance: number
}

interface CustomerOption {
  value: string
  label: string
}

// Define a proper type for autoTable options
interface AutoTableOptions {
  head: string[][]
  body: string[][]
  startY: number
  theme: string
  styles: {
    fontSize: number
    fontStyle?: string
    cellPadding?: number
  }
  headStyles: {
    fillColor: number[]
    fontStyle?: string
    textColor?: number[]
  }
  bodyStyles?: {
    fontStyle?: string
  }
  columnStyles?: {
    [key: number]: {
      cellWidth?: 'auto' | number
      overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden'
      halign?: 'left' | 'center' | 'right'
    }
  }
}

// Update the jsPDF module augmentation
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF
  }
}

export default function CustomerLedger() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [selectedCustomerName, setSelectedCustomerName] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([])
  const [openingBalance, setOpeningBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [isCardView, setIsCardView] = useState(true)
  const [expandedCells, setExpandedCells] = useState<{ [key: string]: boolean }>({})

  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}customers/list/`)
      if (!response.ok) {
        throw new Error("Failed to fetch customers")
      }
      const data = await response.json()
      setCustomers(data.sort((a: Customer, b: Customer) => a.name.localeCompare(b.name)))
    } catch (error) {
      console.error("Error fetching customers:", error)
      setError("Failed to load customers. Please try again later.")
    }
  }

  const generateReport = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}customer-ledger/?customerId=${selectedCustomer}&fromDate=${fromDate}&toDate=${toDate}`
      console.log("Fetching report from:", url)
      
      const response = await fetch(url)
      
      console.log("Response status:", response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
    
      const data = await response.json()
      console.log("Received data:", data)
      setLedgerData(data.ledger)
      setOpeningBalance(data.openingBalance)

      // Store the customer name for the PDF export
      const customer = customers.find((c) => c.id.toString() === selectedCustomer)
      if (customer) {
        setSelectedCustomerName(customer.name)
      }
    } catch (error) {
      console.error("Error fetching customer ledger:", error)
      if (error instanceof Error) {
        setError(`Failed to generate report. Error: ${error.message}`)
      } else {
        setError("Failed to generate report. An unknown error occurred.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50))

  // Manual implementation of print functionality to avoid type errors
  const handlePrint = () => {
    if (!printRef.current) return;
    
    const printContent = printRef.current;
    const windowUrl = 'about:blank';
    const uniqueName = `print_${Date.now()}`;
    const windowFeatures = 'width=800,height=600,top=100,left=100';
    
    const printWindow = window.open(windowUrl, uniqueName, windowFeatures);
    
    if (!printWindow) {
      alert('Please allow pop-ups to print the ledger.');
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedCustomerName}_Ledger</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .text-right { text-align: right; }
            .company-header { text-align: center; margin-bottom: 20px; }
            .company-header h1 { margin-bottom: 5px; }
            .print-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="company-header">
            <h1>Metro Transports</h1>
            <p>Contact: 8903663666, GPay: 9443225671</p>
            <h2>Customer Ledger Statement</h2>
          </div>
          <div class="print-header">
            <p>Customer: ${selectedCustomerName}</p>
            <p>Period: ${fromDate} to ${toDate}</p>
          </div>
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Add a slight delay to ensure content is loaded before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const exportToPDF = () => {
    if (!selectedCustomerName || ledgerData.length === 0) return

    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      })

      // Format the current date for the statement
      const statementDate = format(new Date(), 'dd-MM-yyyy')

      // Set default font for English text
      doc.setFont('helvetica')

      // Add company information
      doc.setFontSize(18)
      doc.text("Metro Transports", 105, 15, { align: "center" })
      
      // Add contact information
      doc.setFontSize(10)
      doc.text("Contact: 8903663666, GPay: 9443225671", 105, 22, { align: "center" })

      // Add report title and date
      doc.setFontSize(14)
      doc.text("Customer Ledger Statement", 105, 30, { align: "center" })

      // Add customer and date information
      doc.setFontSize(10)
      doc.text(`Customer: ${selectedCustomerName}`, 14, 40)
      doc.text(`Period: ${format(new Date(fromDate), 'dd-MM-yyyy')} to ${format(new Date(toDate), 'dd-MM-yyyy')}`, 14, 46)
      doc.text(`Statement Date: ${statementDate}`, 14, 52)

      // Create table data with formatted dates
      const tableRows = [
        ["", "Opening Balance", "", "", `${Math.abs(openingBalance).toFixed(2)} ${openingBalance >= 0 ? "Dr" : "Cr"}`],
        ...ledgerData.map(entry => [
          format(new Date(entry.date), 'dd-MM-yyyy'),  // Format the date here
          entry.description,
          entry.amount_dr.toFixed(2),
          entry.amount_cr.toFixed(2),
          `${Math.abs(entry.balance).toFixed(2)} ${entry.balance >= 0 ? "Dr" : "Cr"}`
        ])
      ]

      // Generate table
      doc.autoTable({
        head: [["Date", "Description", "Debit", "Credit", "Balance"]],
        body: tableRows,
        startY: 50,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 25, halign: 'right' },
          3: { cellWidth: 25, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' }
        }
      })

      // Save the PDF
      doc.save(`${selectedCustomerName}_Ledger_${fromDate}_to_${toDate}.pdf`)

    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  const toggleCell = (cellKey: string) => {
    setExpandedCells(prev => ({
      ...prev,
      [cellKey]: !prev[cellKey]
    }))
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
              href="/reports/reportsmain"
              className={`${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"} mr-4`}
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Customer Ledger</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label
                htmlFor="customer"
                className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Customer
              </label>
              <Select<CustomerOption>
                id="customer"
                options={customers.map((customer) => ({ value: customer.id.toString(), label: customer.name }))}
                value={
                  customers.find((customer) => customer.id.toString() === selectedCustomer)
                    ? {
                        value: selectedCustomer,
                        label: customers.find((customer) => customer.id.toString() === selectedCustomer)!.name,
                      }
                    : null
                }
                onChange={(selected) => setSelectedCustomer(selected ? selected.value : "")}
                placeholder="Search or select a customer..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: isDarkMode ? "#374151" : "white",
                    borderColor: isDarkMode ? "#4B5563" : "#D1D5DB",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: isDarkMode ? "#374151" : "white",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: isDarkMode
                      ? state.isFocused
                        ? "#4B5563"
                        : "#374151"
                      : state.isFocused
                        ? "#F3F4F6"
                        : "white",
                    color: isDarkMode ? "white" : "black",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: isDarkMode ? "white" : "black",
                  }),
                  input: (provided) => ({
                    ...provided,
                    color: isDarkMode ? "white" : "black",
                  }),
                }}
              />
            </div>
            <div>
              <label
                htmlFor="fromDate"
                className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                From Date
              </label>
              <input
                type="date"
                id="fromDate"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="toDate"
                className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                To Date
              </label>
              <input
                type="date"
                id="toDate"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={generateReport}
                className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                  isDarkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>

          {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

          {ledgerData.length > 0 && (
            <>
              <div className="flex justify-between items-center mb-4">
                {/* View Toggle with expand/collapse */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleCell('filters')}
                    className={`p-2 rounded-full ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-800"}`}
                  >
                    {expandedCells['filters'] ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
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

                {/* Export buttons - only show in table view */}
                {!isCardView && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleCell('export')}
                      className={`p-2 rounded-full ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-800"}`}
                    >
                      {expandedCells['export'] ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    {expandedCells['export'] && (
                      <>
                        <button
                          onClick={exportToPDF}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-md ${
                            isDarkMode
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          }`}
                        >
                          <Download size={16} />
                          <span>Export Ledger Statement</span>
                        </button>
                        <button
                          onClick={handlePrint}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-md ${
                            isDarkMode
                              ? "bg-gray-600 hover:bg-gray-700 text-white"
                              : "bg-gray-500 hover:bg-gray-600 text-white"
                          }`}
                        >
                          <Printer size={16} />
                          <span className="hidden sm:inline">Print</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Card View */}
              {isCardView && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Opening Balance Card */}
                  <div className={`p-4 rounded-lg shadow ${isDarkMode ? "bg-gray-700" : "bg-white"}`}>
                    <h3 className={`font-medium text-lg mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                      Opening Balance
                    </h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Balance:</span>
                      <span className={`font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                        {Math.abs(openingBalance).toFixed(2)} {openingBalance >= 0 ? "Dr" : "Cr"}
                      </span>
                    </div>
                  </div>

                  {/* Transaction Cards */}
                  {ledgerData.map((entry, index) => (
                    <div key={index} className={`p-4 rounded-lg shadow ${isDarkMode ? "bg-gray-700" : "bg-white"}`}>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className={`font-medium text-lg ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                          {entry.date}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            entry.amount_dr > 0 ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {entry.amount_dr > 0 ? "Debit" : "Credit"}
                        </span>
                      </div>
                      <p className={`text-sm mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {entry.description}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        {entry.amount_dr > 0 ? (
                          <div className="flex flex-col">
                            <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              Amount Dr:
                            </span>
                            <span className="font-semibold">{entry.amount_dr.toFixed(2)}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              Amount Cr:
                            </span>
                            <span className="font-semibold">{entry.amount_cr.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex flex-col items-end">
                          <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Balance:</span>
                          <span className="font-semibold">
                            {Math.abs(entry.balance).toFixed(2)} {entry.balance >= 0 ? "Dr" : "Cr"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Closing Balance Card */}
                  <div className={`p-4 rounded-lg shadow ${isDarkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                    <h3 className={`font-medium text-lg mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                      Closing Balance
                    </h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Balance:</span>
                      <span className={`font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                        {Math.abs(ledgerData[ledgerData.length - 1]?.balance || 0).toFixed(2)}{" "}
                        {(ledgerData[ledgerData.length - 1]?.balance || 0) >= 0 ? "Dr" : "Cr"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Table View */}
              {!isCardView && (
                <div className="overflow-x-auto" ref={printRef}>
                  <table className={`min-w-full divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                    <thead className={isDarkMode ? "bg-gray-700" : "bg-gray-50"}>
                      <tr>
                        <th
                          className={`py-2 px-4 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
                        >
                          Date
                        </th>
                        <th
                          className={`py-2 px-4 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
                        >
                          Description
                        </th>
                        <th
                          className={`py-2 px-4 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
                        >
                          Amount Cr
                        </th>
                        <th
                          className={`py-2 px-4 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
                        >
                          Amount Dr
                        </th>
                        <th
                          className={`py-2 px-4 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
                        >
                          Balance
                        </th>
                  </tr>
                </thead>
                    <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                  <tr>
                        <td
                          className={`py-2 px-4 whitespace-nowrap text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                          colSpan={4}
                        >
                      Opening Balance
                    </td>
                        <td
                          className={`py-2 px-4 whitespace-nowrap text-sm text-right ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                        >
                          {Math.abs(openingBalance).toFixed(2)} {openingBalance >= 0 ? "Dr" : "Cr"}
                    </td>
                  </tr>
                  {ledgerData.map((entry, index) => (
                        <tr key={index} className={isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                          <td
                            className={`py-2 px-4 whitespace-nowrap text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                          >
                            {entry.date}
                          </td>
                          <td
                            className={`py-2 px-4 whitespace-nowrap text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                          >
                            {entry.description}
                          </td>
                          <td
                            className={`py-2 px-4 whitespace-nowrap text-sm text-right ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                          >
                            {entry.amount_cr.toFixed(2)}
                          </td>
                          <td
                            className={`py-2 px-4 whitespace-nowrap text-sm text-right ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                          >
                            {entry.amount_dr.toFixed(2)}
                          </td>
                          <td
                            className={`py-2 px-4 whitespace-nowrap text-sm text-right ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                          >
                            {Math.abs(entry.balance).toFixed(2)} {entry.balance >= 0 ? "Dr" : "Cr"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                    <tfoot className={isDarkMode ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                        <td
                          colSpan={4}
                          className={`py-2 px-4 whitespace-nowrap text-sm font-medium text-right ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                        >
                      Closing Balance:
                    </td>
                        <td
                          className={`py-2 px-4 whitespace-nowrap text-sm text-right ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                        >
                          {Math.abs(ledgerData[ledgerData.length - 1]?.balance || 0).toFixed(2)}{" "}
                          {(ledgerData[ledgerData.length - 1]?.balance || 0) >= 0 ? "Dr" : "Cr"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Add print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-only {
            display: block !important;
          }
          #printSection, #printSection * {
            visibility: visible;
          }
          #printSection {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}