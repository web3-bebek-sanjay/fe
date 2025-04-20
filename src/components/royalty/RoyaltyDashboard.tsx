"use client"

import type React from "react"
import { motion } from "framer-motion"
import { TrendingUpIcon, ClockIcon, ArrowRightIcon } from "lucide-react"

interface RoyaltyDashboardProps {
  dateRange: string
}

export const RoyaltyDashboard: React.FC<RoyaltyDashboardProps> = ({ dateRange }) => {
  // Mock data based on date range
  const data = {
    week: {
      total: 0.38,
      currentPeriod: 0.12,
      pending: 0.05,
      percentChange: 8.3,
    },
    month: {
      total: 1.45,
      currentPeriod: 0.43,
      pending: 0.12,
      percentChange: 12.7,
    },
    year: {
      total: 8.76,
      currentPeriod: 1.85,
      pending: 0.32,
      percentChange: 24.5,
    },
  }

  const currentData = data[dateRange as keyof typeof data]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.3,
        }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Earnings</h3>
            <div className="flex items-baseline mt-1">
              <span className="text-2xl font-bold">{currentData.total}</span>
              <span className="text-sm ml-1">ETH</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <TrendingUpIcon size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="flex items-center mt-4">
          <div
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${currentData.percentChange >= 0 ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"}`}
          >
            {currentData.percentChange >= 0 ? "+" : ""}
            {currentData.percentChange}%
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">vs. previous {dateRange}</span>
        </div>
      </motion.div>
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.3,
          delay: 0.1,
        }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {dateRange === "week" ? "This Week" : dateRange === "month" ? "This Month" : "This Year"}
            </h3>
            <div className="flex items-baseline mt-1">
              <span className="text-2xl font-bold">{currentData.currentPeriod}</span>
              <span className="text-sm ml-1">ETH</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <ClockIcon size={20} className="text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full"
              style={{
                width: `${(currentData.currentPeriod / (currentData.total * 0.4)) * 100}%`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>0 ETH</span>
            <span>{(currentData.total * 0.4).toFixed(2)} ETH</span>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.3,
          delay: 0.2,
        }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Royalties</h3>
            <div className="flex items-baseline mt-1">
              <span className="text-2xl font-bold">{currentData.pending}</span>
              <span className="text-sm ml-1">ETH</span>
            </div>
          </div>
          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium flex items-center"
          >
            Withdraw
            <ArrowRightIcon size={16} className="ml-1" />
          </motion.button>
        </div>
        <div className="flex items-center mt-4 text-xs text-slate-500 dark:text-slate-400">
          <span>Available for withdrawal</span>
          <div className="w-2 h-2 rounded-full bg-green-500 ml-2" />
        </div>
      </motion.div>
    </div>
  )
}
