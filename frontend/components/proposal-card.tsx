"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Target, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  ExternalLink,
  ArrowUpCircle,
  Gift
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getProposalContract, formatEther, parseEther, type ProposalData } from '@/lib/web3';
import { useWeb3 } from '@/hooks/use-web3';
import { toast } from 'sonner';

interface ProposalCardProps {
  proposal: ProposalData;
  onUpdate?: () => void;
}

export const ProposalCard = ({ proposal, onUpdate }: ProposalCardProps) => {
  const [isInvesting, setIsInvesting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);
  const [investAmount, setInvestAmount] = useState('');
  const [userInvestment, setUserInvestment] = useState('0');
  const [canDistribute, setCanDistribute] = useState(false);
  const { account, isConnected } = useWeb3();

  const progressPercentage = (parseFloat(formatEther(proposal.current_amount)) / parseFloat(formatEther(proposal.max_amount))) * 100;
  const minThresholdReached = parseFloat(formatEther(proposal.current_amount)) >= parseFloat(formatEther(proposal.min_amount));
  const isProposer = account?.toLowerCase() === proposal.proposer.toLowerCase();

  useEffect(() => {
    const fetchUserInvestment = async () => {
      if (!account || !isConnected) return;
      
      try {
        const contract = getProposalContract(proposal.address);
        const investment = await contract.investors_to_amt(account);
        setUserInvestment(formatEther(investment));
      } catch (error) {
        console.error('Failed to fetch user investment:', error);
      }
    };

    const checkDistributionStatus = async () => {
      if (!proposal.executed) return;
      
      try {
        const contract = getProposalContract(proposal.address);
        const executionTime = await contract.executionTime();
        const cooldown = await contract.cooldown();
        const currentTime = Math.floor(Date.now() / 1000);
        
        setCanDistribute(currentTime >= Number(executionTime) + Number(cooldown));
      } catch (error) {
        console.error('Failed to check distribution status:', error);
      }
    };

    fetchUserInvestment();
    checkDistributionStatus();
  }, [account, isConnected, proposal.address, proposal.executed]);

  const handleInvest = async () => {
    if (!investAmount || parseFloat(investAmount) <= 0) {
      toast.error('Please enter a valid investment amount');
      return;
    }

    setIsInvesting(true);
    try {
      const contract = getProposalContract(proposal.address);
      const tx = await contract.invest({ value: parseEther(investAmount) });
      
      toast.loading('Processing investment...', { id: 'invest' });
      await tx.wait();
      
      toast.success('Investment successful!', { id: 'invest' });
      setInvestAmount('');
      
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error('Investment failed:', error);
      toast.error(error.message || 'Investment failed', { id: 'invest' });
    } finally {
      setIsInvesting(false);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const contract = getProposalContract(proposal.address);
      const tx = await contract.execute_proposal(proposal.target);
      
      toast.loading('Executing proposal...', { id: 'execute' });
      await tx.wait();
      
      toast.success('Proposal executed successfully!', { id: 'execute' });
      
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error('Execution failed:', error);
      toast.error(error.message || 'Execution failed', { id: 'execute' });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDistribute = async () => {
    setIsDistributing(true);
    try {
      const contract = getProposalContract(proposal.address);
      const tx = await contract.distribute_profit();
      
      toast.loading('Distributing profits...', { id: 'distribute' });
      await tx.wait();
      
      toast.success('Profits distributed successfully!', { id: 'distribute' });
      
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error('Distribution failed:', error);
      toast.error(error.message || 'Distribution failed', { id: 'distribute' });
    } finally {
      setIsDistributing(false);
    }
  };

  const getStatusBadge = () => {
    if (proposal.profits_distributed) {
      return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Completed</Badge>;
    }
    if (proposal.executed) {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Executed</Badge>;
    }
    if (minThresholdReached) {
      return <Badge className="bg-green-100 text-green-700 border-green-200">Funded</Badge>;
    }
    if (proposal.is_proposal_active) {
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Proposal #{proposal.proposal_id}
                {getStatusBadge()}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Target className="h-3 w-3" />
                {proposal.target.slice(0, 6)}...{proposal.target.slice(-4)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {formatEther(proposal.current_amount)} / {formatEther(proposal.max_amount)} ETH
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: {formatEther(proposal.min_amount)} ETH</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3 w-3" />
                Investor Share
              </div>
              <div className="font-medium">{proposal.investor_share}%</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Investors
              </div>
              <div className="font-medium">{proposal.investors.length}</div>
            </div>
          </div>

          {parseFloat(userInvestment) > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                <DollarSign className="h-4 w-4" />
                Your Investment: {userInvestment} ETH
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            {proposal.is_proposal_active && !proposal.executed && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full" 
                    disabled={!isConnected || progressPercentage >= 100}
                  >
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Invest
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invest in Proposal #{proposal.proposal_id}</DialogTitle>
                    <DialogDescription>
                      Enter the amount of ETH you want to invest
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Investment Amount (ETH)</label>
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="0.1"
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleInvest} 
                        disabled={isInvesting || !investAmount}
                        className="flex-1"
                      >
                        {isInvesting ? 'Investing...' : 'Confirm Investment'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {isProposer && proposal.is_proposal_active && minThresholdReached && !proposal.executed && (
              <Button 
                onClick={handleExecute} 
                disabled={isExecuting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isExecuting ? 'Executing...' : 'Execute Proposal'}
              </Button>
            )}

            {isProposer && proposal.executed && !proposal.profits_distributed && canDistribute && (
              <Button 
                onClick={handleDistribute} 
                disabled={isDistributing}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Gift className="h-4 w-4 mr-2" />
                {isDistributing ? 'Distributing...' : 'Distribute Profits'}
              </Button>
            )}

            {isProposer && proposal.executed && !canDistribute && !proposal.profits_distributed && (
              <Button disabled className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                Cooldown Period
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};