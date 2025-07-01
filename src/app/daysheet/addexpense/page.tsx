'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, FileText, Database, Moon, Sun } from 'lucide-react'
import Select, { SingleValue } from 'react-select'

type Supplier = {
  id: number
  name: string
}

type ExpenseCategory = {
  id: number
  name: string
}

interface SupplierOption {
  value: string;
  label: string;
}

export default function AddExpense() {
  const [date, setDate] = useState('')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<string>('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersResponse, expenseCategoriesResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}suppliers/list/`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}expense-categories/list/`)
        ]);

        if (!suppliersResponse.ok) throw new Error(`Error fetching suppliers: ${suppliersResponse.statusText}`);
        if (!expenseCategoriesResponse.ok) throw new Error(`Error fetching expense categories: ${expenseCategoriesResponse.statusText}`);

        const suppliersData = await suppliersResponse.json();
        const expenseCategoriesData = await expenseCategoriesResponse.json();

        setSuppliers(suppliersData.sort((a: Supplier, b: Supplier) => a.name.localeCompare(b.name)));
        setExpenseCategories(expenseCategoriesData.sort((a: ExpenseCategory, b: ExpenseCategory) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load necessary data. Please try again later.');
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}expenses/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          supplier: selectedSupplier,
          expense_category: selectedExpenseCategory,
          amount: parseFloat(expenseAmount),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit expense');
      }

      const result = await response.json();
      console.log('Expense submitted:', result);
      setSuccessMessage('Expense added successfully!');
      // Reset form
      setDate('');
      setSelectedSupplier('');
      setSelectedExpenseCategory('');
      setExpenseAmount('');
    } catch (error) {
      console.error('Error submitting expense:', error);
      setError('Failed to submit expense. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen pb-16 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/daysheet/daysheetmain" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mr-4`}>
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Add Expense</h1>
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
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded" role="alert">
            {successMessage}
          </div>
        )}
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
          <div className="mb-6">
            <label htmlFor="supplier" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Supplier Name
            </label>
            <Select<SupplierOption>
              id="supplier"
              options={suppliers.map(supplier => ({ value: supplier.id.toString(), label: supplier.name }))}
              value={suppliers.find(supplier => supplier.id.toString() === selectedSupplier) 
                ? { value: selectedSupplier, label: suppliers.find(supplier => supplier.id.toString() === selectedSupplier)!.name }
                : null}
              onChange={(selected: SingleValue<SupplierOption>) => setSelectedSupplier(selected ? selected.value : '')}
              onInputChange={(inputValue, { action }) => {
                if (action === 'input-change') {
                  // Perform any additional actions with inputValue if needed
                }
              }}
              filterOption={(option, input) => option.label.toLowerCase().includes(input.toLowerCase())}
              placeholder="Search or select a supplier..."
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: isDarkMode ? '#374151' : 'white',
                  borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: isDarkMode ? '#374151' : 'white',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: isDarkMode
                    ? state.isFocused
                      ? '#4B5563'
                      : '#374151'
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
          <div className="mb-6">
            <label htmlFor="expenseCategory" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Expense Category
            </label>
            <select
              id="expenseCategory"
              value={selectedExpenseCategory}
              onChange={(e) => setSelectedExpenseCategory(e.target.value)}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Select Expense Category</option>
              {expenseCategories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="expenseAmount" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Expense Amount
            </label>
            <input
              type="number"
              id="expenseAmount"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              required
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Submitting...' : 'Submit'}
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
  )
}