"use client"

import type React from "react"
import { useState } from "react"
import { RegistrationForm } from "./RegistrationForm"
import { IPPreview } from "./IPPreview"
import { TransactionStatus } from "../ui/TransactionStatus"
import { useWallet } from "@/context/WalletContext"

export const IPRegistration: React.FC = () => {
  const { connected } = useWallet()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: [] as string[],
    licenseTypes: ["buy"] as string[],
    price: 0.05,
    royaltyPercentage: 10,
    file: null as File | null,
    filePreview: "",
  })
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "error">("idle")

  const handleFormChange = (updatedData: Partial<typeof formData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updatedData,
    }))
  }

  const handleSubmit = async () => {
    if (!connected) return
    setTxStatus("pending")
    // Simulate transaction
    setTimeout(() => {
      // 90% chance of success
      const success = Math.random() > 0.1
      setTxStatus(success ? "success" : "error")
      // Reset form after success
      if (success) {
        setTimeout(() => {
          setFormData({
            title: "",
            description: "",
            category: "",
            tags: [],
            licenseTypes: ["buy"],
            price: 0.05,
            royaltyPercentage: 10,
            file: null,
            filePreview: "",
          })
          setTxStatus("idle")
        }, 3000)
      }
    }, 3000)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">IP Registration</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Register your intellectual property as an NFT on the blockchain and make it available for licensing.
        </p>
      </div>
      {txStatus !== "idle" ? (
        <TransactionStatus
          status={txStatus}
          onReset={() => setTxStatus("idle")}
          successMessage="Your IP has been successfully registered on the blockchain!"
          errorMessage="There was an error registering your IP. Please try again."
          pendingMessage="Registering your IP on the blockchain..."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RegistrationForm
              formData={formData}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              isWalletConnected={connected}
            />
          </div>
          <div>
            <IPPreview formData={formData} />
          </div>
        </div>
      )}
    </div>
  )
}
