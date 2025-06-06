// hooks/useRemixIP.ts
import { useIPXContract } from './useIPXContract';

export function useRemixIP() {
  const { getContract } = useIPXContract();

  const remixIP = async (parentId: number) => {
    try {
      const contract = await getContract();
      const ipData = await contract.ips(parentId);

      const tx = await contract.remixIP(
        ipData.title,
        ipData.description,
        ipData.category,
        ipData.tag,
        ipData.fileUpload,
        ipData.royaltyPercentage,
        parentId
      );

      const receipt = await tx.wait();
      alert('IP remixed successfully!');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      console.error(err.message);

      if (err?.code === 'CALL_EXCEPTION') {
        alert(
          'Transaksi gagal: kemungkinan token ID tidak valid atau tidak bisa di-remix.'
        );
      } else {
        alert('Gagal remix NFT. Lihat console untuk detail.');
      }
    }
  };

  return { remixIP };
}
