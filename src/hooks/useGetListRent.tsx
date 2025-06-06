// hooks/useRentList.ts
import { useState } from 'react';
import { useIPXContract } from './useIPXContract';

export function useRentList() {
  const { getContract } = useIPXContract();
  const [rentList, setRentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getListRent = async (userAddress: string) => {
    try {
      setLoading(true);
      const contract = await getContract();
      const signer = contract.runner; // ethers v6

      const rentListRaw = await contract.getListRent(userAddress);

      const formatted = rentListRaw.map((rent: any, index: number) => ({
        index,
        renter: rent.renter,
        expiresAt: new Date(Number(rent.expiresAt) * 1000).toLocaleString(),
      }));

      setRentList(formatted);
    } catch (error: any) {
      console.error('Failed to fetch rent list:', error.message);
      // alert("Gagal mengambil daftar sewa. Lihat console.");
    } finally {
      setLoading(false);
    }
  };

  return {
    rentList,
    loading,
    getListRent,
  };
}
