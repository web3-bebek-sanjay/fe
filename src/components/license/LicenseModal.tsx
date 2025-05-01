"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { XIcon, CheckIcon, AlertCircleIcon, LoaderIcon } from "lucide-react"
import { useAccount } from "wagmi"
import Image from "next/image"

interface LicenseModalProps {
  isOpen: boolean
  onClose: () => void
  ip: {
    id: string
    title: string
    owner: string
    thumbnail: string
    licenseTypes: string[]
    category: string
    price: number
  }
}

export const LicenseModal: React.FC<LicenseModalProps> = ({ isOpen, onClose, ip }) => {
  const { isConnected } = useAccount()
  const [licenseType, setLicenseType] = useState<"buy" | "rent">(ip.licenseTypes.includes("buy") ? "buy" : "rent")
  const [duration, setDuration] = useState(30)
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "error">("idle")

  const handleConfirmLicense = async () => {
    if (!isConnected) return
    setTxStatus("pending")
    // Simulate transaction
    setTimeout(() => {
      // 90% chance of success
      const success = Math.random() > 0.1
      setTxStatus(success ? "success" : "error")
      // Reset after showing success/error
      if (success) {
        setTimeout(() => {
          onClose()
          setTxStatus("idle")
        }, 2000)
      }
    }, 2000)
  }

  const calculatePrice = () => {
    if (licenseType === "buy") return ip.price
    return Math.round(((ip.price * duration) / 30) * 1000) / 1000 // Rent price based on duration
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
            }}
            transition={{
              duration: 0.2,
            }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="relative">
              <div className="w-full h-48 relative">
                <Image src={ip.thumbnail || "/placeholder.svg"} alt={ip.title} fill className="object-cover" />
              </div>
              <button
                onClick={onClose}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                disabled={txStatus === "pending"}
              >
                <XIcon size={20} />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">{ip.title}</h3>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Owner: {ip.owner.slice(0, 6)}...{ip.owner.slice(-4)}
              </div>
              {txStatus === "idle" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">License Type</label>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      {ip.licenseTypes.includes("buy") && (
                        <button
                          className={`flex-1 py-2 text-center text-sm font-medium ${licenseType === "buy" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"}`}
                          onClick={() => setLicenseType("buy")}
                        >
                          Buy
                        </button>
                      )}
                      {ip.licenseTypes.includes("rent") && (
                        <button
                          className={`flex-1 py-2 text-center text-sm font-medium ${licenseType === "rent" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"}`}
                          onClick={() => setLicenseType("rent")}
                        >
                          Rent
                        </button>
                      )}
                    </div>
                  </div>
                  {licenseType === "rent" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Duration (days)</label>
                      <input
                        type="range"
                        min={1}
                        max={90}
                        value={duration}
                        onChange={(e) => setDuration(Number.parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mt-1">
                        <span>{duration} days</span>
                        <span>{calculatePrice()} ETH</span>
                      </div>
                    </div>
                  )}
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium mb-2">License Terms</h4>
                    <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-300">
                      <li>• {licenseType === "buy" ? "Perpetual" : `${duration}-day`} license</li>
                      <li>• {licenseType === "buy" ? "Full" : "Limited"} commercial usage</li>
                      <li>• Non-exclusive rights</li>
                      <li>• No redistribution allowed</li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium">Total Price:</div>
                    <div className="text-lg font-bold">{calculatePrice()} ETH</div>
                  </div>
                  <button
                    onClick={handleConfirmLicense}
                    disabled={!isConnected}
                    className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {isConnected
                      ? `Confirm ${licenseType === "buy" ? "Purchase" : "Rental"}`
                      : "Connect Wallet to Continue"}
                  </button>
                </>
              )}
              {txStatus === "pending" && (
                <div className="py-6 flex flex-col items-center justify-center">
                  <div className="animate-spin mb-4">
                    <LoaderIcon size={32} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Processing Transaction</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                    Please wait while we process your transaction on the blockchain.
                  </p>
                </div>
              )}
              {txStatus === "success" && (
                <div className="py-6 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <CheckIcon size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Transaction Successful!</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                    You have successfully {licenseType === "buy" ? "purchased" : "rented"} this IP license.
                  </p>
                </div>
              )}
              {txStatus === "error" && (
                <div className="py-6 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                    <AlertCircleIcon size={24} className="text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Transaction Failed</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
                    There was an error processing your transaction. Please try again.
                  </p>
                  <button
                    onClick={() => setTxStatus("idle")}
                    className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-sm font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
