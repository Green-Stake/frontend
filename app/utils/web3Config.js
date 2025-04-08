import { getContract } from 'wagmi/actions';
import { ethers } from 'ethers';
import contractConfig from './contractConfig.json';

// Import contract configuration
const { contracts } = contractConfig;

// Contract ABIs and addresses from deployment
const CONTRACT_ADDRESSES = {
    ProjectListing: contracts.ProjectListing.address,
    Donate: contracts.Donate.address,
    DAO: contracts.DAO.address,
};

export const getContractInstance = (contractName, signer = null) => {
  if (!contractConfig.contracts[contractName]) {
    throw new Error(`Contract ${contractName} not found in config`);
  }

  const config = contractConfig.contracts[contractName];
  return getContract({
    address: config.address,
    abi: config.abi,
    walletClient: signer,
    chainId: 421614 // Arbitrum Sepolia chain ID
  });
};

export const getWeb3Provider = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            return new ethers.BrowserProvider(window.ethereum);
        } catch (error) {
            throw new Error('User denied account access');
        }
    }
    throw new Error('Please install MetaMask');
};

export const getContracts = async (provider) => {
    const signer = await provider.getSigner();
    
    return {
        projectListing: getContractInstance('ProjectListing', signer),
        donate: getContractInstance('Donate', signer),
        dao: getContractInstance('DAO', signer),
    };
};
