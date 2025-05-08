'use client';

import React, { useState, useEffect } from 'react';
import { UploadIcon } from 'lucide-react';
import { IPFormData } from './IPRegistration';
import {
  LicenseType,
  LicenseTypeString,
  CommercialType,
  CategoryEnum,
} from '@/utils/enums';

interface RegistrationFormProps {
  formData: IPFormData;
  onChange: (data: Partial<IPFormData>) => void;
  onSubmit: () => void;
  isWalletConnected: boolean;
  selectedLicenseOptions: LicenseTypeString[];
  setSelectedLicenseOptions: (options: LicenseTypeString[]) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  formData,
  onChange,
  onSubmit,
  isWalletConnected,
  selectedLicenseOptions,
  setSelectedLicenseOptions,
}) => {
  const categories = Object.entries(CategoryEnum)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({
      id: value.toString(),
      name: key,
    }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onChange({
        file,
        filePreview: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const toggleLicenseOption = (option: LicenseTypeString) => {
    // For commercial mode, we only allow a single option
    if (formData.licenseMode === 'commercial') {
      // Set the selected option as the only one
      const newOptions: LicenseTypeString[] = [option];

      // Update form data - use type guards here
      onChange({
        licenseType: option,
        commercialType:
          option === 'personal'
            ? undefined
            : option === 'rent' || option === 'remix'
            ? (option as CommercialType) // Explicit
            : undefined,
      });

      setSelectedLicenseOptions(newOptions);
      return;
    }

    // For personal mode, just set personal
    const newOptions: LicenseTypeString[] = ['personal'];
    onChange({
      licenseType: 'personal',
      commercialType: undefined,
    });

    setSelectedLicenseOptions(newOptions);
  };

  const isPersonal = formData.licenseType === 'personal';
  const isRent = formData.licenseType === 'rent';
  const isRemix = formData.licenseType === 'remix';
  const isCommercial = formData.licenseMode === 'commercial';

  // Fix the isRentBuySelected check
  const isRentBuySelected =
    formData.licenseType === 'rentbuy' ||
    (selectedLicenseOptions.includes('buy') &&
      selectedLicenseOptions.includes('rent'));
  const isRentSelected =
    selectedLicenseOptions.includes('rent') &&
    !selectedLicenseOptions.includes('buy') &&
    formData.licenseType !== 'rentbuy';
  const isRemixSelected = selectedLicenseOptions.includes('remix');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      {/* License info banner */}
      <div
        className={`p-4 rounded-lg mb-6 ${
          isPersonal && !isCommercial
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : isRent || isRentBuySelected
            ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
            : 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
        }`}
      >
        <p
          className={`text-sm ${
            isPersonal && !isCommercial
              ? 'text-green-800 dark:text-green-300'
              : isRentBuySelected
              ? 'text-orange-800 dark:text-orange-300'
              : isRentSelected
              ? 'text-orange-800 dark:text-orange-300'
              : 'text-purple-800 dark:text-purple-300'
          }`}
        >
          {isPersonal && !isCommercial
            ? 'Personal license grants full rights for personal use with a one-time payment.'
            : isRentBuySelected
            ? 'Commercial buy & rent license allows both one-time purchase and time-limited rental options.'
            : isRent
            ? 'Commercial rent license allows time-limited commercial usage with a daily rental fee.'
            : 'Remix license allows modification and derivative works with royalty payments.'}
        </p>
      </div>

      {/* Commercial License Options - only shown for commercial mode */}
      {isCommercial && (
        <>
          <h3 className="text-lg font-semibold mb-3">
            Commercial License Options
          </h3>
          <div className="space-y-4 mb-6">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  onChange({ licenseType: 'rentbuy' });
                  setSelectedLicenseOptions(['buy', 'rent']); // This should set both options
                }}
                className={`px-4 py-2 rounded-lg font-medium border ${
                  formData.licenseType === 'rentbuy' ||
                  (selectedLicenseOptions.includes('buy') &&
                    selectedLicenseOptions.includes('rent'))
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                }`}
              >
                Rent Buy
              </button>

              <button
                type="button"
                onClick={() => {
                  onChange({ licenseType: 'rent' });
                  setSelectedLicenseOptions(['rent']);
                }}
                className={`px-4 py-2 rounded-lg font-medium border ${
                  formData.licenseType === 'rent'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                }`}
              >
                Rent
              </button>

              <button
                type="button"
                onClick={() => {
                  // This sets license type to remix (3)
                  onChange({ licenseType: 'remix' });
                  setSelectedLicenseOptions(['remix']);
                }}
                className={`px-4 py-2 rounded-lg font-medium border ${
                  isRemixSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                }`}
              >
                Remix
              </button>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
              <p>
                <strong>Note:</strong> For commercial licenses, you can select
                only one option: "Rent Buy", "Rent", or "Remix".
              </p>
            </div>
          </div>
        </>
      )}

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
            onChange={(e) => onChange({ category: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">File Upload</label>
          <div
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {formData.filePreview ? (
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 mb-4 overflow-hidden rounded-lg">
                  <img
                    src={formData.filePreview || '/placeholder.svg'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {formData.file?.name}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange({
                      file: null,
                      filePreview: '',
                    });
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
      <h3 className="text-lg font-semibold mb-4">Pricing</h3>
      <div className="space-y-4 mb-6">
        {/* For Remix, only show royalty percentage */}
        {isRemixSelected ? (
          <div>
            <label className="block text-sm font-medium mb-1">
              Royalty Percentage
              <span className="text-slate-500 dark:text-slate-400 ml-1 text-xs">
                (for original creator)
              </span>
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
              <div className="w-12 text-center font-medium">
                {formData.royaltyPercentage}%
              </div>
            </div>
          </div>
        ) : (
          // For non-remix options
          <>
            {/* Base Price - show for personal license or rent buy */}
            {(selectedLicenseOptions.includes('personal') ||
              isRentBuySelected) && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Base Price (ETH)
                  <span className="text-slate-500 dark:text-slate-400 ml-1 text-xs">
                    (one-time payment)
                  </span>
                </label>
                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={formData.basePrice}
                  onChange={(e) =>
                    onChange({
                      basePrice: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
              </div>
            )}

            {/* Rent Price - show when rent is selected or for rent buy */}
            {(isRentSelected || isRentBuySelected) && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Rent Price (ETH/day)
                  {isRentBuySelected && (
                    <span className="text-slate-500 dark:text-slate-400 ml-1 text-xs">
                      (optional rental option)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min="0.0001"
                  step="0.0001"
                  value={formData.rentPrice}
                  onChange={(e) =>
                    onChange({
                      rentPrice: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Buyers will set their own rental duration when purchasing.
                </p>
              </div>
            )}
          </>
        )}

        {/* Pricing Summary */}
        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
          {isRemixSelected ? (
            // Summary for remix option
            <div className="flex justify-between items-center">
              <span className="font-medium">Royalty Percentage:</span>
              <span className="font-bold">{formData.royaltyPercentage}%</span>
            </div>
          ) : (
            // Summary for non-remix options
            <>
              {selectedLicenseOptions.length > 0 && (
                <>
                  <div className="font-medium text-sm mb-2">License Type:</div>
                  {isRentBuySelected && (
                    <>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">
                          Commercial - Rent Buy:
                        </span>
                        <span className="font-bold">
                          {formData.basePrice} ETH
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium pl-4 text-sm text-slate-600 dark:text-slate-400">
                          + Optional Rental:
                        </span>
                        <span className="font-medium text-slate-600 dark:text-slate-400">
                          {formData.rentPrice} ETH/day
                        </span>
                      </div>
                    </>
                  )}

                  {isRentSelected && (
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">Commercial - Rent:</span>
                      <span className="font-bold">
                        {formData.rentPrice} ETH/day
                      </span>
                    </div>
                  )}

                  {!isCommercial && (
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">Personal:</span>
                      <span className="font-bold">
                        {formData.basePrice} ETH
                      </span>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      <button
        onClick={onSubmit}
        disabled={
          !isWalletConnected ||
          !formData.title ||
          !formData.category ||
          !formData.file ||
          selectedLicenseOptions.length === 0
        }
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isWalletConnected ? 'Register IP' : 'Connect Wallet to Register'}
      </button>
    </div>
  );
};
