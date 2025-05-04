// hooks/useBuyIP.ts
import { IPX_ABI, IPX_ADDRESS } from "@/utils/constants";
import { ethers } from "ethers";

export function useBuyIP() {
  const buyIP = async (tokenId: number): Promise<void> => {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(IPX_ADDRESS, IPX_ABI, signer);
      const userAddress = await signer.getAddress();

      const balance = await provider.getBalance(userAddress);
      const ipData = await contract.ips(tokenId);
      const basePrice = ipData.basePrice;

      console.log("NFT price in wei:", basePrice.toString());
      console.log("Your balance:", ethers.formatEther(balance), "ETH");

      if (balance < basePrice) {
        alert("Saldo tidak cukup untuk membeli NFT ini");
        return;
      }

      const tx = await contract.buyIP(tokenId, { value: basePrice });
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      alert("IP purchased successfully!");
    } catch (err: any) {
      console.error(err);
      if (err?.code === "CALL_EXCEPTION") {
        alert("Transaksi gagal: kemungkinan token ID tidak valid atau sudah dibeli.");
      } else if (err?.code === "INSUFFICIENT_FUNDS") {
        alert("Saldo tidak mencukupi untuk gas dan pembelian.");
      } else {
        alert(`Gagal beli NFT. ${err.message}`);
      }
    }
  };

  return { buyIP };
}
