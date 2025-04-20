"use client"

import type React from "react"
import { Navigation } from "./Navigation"
import { WalletConnect } from "./ui/WalletConnect"
import { motion } from "framer-motion"

interface LayoutProps {
  children: React.ReactNode
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">IP</span>
            </div>
            <h1 className="text-xl font-bold">IPChain</h1>
          </div>
          <WalletConnect />
        </div>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </header>
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.3,
          }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
