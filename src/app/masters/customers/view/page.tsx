"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Search, 
  LayoutGrid, 
  List, 
  Edit, 
  ArrowLeft,
  SlidersHorizontal,
  X,
  ArrowUp,
  ArrowDown,
  Tag ,
  Users
} from "lucide-react"
import { motion } from "framer-motion"

interface Tag {
  id: string
  name: string
  color: string
  description: string
}

interface Customer {
  id: string
  name: string
  address: string
  phone_number: string
  opening_balance: string
  tags: string | null
  tags_detail: Tag | null
  group: string | null
  group_display: string | null
}

type SortOption = "nameAsc" | "nameDesc" | "balanceHigh" | "balanceLow" | "groupAsc" | "groupDesc" | null

interface FilterOptions {
  selectedTags: string[]
  selectedGroups: string[]
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCardView, setIsCardView] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [sortOption, setSortOption] = useState<SortOption>("nameAsc")
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    selectedTags: [],
    selectedGroups: [],
  })
  const filterPanelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Check system preference for dark mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(prefersDark)

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
      mediaQuery.addEventListener("change", handleChange)

      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  // Handle clicks outside panels
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setShowFilterPanel(false)
      }
      if (
        showMobileSearch &&
        !(event.target as Element).closest(".mobile-search-container") &&
        !(event.target as Element).closest(".mobile-search-toggle")
      ) {
        setShowMobileSearch(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMobileSearch])

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch customers and tags in parallel
        const [customersResponse, tagsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}customers/list/`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tags/list/`)
        ])

        if (!customersResponse.ok) throw new Error("Failed to fetch customers")
        if (!tagsResponse.ok) throw new Error("Failed to fetch tags")

        const customersData = await customersResponse.json()
        const tagsData = await tagsResponse.json()

        setCustomers(customersData)
        setTags(tagsData)
        setFilteredCustomers(customersData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load customers")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Apply filtering and sorting
  useEffect(() => {
    if (!Array.isArray(customers) || customers.length === 0) {
      setFilteredCustomers([])
      return
    }

    let filtered = [...customers]

    // Apply search filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone_number.includes(searchQuery) ||
          (customer.address?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      )
    }

    // Apply tag filter
    if (filterOptions.selectedTags.length > 0) {
      filtered = filtered.filter(customer => 
        customer.tags && filterOptions.selectedTags.includes(customer.tags)
      )
    }

    // Apply group filter
    if (filterOptions.selectedGroups.length > 0) {
      filtered = filtered.filter(customer => 
        customer.group && filterOptions.selectedGroups.includes(customer.group)
      )
    }

    // Apply sorting
    if (sortOption === "nameAsc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortOption === "nameDesc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name))
    } else if (sortOption === "balanceHigh") {
      filtered.sort((a, b) => parseFloat(b.opening_balance) - parseFloat(a.opening_balance))
    } else if (sortOption === "balanceLow") {
      filtered.sort((a, b) => parseFloat(a.opening_balance) - parseFloat(b.opening_balance))
    } else if (sortOption === "groupAsc") {
      filtered.sort((a, b) => (a.group || "").localeCompare(b.group || ""))
    } else if (sortOption === "groupDesc") {
      filtered.sort((a, b) => (b.group || "").localeCompare(a.group || ""))
    }

    setFilteredCustomers(filtered)
  }, [customers, searchQuery, sortOption, filterOptions])

  const toggleFilter = () => {
    setShowFilterPanel(!showFilterPanel)
  }

  const toggleSortOption = (option: SortOption) => {
    setSortOption(option === sortOption ? null : option)
  }

  const toggleTagFilter = (tagId: string) => {
    setFilterOptions(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId]
    }))
  }

  const toggleGroupFilter = (group: string) => {
    setFilterOptions(prev => ({
      ...prev,
      selectedGroups: prev.selectedGroups.includes(group)
        ? prev.selectedGroups.filter(g => g !== group)
        : [...prev.selectedGroups, group]
    }))
  }

  const clearAllFilters = () => {
    setFilterOptions({
      selectedTags: [],
      selectedGroups: [],
    })
    setSortOption("nameAsc")
  }

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance)
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const handleQuickTagChange = async (customerId: string, tagId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}customers/${customerId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tags: tagId || null }),
      })

      if (response.ok) {
        // Refresh customers data
        const customersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}customers/list/`)
        if (customersResponse.ok) {
          const customersData = await customersResponse.json()
          setCustomers(customersData)
        }
      }
    } catch (error) {
      console.error("Error updating tag:", error)
    }
  }

  const handleQuickGroupChange = async (customerId: string, group: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}customers/${customerId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ group: group || null }),
      })

      if (response.ok) {
        // Refresh customers data
        const customersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}customers/list/`)
        if (customersResponse.ok) {
          const customersData = await customersResponse.json()
          setCustomers(customersData)
        }
      }
    } catch (error) {
      console.error("Error updating group:", error)
    }
  }

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div
          className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDarkMode ? "border-blue-400" : "border-blue-600"
          }`}
        ></div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div
          className={`rounded-2xl shadow-xl overflow-hidden ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } border border-blue-200`}
        >
          {/* Header section with stacked circular shapes - Blue theme */}
          <div className="relative h-32">
            {/* Base background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl"></div>

            {/* Stacked circular shapes from top-right */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-indigo-400 opacity-20 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-blue-300 opacity-30 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-cyan-200 opacity-40 translate-x-1/4 -translate-y-1/4"></div>

            {/* Content overlay */}
            <div className="relative z-10 h-full px-6 py-4 sm:p-6 flex flex-col justify-center">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <div className="flex items-center mb-1">
                    <Link
                      href="/masters/mastermain"
                      className="mr-3 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                    >
                      <ArrowLeft className="h-5 w-5 text-white" />
                    </Link>
                    <h1 className="text-2xl font-bold text-white drop-shadow-md">View Customers</h1>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Desktop Search Field - Hidden on Mobile */}
                  <div className="hidden sm:flex relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 w-60"
                    />
                  </div>

                  {/* Mobile Search Icon - Only visible on mobile */}
                  <div className="sm:hidden">
                    <button
                      onClick={() => setShowMobileSearch(!showMobileSearch)}
                      className={`p-2 rounded-lg transition-colors duration-200 shadow-md mobile-search-toggle
                        ${
                          isDarkMode
                            ? "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                            : "bg-white/90 hover:bg-white text-gray-700 backdrop-blur-sm"
                        } ${showMobileSearch ? "ring-2 ring-white/50" : ""}`}
                    >
                      <Search size={16} />
                    </button>
                  </div>

                  {/* View Toggle Buttons */}
                  <div className="flex rounded-lg overflow-hidden shadow-md">
                    <button
                      onClick={() => setIsCardView(true)}
                      className={`p-2 transition-colors duration-200 ${
                        isCardView
                          ? "bg-white/20 text-white backdrop-blur-sm"
                          : "bg-white/10 hover:bg-white/15 text-white/70 backdrop-blur-sm"
                      }`}
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      onClick={() => setIsCardView(false)}
                      className={`p-2 transition-colors duration-200 ${
                        !isCardView
                          ? "bg-white/20 text-white backdrop-blur-sm"
                          : "bg-white/10 hover:bg-white/15 text-white/70 backdrop-blur-sm"
                      }`}
                    >
                      <List size={16} />
                    </button>
                  </div>

                  {/* Filter Button */}
                  <div className="relative">
                    <button
                      onClick={toggleFilter}
                      className={`p-2 rounded-lg transition-colors duration-200 flex items-center gap-1.5 shadow-md
                        ${
                          isDarkMode
                            ? "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                            : "bg-white/90 hover:bg-white text-gray-700 backdrop-blur-sm"
                        } ${showFilterPanel ? "ring-2 ring-white/50" : ""}`}
                      aria-label="Filter and sort"
                    >
                      <SlidersHorizontal size={16} />
                      <span className="hidden sm:inline text-sm">Filter</span>
                      {(filterOptions.selectedTags.length > 0 || filterOptions.selectedGroups.length > 0) && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {filterOptions.selectedTags.length + filterOptions.selectedGroups.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Search Input Field - Expandable */}
            {showMobileSearch && (
              <div className="absolute bottom-0 left-0 right-0 transform translate-y-full z-20 mobile-search-container">
                <div className="relative bg-blue-600/95 backdrop-blur-sm p-3 rounded-b-xl shadow-lg border-t border-blue-500">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-white/70" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                      autoFocus
                    />
                    <button
                      onClick={() => setShowMobileSearch(false)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Minimal connecting line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-blue-200"></div>
          </div>

          {/* Content Area */}
          <div className="px-6 pb-8 sm:px-10 sm:pb-10 pt-6">
            {error && (
              <div className={`mb-6 p-4 rounded-xl text-red-500 text-sm ${isDarkMode ? "bg-red-900/20" : "bg-red-50"}`}>
                {error}
              </div>
            )}

            {/* Results Summary */}
            <div className="mb-4 flex items-center justify-between">
              <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
                {(filterOptions.selectedTags.length > 0 || filterOptions.selectedGroups.length > 0) && (
                  <span className="ml-2">
                    (filtered by {filterOptions.selectedTags.length + filterOptions.selectedGroups.length} criteria)
                  </span>
                )}
              </p>
              
              {(filterOptions.selectedTags.length > 0 || filterOptions.selectedGroups.length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Customers Grid/Table */}
            {isCardView ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <motion.div
                      key={customer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`relative rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-102 shadow-md ${
                        isDarkMode 
                          ? "bg-gray-800 border border-gray-700 bg-opacity-95" 
                          : "bg-blue-50/80 border border-blue-200/50"
                      }`}
                    >
                      <div className="relative p-3 flex flex-col z-10">
                        {/* Customer Name & Edit Button Row */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-base font-bold truncate ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                              {customer.name}
                            </h3>
                          </div>
                          <button
                            onClick={() => router.push(`/masters/customers/edit/${customer.id}`)}
                            className={`ml-2 px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-400 hover:to-indigo-400 transition-all duration-200 shadow-sm`}
                          >
                            <Edit className="w-3 h-3 inline mr-1" />
                            Edit
                          </button>
                        </div>

                        {/* Address, Phone, Balance in one compact line */}
                        <div className={`text-xs mb-2 space-y-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                          {customer.address && (
                            <div className="truncate">📍 {customer.address}</div>
                          )}
                          <div className="flex justify-between items-center">
                            <span>📞 {customer.phone_number}</span>
                            <span className={`font-semibold ${
                              parseFloat(customer.opening_balance) >= 0 
                                ? "text-green-600 dark:text-green-400" 
                                : "text-red-600 dark:text-red-400"
                            }`}>
                              {formatBalance(customer.opening_balance)}
                            </span>
                          </div>
                        </div>

                        {/* Tag and Group Quick Edit in same line */}
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={customer.tags || ""}
                            onChange={(e) => handleQuickTagChange(customer.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded border ${
                              isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                            }`}
                          >
                            <option value="">No Tag</option>
                            {tags.map((tag) => (
                              <option key={tag.id} value={tag.id}>
                                {tag.name}
                              </option>
                            ))}
                          </select>

                          <select
                            value={customer.group || ""}
                            onChange={(e) => handleQuickGroupChange(customer.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded border ${
                              isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                            }`}
                          >
                            <option value="">No Group</option>
                            <option value="1">Group 1</option>
                            <option value="2">Group 2</option>
                            <option value="3">Group 3</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className={`col-span-full text-center py-12 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    <Users className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No customers found</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {searchQuery || filterOptions.selectedTags.length > 0 || filterOptions.selectedGroups.length > 0
                        ? "Try adjusting your search or filters"
                        : "No customers available"
                      }
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Table View
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                  <thead className={isDarkMode ? "bg-gray-700" : "bg-gray-50"}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                        Name
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                        Address
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                        Phone
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                        Balance
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                        Tag
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                        Group
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className={isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                          {customer.name}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                          {customer.address}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                          {customer.phone_number}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                          {formatBalance(customer.opening_balance)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap`}>
                          <select
                            value={customer.tags || ""}
                            onChange={(e) => handleQuickTagChange(customer.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded border ${
                              isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                            }`}
                          >
                            <option value="">No Tag</option>
                            {tags.map((tag) => (
                              <option key={tag.id} value={tag.id}>
                                {tag.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap`}>
                          <select
                            value={customer.group || ""}
                            onChange={(e) => handleQuickGroupChange(customer.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded border ${
                              isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                            }`}
                          >
                            <option value="">No Group</option>
                            <option value="1">Group 1</option>
                            <option value="2">Group 2</option>
                            <option value="3">Group 3</option>
                          </select>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium`}>
                          <button
                            onClick={() => router.push(`/masters/customers/edit/${customer.id}`)}
                            className={`px-3 py-1 rounded-md bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-400 hover:to-indigo-400 transition-all duration-200`}
                          >
                            <Edit size={16} className="inline-block mr-1" />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setShowFilterPanel(false)}
          ></div>

          <div
            ref={filterPanelRef}
            className={`
              fixed 
              top-1/2 left-1/2 
              -translate-x-1/2 -translate-y-1/2
              w-[90vw] max-w-md
              max-h-[80vh] 
              overflow-y-auto
              rounded-xl shadow-2xl z-50
              ${isDarkMode ? "bg-gray-800" : "bg-white"}
              border border-blue-200/50
              ring-1 ring-blue-300/30
              overflow-hidden
            `}
          >
            {/* Blue Gradient Header Section */}
            <div className="relative h-14">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-indigo-300 opacity-20 translate-x-1/3 -translate-y-1/2"></div>
              <div className="relative h-full px-5 flex items-center justify-between z-10">
                <h3 className="font-medium text-lg text-white">Filter & Sort</h3>
                <button
                  onClick={() => setShowFilterPanel(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-5 space-y-6">
              {/* Sort Section Card */}
              <div
                className={`rounded-lg p-4 ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"} border ${isDarkMode ? "border-gray-600/50" : "border-gray-200/70"}`}
              >
                <h4
                  className={`text-sm uppercase font-medium mb-4 ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}
                >
                  Sort By
                </h4>

                {/* Name Sort */}
                <div className="mb-4">
                  <div className="flex text-sm rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSortOption("nameAsc")}
                      className={`flex-1 py-2 px-3 text-center transition-colors ${
                        sortOption === "nameAsc"
                          ? isDarkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : isDarkMode
                            ? "bg-gray-600 text-gray-300 hover:bg-gray-500/70"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300/70"
                      }`}
                    >
                      Name (A-Z) {sortOption === "nameAsc" && <ArrowUp size={14} className="inline ml-1" />}
                    </button>

                    <button
                      onClick={() => toggleSortOption("nameDesc")}
                      className={`flex-1 py-2 px-3 text-center transition-colors ${
                        sortOption === "nameDesc"
                          ? isDarkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : isDarkMode
                            ? "bg-gray-600 text-gray-300 hover:bg-gray-500/70"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300/70"
                      }`}
                    >
                      Name (Z-A) {sortOption === "nameDesc" && <ArrowDown size={14} className="inline ml-1" />}
                    </button>
                  </div>
                </div>

                {/* Balance Sort */}
                <div className="mb-4">
                  <div className="flex text-sm rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSortOption("balanceHigh")}
                      className={`flex-1 py-2 px-3 text-center transition-colors ${
                        sortOption === "balanceHigh"
                          ? isDarkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : isDarkMode
                            ? "bg-gray-600 text-gray-300 hover:bg-gray-500/70"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300/70"
                      }`}
                    >
                      Balance (High) {sortOption === "balanceHigh" && <ArrowDown size={14} className="inline ml-1" />}
                    </button>

                    <button
                      onClick={() => toggleSortOption("balanceLow")}
                      className={`flex-1 py-2 px-3 text-center transition-colors ${
                        sortOption === "balanceLow"
                          ? isDarkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : isDarkMode
                            ? "bg-gray-600 text-gray-300 hover:bg-gray-500/70"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300/70"
                      }`}
                    >
                      Balance (Low) {sortOption === "balanceLow" && <ArrowUp size={14} className="inline ml-1" />}
                    </button>
                  </div>
                </div>

                {/* Group Sort */}
                <div>
                  <div className="flex text-sm rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSortOption("groupAsc")}
                      className={`flex-1 py-2 px-3 text-center transition-colors ${
                        sortOption === "groupAsc"
                          ? isDarkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : isDarkMode
                            ? "bg-gray-600 text-gray-300 hover:bg-gray-500/70"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300/70"
                      }`}
                    >
                      Group (1-3) {sortOption === "groupAsc" && <ArrowUp size={14} className="inline ml-1" />}
                    </button>

                    <button
                      onClick={() => toggleSortOption("groupDesc")}
                      className={`flex-1 py-2 px-3 text-center transition-colors ${
                        sortOption === "groupDesc"
                          ? isDarkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : isDarkMode
                            ? "bg-gray-600 text-gray-300 hover:bg-gray-500/70"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300/70"
                      }`}
                    >
                      Group (3-1) {sortOption === "groupDesc" && <ArrowDown size={14} className="inline ml-1" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Filter by Tags */}
              <div
                className={`rounded-lg p-4 ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"} border ${isDarkMode ? "border-gray-600/50" : "border-gray-200/70"}`}
              >
                <h4
                  className={`text-sm uppercase font-medium mb-4 ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}
                >
                  Filter by Tags
                </h4>

                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTagFilter(tag.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                        filterOptions.selectedTags.includes(tag.id)
                          ? isDarkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : isDarkMode
                            ? "bg-gray-600 hover:bg-gray-500 text-gray-300"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        ></div>
                        <span>{tag.name}</span>
                      </div>
                      {filterOptions.selectedTags.includes(tag.id) && (
                        <span className="text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter by Groups */}
              <div
                className={`rounded-lg p-4 ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"} border ${isDarkMode ? "border-gray-600/50" : "border-gray-200/70"}`}
              >
                <h4
                  className={`text-sm uppercase font-medium mb-4 ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}
                >
                  Filter by Groups
                </h4>

                <div className="flex gap-2">
                  {["1", "2", "3"].map((group) => (
                    <button
                      key={group}
                      onClick={() => toggleGroupFilter(group)}
                      className={`flex-1 py-2 px-3 text-center text-sm transition-colors rounded-lg ${
                        filterOptions.selectedGroups.includes(group)
                          ? isDarkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : isDarkMode
                            ? "bg-gray-600 hover:bg-gray-500 text-gray-300"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      Group {group}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}


    </div>
  )
}