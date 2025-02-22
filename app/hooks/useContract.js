import { useState, useEffect } from 'react';
import { getWeb3Provider, getContracts } from '../utils/web3Config';

export const useContract = () => {
    const [contracts, setContracts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializeContracts = async () => {
            try {
                const provider = await getWeb3Provider();
                const contractInstances = await getContracts(provider);
                setContracts(contractInstances);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        initializeContracts();
    }, []);

    // Project Listing Functions
    const listProject = async (name, description, subscriptionFee) => {
        try {
            if (!contracts) throw new Error('Contracts not initialized');
            const tx = await contracts.projectListing.listProject(name, description, {
                value: subscriptionFee
            });
            return await tx.wait();
        } catch (err) {
            throw new Error(`Failed to list project: ${err.message}`);
        }
    };

    // Donation Functions
    const donateToProject = async (projectId, amount) => {
        try {
            if (!contracts) throw new Error('Contracts not initialized');
            const tx = await contracts.donate.donateToProject(projectId, {
                value: amount
            });
            return await tx.wait();
        } catch (err) {
            throw new Error(`Failed to donate: ${err.message}`);
        }
    };

    // DAO Functions
    const getDAOMembers = async () => {
        try {
            if (!contracts) throw new Error('Contracts not initialized');
            return await contracts.dao.getDAOMembers();
        } catch (err) {
            throw new Error(`Failed to get DAO members: ${err.message}`);
        }
    };

    return {
        contracts,
        loading,
        error,
        listProject,
        donateToProject,
        getDAOMembers
    };
};
