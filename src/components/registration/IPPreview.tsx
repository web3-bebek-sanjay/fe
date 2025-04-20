import type React from "react"
import { TagIcon, ShieldIcon } from "lucide-react"

interface IPPreviewProps {
  formData: {
    title: string
    description: string
    category: string
    tags: string[]
    licenseTypes: string[]
    price: number
    royaltyPercentage: number
    filePreview: string
  }
}

export const IPPreview: React.FC<IPPreviewProps> = ({ formData }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Preview</h3>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="aspect-square bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
          {formData.filePreview ? (
            <img
              src={formData.filePreview || "/placeholder.svg"}
              alt={formData.title || "IP Preview"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-slate-400 dark:text-slate-500 text-sm">No file uploaded</div>
          )}
        </div>
        <div className="p-4">
          <h4 className="font-semibold text-lg mb-1">{formData.title || "Untitled IP"}</h4>
          <div className="flex items-center gap-2 mb-3">
            {formData.category && (
              <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-medium">
                <TagIcon size={12} />
                {formData.category}
              </div>
            )}
            <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded text-xs font-medium">
              <ShieldIcon size={12} />
              {formData.royaltyPercentage}% Royalty
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-3">
            {formData.description || "No description provided."}
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs text-slate-600 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
            {formData.tags.length === 0 && (
              <span className="text-xs text-slate-400 dark:text-slate-500">No tags added</span>
            )}
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex gap-2">
              {formData.licenseTypes.includes("buy") && (
                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded text-xs font-medium">
                  Buy
                </span>
              )}
              {formData.licenseTypes.includes("rent") && (
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded text-xs font-medium">
                  Rent
                </span>
              )}
            </div>
            <div className="font-medium">{formData.price} ETH</div>
          </div>
        </div>
      </div>
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Preview Notes</h4>
        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
          <li>• This is how your IP will appear in the marketplace</li>
          <li>• Complete all fields for better discoverability</li>
          <li>• Once minted, some metadata cannot be changed</li>
        </ul>
      </div>
    </div>
  )
}
