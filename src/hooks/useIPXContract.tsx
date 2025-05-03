// hooks/useIPXContract.ts
import { useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { IPX_ABI, IPX_ADDRESS } from "@/utils/constants";

export function useIPXContract() {
  const { data: walletClient } = useWalletClient();

  const getContract = async () => {
    if (!walletClient) return null;
    const provider = new ethers.BrowserProvider(walletClient.transport);
    const signer = await provider.getSigner();
    return new ethers.Contract(IPX_ADDRESS, IPX_ABI, signer);
  };

  return { getContract };
}