"use client"

import Link from 'next/link'
import { ArrowLeft, Users, Truck, Briefcase, Receipt } from 'lucide-react'

export default function DaySheet() {
  const items = [
    { title: 'Attendance', icon: Users, color: 'bg-yellow-500', href: '/daysheet/attendance' },
    { title: 'Tractor Hours', icon: Truck, color: 'bg-green-500', href: '/daysheet/tractorhours' },
    { title: 'Add Job', icon: Briefcase, color: 'bg-blue-500', href: '/daysheet/addjob' },
    { title: 'Receipt Entry', icon: Receipt, color: 'bg-purple-500', href: '/daysheet/receiptentry' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 flex items-center">
          <Link href="/" className="text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Day Sheet</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <Link key={item.title} href={item.href} passHref>
              <div
                className={`${item.color} rounded-xl shadow-lg p-6 text-white transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl cursor-pointer`}
              >
                <item.icon className="h-8 w-8 mb-4" />
                <h3 className="text-xl font-semibold">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
