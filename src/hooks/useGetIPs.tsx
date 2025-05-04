// hooks/useGetIPs.ts
import { useIPXContract } from "./useIPXContract";

export function useGetIPs() {
  const { getContract } = useIPXContract();

  const getIPsByOwner = async (owner: string) => {
    const ipx = await getContract();
    if (!ipx) return [];
    return await ipx.getIPsByOwner(owner);
  };

  return { getIPsByOwner };
}