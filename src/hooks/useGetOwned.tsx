// hooks/useGetNotOwned.ts
import { IPStruct } from "@/lib/app_interface";
import { useIPXContract } from "./useIPXContract";

export function useGetOwned() {
  const { getContract } = useIPXContract();

  const getIPsOwnedBy = async (owner: string) => {
    const ipx = await getContract();
    if (!ipx) return [];
    const ips: IPStruct[] = await ipx.getIPsByOwner(owner);

    return ips;
  };

  return { getIPsOwnedBy };
}