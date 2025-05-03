// hooks/useGetNotOwned.ts
import { useIPXContract } from "./useIPXContract";

export function useGetNotOwned() {
  const { getContract } = useIPXContract();

  const getIPsNotOwnedBy = async (owner: string) => {
    const ipx = await getContract();
    if (!ipx) return [];
    return await ipx.getIPsNotOwnedBy(owner);
  };

  return { getIPsNotOwnedBy };
}