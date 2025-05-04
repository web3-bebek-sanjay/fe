// hooks/useGetNonRemix.ts
import { useIPXContract } from "./useIPXContract";

export function useGetNonRemix() {
  const { getContract } = useIPXContract();

  const getNonRemix = async (owner: string) => {
    const ipx = await getContract();
    if (!ipx) return [];
    return await ipx.get_non_remix(owner);
  };

  return { getNonRemix };
}