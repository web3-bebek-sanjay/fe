import { BrowserProvider, ethers } from 'ethers';
import { GetContractProps } from './types';
import { Contract } from 'ethers';

export const txConfig = {
  gasLimit: 3_000_000,
};

export const getTheBrowserEth = async (): Promise<
  BrowserProvider | undefined
> => {
  if (!window.ethereum) {
    alert('Please install MetaMask!');
    return;
  }

  const provider = new BrowserProvider(window.ethereum);

  return provider;
};

export const getTheContract = async ({
  isConnected,
  contractAddress,
  abi,
  callback,
  setLoading,
}: {
  isConnected: boolean;
  contractAddress: string;
  abi: any[];
  callback: (contract: Contract) => Promise<void>;
  setLoading: (loading: boolean) => void;
}) => {
  try {
    if (!isConnected) {
      console.log('Wallet not connected');
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);

    // Always request a fresh provider connection to ensure MetaMask prompts show
    const provider = await getTheBrowserEth();

    if (!provider) {
      throw new Error('Provider not found');
    }

    console.log('Getting contract with address:', contractAddress);

    // Request accounts to ensure wallet is unlocked
    const accounts = await provider.send('eth_requestAccounts', []);

    // Create the contract instance with the signer
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    console.log('Contract instance created, calling callback');
    await callback(contract);
  } catch (error) {
    console.error('Error in getTheContract:', error);
    alert(`Error: ${error.message || 'Unknown error occurred'}`);
  } finally {
    setLoading(false);
  }
};
