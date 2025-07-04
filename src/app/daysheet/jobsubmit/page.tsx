'use client'

import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import Link from 'next/link'
import { ArrowLeft, Moon, Sun, ChevronDown } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface Customer {
  id: number
  name: string
}

interface Tractor {
  id: number
  name: string
}

interface Job {
  date: string
  customer: number
  tractor: number
  opening_hours: number
  closing_hours: number
  site_area: string
  total_load: number
  load_rate: number
  load_amount: number
  description: string
}

interface JobSubmission {
  date: string
  jobs: Job[]
}

export default function JobSubmitPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [tractors, setTractors] = useState<Tractor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<JobSubmission>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      jobs: [{
        date: new Date().toISOString().split('T')[0],
        customer: 0,
        tractor: 0,
        opening_hours: 0,
        closing_hours: 0,
        site_area: '',
        total_load: 0,
        load_rate: 0,
        load_amount: 0,
        description: ''
      }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "jobs"
  })

  const watchJobs = watch('jobs')
  const watchDate = watch('date')

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}customers/list/`)
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      const data = await response.json()
      const sortedCustomers = data.sort((a: Customer, b: Customer) => a.name.localeCompare(b.name))
      setCustomers(sortedCustomers)
    } catch (error) {
      console.error('Error fetching customers:', error)
      alert('Failed to load customers. Please try again.')
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tractorsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tractors/list/`)

        if (!tractorsResponse.ok) {
          throw new Error('Failed to fetch tractors')
        }

        const tractorsData = await tractorsResponse.json()
        setTractors(tractorsData)

        // Fetch customers
        fetchCustomers()
      } catch (error) {
        console.error('Error fetching data:', error)
        alert('Failed to load initial data. Please try again.')
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    watchJobs.forEach((job, index) => {
      const loadAmount = job.total_load * job.load_rate
      setValue(`jobs.${index}.load_amount`, loadAmount)
      setValue(`jobs.${index}.date`, watchDate)
    })
  }, [watchJobs, watchDate, setValue])

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase())
  )

  // Add this function to handle customer selection
  const handleCustomerSelect = (customerId: number, customerName: string, index: number) => {
    setValue(`jobs.${index}.customer`, customerId)
    setCustomerSearchTerm(customerName)
    setIsCustomerDropdownOpen(false)
  }

  const onSubmit = async (data: JobSubmission) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}jobs/submit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(JSON.stringify(errorData.errors) || 'Failed to submit jobs')
      }

      const result = await response.json()
      alert(result.message)
    } catch (error) {
      console.error('Error submitting jobs:', error)
      alert(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
  }`

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold text-blue-600">Submit Jobs</h1>
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
        <form onSubmit={handleSubmit(onSubmit)} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-8`}>
          <div className="mb-6">
            <label htmlFor="date" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date</label>
            <input
              type="date"
              id="date"
              {...register("date", { required: "Date is required" })}
              className={inputStyle}
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className={`mb-8 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Job {index + 1}</h3>
              
              <div className="mb-4">
                <label htmlFor={`jobs.${index}.customer`} className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Customer</label>
                <div className="relative">
                  <Controller
                    name={`jobs.${index}.customer` as const}
                    control={control}
                    rules={{ required: "Customer is required" }}
                    render={() => (
                      <div className="relative">
                        <div className="flex items-center">
                          <input
                            type="text"
                            placeholder="Search customers..."
                            value={customerSearchTerm}
                            onChange={(e) => {
                              setCustomerSearchTerm(e.target.value)
                              setIsCustomerDropdownOpen(true)
                            }}
                            onFocus={() => setIsCustomerDropdownOpen(true)}
                            className={`${inputStyle} pr-10`}
                          />
                          <button
                            type="button"
                            onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                            className={`absolute right-2 p-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                        
                        {isCustomerDropdownOpen && (
                          <div className={`absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-md shadow-lg ${
                            isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-300'
                          }`}>
                            {filteredCustomers.length > 0 ? (
                              filteredCustomers.map((customer) => (
                                <button
                                  key={customer.id}
                                  type="button"
                                  onClick={() => handleCustomerSelect(customer.id, customer.name, index)}
                                  className={`w-full text-left px-4 py-2 hover:bg-blue-100 ${
                                    isDarkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-900'
                                  }`}
                                >
                                  {customer.name}
                                </button>
                              ))
                            ) : (
                              <div className={`px-4 py-2 text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                No customers found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>
                {errors.jobs?.[index]?.customer && <p className="mt-1 text-sm text-red-600">{errors.jobs[index].customer.message}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor={`jobs.${index}.tractor`} className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tractor</label>
                <Controller
                  name={`jobs.${index}.tractor` as const}
                  control={control}
                  rules={{ required: "Tractor is required" }}
                  render={({ field }) => (
                    <select {...field} className={inputStyle}>
                      <option value="">Select a tractor</option>
                      {tractors.map((tractor) => (
                        <option key={tractor.id} value={tractor.id}>{tractor.name}</option>
                      ))}
                    </select>
                  )}
                />
                {errors.jobs?.[index]?.tractor && <p className="mt-1 text-sm text-red-600">{errors.jobs[index].tractor.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor={`jobs.${index}.opening_hours`} className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Opening Hours</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`jobs.${index}.opening_hours` as const, { required: "Opening hours are required", min: 0 })}
                    className={inputStyle}
                  />
                  {errors.jobs?.[index]?.opening_hours && <p className="mt-1 text-sm text-red-600">{errors.jobs[index].opening_hours.message}</p>}
                </div>

                <div>
                  <label htmlFor={`jobs.${index}.closing_hours`} className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Closing Hours</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`jobs.${index}.closing_hours` as const, { required: "Closing hours are required", min: 0 })}
                    className={inputStyle}
                  />
                  {errors.jobs?.[index]?.closing_hours && <p className="mt-1 text-sm text-red-600">{errors.jobs[index].closing_hours.message}</p>}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor={`jobs.${index}.site_area`} className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Site Area</label>
                <input
                  type="text"
                  {...register(`jobs.${index}.site_area` as const, { required: "Site area is required" })}
                  className={inputStyle}
                />
                {errors.jobs?.[index]?.site_area && <p className="mt-1 text-sm text-red-600">{errors.jobs[index].site_area.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor={`jobs.${index}.total_load`} className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Load</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`jobs.${index}.total_load` as const, { 
                      required: "Total load is required", 
                      min: 0,
                      onChange: (e) => {
                        const totalLoad = parseFloat(e.target.value);
                        const loadRate = parseFloat(String(watch(`jobs.${index}.load_rate`) || '0'));
                        setValue(`jobs.${index}.load_amount`, totalLoad * loadRate);
                      }
                    })}
                    className={inputStyle}
                  />
                  {errors.jobs?.[index]?.total_load && <p className="mt-1 text-sm text-red-600">{errors.jobs[index].total_load.message}</p>}
                </div>

                <div>
                  <label htmlFor={`jobs.${index}.load_rate`} className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Load Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`jobs.${index}.load_rate` as const, { 
                      required: "Load rate is required", 
                      min: 0,
                      onChange: (e) => {
                        const loadRate = parseFloat(e.target.value);
                        const totalLoad = parseFloat(String(watch(`jobs.${index}.total_load`) || '0'));
                        setValue(`jobs.${index}.load_amount`, totalLoad * loadRate);
                      }
                    })}
                    className={inputStyle}
                  />
                  {errors.jobs?.[index]?.load_rate && <p className="mt-1 text-sm text-red-600">{errors.jobs[index].load_rate.message}</p>}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor={`jobs.${index}.load_amount`} className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Load Amount</label>
                <input
                  type="number"
                  step="0.01"
                  {...register(`jobs.${index}.load_amount` as const, { required: "Load amount is required" })}
                  className={`${inputStyle} bg-gray-100`}
                  readOnly
                />
                {errors.jobs?.[index]?.load_amount && <p className="mt-1 text-sm text-red-600">{errors.jobs[index].load_amount.message}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor={`jobs.${index}.description`} className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                <textarea
                  {...register(`jobs.${index}.description` as const)}
                  className={inputStyle}
                  rows={3}
                />
              </div>

              {index > 0 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
                >
                  Remove Job
                </button>
              )}
            </div>
          ))}

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => append({
                date: watchDate,
                customer: 0,
                tractor: 0,
                opening_hours: 0,
                closing_hours: 0,
                site_area: '',
                total_load: 0,
                load_rate: 0,
                load_amount: 0,
                description: ''
              })}
              className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
              Add Another Job
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
            >
              {isLoading ? 'Submitting...' : 'Submit Jobs'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}