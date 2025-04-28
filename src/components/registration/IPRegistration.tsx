"use client"

import React, { useState } from "react"
import { RegistrationForm } from "./RegistrationForm"
import { RemixRegistrationForm } from "./RemixRegistrationForm"
import { IPPreview } from "./IPPreview"
import { TransactionStatus } from "../ui/TransactionStatus"
import { useWallet } from "@/context/WalletContext"

// Define license types and registration modes
export type LicenseType = "personal" | "rent" | "remix"
export type LicenseMode = "personal" | "commercial"
export type CommercialType = "rent" | "remix"

export interface IPFormData {
  title: string
  description: string
  category: string
  tags: string[]
  licenseType: LicenseType
  licenseMode: LicenseMode
  commercialType?: CommercialType
  basePrice: number
  rentPrice: number // For rent type
  royaltyPercentage: number // For commercial types
  file: File | null
  filePreview: string
  parentIPId?: string
}

export const IPRegistration: React.FC = () => {
  const { connected } = useWallet()
  const [licenseMode, setLicenseMode] = useState<LicenseMode>("personal")
  const [commercialType, setCommercialType] = useState<CommercialType>("rent")
  const [formData, setFormData] = useState<IPFormData>({
    title: "",
    description: "",
    category: "",
    tags: [],
    licenseType: "personal",
    licenseMode: "personal",
    basePrice: 0.05,
    rentPrice: 0.01,
    royaltyPercentage: 10,
    file: null,
    filePreview: "",
  })
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "error">("idle")

  const handleFormChange = (updatedData: Partial<IPFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updatedData,
    }))
  }

  // Update both license mode and commercial type (if applicable)
  const handleLicenseModeChange = (mode: LicenseMode) => {
    setLicenseMode(mode);
    
    if (mode === "personal") {
      handleFormChange({
        licenseMode: "personal",
        licenseType: "personal",
        commercialType: undefined
      });
    } else {
      // For commercial, set the current commercial type
      handleFormChange({
        licenseMode: "commercial",
        licenseType: commercialType,
        commercialType
      });
    }
  }

  // Update the commercial type when it's changed
  const handleCommercialTypeChange = (type: CommercialType) => {
    setCommercialType(type);
    handleFormChange({
      licenseType: type,
      commercialType: type
    });
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
            licenseType: "personal",
            licenseMode: "personal",
            basePrice: 0.05,
            rentPrice: 0.01,
            royaltyPercentage: 10,
            file: null,
            filePreview: "",
            parentIPId: undefined,
          })
          setLicenseMode("personal")
          setCommercialType("rent")
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
          Register your intellectual property on the blockchain and make it available for licensing.
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
        <>
          {/* License mode selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">License Type</h3>
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => handleLicenseModeChange("personal")}
                className={`px-4 py-2 rounded-lg font-medium flex-1 
                  ${
                    licenseMode === "personal"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                  }`}
              >
                Personal (Buy)
              </button>
              <button
                onClick={() => handleLicenseModeChange("commercial")}
                className={`px-4 py-2 rounded-lg font-medium flex-1 
                  ${
                    licenseMode === "commercial"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                  }`}
              >
                Commercial
              </button>
            </div>
            
            {/* Commercial type selection - only show when commercial mode is selected */}
            {licenseMode === "commercial" && (
              <div className="flex gap-4">
                <button
                  onClick={() => handleCommercialTypeChange("rent")}
                  className={`px-4 py-2 rounded-lg font-medium flex-1 
                    ${
                      commercialType === "rent"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                    }`}
                >
                  Rent
                </button>
                <button
                  onClick={() => handleCommercialTypeChange("remix")}
                  className={`px-4 py-2 rounded-lg font-medium flex-1 
                    ${
                      commercialType === "remix"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                    }`}
                >
                  Remix
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {(licenseMode === "personal" || commercialType === "rent") ? (
                <RegistrationForm
                  formData={formData}
                  onChange={handleFormChange}
                  onSubmit={handleSubmit}
                  isWalletConnected={connected}
                />
              ) : (
                <RemixRegistrationForm
                  formData={formData}
                  onChange={handleFormChange}
                  onSubmit={handleSubmit}
                  isWalletConnected={connected}
                />
              )}
            </div>
            <div>
              <IPPreview 
                formData={formData} 
                isRemix={formData.licenseType === "remix"} 
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
