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

  // Fetch available IPs for remix when component mounts
  useEffect(() => {
    if (isConnected) {
      handleGetIPsAvailableForRemix();
    }
  }, [isConnected]);

  // Transform IPs for remix into a usable format
  useEffect(() => {
    if (ipsAvailableForRemix && ipsAvailableForRemix.length > 0) {
      const options = ipsAvailableForRemix.map((ip, index) => ({
        value: index.toString(),
        label: ip.title || `IP ${index}`,
        owner: ip[0] || ip.owner, // Handle both array and object format
        title: ip[1] || ip.title,
        description: ip[2] || ip.description,
        royaltyPercentage: ip[8]?.toString() || '20', // Extract royalty percentage from index 8
      }));
      setRemixOptions(options);
    }
  }, [ipsAvailableForRemix]);

  // Function to get the tokenId for a selected IP
  const getTokenIdForSelectedIP = async (
    selectedIpIndex: number
  ): Promise<string | null> => {
    if (
      !ipsAvailableForRemix ||
      selectedIpIndex < 0 ||
      selectedIpIndex >= ipsAvailableForRemix.length
    ) {
      return null;
    }

    const selectedIP = ipsAvailableForRemix[selectedIpIndex];
    const ownerAddress = selectedIP[0] || selectedIP.owner;

    if (!ownerAddress) {
      console.error('Owner address not found for selected IP');
      return null;
    }

    return new Promise<string | null>((resolve) => {
      headerGetterContract(async (contract: Contract) => {
        try {
          console.log(`Getting tokenId for IP owned by ${ownerAddress}`);

          // Get how many tokens this owner has
          const ownerBalance = await contract.balanceOf(ownerAddress);
          console.log(`Owner has ${ownerBalance} tokens`);

          // Loop through all tokens of this owner to find the matching one
          for (let i = 0; i < Number(ownerBalance); i++) {
            const tokenId = await contract.ownerToTokenIds(ownerAddress, i);
            console.log(`Checking token #${tokenId}`);

            // Get full IP details for this token
            const ipDetails = await contract.getIP(tokenId);

            // Check if this is the IP we're looking for by matching title and description
            if (
              (ipDetails.title === selectedIP.title ||
                ipDetails.title === selectedIP[1]) &&
              (ipDetails.description === selectedIP.description ||
                ipDetails.description === selectedIP[2])
            ) {
              console.log(`Found matching token ID: ${tokenId}`);
              resolve(tokenId.toString());
              return;
            }
          }

          console.error('No matching token ID found');
          resolve(null);
        } catch (error) {
          console.error('Error getting parent token ID:', error);
          resolve(null);
        }
      });
    });
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
      console.log(`Selected IP index: ${selectedIPIndex}`);

      // Get the token ID for the selected IP
      const parentTokenId = await getTokenIdForSelectedIP(selectedIPIndex);

      if (!parentTokenId) {
        throw new Error('Could not find token ID for the selected parent IP');
      }

      console.log(`Found parent token ID: ${parentTokenId}`);

      // Convert category to uint using the utility function
      const categoryValue = getCategoryValue(formData.category);

      // Generate a placeholder file reference instead of using the actual file
      const filePlaceholder =
        "https://picsum.photos/seed/${id || 'default'}/200";

      // Trim the file data if it's too large
      const truncatedFileData =
        filePlaceholder.length > 1000
          ? filePlaceholder.substring(0, 1000) + '...'
          : filePlaceholder;

      // Prepare data for the contract - aligned with remixIP function parameters
      const ipData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: categoryValue.toString(),
        fileUpload: truncatedFileData,
        parentIPId: parentTokenId, // Use the resolved token ID
      };

      console.log('Submitting remix with data:', ipData);

      // Set wallet context values
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
            </div>
          </div>
        </>
      )}
    </div>
  );
};
