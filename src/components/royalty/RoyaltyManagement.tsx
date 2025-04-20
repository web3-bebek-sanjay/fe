"use client"

import type React from "react"
import { useState } from "react"
import { RoyaltyDashboard } from "./RoyaltyDashboard"
import { RoyaltyChart } from "./RoyaltyChart"
import { IPBreakdown } from "./IPBreakdown"
import { CalendarIcon, FilterIcon } from "lucide-react"
import { useWallet } from "@/context/WalletContext"

export const RoyaltyManagement: React.FC = () => {
  const { connected } = useWallet()
  const [dateRange, setDateRange] = useState("month")
  const [filterOpen, setFilterOpen] = useState(false)

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Royalty Management</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Connect your wallet to view and manage your royalty earnings from your IP assets.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              You need to connect your wallet to access this feature.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Royalty Management</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setDateRange("week")}
              className={`px-3 py-1.5 text-sm font-medium ${dateRange === "week" ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800"}`}
            >
              Week
            </button>
            <button
              onClick={() => setDateRange("month")}
              className={`px-3 py-1.5 text-sm font-medium ${dateRange === "month" ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800"}`}
            >
              Month
            </button>
            <button
              onClick={() => setDateRange("year")}
              className={`px-3 py-1.5 text-sm font-medium ${dateRange === "year" ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800"}`}
            >
              Year
            </button>
          </div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`p-2 rounded-lg border ${filterOpen ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"}`}
          >
            <FilterIcon size={18} />
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
            <CalendarIcon size={16} />
            <span>Custom</span>
          </button>
        </div>
      </div>
      {filterOpen && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">IP Category</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">
                <option value="">All Categories</option>
                <option value="art">Art</option>
                <option value="music">Music</option>
                <option value="photography">Photography</option>
                <option value="software">Software</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">License Type</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">
                <option value="">All Types</option>
                <option value="buy">Purchase</option>
                <option value="rent">Rental</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Earnings Range</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">
                <option value="">All Earnings</option>
                <option value="0-0.1">0 - 0.1 ETH</option>
                <option value="0.1-0.5">0.1 - 0.5 ETH</option>
                <option value="0.5+">0.5+ ETH</option>
              </select>
            </div>
          </div>
        </div>
      )}
      <RoyaltyDashboard dateRange={dateRange} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3">
              <h3 className="font-medium">Earnings Overview</h3>
            </div>
            <div className="p-4">
              <RoyaltyChart dateRange={dateRange} />
            </div>
          </div>
        </div>
        <div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-between items-center">
              <h3 className="font-medium">Top Earning IPs</h3>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</button>
            </div>
            <div className="p-4">
              <IPBreakdown dateRange={dateRange} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
