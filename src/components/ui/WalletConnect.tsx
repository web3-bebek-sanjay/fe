'use client';

import { useState } from 'react';
import { Button } from './button';
import { WalletIcon } from 'lucide-react';
import { useWallet } from '@/context/WalletContext'; // Use your custom wallet context

export const WalletConnect = () => {
  const { account, isConnected, connectWallet } = useWallet(); // Use your wallet context
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return isConnected && account ? (
    <Button variant="outline" className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-green-500"></div>
      <span className="hidden sm:inline">{formatAddress(account)}</span>
      <span className="sm:hidden">{formatAddress(account, 3)}</span>
    </Button>
  ) : (
    <Button
      variant="default"
      className="flex items-center gap-2"
      onClick={handleConnect}
      disabled={isConnecting}
    >
      <WalletIcon size={16} />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
};

// Add this utility function if you don't have it already
// filepath: /Users/quereda/Desktop/Kulyeah/Lomba/FE/src/lib/utils.ts
export const formatAddress = (address: string, chars = 4) => {
  if (!address) return '';
  const start = address.substring(0, chars);
  const end = address.substring(address.length - chars);
  return `${start}...${end}`;
};
