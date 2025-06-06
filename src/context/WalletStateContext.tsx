'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface WalletState {
  account: string | null;
  isConnected: boolean;
  balance: string;
  name: string;
  symbol: string;
  totalSupply: string;
  owner: string;
}

interface WalletStateContextType extends WalletState {
  setAccount: (account: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setBalance: (balance: string) => void;
  setName: (name: string) => void;
  setSymbol: (symbol: string) => void;
  setTotalSupply: (supply: string) => void;
  setOwner: (owner: string) => void;
}

const WalletStateContext = createContext<WalletStateContextType | undefined>(
  undefined
);

export const WalletStateProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [name, setName] = useState<string>('');
  const [symbol, setSymbol] = useState<string>('');
  const [totalSupply, setTotalSupply] = useState<string>('0');
  const [owner, setOwner] = useState<string>('');

  const value = {
    account,
    isConnected,
    balance,
    name,
    symbol,
    totalSupply,
    owner,
    setAccount,
    setIsConnected,
    setBalance,
    setName,
    setSymbol,
    setTotalSupply,
    setOwner,
  };

  return (
    <WalletStateContext.Provider value={value}>
      {children}
    </WalletStateContext.Provider>
  );
};

export const useWalletState = (): WalletStateContextType => {
  const context = useContext(WalletStateContext);
  if (!context) {
    throw new Error('useWalletState must be used within a WalletStateProvider');
  }
  return context;
};
