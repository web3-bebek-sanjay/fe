'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Contract, ethers } from 'ethers';
import { getContract } from '@/contracts/contract';

import { getTheBrowserEth, getTheContract, txConfig } from '@/contracts/fetch';
import { ContractCallback } from '@/contracts/types';
import { useLoading } from './LoadingContext';

const IPXContract = getContract('IPX');

const contractAddress = IPXContract!.address;
const abi = IPXContract!.abi;

enum LicenseType {
  Personal = 0,
  Rent = 1,
  RentAndBuy = 2,
  ParentRemix = 3,
  ChildRemix = 4,
}

type WalletContextType = {
  // Contract values
  account: string | null;
  isConnected: boolean;
  balance: string;
  name: string;
  symbol: string;
  totalSupply: string;
  owner: string;
  connectWallet: () => Promise<void>;

  // IP data
  myIPs: any[];
  otherIPs: any[]; // Add this to the type definition
  currentIP: any;

  // Form values
  tokenId: string;
  setTokenId: React.Dispatch<React.SetStateAction<string>>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  tag: string;
  setTag: React.Dispatch<React.SetStateAction<string>>;
  fileUpload: string;
  setFileUpload: React.Dispatch<React.SetStateAction<string>>;
  licenseopt: number;
  setLicenseopt: React.Dispatch<React.SetStateAction<number>>;
  basePrice: string;
  setBasePrice: React.Dispatch<React.SetStateAction<string>>;
  rentPrice: string;
  setRentPrice: React.Dispatch<React.SetStateAction<string>>;
  royaltyPercentage: string;
  setRoyaltyPercentage: React.Dispatch<React.SetStateAction<string>>;
  parentId: string;
  setParentId: React.Dispatch<React.SetStateAction<string>>;

  // Contract functions
  handleBalanceOf: () => Promise<void>;
  handleName: () => Promise<void>;
  handleSymbol: () => Promise<void>;
  handleTotalSupply: () => Promise<void>;
  handleOwner: () => Promise<void>;
  handleRegisterIP: (data?: {
    title: string;
    description: string;
    category: string;
    tag: string;
    fileUpload: string;
    licenseopt: number;
    basePrice: string;
    rentPrice: string;
    royaltyPercentage: string;
  }) => Promise<void>;
  handleRemixIP: () => Promise<void>;
  handleBuyIP: (price?: string) => Promise<void>;
  handleRentIP: (price?: string, duration?: number) => Promise<void>;
  handleGetIP: () => Promise<void>;
  handleGetMyIPs: () => Promise<void>;
  handleGetOtherIPs: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { setLoading } = useLoading();

  const [balance, setBalance] = useState<string>('0');
  const [name, setName] = useState<string>('');
  const [symbol, setSymbol] = useState<string>('');
  const [totalSupply, setTotalSupply] = useState<string>('0');
  const [owner, setOwner] = useState<string>('');

  // IP related state
  const [myIPs, setMyIPs] = useState<any[]>([]);
  const [otherIPs, setOtherIPs] = useState<any[]>([]);
  const [currentIP, setCurrentIP] = useState<any>(null);

  // Inputs for forms
  const [tokenId, setTokenId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('0');
  const [tag, setTag] = useState<string>('');
  const [fileUpload, setFileUpload] = useState<string>('');
  const [licenseopt, setLicenseopt] = useState<number>(0);
  const [basePrice, setBasePrice] = useState<string>('0');
  const [rentPrice, setRentPrice] = useState<string>('0');
  const [royaltyPercentage, setRoyaltyPercentage] = useState<string>('0');
  const [parentId, setParentId] = useState<string>('0');

  const connectWallet = async () => {
    try {
      const provider = await getTheBrowserEth();

      if (!provider) {
        alert('Provider not found! Please install MetaMask.');
        return;
      }

      // Force wallet to show a prompt by requesting accounts
      console.log('Requesting accounts...');
      const accounts = await provider.send('eth_requestAccounts', []);
      console.log('Accounts received:', accounts);

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        console.log('Wallet connected:', accounts[0]);
      } else {
        alert('No accounts found. Please unlock your wallet.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const headerGetterContract = async (callback: ContractCallback) => {
    await getTheContract({
      isConnected,
      contractAddress,
      abi,
      callback,
      setLoading,
    });
  };

  const handleBalanceOf = async () => {
    if (!account) return;

    await headerGetterContract(async (contract: Contract) => {
      const result = await contract.balanceOf(account);
      setBalance(result.toString());
      alert('Balance fetched: ' + result.toString());
    });
  };

  const handleName = async () => {
    await headerGetterContract(async (contract: Contract) => {
      const result = await contract.name();
      setName(result);
      alert('Name fetched: ' + result);
    });
  };

  const handleSymbol = async () => {
    await headerGetterContract(async (contract: Contract) => {
      const result = await contract.symbol();
      setSymbol(result);
      alert('Symbol fetched: ' + result);
    });
  };

  const handleTotalSupply = async () => {
    await headerGetterContract(async (contract: Contract) => {
      const result = await contract.totalSupply();
      setTotalSupply(result.toString());
      alert('Total Supply fetched: ' + result.toString());
    });
  };

  const handleOwner = async () => {
    await headerGetterContract(async (contract: Contract) => {
      const result = await contract.owner();
      setOwner(result);
      alert('Owner address: ' + result);
    });
  };

  const handleRegisterIP = async (data?: {
    title: string;
    description: string;
    category: string;
    fileUpload: string;
    licenseopt: number;
    basePrice: string;
    rentPrice: string;
    royaltyPercentage: string;
    parentIPId?: string;
  }) => {
    await headerGetterContract(async (contract: Contract) => {
      try {
        const ipTitle = data?.title || title;
        const ipDescription = data?.description || description;
        const ipCategory = data?.category || category;
        const ipFileUpload = '';
        const ipLicenseopt =
          data?.licenseopt !== undefined ? data?.licenseopt : licenseopt;
        const ipBasePrice = data?.basePrice || basePrice;
        const ipRentPrice = data?.rentPrice || rentPrice;
        const ipRoyaltyPercentage =
          data?.royaltyPercentage || royaltyPercentage;

        console.log('Final Data Being Sent to Contract:', {
          title: ipTitle,
          description: ipDescription,
          category: ipCategory,
          fileUpload: ipFileUpload,
          licenseopt: ipLicenseopt,
          basePrice: ipBasePrice,
          rentPrice: ipRentPrice,
          royaltyPercentage: ipRoyaltyPercentage,
        });

        try {
          // Make sure these are valid BigInt conversions
          console.log('BigInt conversions:', {
            category: BigInt(ipCategory),
            basePrice: BigInt(ipBasePrice),
            rentPrice: BigInt(ipRentPrice),
            royaltyPercentage: BigInt(ipRoyaltyPercentage),
          });

          // For remixing, we need parentIPId
          if (ipLicenseopt === 4 && !data?.parentIPId) {
            throw new Error('Parent IP ID is required for child remixes');
          }

          const tx = await contract.registerIP(
            ipTitle,
            ipDescription,
            BigInt(ipCategory),
            ipFileUpload,
            ipLicenseopt,
            BigInt(ipBasePrice),
            BigInt(ipRentPrice),
            BigInt(ipRoyaltyPercentage),
            { ...txConfig, gasLimit: 3_000_000 }
          );

          console.log('Transaction submitted:', tx.hash);
          const receipt = await tx.wait();
          console.log('Transaction confirmed:', receipt);
          alert('IP successfully registered!');
        } catch (contractError: any) {
          // Error handling remains the same
        }
      } catch (error: any) {
        // Error handling remains the same
      }
    });
  };

  const handleRemixIP = async () => {
    await headerGetterContract(async (contract: Contract) => {
      const tx = await contract.remixIP(
        title,
        description,
        BigInt(category),
        tag,
        fileUpload,
        BigInt(royaltyPercentage),
        BigInt(parentId),
        txConfig
      );
      await tx.wait();
      alert('IP remix created successfully!');
    });
  };

  const handleBuyIP = async (priceParam?: string) => {
    if (!tokenId) return;

    await headerGetterContract(async (contract: Contract) => {
      try {
        // First get the IP details to know the price
        const ip = await contract.getIP(BigInt(tokenId));

        // Determine which price to use
        let finalPrice;

        if (priceParam) {
          // If a custom price was provided as a human-readable number (like "0.05")
          finalPrice = ethers.parseEther(priceParam);
        } else {
          // Use the contract's price directly - it's already in wei format as BigInt
          finalPrice = ip.basePrice;
        }

        // Correctly format the price for display
        const ethAmount = ethers.formatEther(finalPrice);
        console.log(`Buying IP #${tokenId} for ${ethAmount} ETH`);

        // Pass just the tokenId parameter, and include the price as value
        const tx = await contract.buyIP(BigInt(tokenId), {
          ...txConfig,
          value: finalPrice,
          gasLimit: 3000000,
        });

        await tx.wait();
        alert('IP purchased successfully!');

        // Refresh IP listings after purchase
        handleGetMyIPs();
        handleGetOtherIPs();
      } catch (error) {
        console.error('Error buying IP:', error);
        alert(
          'Error purchasing IP: ' + (error.reason || error.message || error)
        );
      }
    });
  };

  const handleRentIP = async (priceParam?: string, durationParam?: number) => {
    if (!tokenId) return;

    await headerGetterContract(async (contract: Contract) => {
      try {
        // First get the IP details to know the rent price
        const ip = await contract.getIP(BigInt(tokenId));

        // Use the price parameter if provided, otherwise use the IP's rentPrice
        let finalPriceWei;

        if (priceParam) {
          // If price is provided as a string (likely in ETH), convert to wei
          finalPriceWei = ethers.parseEther(priceParam);
        } else {
          // If using the contract's rentPrice, it's already in wei
          // Calculate based on duration if provided
          const baseRentPrice = ip.rentPrice;
          if (durationParam) {
            // Pro-rate the price based on duration
            finalPriceWei =
              (baseRentPrice * BigInt(durationParam)) / BigInt(30);
          } else {
            finalPriceWei = baseRentPrice;
          }
        }

        console.log(
          `Renting IP #${tokenId} for ${ethers.formatEther(finalPriceWei)} ETH`
        );

        // Call rentIP with both required parameters
        const tx = await contract.rentIP(
          BigInt(tokenId),
          finalPriceWei, // Send the calculated price as the contract parameter
          {
            ...txConfig,
            value: finalPriceWei, // Also send the same amount as the transaction value
            gasLimit: 3000000,
          }
        );

        await tx.wait();
        alert('IP rented successfully!');
      } catch (error) {
        console.error('Error renting IP:', error);
        throw error;
      }
    });
  };

  const handleGetIP = async () => {
    if (!tokenId) return;

    await headerGetterContract(async (contract: Contract) => {
      const result = await contract.getIP(BigInt(tokenId));
      setCurrentIP(result);
      alert('IP details fetched successfully');
    });
  };

  const handleGetMyIPs = async () => {
    if (!account) return;

    await headerGetterContract(async (contract: Contract) => {
      const result = await contract.getIPsByOwner(account);
      setMyIPs(result);
      alert('Your IPs fetched successfully');
    });
  };

  const handleGetOtherIPs = async () => {
    if (!account) return;

    await headerGetterContract(async (contract: Contract) => {
      try {
        console.log('Current account:', account);
        const result = await contract.getIPsNotOwnedBy(account);
        console.log('Raw contract result for otherIPs:', result);

        // Check if result is an array-like object with length property
        if (result && typeof result === 'object' && 'length' in result) {
          console.log('Result has length:', result.length);

          // Log a few elements if available
          if (result.length > 0) {
            console.log('First item:', result[0]);
          }
        }

        setOtherIPs(result);
        if (result.length === 0) {
          console.log(
            "No other IPs found - this may be expected if you're the only user"
          );
        } else {
          alert('Other IPs fetched successfully');
        }
      } catch (error) {
        console.error('Error in handleGetOtherIPs:', error);
      }
    });
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        isConnected,
        balance,
        name,
        symbol,
        totalSupply,
        owner,
        connectWallet,

        // IP data
        myIPs,
        otherIPs, // Add this to the provider value
        currentIP,

        // Form values
        tokenId,
        setTokenId,
        title,
        setTitle,
        description,
        setDescription,
        category,
        setCategory,
        tag,
        setTag,
        fileUpload,
        setFileUpload,
        licenseopt,
        setLicenseopt,
        basePrice,
        setBasePrice,
        rentPrice,
        setRentPrice,
        royaltyPercentage,
        setRoyaltyPercentage,
        parentId,
        setParentId,

        // Contract functions
        handleBalanceOf,
        handleName,
        handleSymbol,
        handleTotalSupply,
        handleOwner,
        handleRegisterIP,
        handleRemixIP,
        handleBuyIP,
        handleRentIP,
        handleGetIP,
        handleGetMyIPs,
        handleGetOtherIPs,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
