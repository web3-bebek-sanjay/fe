'use client';

import { IPFormData } from './IPRegistration';
import { LicenseType, LicenseTypeString } from '@/utils/enums';

interface IPPreviewProps {
  formData: IPFormData;
  isRemix?: boolean;
  selectedLicenseOptions?: LicenseTypeString[]; // Changed from LicenseType[] to LicenseTypeString[]
}

export const IPPreview: React.FC<IPPreviewProps> = ({
  formData,
  isRemix = false,
  selectedLicenseOptions,
}) => {
  // Determine which license options are selected
  const hasPersonal = selectedLicenseOptions?.includes('personal');
  const hasRent = selectedLicenseOptions?.includes('rent');
  const hasBuy = selectedLicenseOptions?.includes('buy');
  const hasRemix = selectedLicenseOptions?.includes('remix');

  // Check if this is a rentbuy license type
  const isRentBuy = formData.licenseType === 'rentbuy' || (hasBuy && hasRent);

  // Get the label for the license type
  const getLicenseTypeLabel = () => {
    if (hasRemix) return 'Commercial - Remix';

    if (isRentBuy) return 'Commercial - Buy & Rent';

    if (hasPersonal) {
      return formData.licenseMode === 'commercial'
        ? 'Commercial - Buy'
        : 'Personal';
    }

    if (hasRent) return 'Commercial - Rent';

    return 'Unknown';
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
            <span className="text-slate-400 dark:text-slate-500">
              No preview available
            </span>
          </div>
        )}

        {isRemix && formData.parentIPId && (
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-md">
            Remix of IP: {formData.parentIPId}
          </div>
        )}

        <div>
          <h4 className="font-semibold text-lg">
            {formData.title || 'Untitled'}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {formData.description || 'No description provided.'}
          </p>
        </div>

        {formData.category && (
          <div>
            <span className="inline-block bg-slate-100 dark:bg-slate-700 rounded-full px-3 py-1 text-sm">
              {formData.category}
            </span>
          </div>
        )}

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
          <h4 className="font-medium text-sm mb-2">License Terms</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">License Type:</span>
              <span
                className={`font-medium rounded-full px-3 py-1 text-xs ${
                  hasRemix
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                    : hasRent && !hasPersonal
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                }`}
              >
                {getLicenseTypeLabel()}
              </span>
            </div>

            {/* Show Base Price for Personal/Buy license */}
            {(hasPersonal || isRentBuy || hasBuy) && !hasRemix && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Base Price:</span>
                <span className="font-medium">{formData.basePrice} ETH</span>
              </div>
            )}

            {/* Show Rent Price for Rent license or Rent Buy license */}
            {(hasRent || isRentBuy) && !hasRemix && (
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {isRentBuy ? 'Optional Rental:' : 'Rent Price:'}
                </span>
                <span className="font-medium">
                  {formData.rentPrice} ETH/day
                </span>
              </div>
            )}

            {/* For Remix, show that pricing is set by the parent IP */}
            {hasRemix && isRemix && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-italic text-slate-600 dark:text-slate-400">
                  Pricing set by parent IP
                </span>
              </div>
            )}

            {/* For Remix, show royalty percentage from parent IP */}
            {hasRemix && isRemix && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Royalty to Original Creator:</span>
                  <span className="font-medium text-purple-700 dark:text-purple-400">
                    {(formData as any).parentRoyaltyPercentage ||
                      formData.royaltyPercentage ||
                      '20'}
                    %
                  </span>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                  <p className="text-xs text-purple-800 dark:text-purple-300">
                    When your remix sells,{' '}
                    {(formData as any).parentRoyaltyPercentage ||
                      formData.royaltyPercentage ||
                      '20'}
                    % of each sale will be paid to the original IP creator as
                    royalty.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
