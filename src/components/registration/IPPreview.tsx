"use client"

import { IPFormData } from "./IPRegistration"

interface IPPreviewProps {
  formData: IPFormData
  isRemix?: boolean
}

export const IPPreview: React.FC<IPPreviewProps> = ({ formData, isRemix = false }) => {
  // Get the label for the license type
  const getLicenseTypeLabel = () => {
    if (formData.licenseMode === "personal") return "Personal";
    if (formData.licenseType === "rent") return "Commercial - Rent";
    if (formData.licenseType === "remix") return "Commercial - Remix";
    return formData.licenseType;
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sticky top-6">
      <h3 className="text-lg font-semibold mb-4">Preview</h3>
      <div className="space-y-4">
        {formData.filePreview ? (
          <div className="aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            <img
              src={formData.filePreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <span className="text-slate-400 dark:text-slate-500">No preview available</span>
          </div>
        )}

        {isRemix && formData.parentIPId && (
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-md">
            Remix of IP: {formData.parentIPId}
          </div>
        )}

        <div>
          <h4 className="font-semibold text-lg">
            {formData.title || "Untitled"}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {formData.description || "No description provided."}
          </p>
        </div>

        {formData.category && (
          <div>
            <span className="inline-block bg-slate-100 dark:bg-slate-700 rounded-full px-3 py-1 text-sm">
              {formData.category}
            </span>
          </div>
        )}

        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="bg-slate-100 dark:bg-slate-700 text-xs rounded-full px-2 py-1"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
          <h4 className="font-medium text-sm mb-2">License Terms</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">License Type:</span>
              <span className={`font-medium rounded-full px-3 py-1 text-xs ${
                formData.licenseMode === "commercial" 
                  ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300" 
                  : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
              }`}>
                {getLicenseTypeLabel()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Base Price:</span>
              <span className="font-medium">{formData.basePrice} ETH</span>
            </div>
            
            {/* Only show royalty for remix type, not for rent */}
            {formData.licenseType === "remix" && formData.licenseMode === "commercial" && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Royalty:</span>
                <span className="font-medium">{formData.royaltyPercentage}%</span>
              </div>
            )}
            
            {formData.licenseType === "rent" && formData.licenseMode === "commercial" && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Rent Price:</span>
                <span className="font-medium">{formData.rentPrice} ETH/day</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
