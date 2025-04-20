"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { UploadIcon, PlusIcon, XIcon } from "lucide-react"

interface RegistrationFormProps {
  formData: {
    title: string
    description: string
    category: string
    tags: string[]
    licenseTypes: string[]
    price: number
    royaltyPercentage: number
    file: File | null
    filePreview: string
  }
  onChange: (
    data: Partial<{
      title: string
      description: string
      category: string
      tags: string[]
      licenseTypes: string[]
      price: number
      royaltyPercentage: number
      file: File | null
      filePreview: string
    }>,
  ) => void
  onSubmit: () => void
  isWalletConnected: boolean
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  formData,
  onChange,
  onSubmit,
  isWalletConnected,
}) => {
  const [tagInput, setTagInput] = useState("")
  const categories = ["Art", "Music", "Photography", "Literature", "Software", "Research", "Design", "Gaming", "Other"]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      onChange({
        file,
        filePreview: event.target?.result as string,
      })
    }
    reader.readAsDataURL(file)
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      onChange({
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    onChange({
      tags: formData.tags.filter((t) => t !== tag),
    })
  }

  const toggleLicenseType = (type: string) => {
    if (formData.licenseTypes.includes(type)) {
      onChange({
        licenseTypes: formData.licenseTypes.filter((t) => t !== type),
      })
    } else {
      onChange({
        licenseTypes: [...formData.licenseTypes, type],
      })
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold mb-4">IP Details</h3>
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              onChange({
                title: e.target.value,
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
            placeholder="Enter IP title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              onChange({
                description: e.target.value,
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 min-h-[100px]"
            placeholder="Describe your intellectual property"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) =>
              onChange({
                category: e.target.value,
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTag()}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              placeholder="Add tags"
            />
            <button type="button" onClick={addTag} className="p-2 rounded-lg bg-blue-600 text-white">
              <PlusIcon size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md text-sm"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <XIcon size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">File Upload</label>
          <div
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            {formData.filePreview ? (
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 mb-4 overflow-hidden rounded-lg">
                  <img
                    src={formData.filePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{formData.file?.name}</div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onChange({
                      file: null,
                      filePreview: "",
                    })
                  }}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadIcon size={36} className="text-slate-400 mb-2" />
                <p className="text-sm font-medium mb-1">Click to upload</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  SVG, PNG, JPG, GIF, PDF, MP3, MP4 (max 100MB)
                </p>
              </div>
            )}
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,audio/*,video/*,application/pdf"
            />
          </div>
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-4">License Options</h3>
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">License Types</label>
          <div className="flex flex-wrap gap-3">
            <div
              className={`px-4 py-2 rounded-lg border cursor-pointer ${formData.licenseTypes.includes("buy") ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"}`}
              onClick={() => toggleLicenseType("buy")}
            >
              Buy (Perpetual)
            </div>
            <div
              className={`px-4 py-2 rounded-lg border cursor-pointer ${formData.licenseTypes.includes("rent") ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"}`}
              onClick={() => toggleLicenseType("rent")}
            >
              Rent (Time-limited)
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Base Price (ETH)
            <span className="text-slate-500 dark:text-slate-400 ml-1 text-xs">(for purchase or 30-day rental)</span>
          </label>
          <input
            type="number"
            min="0.001"
            step="0.001"
            value={formData.price}
            onChange={(e) =>
              onChange({
                price: Number.parseFloat(e.target.value),
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Royalty Percentage
            <span className="text-slate-500 dark:text-slate-400 ml-1 text-xs">(for secondary sales)</span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="20"
              value={formData.royaltyPercentage}
              onChange={(e) =>
                onChange({
                  royaltyPercentage: Number.parseInt(e.target.value),
                })
              }
              className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="w-12 text-center font-medium">{formData.royaltyPercentage}%</div>
          </div>
        </div>
      </div>
      <motion.button
        whileHover={{
          scale: 1.02,
        }}
        whileTap={{
          scale: 0.98,
        }}
        onClick={onSubmit}
        disabled={
          !isWalletConnected ||
          !formData.title ||
          !formData.category ||
          !formData.file ||
          formData.licenseTypes.length === 0
        }
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isWalletConnected ? "Register & Mint IP" : "Connect Wallet to Register"}
      </motion.button>
    </div>
  )
}
