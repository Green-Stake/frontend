import { useState } from 'react';
import { ethers } from 'ethers';
import { useContract } from './useContract';
import contractConfig from '../utils/contractConfig.json';

export function useContractOperations() {
    const { contracts } = useContract();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const clearError = () => setError(null);

    const handleError = (err) => {
        console.error('Contract operation error:', err);
        if (err.code === 'ACTION_REJECTED') {
            setError('Transaction was rejected by user');
        } else if (err.code === 'INSUFFICIENT_FUNDS') {
            setError('Insufficient funds to complete the transaction');
        } else {
            setError(err.message || 'An error occurred during the transaction');
        }
        setLoading(false);
        return false;
    };

    const joinDAO = async () => {
        if (!contracts?.dao) {
            setError('DAO contract not initialized');
            return false;
        }

        setLoading(true);
        clearError();

        try {
            const minStakeAmount = ethers.parseEther(contractConfig.contracts.DAO.minStakeAmount);
            const tx = await contracts.dao.joinDAO({ value: minStakeAmount });
            await tx.wait();
            setLoading(false);
            return true;
        } catch (err) {
            return handleError(err);
        }
    };

    const listProject = async (name, description) => {
        if (!contracts?.projectListing) {
            setError('ProjectListing contract not initialized');
            return false;
        }

        setLoading(true);
        clearError();

        try {
            const subscriptionFee = ethers.parseEther(contractConfig.contracts.ProjectListing.subscriptionFee);
            const tx = await contracts.projectListing.listProject(name, description, { value: subscriptionFee });
            await tx.wait();
            setLoading(false);
            return true;
        } catch (err) {
            return handleError(err);
        }
    };

    const vote = async (projectId, voteValue) => {
        if (!contracts?.dao) {
            setError('DAO contract not initialized');
            return false;
        }

        setLoading(true);
        clearError();

        try {
            const tx = await contracts.dao.vote(projectId, voteValue);
            await tx.wait();
            setLoading(false);
            return true;
        } catch (err) {
            return handleError(err);
        }
    };

    const donate = async (projectId, amount) => {
        if (!contracts?.donate) {
            setError('Donate contract not initialized');
            return false;
        }

        setLoading(true);
        clearError();

        try {
            // First check if the project is approved
            const project = await contracts.projectListing.projects(projectId);
            if (!project.isApproved) {
                setError('This project is not approved for donations');
                setLoading(false);
                return false;
            }

            if (!project.isListed) {
                setError('This project is no longer listed');
                setLoading(false);
                return false;
            }

            // Check if the subscription is still valid
            if (project.subscriptionEndTime * 1000 < Date.now()) {
                setError('Project subscription has expired');
                setLoading(false);
                return false;
            }

            const valueInWei = ethers.parseEther(amount.toString());
            const tx = await contracts.donate.donateToProject(projectId, { value: valueInWei });
            await tx.wait();
            setLoading(false);
            return true;
        } catch (err) {
            return handleError(err);
        }
    };

    const donateToProject = async (projectId, amount) => {
        if (!contracts?.donate) {
            setError('Donate contract not initialized');
            return false;
        }

        setLoading(true);
        clearError();

        try {
            const donationAmount = ethers.parseEther(amount.toString());
            const tx = await contracts.donate.donateToProject(projectId, {
                value: donationAmount
            });
            await tx.wait();
            setLoading(false);
            return true;
        } catch (err) {
            return handleError(err);
        }
    };

    const getApprovedProjects = async () => {
        if (!contracts?.projectListing) {
            setError('ProjectListing contract not initialized');
            return [];
        }

        try {
            const approvedIds = await contracts.projectListing.getApprovedProjects();
            const projects = [];

            for (const id of approvedIds) {
                try {
                    const project = await contracts.projectListing.projects(id);
                    if (project.isListed && project.isApproved) {
                        projects.push({
                            id: id.toString(),
                            name: project.name,
                            description: project.description,
                            owner: project.owner,
                            totalDonations: ethers.formatEther(project.totalDonations),
                            subscriptionEndTime: new Date(Number(project.subscriptionEndTime) * 1000).toLocaleDateString()
                        });
                    }
                } catch (err) {
                    console.error(`Error loading project ${id}:`, err);
                }
            }

            return projects;
        } catch (err) {
            console.error('Error loading approved projects:', err);
            return [];
        }
    };

    return {
        joinDAO,
        listProject,
        vote,
        donate,
        donateToProject,
        getApprovedProjects,
        loading,
        error,
        clearError
    };
}
