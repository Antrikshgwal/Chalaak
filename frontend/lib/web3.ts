import { ethers } from 'ethers';

export interface Proposal {
  proposer: string;
  proposal_id: number;
  is_proposal_active: boolean;
  target: string;
  min_amount: bigint;
  max_amount: bigint;
  investor_share: number;
}

export interface ProposalData extends Proposal {
  address: string;
  current_amount: bigint;
  investors: string[];
  executed: boolean;
  profits_distributed: boolean;
}

// Factory contract ABI (simplified based on test file)
export const FACTORY_ABI = [
  "function create_proposals((address,uint256,bool,address,uint256,uint256,uint256)) external returns (address)",
  "function proposals(address) external view returns (address,uint256,bool,address,uint256,uint256,uint256)",
  "function safeMint(address) external returns (uint256)",
  "function ownerOf(uint256) external view returns (address)",
  "event ProposalCreated(address indexed proposalAddress, uint256 indexed proposalId, address indexed proposer)"
];

// Proposal contract ABI (based on ProposalContract.sol)
export const PROPOSAL_ABI = [
  "function invest() external payable",
  "function execute_proposal(address payable) external",
  "function distribute_profit() external",
  "function execute_and_distribute_profit() external",
  "function proposal_id() external view returns (uint256)",
  "function is_proposal_active() external view returns (bool)",
  "function target() external view returns (address)",
  "function min_amount() external view returns (uint256)",
  "function max_amount() external view returns (uint256)",
  "function investor_share() external view returns (uint256)",
  "function amt() external view returns (uint256)",
  "function proposer() external view returns (address)",
  "function executionTime() external view returns (uint256)",
  "function cooldown() external view returns (uint256)",
  "function investors_to_amt(address) external view returns (uint256)",
  "function investors(uint256) external view returns (address)",
  "function contractbalance() external view returns (uint256)",
  "event Invested(address indexed investor, uint256 amount)",
  "event ProposalExecuted(address indexed target, uint256 amount)"
];

export const FACTORY_ADDRESS = "0x1234567890123456789012345678901234567890"; // Replace with actual deployed address

let provider: ethers.BrowserProvider | null = null;
let signer: ethers.Signer | null = null;

export const connectWallet = async (): Promise<string> => {
  if (typeof window !== 'undefined' && window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    return await signer.getAddress();
  }
  throw new Error("MetaMask not found");
};

export const getProvider = () => provider;
export const getSigner = () => signer;

export const getFactoryContract = () => {
  if (!signer) throw new Error("Wallet not connected");
  return new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
};

export const getProposalContract = (address: string) => {
  if (!signer) throw new Error("Wallet not connected");
  return new ethers.Contract(address, PROPOSAL_ABI, signer);
};

export const formatEther = (value: string | bigint): string => {
  return ethers.formatEther(value);
};

export const parseEther = (value: string): bigint => {
  return ethers.parseEther(value);
};

export const isValidAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};

declare global {
  interface Window {
    ethereum?: any;
  }
}