'use client';

import { useState } from 'react';
import { RegistrationForm } from './RegistrationForm';
import { RemixRegistrationForm } from './RemixRegistrationForm';
import { IPPreview } from './IPPreview';
import { TransactionStatus } from '../ui/TransactionStatus';
import { useAccount } from 'wagmi';

export type LicenseType = 'personal' | 'rent' | 'remix';
export type LicenseMode = 'personal' | 'commercial';
export type CommercialType = 'rent' | 'remix';

export interface IPFormData {
  title: string;
  description: string;
  category: string;
  licenseType: LicenseType;
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
  const { isConnected } = useAccount();
  const [licenseMode, setLicenseMode] = useState<LicenseMode>('personal');
  const [selectedLicenseOptions, setSelectedLicenseOptions] = useState<
    LicenseType[]
  >(['personal']);
  const [formData, setFormData] = useState<IPFormData>({
    title: '',
    description: '',
    category: '',
    licenseType: 'personal',
    licenseMode: 'personal',
    basePrice: 0.05,
    rentPrice: 0.01,
    royaltyPercentage: 10,
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

  const updateSelectedLicenseOptions = (options: LicenseType[]) => {
    setSelectedLicenseOptions(options);
  };

  const handleCommercialTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const type = e.target.value as CommercialType;
    handleFormChange({
      licenseType: type,
      commercialType: type,
    });
  };

  const handleSubmit = async () => {
    if (!isConnected) return;
    setTxStatus('pending');
    // Simulate transaction
    setTimeout(() => {
      const success = Math.random() > 0.1;
      setTxStatus(success ? 'success' : 'error');
      if (success) {
        setTimeout(() => {
          setFormData({
            title: '',
            description: '',
            category: '',
            licenseType: 'personal',
            licenseMode: 'personal',
            basePrice: 0.05,
            rentPrice: 0.01,
            royaltyPercentage: 10,
            file: null,
            filePreview: '',
            parentIPId: undefined,
          });
          setLicenseMode('personal');
          setSelectedLicenseOptions(['personal']);
          setTxStatus('idle');
        }, 3000);
      }
    }, 3000);
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
