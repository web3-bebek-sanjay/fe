'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Contract } from 'ethers';
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

  testData: any[];

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
  handleRemixIP: (data?: {
    title: string;
    description: string;
    category: string;
    fileUpload: string;
    parentIPId?: string;
  }) => Promise<void>;
  handleBuyIP: () => Promise<void>;
  handleRentIP: () => Promise<void>;
  handleGetIP: () => Promise<void>;
  handleGetMyIPs: () => Promise<void>;
  handleGetOtherIPs: () => Promise<void>;
  handlegetMyRemix: () => Promise<void>;

  handleGetTestData: () => Promise<void>;
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
  const [myRemix, setMyRemix] = useState<any[]>([]);

  // dummy dta aja
  const [testData, setTestData] = useState<any[]>([]);

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
        alert('Provider not found!');
        return;
      }

      const accounts = await provider.send('eth_requestAccounts', []);
      setAccount(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      alert('Error connecting wallet: ' + error);
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
    tag: string;
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
        const ipTag = data?.tag || tag;
        const ipFileUpload = data?.fileUpload || fileUpload;
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
          tag: ipTag,
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
            ipTag,
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

  const handleRemixIP = async (data?: {
    title: string;
    description: string;
    category: string;
    fileUpload: string;
    parentIPId?: string;
  }) => {
    await headerGetterContract(async (contract: Contract) => {
      try {
        const ipTitle = data?.title || title;
        const ipDescription = data?.description || description;
        const ipCategory = data?.category || category;
        const ipFileUpload = data?.fileUpload || fileUpload;
        const ipParentIPId = data?.parentIPId || parentId;

        console.log('Final Data Being Sent to Contract:', {
          title: ipTitle,
          description: ipDescription,
          category: ipCategory,
          fileUpload: ipFileUpload,
          parentIPId: ipParentIPId,
        });

        // Ensure valid BigInt conversions
        console.log('BigInt conversions:', {
          category: BigInt(ipCategory),
        });

        const tx = await contract.remixIP(
          ipTitle,
          ipDescription,
          BigInt(ipCategory),
          ipFileUpload,
          ipParentIPId ? BigInt(ipParentIPId) : undefined,
          { ...txConfig, gasLimit: 3_000_000 }
        );

        console.log('Transaction submitted:', tx.hash);
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);
        alert('Remix successfully registered!');
      } catch (error: any) {
        console.error('Error in handleRemixIP:', error);
        alert('Failed to register remix. Please try again.');
      }
    });
  };

  const handleBuyIP = async () => {
    if (!tokenId) return;

    await headerGetterContract(async (contract: Contract) => {
      // First get the IP details to know the price
      const ip = await contract.getIP(BigInt(tokenId));
      const price = ip.basePrice;

      const tx = await contract.buyIP(BigInt(tokenId), {
        ...txConfig,
        value: price,
      });
      await tx.wait();
      alert('IP purchased successfully!');
    });
  };

  const handleRentIP = async () => {
    if (!tokenId) return;

    await headerGetterContract(async (contract: Contract) => {
      // First get the IP details to know the rent price
      const ip = await contract.getIP(BigInt(tokenId));
      const price = ip.rentPrice;

      const tx = await contract.rentIP(BigInt(tokenId), {
        ...txConfig,
        value: price,
      });
      await tx.wait();
      alert('IP rented successfully!');
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
      const result = await contract.getIPsNotOwnedBy(account);
      setOtherIPs(result);
      alert('Other IPs fetched successfully');
    });
  };

  const handlegetMyRemix = async () => {
    if (!account) return;

    await headerGetterContract(async (contract: Contract) => {
      const result = await contract.getMyRemix(account);
      setMyRemix(result);
      alert('Your Remix IPs fetched successfully');
    });
  }

  // to use getListRentFromMyIp
  // const handleGetTestData = async () => {
  //   if (!account) return;

  //   await headerGetterContract(async (contract: Contract) => {
  //     const result = await contract.getListRentFromMyIp();
  //     setTestData(result);
  //     alert('Test data fetched successfully');
  //   });
  // }

  const handleGetTestData = async () => {
    if (!account) return;

    await headerGetterContract(async (contract: Contract) => {
      const result = await contract.getListRentFromMyIp();
      setTestData(result);
      alert('Test data fetched successfully');
    });
  }

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

        testData,

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
        handlegetMyRemix,

        handleGetTestData
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
