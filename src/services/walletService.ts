import type { WalletInfo } from '@/types';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants';

export class WalletService {
  private static instance: WalletService;

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  async connectWallet(): Promise<WalletInfo | null> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      const balance = await this.getBalance(address);
      const chainId = await this.getChainId();

      const walletInfo: WalletInfo = {
        address,
        balance,
        chainId,
        isConnected: true,
      };

      this.saveConnectionState(walletInfo);
      return walletInfo;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        return '0';
      }

      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });

      // Convert from wei to ether
      return (parseInt(balance, 16) / 1e18).toFixed(4);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  async getChainId(): Promise<number> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        return 1; // Default to mainnet
      }

      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      return parseInt(chainId, 16);
    } catch (error) {
      console.error('Failed to get chain ID:', error);
      return 1;
    }
  }

  async switchNetwork(chainId: number): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });

      return true;
    } catch (error) {
      console.error('Failed to switch network:', error);
      return false;
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      this.clearConnectionState();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }

  getStoredWalletInfo(): WalletInfo | null {
    try {
      if (typeof window === 'undefined') return null;

      const stored = localStorage.getItem('ipx-wallet-connection');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get stored wallet info:', error);
      return null;
    }
  }

  private saveConnectionState(walletInfo: WalletInfo): void {
    try {
      if (typeof window === 'undefined') return;

      localStorage.setItem('ipx-wallet-connection', JSON.stringify(walletInfo));
    } catch (error) {
      console.error('Failed to save connection state:', error);
    }
  }

  private clearConnectionState(): void {
    try {
      if (typeof window === 'undefined') return;

      localStorage.removeItem('ipx-wallet-connection');
    } catch (error) {
      console.error('Failed to clear connection state:', error);
    }
  }

  onAccountsChanged(callback: (accounts: string[]) => void): () => void {
    if (typeof window === 'undefined' || !window.ethereum) {
      return () => {};
    }

    window.ethereum.on('accountsChanged', callback);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', callback);
      }
    };
  }

  onChainChanged(callback: (chainId: string) => void): () => void {
    if (typeof window === 'undefined' || !window.ethereum) {
      return () => {};
    }

    window.ethereum.on('chainChanged', callback);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('chainChanged', callback);
      }
    };
  }
}

// Create a singleton instance
export const walletService = WalletService.getInstance();
