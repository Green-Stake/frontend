'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { useContract } from './useContract';
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import contractConfig from '../utils/contractConfig.json';

export function useContractOperations() {
    const { contracts, signer, isConnected } = useContract();
    const { chain } = useNetwork();
    const { switchNetwork } = useSwitchNetwork();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const clearError = () => setError(null);

    const checkNetworkAndConnection = () => {
        console.log('Checking network and connection:', { isConnected, chainId: chain?.id });
        
        if (!isConnected) {
            setError('Please connect your wallet to continue');
            return false;
        }
        if (chain?.id !== arbitrumSepolia.id) {
            setError(`Please switch to ${arbitrumSepolia.name} network to continue`);
            if (switchNetwork) {
                switchNetwork(arbitrumSepolia.id);
            }
            return false;
        }
        if (!signer) {
            setError('Wallet connection not initialized. Please try again.');
            return false;
        }
        return true;
    };

    const listProject = async (name, description) => {
        console.log('listProject called with:', { name, description });
        
        if (!checkNetworkAndConnection()) {
            console.log('Network check failed');
            return false;
        }
        
        if (!contracts?.projectListing) {
            console.log('Contract not initialized');
            setError('Contract not initialized. Please refresh the page.');
            return false;
        }

        // Validate inputs
        if (!name?.trim() || !description?.trim()) {
            setError('Project name and description are required');
            return false;
        }

        setLoading(true);
        clearError();

        try {
            // Convert subscription amount to Wei
            const subscriptionFee = ethers.parseEther(contractConfig.contracts.ProjectListing.subscriptionFee);
            console.log('Subscription fee:', subscriptionFee.toString());

            console.log('Attempting to list project with params:', {
                name: name.trim(),
                description: description.trim(),
                subscriptionFee: subscriptionFee.toString()
            });

            // Send transaction with subscription fee
            const tx = await contracts.projectListing.listProject(
                name.trim(), 
                description.trim(),
                { 
                    value: subscriptionFee
                }
            );

            console.log('Transaction sent:', tx.hash);
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);
            setLoading(false);
            return true;
        } catch (err) {
            console.error('Contract error:', err);
            
            if (err.message?.includes('insufficient funds')) {
                setError('You do not have enough ETH. Make sure you have enough to cover both the subscription amount and gas fees.');
            } else if (err.code === 'ACTION_REJECTED') {
                setError('Transaction was rejected. Please try again.');
            } else if (err.message?.includes('network changed')) {
                setError('Network changed. Please switch back to Arbitrum Sepolia and try again.');
            } else {
                setError(err.message || 'Failed to list project. Please try again.');
            }
            setLoading(false);
            return false;
        }
    };

    // DAO Functions
    const joinDAO = async () => {
        if (!checkNetworkAndConnection()) return false;
        if (!contracts?.dao) {
            setError('DAO contract not initialized');
            return false;
        }

        setLoading(true);
        clearError();

        try {
            // Convert stake amount to Wei
            const stakeAmount = ethers.parseEther(contractConfig.contracts.DAO.minStakeAmount);
            console.log('Joining DAO with stake:', stakeAmount.toString());

            const tx = await contracts.dao.joinDAO({ value: stakeAmount });
            console.log('Join DAO transaction sent:', tx.hash);
            
            const receipt = await tx.wait();
            console.log('Join DAO transaction confirmed:', receipt);
            
            setLoading(false);
            return true;
        } catch (err) {
            console.error('Error joining DAO:', err);
            if (err.message?.includes('insufficient funds')) {
                setError('You do not have enough ETH to stake and join the DAO');
            } else if (err.code === 'ACTION_REJECTED') {
                setError('Transaction was rejected. Please try again.');
            } else {
                setError(err.message || 'Failed to join DAO');
            }
            setLoading(false);
            return false;
        }
    };

    const vote = async (projectId, voteInFavor) => {
        if (!checkNetworkAndConnection()) return false;
        if (!contracts?.dao) {
            setError('DAO contract not initialized');
            return false;
        }

        setLoading(true);
        clearError();

        try {
            console.log('Voting on project:', { projectId, voteInFavor });
            
            const address = await signer.getAddress();
            
            // First check if user is a member
            const memberStatus = await contracts.dao.isMember(address);
            if (!memberStatus) {
                setError('You must be a DAO member to vote');
                setLoading(false);
                return false;
            }

            // Check if already voted
            const hasVoted = await contracts.dao.hasVoted(projectId, address);
            if (hasVoted) {
                setError('You have already voted on this project');
                setLoading(false);
                return false;
            }

            // Check if project exists and is not processed
            const projectRequest = await contracts.dao.projectRequests(projectId);
            if (projectRequest.isProcessed) {
                setError('This project request has already been processed');
                setLoading(false);
                return false;
            }
            
            const tx = await contracts.dao.voteOnProject(projectId, voteInFavor);
            console.log('Vote transaction sent:', tx.hash);
            
            // Wait for transaction with timeout
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Transaction confirmation timeout')), 60000)
            );
            
            const receipt = await Promise.race([
                tx.wait(),
                timeoutPromise
            ]);
            
            console.log('Vote transaction confirmed:', receipt);
            
            setLoading(false);
            return true;
        } catch (err) {
            console.error('Error voting:', err);
            if (err.message === 'Transaction confirmation timeout') {
                setError('Transaction is taking longer than expected. Please check your wallet for status.');
            } else if (err.code === 'ACTION_REJECTED') {
                setError('Transaction was rejected. Please try again.');
            } else if (err.message?.includes('Already voted')) {
                setError('You have already voted on this project');
            } else if (err.message?.includes('Not a DAO member')) {
                setError('You must be a DAO member to vote');
            } else if (err.message?.includes('Project request already processed')) {
                setError('This project request has already been processed');
            } else {
                setError(err.message || 'Failed to vote');
            }
            setLoading(false);
            return false;
        }
    };

    // Additional DAO functions
    const getDAOMembers = async () => {
        if (!contracts?.dao) return [];
        try {
            const members = await contracts.dao.getDAOMembers();
            return members;
        } catch (err) {
            console.error('Error getting DAO members:', err);
            return [];
        }
    };

    const getTotalStaked = async () => {
        if (!contracts?.dao) return ethers.parseEther('0');
        try {
            const total = await contracts.dao.getTotalStaked();
            return total;
        } catch (err) {
            console.error('Error getting total staked:', err);
            return ethers.parseEther('0');
        }
    };

    const getQuorum = async () => {
        if (!contracts?.dao) return 0;
        try {
            const quorum = await contracts.dao.getQuorum();
            return Number(quorum);
        } catch (err) {
            console.error('Error getting quorum:', err);
            return 0;
        }
    };

    return {
        listProject,
        joinDAO,
        vote,
        getDAOMembers,
        getTotalStaked,
        getQuorum,
        loading,
        error,
        clearError
    };
}
