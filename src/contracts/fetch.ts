import { BrowserProvider } from 'ethers';
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
}: GetContractProps): Promise<void> => {
  try {
    setLoading(true);

    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    const provider = await getTheBrowserEth();

    if (!provider) {
      alert('Provider not found!');
      return;
    }

    const signer = await provider.getSigner();
    const contract = new Contract(contractAddress, abi, signer);

    await callback(contract);
  } catch (error) {
    alert('Error fetching contract: ' + error);
  } finally {
    setLoading(false);
  }
};
