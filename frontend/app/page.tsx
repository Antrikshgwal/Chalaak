"use client";

import { useState, useEffect } from 'react';
import { WalletConnect } from '@/components/wallet-connect';
import { Dashboard } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { RefreshCw, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWeb3 } from '@/hooks/use-web3';
import { type ProposalData, parseEther } from '@/lib/web3';
import { toast } from 'sonner';

export default function Home() {
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected, account } = useWeb3();

  // Mock data for development - replace with actual contract calls
  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual blockchain calls
      const mockProposals: ProposalData[] = [
        {
          address: '0x1234567890123456789012345678901234567890',
          proposer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          proposal_id: 1,
          is_proposal_active: true,
          target: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          min_amount: parseEther('0.5'),
          max_amount: parseEther('2.0'),
          investor_share: 15,
          current_amount: parseEther('0.8'),
          investors: ['0xabc123', '0xdef456'],
          executed: false,
          profits_distributed: false,
        },
        {
          address: '0x2345678901234567890123456789012345678901',
          proposer: '0x8ba1f109551bD432803012645Hac136c12345678',
          proposal_id: 2,
          is_proposal_active: false,
          target: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
          min_amount: parseEther('1.0'),
          max_amount: parseEther('5.0'),
          investor_share: 20,
          current_amount: parseEther('3.2'),
          investors: ['0xabc123', '0xdef456', '0x789xyz'],
          executed: true,
          profits_distributed: false,
        },
        {
          address: '0x3456789012345678901234567890123456789012',
          proposer: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
          proposal_id: 3,
          is_proposal_active: false,
          target: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
          min_amount: parseEther('0.2'),
          max_amount: parseEther('1.0'),
          investor_share: 10,
          current_amount: parseEther('0.7'),
          investors: ['0xabc123'],
          executed: true,
          profits_distributed: true,
        },
      ];

      setProposals(mockProposals);
      console.log('Proposals loaded:', mockProposals.length);
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
      toast.error('Failed to fetch proposals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Connection status changed:', { isConnected, account });
    if (isConnected) {
      fetchProposals();
    }
  }, [isConnected]);

  console.log('Render state:', { isConnected, account, proposalsCount: proposals.length });

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.header 
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                ProposalDAO
              </h1>
              <p className="text-muted-foreground">
                Decentralized investment proposal platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isConnected && (
              <Button
                variant="outline"
                size="sm"
                onClick={fetchProposals}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
            <WalletConnect />
          </div>
        </motion.header>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
            <strong>Debug:</strong> Connected: {isConnected ? 'Yes' : 'No'}, 
            Account: {account || 'None'}, 
            Proposals: {proposals.length}
          </div>
        )}

        {/* Main Content */}
        {isConnected ? (
          <Dashboard 
            proposals={proposals} 
            onRefresh={fetchProposals}
            isLoading={isLoading}
          />
        ) : (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="max-w-md mx-auto">
              <WalletConnect />
              <div className="mt-8 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Welcome to ProposalDAO
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  A decentralized platform for creating and investing in funding proposals. 
                  Connect your wallet to get started with creating proposals, investing in projects, 
                  and managing your investments.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-sm">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="font-semibold text-blue-900 mb-1">Create Proposals</div>
                    <div className="text-blue-700">Launch funding campaigns for your projects</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="font-semibold text-green-900 mb-1">Invest Securely</div>
                    <div className="text-green-700">Fund promising proposals with smart contracts</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="font-semibold text-purple-900 mb-1">Earn Returns</div>
                    <div className="text-purple-700">Receive your share of profits automatically</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <Toaster position="top-right" richColors />
    </main>
  );
}