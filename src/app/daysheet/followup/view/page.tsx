"use client"

import { useState, useEffect, useRef } from "react"
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  X,
  ArrowUp,
  ArrowDown,
  Phone,
  Tag as TagIcon,
  Users,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import React from "react"
import { useDarkMode } from '@/contexts/DarkModeContext'

// Add CSS for hiding scrollbar
const hideScrollbarCSS = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`

interface Tag {
  id: string
  name: string
  color: string
  description: string
}

interface Customer {
  id: number
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

interface VisibilityOptions {
  address: boolean
  balance: boolean
  tag: boolean
  group: boolean
}

interface FilterOptions {
  selectedTags: string[]
  selectedGroups: string[]
}

export default function NewFollowUpPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { isDarkMode} = useDarkMode()
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [sortOption, setSortOption] = useState<SortOption>("nameAsc")
  const [visibilityOptions, setVisibilityOptions] = useState<VisibilityOptions>({
    address: true,
    balance: true,
    tag: true,
    group: true,
  })
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    selectedTags: [],
    selectedGroups: ["1"]
  })
  const filterPanelRef = useRef<HTMLDivElement>(null)

  // Check system preference for dark mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Dark mode is now handled by DarkModeContext
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
        setLoading(true)
        
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
        setError("Failed to load data")
      } finally {
        setLoading(false)
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
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone_number.includes(searchTerm) ||
          (customer.address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
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
  }, [customers, searchTerm, sortOption, filterOptions])

  const toggleFilter = () => {
    setShowFilterPanel(!showFilterPanel)
  }

  const toggleSortOption = (option: SortOption) => {
    setSortOption(option === sortOption ? null : option)
  }

  const toggleVisibilityOption = (option: keyof VisibilityOptions) => {
    setVisibilityOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }))
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
      selectedGroups: ["1"],
    })
    setSortOption("nameAsc")
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div
          className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDarkMode ? "border-indigo-400" : "border-indigo-600"
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
      <style>{hideScrollbarCSS}</style>
      <div className="max-w-7xl mx-auto">
        <div
          className={`rounded-2xl shadow-xl overflow-hidden ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } border border-indigo-200`}
        >
          {/* Header section with stacked circular shapes */}
          <div className="relative h-48">
            {/* Base background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-t-2xl"></div>

            {/* Stacked circular shapes from top-right */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-teal-400 opacity-20 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-emerald-300 opacity-30 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-cyan-200 opacity-40 translate-x-1/4 -translate-y-1/4"></div>

            {/* Content overlay */}
            <div className="relative z-10 h-full px-6 py-8 sm:p-10 flex flex-col justify-center">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <Link
                      href="/reports/reportsmain"
                      className="mr-3 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                    >
                      <ArrowLeft className="h-5 w-5 text-white" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white drop-shadow-md">New Follow Up</h1>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Quick Filters */}
                  <div className="flex gap-2 mr-2">
                    <button
                      onClick={() => setFilterOptions(prev => ({...prev, selectedGroups: []}))}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        filterOptions.selectedGroups.length === 0
                          ? "bg-white text-emerald-600"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      All
                    </button>
                    {["1", "2", "3"].map((group) => (
                      <button
                        key={group}
                        onClick={() => setFilterOptions(prev => ({
                          ...prev,
                          selectedGroups: [group]
                        }))}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          filterOptions.selectedGroups.includes(group)
                            ? "bg-white text-emerald-600"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        Group {group}
                      </button>
                    ))}
                  </div>

                  {/* Quick Tag Filters */}
                  <div className="flex gap-2 mr-2 overflow-x-auto max-w-[300px] hide-scrollbar">
                    <button
                      onClick={() => setFilterOptions(prev => ({...prev, selectedTags: []}))}
                      className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                        filterOptions.selectedTags.length === 0
                          ? "bg-white text-emerald-600"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      All Tags
                    </button>
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTagFilter(tag.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                          filterOptions.selectedTags.includes(tag.id)
                            ? "bg-white"
                            : "bg-white/10 hover:bg-white/20"
                        }`}
                        style={{
                          color: filterOptions.selectedTags.includes(tag.id) ? tag.color : 'white',
                        }}
                      >
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </button>
                    ))}
                  </div>

                  {/* Desktop Search Field - Hidden on Mobile */}
                  <div className="hidden sm:flex relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 w-60"
                    />
                  </div>

                  {/* Mobile Search Icon - Only visible on mobile */}
                  <div className="sm:hidden">
                    <button
                      onClick={() => setShowMobileSearch(!showMobileSearch)}
                      className={`p-2 rounded-lg transition-colors duration-200 shadow-md mobile-search-toggle
                        ${isDarkMode
                          ? "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                          : "bg-white/90 hover:bg-white text-gray-700 backdrop-blur-sm"
                        } ${showMobileSearch ? "ring-2 ring-white/50" : ""}`}
                    >
                      <Search size={16} />
                    </button>
                  </div>

                  {/* Filter Button */}
                  <div className="relative">
                    <button
                      onClick={toggleFilter}
                      className={`p-2 rounded-lg transition-colors duration-200 flex items-center gap-1.5 shadow-md
                        ${isDarkMode
                          ? "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                          : "bg-white/90 hover:bg-white text-gray-700 backdrop-blur-sm"
                        } ${showFilterPanel ? "ring-2 ring-white/50" : ""}`}
                      aria-label="Filter and sort"
                    >
                      <SlidersHorizontal size={16} />
                      <span className="hidden sm:inline text-sm">Filter</span>
                      {(filterOptions.selectedTags.length > 0) && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {filterOptions.selectedTags.length}
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
                <div className="relative bg-teal-600/95 backdrop-blur-sm p-3 rounded-b-xl shadow-lg border-t border-teal-500">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-white/70" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-teal-200"></div>
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
                {(filterOptions.selectedTags.length > 0) && (
                  <span className="ml-2">
                    (filtered by {filterOptions.selectedTags.length} criteria)
                  </span>
                )}
              </p>
              
              {(filterOptions.selectedTags.length > 0) && (
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

            {/* Customers Grid */}
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
                        : "bg-emerald-50/80 border border-emerald-200/50"
                    }`}
                  >
                    <div className="relative p-4 flex flex-col z-10">
                      {/* First Line: Name & Call Button */}
                      <div className="flex justify-between items-center mb-2">
                        <h3 className={`text-base font-bold truncate flex-1 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                          {customer.name}
                        </h3>
                        <a
                          href={`tel:${customer.phone_number}`}
                          className="ml-2 px-3 py-1 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 transition-all duration-200 shadow-sm flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          Call
                        </a>
                      </div>

                      {/* Second Line: Group & Tag */}
                      <div className="flex items-center justify-between">
                        {visibilityOptions.group && customer.group_display && (
                          <div className="flex items-center">
                            <Users className={`h-3 w-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                            <span className={`ml-1 text-xs ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                              {customer.group_display}
                            </span>
                          </div>
                        )}

                        {visibilityOptions.tag && customer.tags_detail && (
                          <div 
                            className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                            style={{ 
                              backgroundColor: `${customer.tags_detail.color}20`,
                              color: customer.tags_detail.color,
                              border: `1px solid ${customer.tags_detail.color}40`
                            }}
                          >
                            <TagIcon className="w-3 h-3" />
                            <span className="truncate max-w-20">{customer.tags_detail.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className={`col-span-full text-center py-12 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <Users className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No customers found</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm || filterOptions.selectedTags.length > 0
                      ? "Try adjusting your search or filters"
                      : "No customers available"
                    }
                  </p>
                </div>
              )}
            </div>
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
              border border-emerald-200/50
              ring-1 ring-emerald-300/30
              overflow-hidden
            `}
          >
            {/* Gradient Header Section */}
            <div className="relative h-14">
              {/* Teal Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600"></div>

              {/* Decorative Circle */}
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-teal-300 opacity-20 translate-x-1/3 -translate-y-1/2"></div>

              {/* Header Content */}
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
                  className={`text-sm uppercase font-medium mb-4 ${isDarkMode ? "text-emerald-300" : "text-emerald-600"}`}
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
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-500 text-white"
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
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-500 text-white"
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
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-500 text-white"
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
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-500 text-white"
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
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-500 text-white"
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
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-500 text-white"
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
                  className={`text-sm uppercase font-medium mb-4 ${isDarkMode ? "text-emerald-300" : "text-emerald-600"}`}
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
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-500 text-white"
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
                  className={`text-sm uppercase font-medium mb-4 ${isDarkMode ? "text-emerald-300" : "text-emerald-600"}`}
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
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-500 text-white"
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

              {/* Show/Hide Section Card */}
              <div
                className={`rounded-lg p-4 ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"} border ${isDarkMode ? "border-gray-600/50" : "border-gray-200/70"}`}
              >
                <h4
                  className={`text-sm uppercase font-medium mb-4 ${isDarkMode ? "text-emerald-300" : "text-emerald-600"}`}
                >
                  Show/Hide
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tag</span>
                    <button
                      onClick={() => toggleVisibilityOption("tag")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        visibilityOptions.tag
                          ? isDarkMode
                            ? "bg-emerald-600"
                            : "bg-emerald-500"
                          : isDarkMode
                            ? "bg-gray-600"
                            : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          visibilityOptions.tag ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Group</span>
                    <button
                      onClick={() => toggleVisibilityOption("group")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        visibilityOptions.group
                          ? isDarkMode
                            ? "bg-emerald-600"
                            : "bg-emerald-500"
                          : isDarkMode
                            ? "bg-gray-600"
                            : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          visibilityOptions.group ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}