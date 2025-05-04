// hooks/useRemixList.ts
import { useState } from "react";
import { useIPXContract } from "./useIPXContract";
import { ethers } from "ethers";

export function useRemixList() {
  const { getContract } = useIPXContract();
  const [remixList, setRemixList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getMyIPRemix = async (parentTokenId: number) => {
    try {
      setLoading(true);
      const contract = await getContract();

      const results = await contract.getMyIPsRemix(parentTokenId);

      const formatted = results.map((item: any, index: number) => ({
        index,
        title: item.ip.title,
        description: item.ip.description,
        owner: item.ip.owner,
        category: item.ip.category,
        tag: item.ip.tag,
        file: item.ip.fileUpload,
        licenseopt: item.ip.licenseopt.toString(),
        basePrice: ethers.formatEther(item.ip.basePrice),
        rentPrice: ethers.formatEther(item.ip.rentPrice),
        royalty: item.ip.royaltyPercentage,
        parentId: item.parentId,
      }));

      setRemixList(formatted);
    } catch (error: any) {
      console.error("Error fetching remix list:", error.message);
      alert("Gagal mengambil daftar remix.");
    } finally {
      setLoading(false);
    }
  };

  return {
    remixList,
    loading,
    getMyIPRemix,
  };
}
