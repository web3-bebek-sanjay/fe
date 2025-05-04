import { Contract } from 'ethers';

export type ABIBos = {
  name: string;
  type: string;
  inputs: {
    name: string;
    type: string;
    internalType: string;
    indexed?: boolean;
    components?: {
      name: string;
      type: string;
      internalType: string;
    }[];
  }[];
  outputs?: {
    name: string;
    type: string;
    internalType: string;
    components?: {
      name: string;
      type: string;
      internalType: string;
    }[];
  }[];
  stateMutability?: string;
  anonymous?: boolean;
};

export type ABI = ABIBos[];

export type ContractCallback = (contract: Contract) => Promise<void>;

export type ContractType = {
  name: "IPX";
  address: string;
  abi: ABI;
};

export interface GetContractProps {
  isConnected: boolean;
  contractAddress: string;
  abi: ABI;
  callback: ContractCallback;
  setLoading: (loading: boolean) => void;
}
