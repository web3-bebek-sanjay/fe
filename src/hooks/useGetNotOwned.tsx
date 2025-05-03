// hooks/useGetNotOwned.ts
import { IPStruct } from "@/lib/app_interface";
import { useIPXContract } from "./useIPXContract";

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