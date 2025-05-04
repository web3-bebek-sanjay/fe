'use client';

import { useState, useEffect } from 'react';
import { RegistrationForm } from './RegistrationForm';
import { IPPreview } from './IPPreview';
import { TransactionStatus } from '../ui/TransactionStatus';
import { useWallet } from '@/context/WalletContext';
import {
  LicenseType,
  LicenseTypeString,
  LICENSE_TYPE_MAPPING,
  LicenseMode,
  CommercialType,
  CategoryEnum,
  getCategoryValue,
  getCategoryName,
} from '@/utils/enums';

export interface IPFormData {
  title: string;
  description: string;
  category: string;
  licenseType: LicenseTypeString;
  licenseMode: LicenseMode;
  commercialType?: CommercialType;
  basePrice: number;
  rentPrice: number;
  royaltyPercentage: number;
  file: File | null;
  filePreview: string;
  parentIPId?: string;
}

export const IPRegistration: React.FC = () => {
  const {
    isConnected,
    setTitle: setWalletTitle,
    setDescription: setWalletDescription,
    setCategory: setWalletCategory,
    setTag: setWalletTag,
    setFileUpload: setWalletFile, // Changed from setFile to setFileUpload
    setLicenseopt: setWalletLicenseType, // Changed from setLicenseType to setLicenseopt
    setBasePrice: setWalletBasePrice,
    setRentPrice: setWalletRentPrice,
    setRoyaltyPercentage: setWalletRoyaltyPercentage,
    handleRegisterIP,
  } = useWallet();

  const [licenseMode, setLicenseMode] = useState<LicenseMode>('personal');
  const [selectedLicenseOptions, setSelectedLicenseOptions] = useState<
    LicenseTypeString[]
  >(['personal']);
  const [formData, setFormData] = useState<IPFormData>({
    title: '',
    description: '',
    category: '',
    licenseType: 'personal',
    licenseMode: 'personal',
    basePrice: 0,
    rentPrice: 0,
    royaltyPercentage: 0,
    file: null,
    filePreview: '',
  });
  const [txStatus, setTxStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');

  const handleFormChange = (updatedData: Partial<IPFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updatedData,
    }));
  };

  const handleLicenseModeChange = (mode: LicenseMode) => {
    setLicenseMode(mode);

    if (mode === 'personal') {
      handleFormChange({
        licenseMode: 'personal',
        licenseType: 'personal',
        commercialType: undefined,
      });
      setSelectedLicenseOptions(['personal']);
    } else {
      // Default to rent for commercial mode
      handleFormChange({
        licenseMode: 'commercial',
        licenseType: 'rent',
        commercialType: 'rent',
      });
      setSelectedLicenseOptions(['rent']);
    }
  };

  const updateSelectedLicenseOptions = (options: LicenseTypeString[]) => {
    setSelectedLicenseOptions(options);
  };

  // Update the handleCommercialTypeChange function
  const handleCommercialTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    // Here we ensure type safety by using a type assertion or validation
    const typeValue = e.target.value;
    const type =
      typeValue === 'rent' || typeValue === 'remix'
        ? (typeValue as CommercialType)
        : 'rent'; // Default to rent if invalid value

    // Now update the form with the valid type
    handleFormChange({
      licenseType: type as LicenseTypeString, // Cast to LicenseTypeString since we know it's valid
      commercialType: type,
    });
  };

  const handleSubmit = async () => {
    if (!isConnected) return;

    try {
      setTxStatus('pending');

      // Basic validation to prevent empty fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (!formData.category) {
        throw new Error('Category is required');
      }
      if (!formData.filePreview) {
        throw new Error('File is required');
      }

      let licenseTypeValue = LICENSE_TYPE_MAPPING[formData.licenseType];

      // Convert category to uint
      const categoryValue = getCategoryValue(formData.category);

      // Convert numeric values to strings and ensure they're in wei format
      const basePriceInWei = (formData.basePrice * 10 ** 18).toString();
      const rentPriceInWei = (formData.rentPrice * 10 ** 18).toString();
      const royaltyPercentage = Math.floor(
        formData.royaltyPercentage
      ).toString();

      // Generate a placeholder file reference instead of using the actual file
      const filePlaceholder = '';

      const ipData = {
        title: formData.title,
        description: formData.description,
        category: categoryValue.toString(), // Convert the enum value to string for the contract
        tag: '',
        fileUpload: filePlaceholder, // Changed from file to fileUpload
        licenseopt: licenseTypeValue, // Changed from licenseType to licenseopt
        basePrice: basePriceInWei,
        rentPrice: rentPriceInWei,
        royaltyPercentage,
      };

      console.log('Setting wallet context values:', ipData);

      setWalletTitle(ipData.title);
      setWalletDescription(ipData.description);
      setWalletCategory(ipData.category);
      setWalletTag(ipData.tag);
      setWalletFile(ipData.fileUpload); // Changed to use fileUpload
      setWalletLicenseType(ipData.licenseopt); // Changed to use licenseopt
      setWalletBasePrice(ipData.basePrice);
      setWalletRentPrice(ipData.rentPrice);
      setWalletRoyaltyPercentage(ipData.royaltyPercentage);

      // Pass the data directly to the handler
      await handleRegisterIP(ipData);

      // Success handling
      setTxStatus('success');
      setTimeout(() => {
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: '',
          licenseType: 'personal',
          licenseMode: 'personal',
          basePrice: 0,
          rentPrice: 0,
          royaltyPercentage: 0,
          file: null,
          filePreview: '',
          parentIPId: undefined,
        });
        setLicenseMode('personal');
        setSelectedLicenseOptions(['personal']);
        setTxStatus('idle');
      }, 3000);
    } catch (error: any) {
      console.error('Error registering IP:', error);
      alert(
        `Registration failed: ${error.message || 'Unknown error occurred'}`
      );
      setTxStatus('error');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">IP Registration</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Register your intellectual property on the blockchain and make it
          available for licensing.
        </p>
      </div>

      {txStatus !== 'idle' ? (
        <TransactionStatus
          status={txStatus}
          onReset={() => setTxStatus('idle')}
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
                onClick={() => handleLicenseModeChange('personal')}
                className={`px-4 py-2 rounded-lg font-medium flex-1 
                  ${
                    licenseMode === 'personal'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
              >
                Personal
              </button>
              <button
                onClick={() => handleLicenseModeChange('commercial')}
                className={`px-4 py-2 rounded-lg font-medium flex-1 
                  ${
                    licenseMode === 'commercial'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
              >
                Commercial
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <RegistrationForm
                formData={formData}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
                isWalletConnected={isConnected}
                selectedLicenseOptions={selectedLicenseOptions}
                setSelectedLicenseOptions={updateSelectedLicenseOptions}
              />
            </div>
            <div>
              <IPPreview
                formData={formData}
                isRemix={selectedLicenseOptions.includes('remix')}
                selectedLicenseOptions={selectedLicenseOptions}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
