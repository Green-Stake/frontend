'use client';

import { useState, useEffect } from 'react';
import { useAccount, useNetwork, useSwitchNetwork, usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import contractConfig from '../utils/contractConfig.json';
import { arbitrumSepolia } from 'wagmi/chains';

export const useContract = () => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const publicClient = usePublicClient();
  const [contracts, setContracts] = useState(null);
  const [signer, setSigner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  useEffect(() => {
    const initializeContracts = async () => {
      console.log('Initializing contracts, wallet status:', { isConnected, chainId: chain?.id });
      
      if (!isConnected || !window.ethereum) {
        console.log('Wallet not connected or ethereum not available');
        setContracts(null);
        setSigner(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        clearError();

        // Check if we're on the correct network (Arbitrum Sepolia)
        if (chain?.id !== arbitrumSepolia.id) {
          console.log('Wrong network, current:', chain?.id, 'expected:', arbitrumSepolia.id);
          setError('Please switch to Arbitrum Sepolia network');
          if (switchNetwork) {
            switchNetwork(arbitrumSepolia.id);
          }
          setLoading(false);
          return;
        }

        // Get the provider and signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await provider.getSigner();
        console.log('Got signer:', await newSigner.getAddress());

        // Initialize contract instances
        const projectListingContract = new ethers.Contract(
          contractConfig.contracts.ProjectListing.address,
          contractConfig.contracts.ProjectListing.abi,
          newSigner
        );

        const donateContract = new ethers.Contract(
          contractConfig.contracts.Donate.address,
          contractConfig.contracts.Donate.abi,
          newSigner
        );

        const daoContract = new ethers.Contract(
          contractConfig.contracts.DAO.address,
          contractConfig.contracts.DAO.abi,
          newSigner
        );

        // Verify contracts are properly initialized
        try {
          // Test a read-only call to each contract
          await projectListingContract.owner();
          await donateContract.owner();
          await daoContract.owner();
          
          console.log('Contracts initialized:', {
            projectListing: projectListingContract.target,
            donate: donateContract.target,
            dao: daoContract.target
          });

          setContracts({
            projectListing: projectListingContract,
            donate: donateContract,
            dao: daoContract,
          });
          setSigner(newSigner);
          setError(null);
        } catch (contractErr) {
          console.error('Contract verification failed:', contractErr);
          setError('Failed to connect to smart contracts. Please check if you are on the correct network.');
          setContracts(null);
          setSigner(null);
        }
      } catch (err) {
        console.error('Error initializing contracts:', err);
        setError(err.message || 'Failed to initialize contracts');
        setContracts(null);
        setSigner(null);
      } finally {
        setLoading(false);
      }
    };

    initializeContracts();
  }, [isConnected, chain?.id, switchNetwork]);

  return {
    contracts,
    signer,
    loading,
    error,
    isConnected,
    address,
    chainId: chain?.id,
    clearError
  };
};
