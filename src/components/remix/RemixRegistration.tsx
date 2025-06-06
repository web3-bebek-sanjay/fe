'use client';

import React, { useState, useEffect } from 'react';
import { RemixRegistrationForm } from '../registration/RemixRegistrationForm';
import { IPPreview } from '../registration/IPPreview';
import { TransactionStatus } from '../ui/TransactionStatus';
import { useWallet } from '@/context/WalletContext';
import { CategoryEnum, getCategoryValue, getCategoryName } from '@/utils/enums';
import { Contract } from 'ethers';

// Simplified IPFormData for remix - no price fields needed
export interface IPFormData {
  title: string;
  description: string;
  category: string;
  file: File | null;
  filePreview: string;
  selectedOption?: string; // Store the selected option index
  // Add these optional properties to match what you're setting in the form
  licenseType?: string;
  licenseMode?: string;
  commercialType?: string;
  parentRoyaltyPercentage?: string; // Add this field
  // Supabase storage properties
  uploadedUrl?: string;
  uploadedPath?: string;
}

export const RemixRegistration: React.FC = () => {
  const {
    isConnected,
    setTitle: setWalletTitle,
    setDescription: setWalletDescription,
    setCategory: setWalletCategory,
    setTag: setWalletTag,
    setFileUpload: setWalletFile,
    setParentId: setWalletParentId,
    handleRemixIP,
    headerGetterContract,
    ipsAvailableForRemix,
    handleGetIPsAvailableForRemix,
  } = useWallet();

  const [formData, setFormData] = useState<IPFormData>({
    title: '',
    description: '',
    category: '',
    file: null,
    filePreview: '',
  });
  const [txStatus, setTxStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');
  const [remixOptions, setRemixOptions] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedParentTokenId, setSelectedParentTokenId] = useState<
    string | null
  >(null);

  // Fetch available IPs for remix when component mounts
  useEffect(() => {
    if (isConnected) {
      handleGetIPsAvailableForRemix();
    }
  }, [isConnected]);

  // Transform IPs for remix into a usable format
  useEffect(() => {
    if (ipsAvailableForRemix && ipsAvailableForRemix.length > 0) {
      const options = ipsAvailableForRemix.map((ip, index) => {
        // First check if the data is in object format or array format
        const title = ip.title || ip[1] || `IP ${index}`;
        const owner = ip.owner || ip[0] || 'Unknown Owner';
        const description = ip.description || ip[2] || '';
        const royaltyPercentage =
          ip.royaltyPercentage || (ip[8] ? ip[8].toString() : '20');

        // Extract image URL using the same logic as LicenseManagement
        let imageUrl = `https://picsum.photos/seed/${index + 100}/200`; // Default fallback

        // Priority order for image sources:
        // 1. ip.imageUrl (processed)
        // 2. ip[4] (fileUpload from blockchain)
        // 3. ip.fileUri
        // 4. ip.thumbnail
        // 5. fallback to placeholder

        if (
          ip.imageUrl &&
          typeof ip.imageUrl === 'string' &&
          ip.imageUrl.trim() !== ''
        ) {
          imageUrl = ip.imageUrl;
        } else if (ip[4] && typeof ip[4] === 'string' && ip[4].trim() !== '') {
          imageUrl = ip[4];
        } else if (
          ip.fileUri &&
          typeof ip.fileUri === 'string' &&
          ip.fileUri.trim() !== ''
        ) {
          imageUrl = ip.fileUri;
        } else if (
          ip.thumbnail &&
          typeof ip.thumbnail === 'string' &&
          ip.thumbnail.trim() !== ''
        ) {
          imageUrl = ip.thumbnail;
        }

        return {
          value: index.toString(),
          label: title,
          owner: owner,
          title: title,
          description: description,
          royaltyPercentage: royaltyPercentage,
          imageUrl: imageUrl, // Add the extracted image URL
        };
      });
      setRemixOptions(options);
    }
  }, [ipsAvailableForRemix]);

  // Improved function to get the tokenId for a selected IP
  const getTokenIdForSelectedIP = async (
    selectedIpIndex: number
  ): Promise<string | null> => {
    if (
      !ipsAvailableForRemix ||
      selectedIpIndex < 0 ||
      selectedIpIndex >= ipsAvailableForRemix.length
    ) {
      console.error('Invalid selection index or no IPs available for remix');
      return null;
    }

    const selectedIP = ipsAvailableForRemix[selectedIpIndex];

    // Extract owner address, handling both object and array format
    const ownerAddress = selectedIP.owner || selectedIP[0];

    if (!ownerAddress) {
      console.error('Owner address not found for selected IP');
      return null;
    }

    try {
      // Return a Promise that resolves with the tokenId
      return new Promise<string | null>((resolve) => {
        headerGetterContract(async (contract: Contract) => {
          try {
            const ownerBalance = await contract.balanceOf(ownerAddress);

            if (Number(ownerBalance) === 0) {
              console.error('Owner has no tokens');
              resolve(null);
              return;
            }

            // Loop through all tokens of this owner to find the matching one
            for (let i = 0; i < Number(ownerBalance); i++) {
              try {
                const tokenId = await contract.ownerToTokenIds(ownerAddress, i);
                const ipDetails = await contract.getIP(tokenId);

                // Check title and description match
                const ipTitle = ipDetails.title || ipDetails[1];
                const ipDescription = ipDetails.description || ipDetails[2];
                const selectedTitle = selectedIP.title || selectedIP[1];
                const selectedDescription =
                  selectedIP.description || selectedIP[2];

                // Check if this is the IP we're looking for by matching title and description
                if (
                  ipTitle === selectedTitle &&
                  ipDescription === selectedDescription
                ) {
                  // Store the parentTokenId in state for later use
                  setSelectedParentTokenId(tokenId.toString());

                  resolve(tokenId.toString());
                  return;
                }
              } catch (err) {
                console.error(`Error checking token ${i}:`, err);
                // Continue to next token
              }
            }

            console.error(
              'No matching token ID found after checking all tokens'
            );
            resolve(null);
          } catch (error) {
            console.error('Error getting parent token ID:', error);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Failed to get token ID:', error);
      return null;
    }
  };

  // Update the handleSubmit function
  const handleSubmit = async () => {
    if (!isConnected || isProcessing) return;

    try {
      setIsProcessing(true);
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
      if (!formData.selectedOption) {
        throw new Error('Parent IP selection is required');
      }

      // Convert selected option to index
      const selectedIPIndex = parseInt(formData.selectedOption);

      const parentTokenId = await getTokenIdForSelectedIP(selectedIPIndex);

      if (!parentTokenId) {
        throw new Error('Could not find token ID for the selected parent IP');
      }

      // Convert category to uint using the utility function
      const categoryValue = getCategoryValue(formData.category);

      // Generate a simple file reference instead of placeholder with random values
      // to ensure consistency in file references
      const fileReference = `remix-${parentTokenId}-${Date.now()}`;

      // Prepare data for the contract - aligned with remixIP function parameters
      const ipData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: categoryValue.toString(),
        fileUpload: fileReference,
        parentIPId: parentTokenId, // Use the resolved token ID
      };

      setWalletTitle(ipData.title);
      setWalletDescription(ipData.description);
      setWalletCategory(ipData.category);
      setWalletFile(ipData.fileUpload);
      setWalletParentId(ipData.parentIPId);

      // Call remix function with the required data
      await handleRemixIP(ipData);

      setTxStatus('success');
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          category: '',
          file: null,
          filePreview: '',
          selectedOption: undefined,
        });
        setTxStatus('idle');
      }, 3000);
    } catch (error: any) {
      console.error('Remix submission error:', error);
      setTxStatus('error');
    } finally {
      setIsProcessing(false);
    }
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
                remixOptions={remixOptions}
                isProcessing={isProcessing}
              />
            </div>
            <div>
              <IPPreview
                formData={
                  {
                    ...formData,
                    // Add these properties just for the preview component
                    licenseType: 'remix',
                    licenseMode: 'commercial',
                    basePrice: 0,
                    rentPrice: 0,
                    royaltyPercentage: 0,
                  } as any
                } // Use 'as any' to bypass type checking for this specific object
                isRemix={true}
                selectedLicenseOptions={['remix']}
              />
              {selectedParentTokenId && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Selected Parent IP Token ID:{' '}
                    <span className="font-bold">{selectedParentTokenId}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
