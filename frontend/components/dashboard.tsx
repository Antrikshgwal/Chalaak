"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ProposalCard } from './proposal-card';
import { CreateProposalForm } from './create-proposal-form';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  Activity,
  CheckCircle,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { type ProposalData } from '@/lib/web3';

interface DashboardProps {
  proposals: ProposalData[];
  onRefresh: () => void;
  isLoading: boolean;
}

export const Dashboard = ({ proposals, onRefresh, isLoading }: DashboardProps) => {
  const [stats, setStats] = useState({
    totalProposals: 0,
    activeProposals: 0,
    totalFunding: '0',
    completedProposals: 0,
  });

  useEffect(() => {
    const calculateStats = () => {
      const totalProposals = proposals.length;
      const activeProposals = proposals.filter(p => p.is_proposal_active && !p.executed).length;
      const completedProposals = proposals.filter(p => p.profits_distributed).length;
      const totalFunding = proposals.reduce((acc, p) => acc + parseFloat(p.current_amount), 0).toFixed(3);

      setStats({
        totalProposals,
        activeProposals,
        totalFunding,
        completedProposals,
      });
    };

    calculateStats();
  }, [proposals]);

  const activeProposals = proposals.filter(p => p.is_proposal_active && !p.executed);
  const executedProposals = proposals.filter(p => p.executed && !p.profits_distributed);
  const completedProposals = proposals.filter(p => p.profits_distributed);

  const StatCard = ({ title, value, icon: Icon, description, color = "default" }: {
    title: string;
    value: string | number;
    icon: any;
    description: string;
    color?: "default" | "green" | "blue" | "purple";
  }) => {
    const colorClasses = {
      default: "bg-gray-50 border-gray-200",
      green: "bg-green-50 border-green-200",
      blue: "bg-blue-50 border-blue-200",
      purple: "bg-purple-50 border-purple-200",
    };

    const iconColors = {
      default: "text-gray-600",
      green: "text-green-600",
      blue: "text-blue-600", 
      purple: "text-purple-600",
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`${colorClasses[color]} border`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              </div>
              <div className={`p-3 rounded-full bg-background ${iconColors[color]}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Proposals"
          value={stats.totalProposals}
          icon={Target}
          description="All created proposals"
        />
        <StatCard
          title="Active Proposals"
          value={stats.activeProposals}
          icon={Activity}
          description="Currently accepting investments"
          color="blue"
        />
        <StatCard
          title="Total Funding"
          value={`${stats.totalFunding} ETH`}
          icon={DollarSign}
          description="Across all proposals"
          color="green"
        />
        <StatCard
          title="Completed"
          value={stats.completedProposals}
          icon={CheckCircle}
          description="Profits distributed"
          color="purple"
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Investment Proposals</h2>
              <p className="text-muted-foreground">
                Discover and invest in active proposals or track your investments
              </p>
            </div>
            <CreateProposalForm onProposalCreated={onRefresh} />
          </div>

          <Tabs defaultValue="active" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Active ({activeProposals.length})
              </TabsTrigger>
              <TabsTrigger value="executed" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Executed ({executedProposals.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed ({completedProposals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="h-64 animate-pulse">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                          <div className="h-2 bg-gray-200 rounded w-full" />
                          <div className="h-8 bg-gray-200 rounded w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : activeProposals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeProposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.address}
                      proposal={proposal}
                      onUpdate={onRefresh}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Proposals</h3>
                    <p className="text-muted-foreground mb-4">
                      There are currently no active proposals accepting investments.
                    </p>
                    <CreateProposalForm onProposalCreated={onRefresh} />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="executed" className="space-y-4">
              {executedProposals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {executedProposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.address}
                      proposal={proposal}
                      onUpdate={onRefresh}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Executed Proposals</h3>
                    <p className="text-muted-foreground">
                      Proposals that have been executed will appear here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedProposals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedProposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.address}
                      proposal={proposal}
                      onUpdate={onRefresh}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Completed Proposals</h3>
                    <p className="text-muted-foreground">
                      Proposals with distributed profits will appear here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};