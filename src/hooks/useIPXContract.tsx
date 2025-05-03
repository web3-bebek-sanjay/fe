// hooks/useIPXContract.ts
import { useWalletClient } from "wagmi";
import { ethers } from "ethers";
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

export function useIPXContract() {
  const { data: walletClient } = useWalletClient();

  const getContract = async () => {
    // const provider = new ethers.BrowserProvider(window.ethereum);
    const provider = new ethers.BrowserProvider(window.ethereum, {
      chainId: pharosDevnet.id,
      name: pharosDevnet.name,
      rpcUrls: pharosDevnet.rpcUrls.default.http,
    });
    const signer = await provider.getSigner();

    return new ethers.Contract(IPX_ADDRESS, IPX_ABI, signer);
  };


  return { getContract };
}