"use client";

import { useState, useEffect, useCallback } from 'react';
import { connectWallet, getProvider } from '@/lib/web3';

export const useWeb3 = () => {
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const connect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const address = await connectWallet();
      setAccount(address);
      setIsConnected(true);
      console.log('Wallet connected:', address);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to connect wallet:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount('');
    setIsConnected(false);
    setError('');
    console.log('Wallet disconnected');
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            console.log('Existing connection found:', accounts[0]);
          }
        } catch (err) {
          console.error('Failed to check existing connection:', err);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('Accounts changed:', accounts);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          disconnect();
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [disconnect]);

  return {
    account,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
  };
};