"use client"

import type React from "react"
import { motion } from "framer-motion"
import { TagIcon } from "lucide-react"
import Image from "next/image"

interface IPCardProps {
  ip: {
    id: string
    title: string
    owner: string
    thumbnail: string
    licenseTypes: string[]
    category: string
    price: number
  }
  onClick: () => void
}

export const IPCard: React.FC<IPCardProps> = ({ ip, onClick }) => {
  return (
    <motion.div
      whileHover={{
        y: -4,
        transition: {
          duration: 0.2,
        },
      }}
      className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="w-full h-48 overflow-hidden relative">
        <Image
          src={ip.thumbnail || "/placeholder.svg"}
          alt={ip.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform hover:scale-105 duration-500"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{ip.title}</h3>
          <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-medium">
            <TagIcon size={12} />
            {ip.category}
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Owner: {ip.owner.slice(0, 6)}...{ip.owner.slice(-4)}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {ip.licenseTypes.includes("buy") && (
              <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded text-xs font-medium">
                Buy
              </span>
            )}
            {ip.licenseTypes.includes("rent") && (
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded text-xs font-medium">
                Rent
              </span>
            )}
          </div>
          <div className="font-medium text-sm">{ip.price} ETH</div>
        </div>
      </div>
    </motion.div>
  )
}
