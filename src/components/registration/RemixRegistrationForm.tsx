'use client';

import React, { useState, useEffect } from 'react';
import { UploadIcon, SearchIcon, XIcon } from 'lucide-react';
import { IPFormData } from '../remix/RemixRegistration';
import { useWallet } from '@/context/WalletContext';
import { CategoryEnum, getCategoryValue, getCategoryName } from '@/utils/enums';
import { useFileUpload } from '@/hooks/useFileUpload';

interface RemixRegistrationFormProps {
  formData: IPFormData;
  onChange: (data: Partial<IPFormData>) => void;
  onSubmit: () => void;
  isWalletConnected: boolean;
  remixOptions: Array<{
    value: string;
    label: string;
    owner: string;
    title: string;
    description: string;
    royaltyPercentage?: string;
    imageUrl?: string; // Add imageUrl to the interface
  }>;
  isProcessing?: boolean;
}

interface ParentIP {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
  royaltyPercentage?: string;
  imageUrl?: string; // Add imageUrl to match actual data structure
  // Could add royalty and pricing info here if needed for display
}

export const RemixRegistrationForm: React.FC<RemixRegistrationFormProps> = ({
  formData,
  onChange,
  onSubmit,
  isWalletConnected,
  remixOptions,
  isProcessing = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ParentIP[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedParentIP, setSelectedParentIP] = useState<ParentIP | null>(
    null
  );
  // New state for default displayed parent IPs
  const [defaultParentIPs, setDefaultParentIPs] = useState<ParentIP[]>([]);

  // File upload hook
  const {
    isUploading,
    uploadProgress,
    error: uploadError,
    uploadedUrl,
    uploadedPath,
    uploadFile,
    deleteFile: deleteUploadedFile,
    resetUploadState,
  } = useFileUpload();

  // Categories aligned with the enum pattern
  const categories = Object.entries(CategoryEnum)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({
      id: value.toString(),
      name: key,
    }));

  useEffect(() => {
    onChange({
      licenseType: 'remix',
      licenseMode: 'commercial',
      commercialType: 'remix' as const,
    });
  }, []);

  // New useEffect to set the default parent IPs when remixOptions changes
  useEffect(() => {
    if (remixOptions && remixOptions.length > 0) {
      // Take the first 5 options (or all if less than 5)
      const firstFiveOptions = remixOptions.slice(0, 5).map((option) => ({
        id: option.value,
        title: option.title,
        creator: option.owner,
        thumbnail:
          option.imageUrl || `https://picsum.photos/seed/${option.value}/200`,
        imageUrl:
          option.imageUrl || `https://picsum.photos/seed/${option.value}/200`,
        royaltyPercentage: option.royaltyPercentage || '20',
      }));

      setDefaultParentIPs(firstFiveOptions);
    }
  }, [remixOptions]);

  // Handle search for parent IPs from the remix options
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    // Filter remix options based on search query
    const filteredResults = remixOptions
      .filter(
        (option) =>
          option.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          option.owner.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((option) => ({
        id: option.value,
        title: option.title,
        creator: option.owner,
        thumbnail:
          option.imageUrl || `https://picsum.photos/seed/${option.value}/200`,
        imageUrl:
          option.imageUrl || `https://picsum.photos/seed/${option.value}/200`,
        royaltyPercentage: option.royaltyPercentage || '20', // Include royalty percentage
      }));

    setTimeout(() => {
      setSearchResults(filteredResults.length > 0 ? filteredResults : []);
      setIsSearching(false);
    }, 500);
  };

  const selectParentIP = (ip: ParentIP) => {
    setSelectedParentIP(ip);

    // Find the corresponding remixOption to get the royalty percentage
    const selectedOption = remixOptions.find(
      (option) => option.value === ip.id
    );

    onChange({
      selectedOption: ip.id,
      parentRoyaltyPercentage: selectedOption?.royaltyPercentage || '20',
    });

    setSearchResults([]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset any previous upload state
    resetUploadState();

    // Create local preview for immediate display
    const reader = new FileReader();
    reader.onload = (event) => {
      onChange({
        file,
        filePreview: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    try {
      const result = await uploadFile(file, 'remix-files');
      if (result.success) {
        // Update form data with uploaded URL and path
        onChange({
          file,
          filePreview: result.url,
          uploadedUrl: result.url,
          uploadedPath: result.path,
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      {/* Parent IP Selection */}
      <h3 className="text-lg font-semibold mb-4">Parent IP Selection</h3>
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Search for Parent IP
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              placeholder="Search by title, creator, or IP ID"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={isProcessing}
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim() || isProcessing}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
            >
              {isSearching ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                <span className="flex items-center">
                  <SearchIcon size={18} className="mr-1" />
                  Search
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Default Parent IPs */}
        {!selectedParentIP &&
          defaultParentIPs.length > 0 &&
          !searchResults.length && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-4">
              <div className="p-2 bg-slate-50 dark:bg-slate-900 text-xs font-medium">
                Available Parent IPs
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {defaultParentIPs.map((ip) => (
                  <div
                    key={ip.id}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3"
                    onClick={() => selectParentIP(ip)}
                  >
                    <img
                      src={ip.imageUrl || ip.thumbnail}
                      alt={ip.title}
                      className="w-10 h-10 rounded object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://picsum.photos/seed/${ip.id}/200`;
                      }}
                    />
                    <div>
                      <div className="font-medium">{ip.title}</div>
                      <div className="text-xs text-slate-500">
                        Creator: {ip.creator.substring(0, 6)}...
                        {ip.creator.substring(38)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-4">
            <div className="p-2 bg-slate-50 dark:bg-slate-900 text-xs font-medium">
              Search Results ({searchResults.length})
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {searchResults.map((ip) => (
                <div
                  key={ip.id}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3"
                  onClick={() => selectParentIP(ip)}
                >
                  <img
                    src={ip.imageUrl || ip.thumbnail}
                    alt={ip.title}
                    className="w-10 h-10 rounded object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://picsum.photos/seed/${ip.id}/200`;
                    }}
                  />
                  <div>
                    <div className="font-medium">{ip.title}</div>
                    <div className="text-xs text-slate-500">
                      Creator: {ip.creator.substring(0, 6)}...
                      {ip.creator.substring(38)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Parent IP */}
        {selectedParentIP ? (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 p-3 rounded-lg flex items-center gap-3">
            <img
              src={selectedParentIP.imageUrl || selectedParentIP.thumbnail}
              alt={selectedParentIP.title}
              className="w-12 h-12 rounded object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://picsum.photos/seed/${selectedParentIP.id}/200`;
              }}
            />
            <div className="flex-1">
              <div className="font-medium">{selectedParentIP.title}</div>
              <div className="text-xs text-slate-500">
                ID: {selectedParentIP.id} | Creator:{' '}
                {selectedParentIP.creator.substring(0, 6)}...
                {selectedParentIP.creator.substring(38)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedParentIP(null);
                onChange({ selectedOption: undefined });
              }}
              className="text-red-500 hover:text-red-700"
              disabled={isProcessing}
            >
              <XIcon size={18} />
            </button>
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span className="font-medium">
                Parent IP selection is required for remix registration
              </span>
            </div>
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold mb-4">Commercial Remix License</h3>
      <div className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Remix licenses are always commercial and include royalty payments to
          the original creator. The base price and royalty percentage are set by
          the parent IP.
        </p>
      </div>

      <h3 className="text-lg font-semibold mb-4">Remix Details</h3>
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
            placeholder="Enter remix title"
            disabled={isProcessing}
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
            placeholder="Describe your remix and how it relates to the original IP"
            disabled={isProcessing}
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
            disabled={isProcessing}
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
          <label className="block text-sm font-medium mb-1">
            Remix File Upload
          </label>
          <div
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            onClick={() =>
              !isProcessing &&
              document.getElementById('remix-file-upload')?.click()
            }
            style={{ cursor: isProcessing ? 'not-allowed' : 'pointer' }}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 mb-4 flex items-center justify-center">
                  <div className="relative">
                    <svg
                      className="animate-spin h-12 w-12 text-blue-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">
                        {uploadProgress}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Uploading to storage...
                </div>
              </div>
            ) : formData.filePreview ? (
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
                {uploadedUrl && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    ✓ Uploaded to storage
                  </div>
                )}
                {uploadError && (
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Upload failed: {uploadError}
                  </div>
                )}
                {!isProcessing && (
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (uploadedPath) {
                        await deleteUploadedFile(uploadedPath);
                      }
                      onChange({
                        file: null,
                        filePreview: '',
                        uploadedUrl: undefined,
                        uploadedPath: undefined,
                      });
                    }}
                    className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Remove file
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadIcon size={36} className="text-slate-400 mb-2" />
                <p className="text-sm font-medium mb-1">
                  Click to upload your remix
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  SVG, PNG, JPG, GIF, PDF, MP3, MP4 (max 100MB)
                </p>
              </div>
            )}
            <input
              id="remix-file-upload"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,audio/*,video/*,application/pdf"
              disabled={isProcessing}
            />
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={
          !isWalletConnected ||
          !formData.title ||
          !formData.category ||
          !formData.filePreview ||
          !formData.selectedOption ||
          isProcessing
        }
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing Remix Registration...
          </div>
        ) : isWalletConnected ? (
          'Register Remix'
        ) : (
          'Connect Wallet to Register'
        )}
      </button>
    </div>
  );
};
