'use client';

import React, { useState } from 'react';
import { RemixRegistrationForm } from '../registration/RemixRegistrationForm';
import { IPPreview } from '../registration/IPPreview';
import { TransactionStatus } from '../ui/TransactionStatus';
import { useAccount } from 'wagmi';

export type LicenseMode = 'commercial';
export type LicenseType = 'remix';
export type CommercialType = 'remix';

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

export const RemixRegistration: React.FC = () => {
  const { isConnected } = useAccount();
  const [formData, setFormData] = useState<IPFormData>({
    title: '',
    description: '',
    category: '',
    licenseType: 'remix',
    licenseMode: 'commercial',
    basePrice: 0.05, // These will be set by parent IP, not editable
    rentPrice: 0.01, // These will be set by parent IP, not editable
    royaltyPercentage: 10, // These will be set by parent IP, not editable
    file: null,
    filePreview: '',
  });
  const [txStatus, setTxStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');

  const handleSubmit = async () => {
    if (!isConnected) return;
    setTxStatus('pending');
    // Simulate transaction
    setTimeout(() => {
      // 90% chance of success
      const success = Math.random() > 0.1;
      setTxStatus(success ? 'success' : 'error');
      // Reset form after success
      if (success) {
        setTimeout(() => {
          setFormData({
            title: '',
            description: '',
            category: '',
            licenseType: 'remix',
            licenseMode: 'commercial',
            basePrice: 0.05,
            rentPrice: 0.01,
            royaltyPercentage: 10,
            file: null,
            filePreview: '',
            parentIPId: undefined,
          });
          setTxStatus('idle');
        }, 3000);
      }
    }, 3000);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Remix Registration</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Create a remix of an existing intellectual property by selecting a
          parent IP. Pricing and royalty rates are determined by the parent IP.
        </p>
      </div>

      {txStatus !== 'idle' ? (
        <TransactionStatus
          status={txStatus}
          onReset={() => setTxStatus('idle')}
          successMessage="Your remix has been successfully registered on the blockchain!"
          errorMessage="There was an error registering your remix. Please try again."
          pendingMessage="Registering your remix on the blockchain..."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <RemixRegistrationForm
                formData={formData}
                onChange={(updatedData) => {
                  setFormData(
                    (prevData) =>
                      ({
                        ...prevData,
                        ...updatedData,
                      } as IPFormData)
                  );
                }}
                onSubmit={handleSubmit}
                isWalletConnected={isConnected}
              />
            </div>
            <div>
              <IPPreview
                formData={formData}
                isRemix={true}
                selectedLicenseOptions={['remix']}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
