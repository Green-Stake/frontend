import { ethers } from 'ethers';
import contractConfig from './contractConfig.json';

// Import contract configuration
const { contracts } = contractConfig;

// Contract ABIs and addresses from deployment
const ProjectListingABI = contracts.ProjectListing.abi;
const DonateABI = contracts.Donate.abi;
const DAOABI = contracts.DAO.abi;

const CONTRACT_ADDRESSES = {
    ProjectListing: contracts.ProjectListing.address,
    Donate: contracts.Donate.address,
    DAO: contracts.DAO.address,
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
        projectListing: new ethers.Contract(
            CONTRACT_ADDRESSES.ProjectListing,
            ProjectListingABI,
            signer
        ),
        donate: new ethers.Contract(
            CONTRACT_ADDRESSES.Donate,
            DonateABI,
            signer
        ),
        dao: new ethers.Contract(
            CONTRACT_ADDRESSES.DAO,
            DAOABI,
            signer
        ),
    };
};
