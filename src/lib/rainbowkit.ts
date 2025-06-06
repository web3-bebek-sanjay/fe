import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

// Create wagmi config using the new API
export const wagmiConfig = getDefaultConfig({
  appName: 'IPX',
  projectId: 'YOUR_PROJECT_ID', // Get this from WalletConnect Cloud
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});

export const chains = [mainnet, sepolia];
export { RainbowKitProvider };
