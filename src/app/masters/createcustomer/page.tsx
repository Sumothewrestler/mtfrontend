"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateCustomer() {
  const [formData, setFormData] = useState({
    name: "",               // Updated to match Django model
    address: "",
    phone_number: "",
    opening_balance: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    setSuccessMessage("");
    setErrorMessage(""); // Reset the error message
  
    try {
      const response = await fetch("http://localhost:8000/api/customers/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        setSuccessMessage("Customer created successfully!");
        setFormData({ 
          name: "",                // Updated to match Django model
          address: "",
          phone_number: "",
          opening_balance: "",
        });
      } else {
        const errorData = await response.json();
        // Check for 'errors' key in the errorData and handle accordingly
        if (errorData.errors) {
          // Join all error messages into a single string
          const errors = Object.values(errorData.errors)
            .flat()
            .join(", ");
          setErrorMessage(`Error: ${errors}`);
        } else {
          setErrorMessage("Failed to create customer.");
        }
        console.error("Error:", errorData); // Log the error response data
      }
    } catch (error) {
      console.error("Error:", error); // Log the error object to the console
      setErrorMessage("An unexpected error occurred. Please try again later."); // General error message
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 flex items-center">
          <Link href="/masters/mastermain" className="text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Customer</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-12">
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-8">
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
              Customer Name
            </label>
            <input
              type="text"
              id="name"
              name="name" // Match with formData and Django model
              value={formData.name} // Match with formData
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="address" className="block text-sm font-medium text-black mb-2">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            ></textarea>
          </div>
          <div className="mb-6">
            <label htmlFor="phone_number" className="block text-sm font-medium text-black mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="opening_balance" className="block text-sm font-medium text-black mb-2">
              Opening Balance
            </label>
            <input
              type="number"
              id="opening_balance"
              name="opening_balance"
              value={formData.opening_balance}
              onChange={handleChange}
              required
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit
          </button>
        </form>
      </main>
    </div>
  );
}
