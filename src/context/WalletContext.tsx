'use client';

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import { Contract, ethers } from 'ethers';
import { getContract } from '@/contracts/contract';

import { getTheBrowserEth, getTheContract, txConfig } from '@/contracts/fetch';
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

export type ContractCallback = (contract: Contract) => Promise<void>;

export interface WalletContextType {
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
  otherIPs: any[];
  currentIP: any;
  ipsAvailableForRemix: any[];
  myRemixes: any[];

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
  handleRemixIP: (data?: {
    title: string;
    description: string;
    category: string;
    fileUpload: string;
    parentIPId?: string;
  }) => Promise<void>;
  handleBuyIP: (price?: string, specificTokenId?: string) => Promise<void>;
  handleRentIP: (
    price?: string,
    duration?: number,
    specificTokenId?: string
  ) => Promise<void>;
  handleGetIP: () => Promise<void>;
  handleGetMyIPs: () => Promise<void>;
  handleGetOtherIPs: () => Promise<void>;
  handleGetIPsAvailableForRemix: () => Promise<void>;
  handleGetMyRemixes: (
    forceRefresh?: boolean,
    customRemixes?: any[]
  ) => Promise<void>;

  // Additional royalty management functions
  handleGetRentalsFromMyIP: () => Promise<void>;
  handleGetRemixesOfMyIP: (parentTokenId: string) => Promise<void>;
  handleClaimRoyalty: (tokenId: string) => Promise<void>;
  rentalsByIP: any[];
  remixesByParentIP: any[];

  // Add headerGetterContract to the interface
  headerGetterContract: (callback: ContractCallback) => Promise<void>;

  // Add depositRoyalty function
  handleDepositRoyalty: (remixTokenId: string, amount: string) => Promise<void>;
}

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
  const [ipsAvailableForRemix, setIPsAvailableForRemix] = useState<any[]>([]);
  const [isLoadingRemixIPs, setIsLoadingRemixIPs] = useState(false);
  const [remixIPsLoaded, setRemixIPsLoaded] = useState(false);

  // First, add a new state variable for storing remixes
  const [myRemixes, setMyRemixes] = useState<any[]>([]);
  const [isLoadingMyRemixes, setIsLoadingMyRemixes] = useState(false);
  const [myRemixesLoaded, setMyRemixesLoaded] = useState(false);

  // Add state for rental and remix data
  const [rentalsByIP, setRentalsByIP] = useState<any[]>([]);
  const [remixesByParentIP, setRemixesByParentIP] = useState<any[]>([]);

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

          const receipt = await tx.wait();
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

        const receipt = await tx.wait();
        alert('Remix successfully registered!');
      } catch (error: any) {
        alert('Failed to register remix. Please try again.');
      }
    });
  };

  const handleBuyIP = async (priceParam?: string, specificTokenId?: string) => {
    // Use provided token ID if available, otherwise use state
    const currentTokenId = specificTokenId || tokenId;

    if (!currentTokenId) {
      return;
    }

    console.log('Buy function called with:', {
      tokenId: currentTokenId,
      priceParam,
    });

    await headerGetterContract(async (contract: Contract) => {
      try {
        // First verify the token actually exists
        try {
          const owner = await contract.ownerOf(BigInt(currentTokenId));
          console.log(
            `Token #${currentTokenId} exists and is owned by ${owner}`
          );
        } catch (error) {
          console.error(error);
          return;
        }

        // Now get the IP details to know the price
        const ip = await contract.getIP(BigInt(currentTokenId));
        console.log(`Retrieved IP data for token #${currentTokenId}:`, ip);

        // Debugging output to see exact structure
        console.log('BasePrice raw value:', ip.basePrice);
        console.log('BasePrice type:', typeof ip.basePrice);
        console.log('Price at index 6:', ip[6]);

        // Extract price properly, handling different return types
        const extractPrice = (ipData: any): bigint => {
          // Log the full structure for debugging
          console.log('IP data structure for price extraction:', ipData);

          // If direct property access works (object format)
          if (ipData.basePrice !== undefined) {
            console.log('Using object.basePrice:', ipData.basePrice);
            return ipData.basePrice;
          }
          // If array-like access is needed (some contract returns)
          else if (ipData[6] !== undefined) {
            console.log('Using array index 6:', ipData[6]);
            return ipData[6];
          }
          // If we can't find it but see the value in the log, try a direct path
          else {
            console.log('Could not find basePrice, using fallback value');
            return BigInt('1000000000000000'); // 0.001 ETH fallback
          }
        };

        // Get the price from the IP data
        const basePrice = extractPrice(ip);
        console.log('Extracted basePrice:', basePrice);

        // Determine final price
        let finalPrice;
        if (priceParam) {
          finalPrice = ethers.parseEther(priceParam);
          console.log('Using provided price parameter:', finalPrice);
        } else {
          finalPrice = basePrice;
          console.log('Using extracted basePrice:', finalPrice);
        }

        // Safeguard against zero price
        if (finalPrice.toString() === '0') {
          console.warn('Price was zero! Using fallback price instead');
          finalPrice = BigInt('1000000000000000'); // 0.001 ETH
        }

        // Correctly format the price for display
        const ethAmount = ethers.formatEther(finalPrice);
        console.log(
          `Buying IP #${currentTokenId} for ${ethAmount} ETH (${finalPrice} wei)`
        );

        // Pass just the tokenId parameter, and include the price as value
        const tx = await contract.buyIP(BigInt(currentTokenId), {
          ...txConfig,
          value: finalPrice,
          gasLimit: 3000000,
        });

        const receipt = await tx.wait();

        // Refresh IP listings after purchase
        handleGetMyIPs();
        handleGetOtherIPs();
      } catch (error: any) {
        // Provide more detailed error message
        if (error.reason) {
        } else if (
          error.message &&
          error.message.includes('invalid token ID')
        ) {
        } else {
        }
      }
    });
  };

  // Add this function before your handleRentIP function

  // Helper function to check if an IP is rentable
  const isIPRentable = (ip: any): boolean => {
    // Check both object and array access patterns
    const licenseType = ip.licenseopt !== undefined ? ip.licenseopt : ip[5];

    // Convert BigInt to Number if needed
    const licenseValue =
      typeof licenseType === 'bigint'
        ? Number(licenseType)
        : Number(licenseType);

    // License types 1 and 2 are rentable
    return licenseValue === 1 || licenseValue === 2;
  };

  const handleRentIP = async (
    priceParam?: string,
    durationParam?: number,
    specificTokenId?: string
  ) => {
    // Use provided token ID if available, otherwise use state
    const currentTokenId = specificTokenId || tokenId;

    if (!currentTokenId) {
      console.error('No token ID provided for rental');
      alert('Error: No token ID provided for rental');
      return;
    }

    console.log('Rent function called with:', {
      tokenId: currentTokenId,
      priceParam,
      durationParam,
    });

    await headerGetterContract(async (contract: Contract) => {
      try {
        // First verify the token actually exists
        try {
          const owner = await contract.ownerOf(BigInt(currentTokenId));
          console.log(
            `Token #${currentTokenId} exists and is owned by ${owner}`
          );
        } catch (error) {
          console.error(
            `Token #${currentTokenId} does not exist or cannot be queried:`,
            error
          );
          alert(
            `Error: Token ID ${currentTokenId} is invalid or does not exist`
          );
          return;
        }

        // Now get the IP details
        console.log(`Getting IP with ID: ${currentTokenId}`);
        const ip = await contract.getIP(BigInt(currentTokenId));
        console.log('IP data retrieved:', ip);

        // Check if license allows for renting (types 1 or 2)
        if (!isIPRentable(ip)) {
          // Get the actual license type value for the message
          const licenseType =
            typeof ip.licenseopt === 'bigint'
              ? Number(ip.licenseopt)
              : Number(ip.licenseopt);

          alert(
            `This IP has license type ${licenseType} which does not allow renting.`
          );
          return;
        }

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

        console.log('TokenId for rent:', currentTokenId);
        console.log('Price in Wei:', finalPriceWei.toString());
        console.log('Price in ETH:', ethers.formatEther(finalPriceWei));

        const owner = await contract.ownerOf(BigInt(currentTokenId));
        if (account && owner.toLowerCase() === account.toLowerCase()) {
          return;
        }

        // Call rentIP with exactly the parameters the contract expects
        console.log('Sending rent transaction with params:', {
          tokenId: currentTokenId,
          finalPriceWei: finalPriceWei.toString(),
          value: finalPriceWei.toString(),
        });

        const tx = await contract.rentIP(
          BigInt(currentTokenId), // First parameter: tokenId as BigInt
          finalPriceWei, // Second parameter: finalprice as BigInt
          {
            ...txConfig,
            value: finalPriceWei, // The ETH value to send
            gasLimit: 5000000, // Increased gas limit for complex transaction
          }
        );
        const receipt = await tx.wait();
      } catch (error: any) {
        // Enhanced error reporting
        if (error.reason) {
        } else if (
          error.message &&
          error.message.includes('invalid token ID')
        ) {
          alert('Error: Invalid Token ID. This token may not exist.');
        } else if (error.data) {
          alert(`Rental failed with data: ${error.data}`);
        } else {
          alert('Rental transaction failed. Please check console for details.');
        }
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
    });
  };

  const handleGetOtherIPs = async () => {
    if (!account) return;

    await headerGetterContract(async (contract: Contract) => {
      try {
        const result = await contract.getIPsNotOwnedBy(account);

        if (result && typeof result === 'object' && 'length' in result) {
          const enhancedIPs = await Promise.all(
            result.map(async (ip: any, index: number) => {
              try {
                // Get token ID by querying ownerToTokenIds for this owner
                const ownerBalance = await contract.balanceOf(ip.owner);

                // Loop through all tokens of this owner to find matching IP
                for (let i = 0; i < Number(ownerBalance); i++) {
                  const tokenId = await contract.ownerToTokenIds(ip.owner, i);
                  // Verify this is the correct IP by title and description matching
                  const ipDetails = await contract.getIP(tokenId);

                  if (
                    ipDetails.title === ip.title &&
                    ipDetails.description === ip.description
                  ) {
                    // We found the matching token ID

                    return {
                      ...ip,
                      tokenId: tokenId.toString(),
                    };
                  }
                }
                return ip;
              } catch (error) {
                return ip;
              }
            })
          );

          setOtherIPs(enhancedIPs);
        } else {
          setOtherIPs([]);
        }

        if (result.length === 0) {
          console.log(
            "No other IPs found - this may be expected if you're the only user"
          );
        }
      } catch (error) {
        console.error('Error in handleGetOtherIPs:', error);
      }
    });
  };

  const handleGetIPsAvailableForRemix = async () => {
    if (!account) return;

    // Prevent duplicate fetches
    if (isLoadingRemixIPs || remixIPsLoaded) {
      console.log('Already loading or loaded remix IPs, skipping fetch');
      return;
    }

    setIsLoadingRemixIPs(true);

    await headerGetterContract(async (contract: Contract) => {
      try {
        console.log('Fetching IPs available for remix for account:', account);
        const result = await contract.getIPsNotOwnedByRemix(account);
        console.log('Raw contract result for IPs available for remix:', result);

        // Store the result in a new state variable
        setIPsAvailableForRemix(result);
        setRemixIPsLoaded(true);

        if (result.length === 0) {
          console.log('No IPs available for remix');
        } else {
          console.log(`Found ${result.length} IPs available for remix`);
        }
      } catch (error) {
        console.error('Error fetching IPs available for remix:', error);
        alert('Failed to fetch IPs available for remix. Please try again.');
      } finally {
        setIsLoadingRemixIPs(false);
      }
    });
  };

  const handleGetMyRemixes = async (
    forceRefresh = false,
    customRemixes?: any[]
  ) => {
    if (!account) return;

    // Allow skipping the check if forceRefresh is true
    if (!forceRefresh && (isLoadingMyRemixes || myRemixesLoaded)) {
      console.log('Already loading or loaded my remixes, skipping fetch');
      return;
    }

    setIsLoadingMyRemixes(true);

    if (customRemixes && customRemixes.length > 0) {
      // Use the custom remixes provided by the caller
      setMyRemixes(customRemixes);
      setMyRemixesLoaded(true);
      setIsLoadingMyRemixes(false);
      return;
    }

    await headerGetterContract(async (contract: Contract) => {
      try {
        console.log('Fetching my remixes for account:', account);
        const result = await contract.getMyRemix(account);
        console.log('Raw contract result for my remixes:', result);

        // Store the result in state variable
        setMyRemixes(result);
        setMyRemixesLoaded(true);

        if (result.length === 0) {
          console.log('No remixes found for your account');
        } else {
          console.log(`Found ${result.length} remixes for your account`);
          // Log some details of the first remix for debugging
          if (result[0] && result[0].ip) {
            console.log('First remix title:', result[0].ip.title);
            console.log('Parent IP ID:', result[0].parentId.toString());
          }
        }
      } catch (error) {
        console.error('Error fetching my remixes:', error);
        alert('Failed to fetch your remixes. Please try again.');
      } finally {
        setIsLoadingMyRemixes(false);
      }
    });
  };

  // Get all rentals from IPs owned by the current account
  const handleGetRentalsFromMyIP = async () => {
    if (!account) return;

    await headerGetterContract(async (contract: Contract) => {
      try {
        console.log('Fetching rentals from my IPs for account:', account);
        const result = await contract.getListRentFromMyIp();
        console.log('Raw contract result for rentals from my IPs:', result);

        // Store the result in state
        setRentalsByIP(result);

        if (result.length === 0) {
          console.log('No rentals found for your IPs');
        } else {
          console.log(`Found ${result.length} rentals of your IPs`);
        }
      } catch (error) {
        console.error('Error fetching rentals from my IPs:', error);
        alert('Failed to fetch rentals. Please try again.');
      }
    });
  };

  // Get remixes of a specific IP owned by the current account
  const handleGetRemixesOfMyIP = async (parentTokenId: string) => {
    if (!account || !parentTokenId) return;

    await headerGetterContract(async (contract: Contract) => {
      try {
        console.log(`Fetching remixes of IP #${parentTokenId}`);

        // Use getMyIPsRemix instead of the previous method
        // This will get all remixes where the specified IP is the parent
        const result = await contract.getMyIPsRemix(account);
        console.log(`Raw contract result for remixes:`, result);

        // Filter remixes to only include those with the specified parentId
        const filteredRemixes = result.filter(
          (remix: any) =>
            remix.parentId && remix.parentId.toString() === parentTokenId
        );

        console.log(
          `Filtered ${filteredRemixes.length} remixes with parentId ${parentTokenId}`
        );

        // Store the filtered result in state
        setRemixesByParentIP(filteredRemixes);
      } catch (error) {
        console.error(`Error fetching remixes of IP #${parentTokenId}:`, error);
        alert('Failed to fetch remixes. Please try again.');
      }
    });
  };

  // Claim royalties for a specific token ID
  const handleClaimRoyalty = async (tokenId: string) => {
    if (!account || !tokenId) return;

    await headerGetterContract(async (contract: Contract) => {
      try {
        console.log(`Claiming royalty for token ID ${tokenId}`);

        // First, check the pending royalty amount
        const [pending, claimed] = await contract.getRoyalty(BigInt(tokenId));
        console.log(
          `Pending royalty: ${ethers.formatEther(
            pending
          )} ETH, Previously claimed: ${ethers.formatEther(claimed)} ETH`
        );

        if (pending.toString() === '0') {
          alert('No royalties available to claim for this IP');
          return;
        }

        // Execute the claim transaction
        const tx = await contract.claimRoyalty(BigInt(tokenId), {
          ...txConfig,
          gasLimit: 3000000,
        });

        const receipt = await tx.wait();
        console.log('Royalty claim transaction confirmed:', receipt);
        alert(
          `Successfully claimed ${ethers.formatEther(pending)} ETH in royalties`
        );
      } catch (error) {
        console.error('Error claiming royalty:', error);
        alert('Failed to claim royalty. Please try again.');
      }
    });
  };

  const handleDepositRoyalty = async (remixTokenId: string, amount: string) => {
    if (!remixTokenId || !amount) {
      alert('Please provide a remix token ID and royalty amount');
      return;
    }

    console.log(
      `Starting deposit process for remix #${remixTokenId} with amount ${amount} ETH`
    );

    // Add this explicit conversion and validation
    let tokenIdBigInt;
    try {
      tokenIdBigInt = BigInt(remixTokenId);
      console.log(`Converted remixTokenId to BigInt: ${tokenIdBigInt}`);
    } catch (e) {
      console.error('Error converting remixTokenId to BigInt:', e);
      alert(`Invalid remix token ID: ${remixTokenId}`);
      return;
    }

    await headerGetterContract(async (contract: Contract) => {
      try {
        const weiAmount = ethers.parseEther(amount);
        console.log(
          `Depositing ${amount} ETH (${weiAmount} wei) as royalty payment for remix #${remixTokenId}`
        );

        // Call the contract function with the proper parameters
        const tx = await contract.depositRoyalty(tokenIdBigInt, {
          ...txConfig,
          value: weiAmount,
          gasLimit: 3000000,
        });

        console.log('Transaction sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('Royalty deposit transaction confirmed:', receipt);
        alert(
          `Successfully deposited ${amount} ETH as royalty for remix #${remixTokenId}`
        );
      } catch (error: any) {
        console.error('Error depositing royalty:', error);

        // Add more detailed logging to help diagnose the issue
        if (error.transaction) {
          console.error('Transaction details:', error.transaction);
        }

        // Enhanced error handling
        if (error.message) {
          if (error.message.includes('user rejected')) {
            alert('Transaction was rejected by the user.');
          } else if (error.message.includes('insufficient funds')) {
            alert(
              'Insufficient funds in your wallet to complete this transaction.'
            );
          } else if (error.message.includes('execution reverted')) {
            alert(
              'Contract execution reverted. This may happen if the token ID is invalid or you cannot deposit for this remix.'
            );
          } else {
            alert(`Failed to deposit royalty: ${error.message}`);
          }
        } else {
          alert('Failed to deposit royalty. Please try again.');
        }
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
        otherIPs,
        currentIP,
        ipsAvailableForRemix,
        myRemixes,

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
        handleGetIPsAvailableForRemix,
        handleGetMyRemixes,

        // Add new functions to the context
        handleGetRentalsFromMyIP,
        handleGetRemixesOfMyIP,
        handleClaimRoyalty,
        rentalsByIP,
        remixesByParentIP,

        // Add headerGetterContract to the context
        headerGetterContract,

        handleDepositRoyalty,
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
