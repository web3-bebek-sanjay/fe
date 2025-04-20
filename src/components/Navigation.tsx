"use client"

import type React from "react"
import { motion } from "framer-motion"
import { FileTextIcon, DollarSignIcon } from "lucide-react"
import { LicenseIcon } from "./icons/LicenseIcon"

interface NavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: "license",
      name: "License Management",
      icon: <LicenseIcon size={18} />,
    },
    {
      id: "register",
      name: "IP Registration",
      icon: <FileTextIcon size={18} />,
    },
    {
      id: "royalty",
      name: "Royalty Management",
      icon: <DollarSignIcon size={18} />,
    },
  ]

  return (
    <nav className="container mx-auto px-4">
      <div className="flex overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? "text-blue-600 dark:text-blue-400" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"}`}
          >
            {tab.icon}
            {tab.name}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                initial={false}
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
