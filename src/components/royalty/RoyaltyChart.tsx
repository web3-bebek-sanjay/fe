"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface RoyaltyChartProps {
  dateRange: string
}

export const RoyaltyChart: React.FC<RoyaltyChartProps> = ({ dateRange }) => {
  const [chartData, setChartData] = useState<
    {
      name: string
      value: number
    }[]
  >([])

  // Generate mock data based on date range
  useEffect(() => {
    const generateMockData = () => {
      let labels: string[] = []
      let dataPoints: number[] = []

      if (dateRange === "week") {
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        dataPoints = [0.02, 0.015, 0.03, 0.01, 0.025, 0.035, 0.02]
      } else if (dateRange === "month") {
        labels = ["Week 1", "Week 2", "Week 3", "Week 4"]
        dataPoints = [0.1, 0.08, 0.12, 0.13]
      } else {
        labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        dataPoints = [0.15, 0.12, 0.18, 0.2, 0.22, 0.19, 0.17, 0.25, 0.23, 0.21, 0.24, 0.28]
      }

      return labels.map((label, index) => ({
        name: label,
        value: dataPoints[index],
      }))
    }

    setChartData(generateMockData())
  }, [dateRange])

  // Find the maximum value for scaling
  const maxValue = Math.max(...chartData.map((item) => item.value)) * 1.2

  return (
    <div className="h-64">
      <div className="flex h-full">
        <div className="flex flex-col justify-between pr-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{maxValue.toFixed(2)}</span>
          <span>{(maxValue * 0.75).toFixed(2)}</span>
          <span>{(maxValue * 0.5).toFixed(2)}</span>
          <span>{(maxValue * 0.25).toFixed(2)}</span>
          <span>0.00</span>
        </div>
        <div className="flex-1">
          <div className="relative h-full flex items-end">
            {/* Horizontal grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-slate-100 dark:border-slate-700 w-full h-0" />
              <div className="border-t border-slate-100 dark:border-slate-700 w-full h-0" />
              <div className="border-t border-slate-100 dark:border-slate-700 w-full h-0" />
              <div className="border-t border-slate-100 dark:border-slate-700 w-full h-0" />
              <div className="border-t border-slate-100 dark:border-slate-700 w-full h-0" />
            </div>
            {/* Bars */}
            <div className="flex w-full h-full items-end">
              {chartData.map((item, index) => (
                <div key={item.name} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{
                      height: 0,
                    }}
                    animate={{
                      height: `${(item.value / maxValue) * 100}%`,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.05,
                    }}
                    className="w-2/3 bg-blue-600 dark:bg-blue-500 rounded-t-sm"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
