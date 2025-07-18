'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Sun, Moon, Search, FileTextIcon, X, Share2, Eye, EyeOff } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'

type Job = {
  id: number
  date: string
  customer_name: string
  site_area: string
  to_area?: string
  total_load: number
  load_rate: number
  load_amount: number
  description: string
  outstanding_balance: number
  outstanding_as_of: string
}

export default function JobReport() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [jobs, setJobs] = useState<Job[]>([])
  const today = new Date().toISOString().split('T')[0]
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBillPreview, setShowBillPreview] = useState(false)
  const [billImageUrl, setBillImageUrl] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showDetails, setShowDetails] = useState<{ [key: number]: boolean }>({})
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [])

  const toggleDetails = (jobId: number) => {
    setShowDetails(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }))
  }

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-')
    return `${day}-${month}-${year}`
  }

  const fetchJobs = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}jobs/report/?from_date=${fromDate}&to_date=${toDate}`)
      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }
      const data = await response.json()
      setJobs(data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setError('Failed to load jobs. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault()
    fetchJobs()
  }

  const generateSalesBill = async (job: Job) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 700 // Increased height to accommodate new fields

    // Set background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#f0f9ff')
    gradient.addColorStop(1, '#e0f2fe')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Set text style
    ctx.fillStyle = '#0369a1'
    ctx.font = 'bold 32px Arial'

    // Draw header
    ctx.textAlign = 'center'
    ctx.fillText('Sales Bill', canvas.width / 2, 50)

    ctx.font = 'bold 24px Arial'
    ctx.fillText('Metro Transports', canvas.width / 2, 90)

    ctx.font = '18px Arial'
    ctx.fillStyle = '#0284c7'
    ctx.fillText('Google Pay Number: 8903663666', canvas.width / 2, 120)

    // Draw job details
    ctx.textAlign = 'left'
    ctx.font = '16px Arial'
    ctx.fillStyle = '#0369a1'
    ctx.fillText(`Date: ${formatDate(job.date)}`, 50, 160)
    ctx.fillText('Customer Name:', 50, 190)

    // Bold customer name
    ctx.font = 'bold 16px Arial'
    ctx.fillStyle = '#0284c7'
    ctx.fillText(job.customer_name, 170, 190)

    // Add Site Area and To Area
    ctx.font = '16px Arial'
    ctx.fillStyle = '#0369a1'
    ctx.fillText('Site Area:', 50, 220)
    ctx.font = '14px Arial'
    ctx.fillStyle = '#0284c7'
    const siteAreaText = job.site_area || 'N/A'
    ctx.fillText(siteAreaText, 130, 220)

    ctx.font = '16px Arial'
    ctx.fillStyle = '#0369a1'
    ctx.fillText('To Area:', 50, 250)
    ctx.font = '14px Arial'
    ctx.fillStyle = '#0284c7'
    const toAreaText = job.to_area || 'N/A'
    ctx.fillText(toAreaText, 120, 250)

    // Draw table
    const tableTop = 280
    const rowHeight = 40
    const col1 = 50
    const col2 = 300
    const col3 = 550

    // Table header
    ctx.fillStyle = '#0369a1'
    ctx.fillRect(col1, tableTop, canvas.width - 100, rowHeight)
    ctx.font = 'bold 16px Arial'
    ctx.fillStyle = 'white'
    ctx.fillText('Item', col1 + 10, tableTop + 25)
    ctx.fillText('Quantity', col2 + 10, tableTop + 25)
    ctx.fillText('Amount', col3 - 70, tableTop + 25)

    // Table content
    ctx.font = '16px Arial'
    ctx.fillStyle = '#0369a1'
    ctx.fillText('Total Load', col1 + 10, tableTop + rowHeight + 25)
    ctx.fillText(job.total_load.toString(), col2 + 10, tableTop + rowHeight + 25)
    ctx.fillText(`₹${job.total_load * job.load_rate}`, col3 - 70, tableTop + rowHeight + 25)

    // Total amount
    ctx.font = 'bold 18px Arial'
    ctx.fillStyle = '#0284c7'
    ctx.fillText('Total Amount:', col2 + 10, tableTop + rowHeight * 2 + 25)
    ctx.fillText(`₹${job.load_amount}`, col3 - 70, tableTop + rowHeight * 2 + 25)

    // Add outstanding balance section after the total amount
    ctx.font = 'bold 18px Arial'
    ctx.fillStyle = '#0284c7'
    const outstandingY = tableTop + rowHeight * 3 + 25
    ctx.fillText('Total Outstanding:', col2 + 10, outstandingY)
    ctx.fillText(`₹${job.outstanding_balance}`, col3 - 70, outstandingY)
    ctx.font = '14px Arial'
    ctx.fillStyle = '#64748b'
    ctx.fillText(`(as of ${job.outstanding_as_of})`, col2 + 10, outstandingY + 20)

    // Draw description
    ctx.font = '16px Arial'
    ctx.fillStyle = '#0369a1'
    ctx.fillText('Description:', 50, outstandingY + 50)
    
    // Wrap description text if it's too long
    const maxWidth = canvas.width - 100
    const words = job.description.split(' ')
    let line = ''
    let y = outstandingY + 80
    
    ctx.font = '14px Arial'
    ctx.fillStyle = '#0284c7'
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, 50, y)
        line = words[n] + ' '
        y += 20
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, 50, y)

    // Add decorative elements
    ctx.strokeStyle = '#0284c7'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(50, canvas.height - 50)
    ctx.lineTo(canvas.width - 50, canvas.height - 50)
    ctx.stroke()

    // Set the generated image URL and show the preview
    const imageUrl = canvas.toDataURL('image/png')
    setBillImageUrl(imageUrl)
    setShowBillPreview(true)
  }

  const handleDownloadBill = () => {
    if (billImageUrl) {
      const link = document.createElement('a')
      link.href = billImageUrl
      link.download = `sales_bill_${Date.now()}.png`
      link.click()
    }
  }

  const handleShareBill = async () => {
    if (billImageUrl && navigator.share) {
      try {
        const blob = await (await fetch(billImageUrl)).blob()
        const file = new File([blob], 'sales_bill.png', { type: 'image/png' })
        await navigator.share({
          files: [file],
          title: 'Sales Bill',
          text: 'Here is your sales bill from Metro Transports.'
        })
      } catch (error) {
        console.error('Error sharing bill:', error)
      }
    } else {
      alert('Sharing is not supported on this device or browser.')
    }
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/daysheet/daysheetmain" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Job Report</h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleGenerateReport} className="mb-8">
          <div className="flex flex-wrap -mx-2 mb-4">
            <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
              <label htmlFor="fromDate" className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>From Date</label>
              <input
                type="date"
                id="fromDate"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                required
              />
            </div>
            <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
              <label htmlFor="toDate" className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>To Date</label>
              <input
                type="date"
                id="toDate"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                required
              />
            </div>
            <div className="w-full md:w-1/3 px-2 flex items-end">
              <button
                type="submit"
                className={`w-full p-2 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white flex items-center justify-center`}
                disabled={isLoading}
              >
                <Search className="mr-2" size={20} />
                {isLoading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : jobs.length > 0 ? (
          <>
            {isMobile ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4 shadow-md`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatDate(job.date)}
                          </span>
                          <button
                            onClick={() => toggleDetails(job.id)}
                            className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            {showDetails[job.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{job.customer_name}</h3>
                        <p className={`text-xl font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                          ₹{job.load_amount}
                        </p>
                      </div>
                      <button
                        onClick={() => generateSalesBill(job)}
                        className={`ml-3 p-3 rounded-full ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white flex items-center`}
                        aria-label="Generate Sales Bill"
                      >
                        <FileTextIcon size={20} className="mr-1" />
                        <span className="text-sm font-medium">Bill</span>
                      </button>
                    </div>
                    
                    {showDetails[job.id] && (
                      <div className={`pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} space-y-2`}>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Site Area:</span>
                            <p className="font-medium">{job.site_area}</p>
                          </div>
                          <div>
                            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>To Area:</span>
                            <p className="font-medium">{job.to_area || '-'}</p>
                          </div>
                          <div>
                            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Load:</span>
                            <p className="font-medium">{job.total_load}</p>
                          </div>
                          <div>
                            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Load Rate:</span>
                            <p className="font-medium">{job.load_rate}</p>
                          </div>
                        </div>
                        <div>
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Description:</span>
                          <p className="font-medium text-sm">{job.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className={`min-w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg overflow-hidden`}>
                  <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <tr>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Customer Name</th>
                      <th className="px-4 py-2 text-left">Site Area</th>
                      <th className="px-4 py-2 text-left">To Area</th>
                      <th className="px-4 py-2 text-right">Total Load</th>
                      <th className="px-4 py-2 text-right">Load Rate</th>
                      <th className="px-4 py-2 text-right">Load Amount</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job, index) => (
                      <tr key={job.id} className={`${index % 2 === 0 ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-50') : ''}`}>
                        <td className="px-4 py-2">{job.date}</td>
                        <td className="px-4 py-2 font-bold">{job.customer_name}</td>
                        <td className="px-4 py-2">{job.site_area}</td>
                        <td className="px-4 py-2">{job.to_area || '-'}</td>
                        <td className="px-4 py-2 text-right">{job.total_load}</td>
                        <td className="px-4 py-2 text-right">{job.load_rate}</td>
                        <td className="px-4 py-2 text-right">₹{job.load_amount}</td>
                        <td className="px-4 py-2">{job.description}</td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => generateSalesBill(job)}
                            className={`p-2 rounded ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white flex items-center justify-center mx-auto`}
                            aria-label="Generate Sales Bill"
                          >
                            <FileTextIcon size={16} className="mr-1" />
                            <span className="text-sm">Bill</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No data available. Please select a date range and generate a report.
          </p>
        )}
      </main>

      {showBillPreview && billImageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white p-4 rounded-lg shadow-lg ${isDarkMode ? 'dark:bg-gray-800' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sales Bill Preview</h2>
              <button
                onClick={() => setShowBillPreview(false)}
                className={`p-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                aria-label="Close preview"
              >
                <X size={20} />
              </button>
            </div>
            <Image src={billImageUrl} alt="Sales Bill" width={800} height={700} className="mb-4 max-w-full h-auto" />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleShareBill}
                className={`px-4 py-2 rounded ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white flex items-center`}
              >
                <Share2 size={16} className="mr-2" />
                Share
              </button>
              <button
                onClick={handleDownloadBill}
                className={`px-4 py-2 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}