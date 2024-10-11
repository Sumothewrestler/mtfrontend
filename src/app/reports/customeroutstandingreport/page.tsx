'use client'

import Link from 'next/link'
import { ArrowLeft, FileText, Users } from 'lucide-react'

export default function CustomerOutstandingReport() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex items-center">
          <Link href="/reports/customerledger" className="text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Ledger Card */}
          <Link href="/reports/customerledger" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Customer Ledger</h2>
                <FileText className="h-10 w-10 text-blue-500" />
              </div>
              <p className="text-gray-600">
                
              </p>
            </div>
          </Link>

          {/* Total Customer Outstanding Card */}
          <Link href="/reports/totalcustomeroutstanding" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Total Customer Outstanding</h2>
                <Users className="h-10 w-10 text-green-500" />
              </div>
              <p className="text-gray-600">
                
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
