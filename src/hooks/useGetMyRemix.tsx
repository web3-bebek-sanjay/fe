// hooks/useGetMyRemix.ts
import { useIPXContract } from "./useIPXContract";

export function useGetMyRemix() {
  const { getContract } = useIPXContract();

  const getMyRemix = async (owner: string) => {
    const ipx = await getContract();
    if (!ipx) return [];
    return await ipx.getMyRemix(owner);
  };

  return { getMyRemix };
}