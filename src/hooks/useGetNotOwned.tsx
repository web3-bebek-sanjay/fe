// hooks/useGetNotOwned.ts
import { useIPXContract } from "./useIPXContract";

interface IPStruct {
  title: string;
  description: string;
  category: bigint;
  tag: string;
  fileUpload: string;
  licenseopt: number;
  basePrice: bigint;
  rentPrice: bigint;
  royaltyPercentage: bigint;
  owner: string;
}

export function useGetNotOwned() {
  const { getContract } = useIPXContract();

  const getIPsNotOwnedBy = async (owner: string) => {
    const ipx = await getContract();
    if (!ipx) return [];
    const ips: IPStruct[] = await ipx.getIPsNotOwnedBy(owner);

    return ips;
  };

  return { getIPsNotOwnedBy };
}