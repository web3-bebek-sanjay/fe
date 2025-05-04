// hooks/useRentIP.ts
import { useIPXContract } from "./useIPXContract";
import { ethers } from "ethers";

export function useRentIP() {
  const { getContract } = useIPXContract();

  const rentIP = async (tokenId: number) => {
    try {
      const ipx = await getContract();
      if (!ipx) throw new Error("Wallet not connected");

      const ipData = await ipx.ips(tokenId);
      const rentPrice = ipData.rentPrice;

      const tx = await ipx.rentIP(tokenId, { value: rentPrice });
      await tx.wait();

      return { success: true };
    } catch (error) {
      console.error("Gagal menyewa:", error);
      return { success: false, error };
    }
  };

  return { rentIP };
}