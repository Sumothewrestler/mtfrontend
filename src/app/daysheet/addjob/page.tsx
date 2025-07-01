'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, FileText, Database, Moon, Sun, Plus, X } from 'lucide-react';
import Select from 'react-select';

type Customer = {
  id: number;
  name: string;
};

type Tractor = {
  id: number;
  name: string;
};

type Job = {
  id: number;
  customerId: string | null;
  tractorId: string | null;
  customerName: string;
  tractorName: string;
  openingHours: number;
  closingHours: number;
  totalHours: number;
  siteArea: string;
  totalLoad: number;
  loadRate: number;
  loadAmount: number;
  description: string;
};

export default function AddJob() {
  const [date, setDate] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersResponse, tractorsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}customers/list/`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tractors/list/`)
        ]);

        if (!customersResponse.ok) throw new Error('Failed to fetch customers');
        if (!tractorsResponse.ok) throw new Error('Failed to fetch tractors');

        const [customersData, tractorsData] = await Promise.all([
          customersResponse.json(),
          tractorsResponse.json()
        ]);

        console.log('Fetched customers:', customersData);
        console.log('Fetched tractors:', tractorsData);

        setCustomers(customersData);
        setTractors(tractorsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const invalidJobs = jobs.filter(job => !job.customerId || !job.tractorId);
    if (invalidJobs.length > 0) {
      alert("Please select both customer and tractor for all jobs.");
      return;
    }

    try {
      const submissionData = {
        date,
        jobs: jobs.map(job => ({
          date,
          customer: job.customerId,
          tractor: job.tractorId,
          opening_hours: job.openingHours,
          closing_hours: job.closingHours,
          total_hours: job.totalHours,
          site_area: job.siteArea,
          total_load: job.totalLoad,
          load_rate: job.loadRate,
          load_amount: job.loadAmount,
          description: job.description
        }))
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}jobs/submit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to submit jobs: ${response.status}. ${JSON.stringify(errorData)}`);
      }

      await response.json();
      alert('Jobs submitted successfully!');
      setDate('');
      setJobs([]);
    } catch (error) {
      console.error('Error submitting jobs:', error);
      alert(`Failed to submit jobs. Error: ${(error as Error).message}`);
    }
  };

  const addJob = () => {
    if (customers.length === 0 || tractors.length === 0) {
      alert("Cannot add a job without available customers and tractors.");
      return;
    }

    const newJob: Job = {
      id: Date.now(),
      customerId: null,
      tractorId: null,
      customerName: '',
      tractorName: '',
      openingHours: 0,
      closingHours: 0,
      totalHours: 0,
      siteArea: '',
      totalLoad: 0,
      loadRate: 0,
      loadAmount: 0,
      description: ''
    };
    setJobs([...jobs, newJob]);
  };

  const removeJob = (id: number) => {
    if (window.confirm('Are you sure you want to remove this job?')) {
      setJobs(jobs.filter(job => job.id !== id));
    }
  };

  const updateJob = (id: number, field: keyof Job, value: Job[keyof Job]) => {
    setJobs(jobs.map(job => {
      if (job.id === id) {
        const updatedJob = { ...job, [field]: value };
        if (field === 'openingHours' || field === 'closingHours') {
          updatedJob.totalHours = Math.max(0, updatedJob.closingHours - updatedJob.openingHours);
        }
        if (field === 'totalLoad' || field === 'loadRate') {
          updatedJob.loadAmount = updatedJob.totalLoad * updatedJob.loadRate;
        }
        return updatedJob;
      }
      return job;
    }));
  };

  const sortedCustomers = customers.sort((a, b) => a.name.localeCompare(b.name));
  const customerOptions = sortedCustomers.map(customer => ({
    value: customer.id.toString(),
    label: customer.name
  }));

  const sortedTractors = tractors.sort((a, b) => a.name.localeCompare(b.name));
  const tractorOptions = sortedTractors.map(tractor => ({
    value: tractor.id.toString(),
    label: tractor.name
  }));

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/daysheet/daysheetmain" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Add Job</h1>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor={`customer-${job.id}`} className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Customer Name *
                  </label>
                  <Select
                    id={`customer-${job.id}`}
                    options={customerOptions}
                    value={customerOptions.find(option => option.value === job.customerId) || null}
                    onChange={(selectedOption) => {
                      if (selectedOption) {
                        updateJob(job.id, 'customerId', selectedOption.value);
                        updateJob(job.id, 'customerName', selectedOption.label);
                      } else {
                        updateJob(job.id, 'customerId', null);
                        updateJob(job.id, 'customerName', '');
                      }
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Search or select a customer..."
                    isClearable
                    isSearchable
                    required
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: isDarkMode ? '#4B5563' : 'white',
                        borderColor: isDarkMode ? '#6B7280' : '#D1D5DB',
                      }),
                      menu: (provided) => ({
                        ...provided,
                        backgroundColor: isDarkMode ? '#4B5563' : 'white',
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: isDarkMode
                          ? state.isFocused
                            ? '#374151'
                            : '#4B5563'
                          : state.isFocused
                            ? '#F3F4F6'
                            : 'white',
                        color: isDarkMode ? 'white' : 'black',
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: isDarkMode ? 'white' : 'black',
                      }),
                      input: (provided) => ({
                        ...provided,
                        color: isDarkMode ? 'white' : 'black',
                      }),
                    }}
                  />
                </div>
                <div>
                  <label htmlFor={`tractor-${job.id}`} className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tractor *
                  </label>
                  <Select
                    id={`tractor-${job.id}`}
                    options={tractorOptions}
                    value={tractorOptions.find(option => option.value === job.tractorId) || null}
                    onChange={(selectedOption) => {
                      if (selectedOption) {
                        updateJob(job.id, 'tractorId', selectedOption.value);
                        updateJob(job.id, 'tractorName', selectedOption.label);
                      } else {
                        updateJob(job.id, 'tractorId', null);
                        updateJob(job.id, 'tractorName', '');
                      }
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select Tractor"
                    isClearable
                    isSearchable
                    required
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: isDarkMode ? '#4B5563' : 'white',
                        borderColor: isDarkMode ? '#6B7280' : '#D1D5DB',
                      }),
                      menu: (provided) => ({
                        ...provided,
                        backgroundColor: isDarkMode ? '#4B5563' : 'white',
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: isDarkMode
                          ? state.isFocused
                            ? '#374151'
                            : '#4B5563'
                          : state.isFocused
                            ? '#F3F4F6'
                            : 'white',
                        color: isDarkMode ? 'white' : 'black',
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: isDarkMode ? 'white' : 'black',
                      }),
                      input: (provided) => ({
                        ...provided,
                        color: isDarkMode ? 'white' : 'black',
                      }),
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor={`openingHours-${job.id}`} className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Opening Hours
                  </label>
                  <input
                    type="number"
                    id={`openingHours-${job.id}`}
                    value={job.openingHours}
                    onChange={(e) => updateJob(job.id, 'openingHours', parseFloat(e.target.value))}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label htmlFor={`closingHours-${job.id}`} className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Closing Hours
                  </label>
                  <input
                    type="number"
                    id={`closingHours-${job.id}`}
                    value={job.closingHours}
                    onChange={(e) => updateJob(job.id, 'closingHours', parseFloat(e.target.value))}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label htmlFor={`totalHours-${job.id}`} className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Total Hours
                  </label>
                  <input
                    type="number"
                    id={`totalHours-${job.id}`}
                    value={job.totalHours}
                    readOnly
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDarkMode ? 'bg-gray-500 border-gray-400 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'
                    }`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label htmlFor={`siteArea-${job.id}`} className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Site Area
                  </label>
                  <input
                    type="text"
                    id={`siteArea-${job.id}`}
                    value={job.siteArea}
                    onChange={(e) => updateJob(job.id, 'siteArea', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
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
              <div>
                <label htmlFor={`description-${job.id}`} className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  id={`description-${job.id}`}
                  value={job.description}
                  onChange={(e) => updateJob(job.id, 'description', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                ></textarea>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addJob}
            className={`mb-6 flex items-center justify-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Another Job
          </button>
          <button
            type="submit"
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
          >
            Submit All Jobs
          </button>
        </form>
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg md:hidden`}>
        <div className="flex justify-around">
          <Link href="/daysheet/daysheetmain" className={`flex flex-col items-center py-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            <Calendar className="h-6 w-6 mb-1" />
            <span className="text-xs">Day Sheet</span>
          </Link>
          <Link href="/reports/reportsmain" className={`flex flex-col items-center py-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            <FileText className="h-6 w-6 mb-1" />
            <span className="text-xs">Reports</span>
          </Link>
          <Link href="/masters/mastermain" className={`flex flex-col items-center py-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            <Database className="h-6 w-6 mb-1" />
            <span className="text-xs">Masters</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}