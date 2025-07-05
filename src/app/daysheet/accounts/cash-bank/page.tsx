// app/bank-transfers/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Sun, ArrowLeft, ArrowRightLeft, Wallet, Calendar, AlertCircle, CheckCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import Link from 'next/link';

interface CashBankAccount {
  id: number;
  name: string;
  account_type: string;
  current_balance: number;
}

interface BankTransfer {
  date: string;
  from_account: number;
  to_account: number;
  amount: number;
  transfer_type: 'bank_to_bank' | 'cash_deposit' | 'withdrawal';
  description?: string;
}

interface ValidationError {
  errors: {
    [key: string]: string[];
  };
  error?: string;
}

export default function BankTransferPage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  // API Base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  const [accounts, setAccounts] = useState<CashBankAccount[]>([]);
  const [selectedType, setSelectedType] = useState<BankTransfer['transfer_type']>('bank_to_bank');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const [formData, setFormData] = useState<BankTransfer>({
    date: new Date().toISOString().split('T')[0],
    from_account: 0,
    to_account: 0,
    amount: 0,
    transfer_type: 'bank_to_bank',
    description: '',
  });

  // Fetch accounts on component mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}cash-bank-accounts/`);
        if (response.ok) {
          const data = await response.json();
          setAccounts(data);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };
    
    fetchAccounts();
  }, [API_BASE_URL]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Send the data directly without wrapping
      const payload = {
        date: formData.date,
        amount: formData.amount,
        transfer_type: formData.transfer_type,
        from_account: formData.from_account,
        to_account: formData.to_account,
        description: formData.description || null
      };

      const response = await fetch(`${API_BASE_URL}bank-transfers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ValidationError;
        if (errorData.errors) {
          // Handle validation errors
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
          throw new Error(errorMessages);
        }
        throw new Error(errorData.error || 'Failed to create transfer');
      }
      
      // Reset form and show success message
      setFormData({
        date: new Date().toISOString().split('T')[0],
        from_account: 0,
        to_account: 0,
        amount: 0,
        transfer_type: 'bank_to_bank',
        description: '',
      });
      
      showMessage('success', 'Transfer created successfully!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        showMessage('error', error.message || 'An error occurred while creating the transfer');
      } else {
        showMessage('error', 'An unexpected error occurred while creating the transfer');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-purple-900'}`}>
              Bank Transfers
            </h1>
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

      {/* Main Content */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
            {message.text}
          </div>
        )}

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4`}>
          {/* Transfer Type Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'bank_to_bank', label: 'Bank', icon: <ArrowRightLeft size={16} /> },
              { id: 'cash_deposit', label: 'Deposit', icon: <ArrowDownCircle size={16} /> },
              { id: 'withdrawal', label: 'Withdrawal', icon: <ArrowUpCircle size={16} /> },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedType(type.id as BankTransfer['transfer_type']);
                  setFormData(prev => ({ ...prev, transfer_type: type.id as BankTransfer['transfer_type'] }));
                }}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  selectedType === type.id
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type.icon}
                <span className="ml-2">{type.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <Calendar size={16} className="mr-1" />
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className={`w-full p-3 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                required
              />
            </div>

            {/* From Account */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <Wallet size={16} className="mr-1" />
                From Account *
              </label>
              <select
                value={formData.from_account}
                onChange={(e) => setFormData(prev => ({ ...prev, from_account: Number(e.target.value) }))}
                className={`w-full p-3 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                required
              >
                <option value="">Select account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} - Balance: ₹{account.current_balance}
                  </option>
                ))}
              </select>
            </div>

            {/* To Account */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <Wallet size={16} className="mr-1" />
                To Account *
              </label>
              <select
                value={formData.to_account}
                onChange={(e) => setFormData(prev => ({ ...prev, to_account: Number(e.target.value) }))}
                className={`w-full p-3 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                required
              >
                <option value="">Select account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} - Balance: ₹{account.current_balance}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium mb-2">Amount * (₹)</label>
              <input
                type="number"
                value={formData.amount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                className={`w-full p-3 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={`w-full p-3 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isLoading ? (
                  'Processing...'
                ) : (
                  <>
                    <ArrowRightLeft size={18} className="mr-2" />
                    Submit Transfer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}