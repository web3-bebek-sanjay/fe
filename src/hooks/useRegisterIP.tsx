import { useState } from 'react';
import { ethers } from 'ethers';
import { IPX_ABI, IPX_ADDRESS } from "@/utils/constants";

const pharosDevnet = {
    id: 50002,
    name: "PharosDevnet",
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
    },
    rpcUrls: {
      default: {
        http: ["https://devnet.dplabs-internal.com"],
        webSocket: ["wss://devnet.dplabs-internal.com"],
      },
    },
    blockExplorers: {
      default: { name: "Explorer", url: "https://pharosscan.xyz/" },
    },
  };

const useRegisterIP = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerIP = async (
    title: string,
    description: string,
    category: number,
    tag: string,
    fileUpload: string,
    licenseopt: number,
    basePrice: number,
    rentPrice: number,
    royaltyPercentage: number,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create a new contract instance
      const provider = new ethers.BrowserProvider(window.ethereum, {
            chainId: pharosDevnet.id,
            name: pharosDevnet.name,
            // rpcUrls: pharosDevnet.rpcUrls.default.http,
          });
          const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(IPX_ADDRESS, IPX_ABI, signer);

      // Call registerIP function on the smart contract
      const tx = await contract.registerIP(
        title,
        description,
        category,
        tag,
        fileUpload,
        licenseopt,
        basePrice,
        rentPrice,
        royaltyPercentage
      );

      // Wait for the transaction to be mined
      await tx.wait();

      return tx;
    } catch (err) {
      console.error(err);
      setError('Failed to register IP.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { registerIP, isLoading, error };
};

export default useRegisterIP;
