"use client"

import type React from "react"
import { CalendarIcon, CheckCircleIcon, ClockIcon } from "lucide-react"

// Mock license history data
const mockLicenseHistory = [
  {
    id: "1",
    ipTitle: "Digital Artwork Collection",
    ipId: "1",
    licenseType: "rent",
    startDate: "2023-11-15",
    endDate: "2023-12-15",
    price: 0.015,
    status: "active",
  },
  {
    id: "2",
    ipTitle: "Music Production Sample Pack",
    ipId: "2",
    licenseType: "buy",
    startDate: "2023-10-22",
    endDate: null,
    price: 0.03,
    status: "active",
  },
  {
    id: "3",
    ipTitle: "Photography Collection: Urban Landscapes",
    ipId: "4",
    licenseType: "rent",
    startDate: "2023-09-05",
    endDate: "2023-10-05",
    price: 0.02,
    status: "expired",
  },
]

export const LicenseHistory: React.FC = () => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">IP Title</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Type</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Date</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Price</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
          </tr>
        </thead>
        <tbody>
          {mockLicenseHistory.map((license) => (
            <tr
              key={license.id}
              className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <td className="py-3 px-4">
                <div className="font-medium">{license.ipTitle}</div>
              </td>
              <td className="py-3 px-4">
                <div
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${license.licenseType === "buy" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"}`}
                >
                  {license.licenseType === "buy" ? "Purchase" : "Rental"}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <CalendarIcon size={14} className="mr-1" />
                  <span>
                    {new Date(license.startDate).toLocaleDateString()}
                    {license.endDate && ` - ${new Date(license.endDate).toLocaleDateString()}`}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="font-medium">{license.price} ETH</div>
              </td>
              <td className="py-3 px-4">
                <div
                  className={`flex items-center text-sm ${license.status === "active" ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400"}`}
                >
                  {license.status === "active" ? (
                    <CheckCircleIcon size={14} className="mr-1" />
                  ) : (
                    <ClockIcon size={14} className="mr-1" />
                  )}
                  <span className="capitalize">{license.status}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
