"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Home, Database, FileText, Calendar, Moon, Sun, ZoomIn, ZoomOut, Plus, X } from 'lucide-react'

type Customer = {
  id: number
  name: string
}

type Tractor = {
  id: number
  name: string
}

type Employee = {
  id: number
  name: string
}

type Job = {
  id: number
  customerName: string
  tractorName: string
  totalLoad: number
  loadRate: number
  loadAmount: number
  employees: {[key: string]: number}
  description: string
}

export default function AddJob() {
  const [date, setDate] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [tractors, setTractors] = useState<Tractor[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersResponse, tractorsResponse, employeesResponse] = await Promise.all([
          fetch('http://localhost:8000/api/customers/list/'),
          fetch('http://localhost:8000/api/tractors/list/'),
          fetch('http://localhost:8000/api/employees/list/')
        ]);

        if (!customersResponse.ok) throw new Error('Failed to fetch customers');
        if (!tractorsResponse.ok) throw new Error('Failed to fetch tractors');
        if (!employeesResponse.ok) throw new Error('Failed to fetch employees');

        const [customersData, tractorsData, employeesData] = await Promise.all([
          customersResponse.json(),
          tractorsResponse.json(),
          employeesResponse.json()
        ]);

        console.log('Customers:', customersData);
        console.log('Tractors:', tractorsData);
        console.log('Employees:', employeesData);

        setCustomers(customersData);
        setTractors(tractorsData);
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // You might want to set an error state here and display it to the user
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async  (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submissionData = {
        date,
        jobs: jobs.map(job => ({
          date,
          customer: job.customerName,
          tractor: job.tractorName,
          total_load: job.totalLoad,
          load_rate: job.loadRate,
          load_amount: job.loadAmount,
          description: job.description,
          employee_jobs: Object.entries(job.employees)
            .filter(([_, loadingCharge]) => loadingCharge !== null && loadingCharge !== '')
            .map(([employeeName, loadingCharge]) => ({
              employee: employeeName,
              loading_charge: parseFloat(loadingCharge as string)
            }))
        }))
      };

      console.log('Submitting jobs:', JSON.stringify(submissionData, null, 2));

      const response = await fetch('http://localhost:8000/api/jobs/submit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      console.log('Response status:', response.status);

      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`Failed to submit jobs: ${response.status} ${response.statusText}\n${responseText}`);
      }

      const result = JSON.parse(responseText);
      console.log('Jobs submitted:', result);
      alert('Jobs submitted successfully!');
      // Reset form
      setDate('');
      setJobs([]);
    } catch (error) {
      console.error('Error submitting jobs:', error);
      alert(`Failed to submit jobs. Error: ${error.message}`);
    }
  };

  const addJob = () => {
    setJobs([...jobs, {
      id: Date.now(),
      customerName: '',
      tractorName: '',
      totalLoad: 0,
      loadRate: 0,
      loadAmount: 0,
      employees: {},
      description: ''
    }]);
  };

  const removeJob = (id: number) => {
    setJobs(jobs.filter(job => job.id !== id));
  };

  const updateJob = (id: number, field: string, value: any) => {
    setJobs(jobs.map(job => {
      if (job.id === id) {
        const updatedJob = { ...job, [field]: value };
        if (field === 'totalLoad' || field === 'loadRate') {
          updatedJob.loadAmount = updatedJob.totalLoad * updatedJob.loadRate;
        }
        return updatedJob;
      }
      return job;
    }));
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50))

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`} style={{ fontSize: `${zoom}%` }}>
      {/* Sidebar */}
      <div className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">METRO TRANSPORTS</h2>
          <h3 className="text-xl font-semibold mb-6">Dashboard</h3>
          <nav>
            <Link href="/" className={`flex items-center py-3 px-4 rounded transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`}>
              <Home className="mr-3" size={20} />
              Homepage
            </Link>
            <Link href="/masters/mastermain" className={`flex items-center py-3 px-4 rounded transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`}>
              <Database className="mr-3" size={20} />
              Masters
            </Link>
            <Link href="/reports/reportsmain" className={`flex items-center py-3 px-4 rounded transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`}>
              <FileText className="mr-3" size={20} />
              Reports
            </Link>
            <Link href="/daysheet/daysheetmain" className={`flex items-center py-3 px-4 rounded transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`}>
              <Calendar className="mr-3" size={20} />
              Day Sheet
            </Link>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm flex justify-between items-center px-6 py-4`}>
          <div className="flex items-center">
            <Link href="/daysheet/daysheetmain" className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-semibold">Add Job</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={handleZoomOut} className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}>
              <ZoomOut size={20} />
            </button>
            <button onClick={handleZoomIn} className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}>
              <ZoomIn size={20} />
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <main className="p-6">
          <form onSubmit={handleSubmit} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-8`}>
            <div className="mb-6">
              <label htmlFor="date" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            {jobs.map(job => (
              <div key={job.id} className={`mb-8 p-4 rounded-md relative ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <button
                  type="button"
                  onClick={() => removeJob(job.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor={`customer-${job.id}`} className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Customer Name
                    </label>
                    <select
                      id={`customer-${job.id}`}
                      value={job.customerName}
                      onChange={(e) => updateJob(job.id, 'customerName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Select Customer</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.name}>{customer.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`tractor-${job.id}`} className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tractor
                    </label>
                    <select
                      id={`tractor-${job.id}`}
                      value={job.tractorName}
                      onChange={(e) => updateJob(job.id, 'tractorName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Select Tractor</option>
                      {tractors.map(tractor => (
                        <option key={tractor.id} value={tractor.name}>{tractor.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label htmlFor={`totalLoad-${job.id}`} className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Total Load
                    </label>
                    <input
                      type="number"
                      id={`totalLoad-${job.id}`}
                      value={job.totalLoad}
                      onChange={(e) => updateJob(job.id, 'totalLoad', parseFloat(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor={`loadRate-${job.id}`} className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Load Rate
                    </label>
                    <input
                      type="number"
                      id={`loadRate-${job.id}`}
                      value={job.loadRate}
                      onChange={(e) => updateJob(job.id, 'loadRate', parseFloat(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor={`loadAmount-${job.id}`} className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Load Amount
                    </label>
                    <input
                      type="number"
                      id={`loadAmount-${job.id}`}
                      value={job.loadAmount}
                      readOnly
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode ? 'bg-gray-500 border-gray-400 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'
                      }`}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Employees and Loading Charge</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {employees.map(employee => (
                      <div key={employee.id} className="flex items-center">
                        <span className={`text-sm font-medium mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{employee.name}</span>
                        <input
                          type="number"
                          value={job.employees[employee.name] || ''}
                          onChange={(e) => updateJob(job.id, 'employees', {...job.employees, [employee.name]: parseFloat(e.target.value)})}
                          className={`w-24 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder="Charge"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor={`description-${job.id}`} className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    id={`description-${job.id}`}
                    value={job.description}
                    onChange={(e) => updateJob(job.id, 'description', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows={3}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addJob}
              className={`mb-6 flex items-center justify-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Job
            </button>
            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Submit
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}