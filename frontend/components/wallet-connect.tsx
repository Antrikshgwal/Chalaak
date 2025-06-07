"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWeb3 } from '@/hooks/use-web3';
import { Wallet, Copy, LogOut, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export const WalletConnect = () => {
  const { account, isConnected, isLoading, error, connect, disconnect } = useWeb3();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== 'undefined' && window.ethereum;

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-4">
              Connect your MetaMask wallet to start interacting with proposals
            </p>
            
            {!isMetaMaskInstalled && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <div className="flex items-center gap-2 text-orange-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">MetaMask not detected</span>
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  Please install MetaMask to continue
                </p>
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            
            {isMetaMaskInstalled ? (
              <Button 
                onClick={connect} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            ) : (
              <Button 
                onClick={() => window.open('https://metamask.io/download/', '_blank')}
                className="w-full"
              >
                Install MetaMask
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
        Connected
      </Badge>
      <Card className="bg-muted/50">
        <CardContent className="p-3 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{formatAddress(account)}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyAddress}
            className="h-6 w-6 p-0"
          >
            <Copy className="h-3 w-3" />
          </Button>
          {copied && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-xs text-green-600"
            >
              Copied!
            </motion.span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={disconnect}
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          >
            <LogOut className="h-3 w-3" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};