"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Target, DollarSign, Users, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { getFactoryContract, parseEther, isValidAddress } from '@/lib/web3';
import { useWeb3 } from '@/hooks/use-web3';
import { toast } from 'sonner';

const formSchema = z.object({
  proposalId: z.string().min(1, 'Proposal ID is required'),
  targetAddress: z.string().refine(isValidAddress, 'Invalid Ethereum address'),
  minAmount: z.string().min(1, 'Minimum amount is required'),
  maxAmount: z.string().min(1, 'Maximum amount is required'),
  investorShare: z.string().min(1, 'Investor share is required').max(2, 'Max 99%'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
}).refine((data) => {
  const min = parseFloat(data.minAmount);
  const max = parseFloat(data.maxAmount);
  return max > min;
}, {
  message: "Maximum amount must be greater than minimum amount",
  path: ["maxAmount"],
});

type FormData = z.infer<typeof formSchema>;

interface CreateProposalFormProps {
  onProposalCreated?: () => void;
}

export const CreateProposalForm = ({ onProposalCreated }: CreateProposalFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isConnected, account } = useWeb3();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proposalId: '',
      targetAddress: '',
      minAmount: '',
      maxAmount: '',
      investorShare: '',
      description: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!isConnected || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    try {
      const factory = getFactoryContract();
      
      const proposal = {
        proposer: account,
        proposal_id: parseInt(data.proposalId),
        is_proposal_active: true,
        target: data.targetAddress,
        min_amount: parseEther(data.minAmount),
        max_amount: parseEther(data.maxAmount),
        investor_share: parseInt(data.investorShare),
      };

      const tx = await factory.create_proposals(proposal);
      toast.loading('Creating proposal...', { id: 'create-proposal' });
      
      await tx.wait();
      
      toast.success('Proposal created successfully!', { id: 'create-proposal' });
      
      form.reset();
      setIsOpen(false);
      
      if (onProposalCreated) {
        onProposalCreated();
      }
    } catch (error: any) {
      console.error('Failed to create proposal:', error);
      toast.error(error.message || 'Failed to create proposal', { id: 'create-proposal' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" disabled={!isConnected}>
          <Plus className="h-4 w-4" />
          Create Proposal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Proposal</DialogTitle>
          <DialogDescription>
            Create a new investment proposal to raise funds for your project
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="proposalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Proposal ID
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="1" type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Unique identifier for your proposal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="investorShare"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Investor Share (%)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="10" type="number" min="1" max="99" {...field} />
                    </FormControl>
                    <FormDescription>
                      Percentage of profits for investors
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="targetAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Target Address
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="0x..." {...field} />
                  </FormControl>
                  <FormDescription>
                    The address where funds will be sent when proposal is executed
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Minimum Amount (ETH)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="0.1" type="number" step="0.001" {...field} />
                    </FormControl>
                    <FormDescription>
                      Minimum funding required
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Maximum Amount (ETH)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="1.0" type="number" step="0.001" {...field} />
                    </FormControl>
                    <FormDescription>
                      Maximum funding accepted
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your proposal, what the funds will be used for, and expected returns..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about your proposal to attract investors
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Proposal'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};