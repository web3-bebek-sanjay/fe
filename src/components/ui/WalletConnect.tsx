"use client"

import type React from "react"
import { motion } from "framer-motion"
import { useWallet } from "@/context/WalletContext"
import { WalletIcon } from "lucide-react"

export const WalletConnect: React.FC = () => {
  const { connected, connecting, address, connect, disconnect } = useWallet()

  return (
    <div>
      {!connected ? (
        <motion.button
          whileHover={{
            scale: 1.03,
          }}
          whileTap={{
            scale: 0.98,
          }}
          onClick={connect}
          disabled={connecting}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-70"
        >
          {connecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Connecting...
            </>
          ) : (
            <>
              <WalletIcon size={16} />
              Connect Wallet
            </>
          )}
        </motion.button>
      ) : (
        <div className="flex items-center gap-3">
          <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-xs font-medium hidden sm:block">
            Connected
          </div>
          <motion.button
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.98,
            }}
            onClick={disconnect}
            className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-3 py-1 rounded-lg text-sm flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="hidden sm:inline">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <span className="sm:hidden">
              {address.slice(0, 4)}...{address.slice(-2)}
            </span>
          </motion.button>
        </div>
      )}
    </div>
  )
}
